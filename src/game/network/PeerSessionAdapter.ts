import { Peer } from 'peerjs';
import type { DataConnection, PeerOptions } from 'peerjs';
import type { OnlineSessionAdapter } from './OnlineSessionAdapter';
import type { UnsubscribeFn } from '../battle/controller/IBattleController';
import type { AutonomousBattleSnapshot } from '../battle/BattleTypes';
import type { BattleCommand } from '../battle/commands/BattleCommand';
import type { BattleEvent } from '../battle/events/BattleEvents';
import { onlinePerspective } from './OnlinePerspective';
import { validBattleResult } from './BattleResultValidation';
import type { TeamSide } from '../battle/entities/CombatEntity';
import { BattleRoom, type RoomScheduler } from '../../network/room/BattleRoom';
import {
  ONLINE_PROTOCOL_VERSION,
  type ClientMessage,
  type ServerMessage,
  type RoomJoinedMessage,
  type RoomUpdateMessage,
  type MatchStartMessage,
  type MatchEndMessage,
  type ErrorMessage,
  type GameMode,
  type DeployedFormationUnit,
  type OnlineBattleStartMessage,
  type OpponentFormationReadyMessage,
  type PreparationPhase,
  type EnergyInventoryMessage,
} from '../../network/protocol/NetworkMessages';

export interface PeerSessionOptions {
  peerId?: string;
  protocolVersion?: number;
  peerConfig?: PeerOptions;
  peerFactory?: (id?: string, options?: PeerOptions) => any;
  scheduler?: RoomScheduler;
  connectTimeoutMs?: number;
  heartbeatTimeoutMs?: number;
}

function getDefaultPeerConfig(): PeerOptions | undefined {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    if (!env) return undefined;
    const config: PeerOptions = {};
    if (env.VITE_PEER_HOST) config.host = String(env.VITE_PEER_HOST);
    if (env.VITE_PEER_PORT) config.port = Number(env.VITE_PEER_PORT);
    if (env.VITE_PEER_PATH) config.path = String(env.VITE_PEER_PATH);
    if (env.VITE_PEER_SECURE !== undefined) config.secure = env.VITE_PEER_SECURE === 'true';
    if (env.VITE_ICE_SERVERS) {
      try {
        config.config = {
          iceServers: JSON.parse(String(env.VITE_ICE_SERVERS)),
        };
      } catch {}
    }
    return Object.keys(config).length > 0 ? config : undefined;
  } catch {
    return undefined;
  }
}

export class PeerSessionAdapter implements OnlineSessionAdapter {
  roundResult?: MatchEndMessage;
  nextRoundReady(): void {
    if (this.isHost) this.room?.nextRoundReady(this.playerId);
    else this.hostConnection?.send({ type: 'NEXT_ROUND_READY' });
  }
  playerId = '';
  teamId: TeamSide = 'TeamA';
  preparationPhase: PreparationPhase = 'BeastRush';
  opponentFormation?: OpponentFormationReadyMessage;
  isHost = false;
  roomCode?: string;

  private peer?: any;
  private hostConnection?: any;
  private guestConnection?: any;
  private room?: BattleRoom;
  private options: PeerSessionOptions;

  private preparationListeners = new Set<(phase: PreparationPhase) => void>();
  private energyListeners = new Set<(msg: EnergyInventoryMessage) => void>();
  private snapshotListeners = new Set<(s: AutonomousBattleSnapshot) => void>();
  private eventsListeners = new Set<(evs: BattleEvent[]) => void>();
  private statusListeners = new Set<(st: 'Running' | 'Win' | 'Lose') => void>();
  private roomUpdateListeners = new Set<(update: RoomUpdateMessage) => void>();
  private matchStartListeners = new Set<(start: MatchStartMessage) => void>();
  private onlineBattleStartListeners = new Set<(start: OnlineBattleStartMessage) => void>();
  private opponentReadyListeners = new Set<(msg: OpponentFormationReadyMessage) => void>();
  private errorListeners = new Set<(err: ErrorMessage) => void>();

  private joinPromiseResolver?: (msg: RoomJoinedMessage) => void;
  private joinPromiseRejecter?: (err: Error) => void;
  private connectPromiseResolver?: () => void;
  private connectPromiseRejecter?: (err: Error) => void;
  private lastReceivedTick = -1;
  private beforeUnloadHandler?: () => void;
  private connectTimer?: ReturnType<typeof setTimeout>;
  private joinTimer?: ReturnType<typeof setTimeout>;
  private visibilityHandler?: () => void;
  private matchId = '';
  private commandSequence = 0;
  private monitors = new Set<ReturnType<typeof setInterval>>();
  private lastActivity = new Map<any, number>();
  private closing = false;
  private initialization?: Promise<void>;

  private monitor(conn: any, hostSide: boolean): void {
    const now = () => performance.now();
    this.lastActivity.set(conn, now());
    let previous = now();
    const interval = setInterval(() => {
      if (!conn.open || this.closing) return;
      const current = now();
      if (current - previous > 5000 || current - (this.lastActivity.get(conn) ?? current) > (this.options.heartbeatTimeoutMs ?? 15000)) {
        const error: ErrorMessage = { type: 'ERROR', code: 'CONNECTION_LOST', message: 'Phiên đấu bị gián đoạn quá lâu. Hãy tạo phòng mới.' };
        conn.send(error);
        this.handleErrorMessage(error);
        this.disconnect();
        return;
      }
      previous = current;
      conn.send({ type: hostSide ? 'PONG' : 'PING', timestamp: Date.now() });
    }, 1000);
    this.monitors.add(interval);
    conn.on('close', () => { clearInterval(interval); this.monitors.delete(interval); this.lastActivity.delete(conn); });
  }

  constructor(options: PeerSessionOptions = {}) {
    this.options = options;
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.beforeUnloadHandler = () => {
        this.disconnect();
      };
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
      this.visibilityHandler = () => {
        if (this.isHost && document.hidden && this.room && !['WAITING', 'ENDED'].includes(this.room.state)) {
          const error: ErrorMessage = { type: 'ERROR', code: 'HOST_BACKGROUND', message: 'Host đã chuyển tab hoặc khóa màn hình. Phiên đấu kết thúc; hãy tạo phòng mới.' };
          this.guestConnection?.send(error);
          this.handleErrorMessage(error);
          this.disconnect();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  get isConnected(): boolean {
    if (this.isHost) {
      return this.peer !== undefined && !this.peer.destroyed;
    }
    return this.hostConnection !== undefined && Boolean(this.hostConnection.open);
  }

  get localPeerId(): string | undefined {
    return this.peer?.id;
  }

  getInviteLink(baseUrl?: string): string {
    if (!this.roomCode) return '';
    const origin = baseUrl ?? (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
    return `${origin}?room=${encodeURIComponent(this.roomCode)}`;
  }

  async connect(peerId?: string): Promise<void> {
    this.closing = false;
    if (this.peer && !this.peer.destroyed) return this.initialization;

    const id = peerId ?? this.options.peerId;
    const config = this.options.peerConfig ?? getDefaultPeerConfig();
    const factory = this.options.peerFactory ?? ((pId?: string, opts?: PeerOptions) => new Peer(pId as any, opts));

    return this.initialization = new Promise((resolve, reject) => {
      this.connectPromiseResolver = resolve;
      this.connectPromiseRejecter = reject;
      this.connectTimer = setTimeout(() => {
        this.connectPromiseRejecter?.(new Error('CONNECTION_TIMEOUT: Không thể kết nối signaling.'));
        this.connectPromiseRejecter = undefined;
        this.disconnect(true);
      }, this.options.connectTimeoutMs ?? 10000);

      try {
        this.peer = factory(id, config);

        this.peer.on('open', (assignedId: string) => {
          clearTimeout(this.connectTimer);
          this.connectPromiseResolver?.();
          this.connectPromiseResolver = undefined;
          this.connectPromiseRejecter = undefined;
        });

        this.peer.on('error', (err: any) => {
          clearTimeout(this.connectTimer);
          const errMsg = err?.message ?? String(err);
          const errType = err?.type ?? 'PEER_ERROR';

          if (this.connectPromiseRejecter) {
            this.connectPromiseRejecter(new Error(`Peer initialization failed [${errType}]: ${errMsg}`));
            this.connectPromiseResolver = undefined;
            this.connectPromiseRejecter = undefined;
            this.disconnect(true);
          } else if (this.joinPromiseRejecter) {
            this.joinPromiseRejecter(new Error(`Peer connection error [${errType}]: ${errMsg}`));
            this.joinPromiseResolver = undefined;
            this.joinPromiseRejecter = undefined;
            this.disconnect(true);
          } else {
            this.handleErrorMessage({
              type: 'ERROR',
              code: errType,
              message: errMsg,
            });
          }
        });

        this.peer.on('disconnected', () => {
          // May attempt reconnect or emit status
        });

        this.peer.on('close', () => {
          if (this.closing) return;
          this.connectPromiseRejecter?.(new Error('CONNECTION_CLOSED: Kết nối đã đóng.'));
          this.joinPromiseRejecter?.(new Error('CONNECTION_CLOSED: Kết nối đã đóng.'));
          this.statusListeners.forEach((l) => l('Lose'));
        });
      } catch (err) {
        clearTimeout(this.connectTimer);
        this.connectPromiseResolver = undefined;
        this.connectPromiseRejecter = undefined;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  async createRoom(playerName: string, mode: GameMode = 'pvp'): Promise<RoomJoinedMessage> {
    await this.connect();
    this.isHost = true;
    this.roomCode = this.peer.id;
    this.playerId = `host-${this.peer.id.slice(0, 8)}`;
    this.teamId = 'TeamA';

    const roomCode = this.roomCode!;
    this.room = new BattleRoom(
      `room-${this.peer.id}`,
      roomCode,
      mode,
      this.options.scheduler,
    );

    // Host joins the local room authoritative core
    const hostInfo = this.room.addPlayer(this.playerId, playerName, (msg) => {
      this.handleServerMessage(msg);
    });

    // Listen for incoming guest connections
    this.peer.on('connection', (conn: any) => {
      this.handleIncomingGuestConnection(conn);
    });

    const joinedMessage: RoomJoinedMessage = {
      protocolVersion: ONLINE_PROTOCOL_VERSION,
      type: 'ROOM_JOINED',
      roomId: this.room.roomId,
      roomCode,
      mode,
      playerId: this.playerId,
      teamId: hostInfo.teamId,
    };

    return joinedMessage;
  }

  async joinRoom(roomCode: string, playerName: string): Promise<RoomJoinedMessage> {
    const deadline = performance.now() + (this.options.connectTimeoutMs ?? 10000);
    await this.connect();
    this.isHost = false;
    this.roomCode = roomCode.trim();

    return new Promise((resolve, reject) => {
      this.joinPromiseResolver = resolve;
      this.joinPromiseRejecter = reject;

      const timeoutMs = Math.max(1, deadline - performance.now());
      const timer = setTimeout(() => {
        if (this.joinPromiseRejecter) {
          this.joinPromiseRejecter(new Error('CONNECTION_TIMEOUT: Quá thời gian chờ kết nối tới chủ phòng.'));
          this.joinPromiseResolver = undefined;
          this.joinPromiseRejecter = undefined;
          this.disconnect(true);
        }
      }, timeoutMs);
      this.joinTimer = timer;

      try {
        const conn = this.peer.connect(this.roomCode, { reliable: true });
        this.hostConnection = conn;

        conn.on('open', () => {
          this.monitor(conn, false);
          // Send JOIN_ROOM message to Host
          const joinMsg: ClientMessage = {
            type: 'JOIN_ROOM',
            roomCode: this.roomCode!,
            playerName,
            protocolVersion: this.options.protocolVersion ?? ONLINE_PROTOCOL_VERSION,
          };
          conn.send(joinMsg);
        });

        conn.on('data', (raw: any) => {
          this.lastActivity.set(conn, performance.now());
          try {
            const msg = (typeof raw === 'string' ? JSON.parse(raw) : raw) as ServerMessage;
            this.handleServerMessage(msg);
          } catch (e) {
            console.error('Failed to parse incoming peer message', e);
          }
        });

        conn.on('close', () => {
          if (this.closing || this.hostConnection !== conn) return;
          clearTimeout(timer);
          this.handleErrorMessage({
            type: 'ERROR',
            code: 'HOST_DISCONNECTED',
            message: 'Chủ phòng đã đóng kết nối.',
          });
          this.statusListeners.forEach((l) => l('Lose'));
        });

        conn.on('error', (err: any) => {
          clearTimeout(timer);
          const msg = err?.message ?? String(err);
          if (this.joinPromiseRejecter) {
            this.joinPromiseRejecter(new Error(`PEER_CONNECTION_ERROR: ${msg}`));
            this.joinPromiseResolver = undefined;
            this.joinPromiseRejecter = undefined;
          }
        });
      } catch (err) {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  private handleIncomingGuestConnection(conn: any): void {
    if (this.guestConnection || !this.room || this.room.isFull) {
      // Room full: notify and reject
      conn.on('open', () => {
        conn.send({
          type: 'ERROR',
          code: 'ROOM_FULL',
          message: 'Phòng đã đủ người chơi.',
        });
        setTimeout(() => conn.close(), 100);
      });
      return;
    }

    this.guestConnection = conn;
    let guestPlayerId = '';

    conn.on('open', () => {
      this.monitor(conn, true);
      // Connection open, waiting for JOIN_ROOM message
    });

    conn.on('data', (raw: any) => {
      this.lastActivity.set(conn, performance.now());
      try {
        const msg = (typeof raw === 'string' ? JSON.parse(raw) : raw) as ClientMessage;

        if (msg.type === 'JOIN_ROOM') {
          if (msg.protocolVersion !== ONLINE_PROTOCOL_VERSION) {
            conn.send({
              type: 'ERROR',
              code: 'VERSION_MISMATCH',
              message: `Phiên bản không tương thích (Yêu cầu v${ONLINE_PROTOCOL_VERSION}).`,
            });
            setTimeout(() => conn.close(), 100);
            return;
          }

          guestPlayerId = `guest-${conn.peer.slice(0, 8)}`;
          try {
            const info = this.room!.addPlayer(guestPlayerId, msg.playerName, (serverMsg) => {
              if (!conn.open) return;
              if (serverMsg.type === 'BATTLE_TICK' && serverMsg.snapshot.status === 'Running' && serverMsg.events.length === 0) {
                const dc = conn.dataChannel ?? conn._dc;
                if (dc && typeof dc.bufferedAmount === 'number' && dc.bufferedAmount > 65536) {
                  return;
                }
              }
              conn.send(serverMsg);
            });

            const joinedResponse: RoomJoinedMessage = {
              protocolVersion: ONLINE_PROTOCOL_VERSION,
              type: 'ROOM_JOINED',
              roomId: this.room!.roomId,
              roomCode: this.roomCode!,
              mode: this.room!.mode,
              playerId: guestPlayerId,
              teamId: info.teamId,
            };
            conn.send(joinedResponse);
          } catch (err: any) {
            conn.send({
              type: 'ERROR',
              code: 'ROOM_FULL',
              message: err?.message ?? 'Không thể tham gia phòng.',
            });
            setTimeout(() => conn.close(), 100);
          }
          return;
        }

        if (!guestPlayerId || !this.room) return;

        switch (msg.type) {
          case 'NEXT_ROUND_READY':
            this.room.nextRoundReady(guestPlayerId);
            break;
          case 'PING':
            conn.send({ type: 'PONG', timestamp: msg.timestamp });
            break;
          case 'SET_READY':
            this.room.setPlayerReady(guestPlayerId, msg.isReady);
            break;
          case 'PREPARATION_READY':
            this.room.preparationReady(guestPlayerId, msg.phase);
            break;
          case 'DEPLOY_FORMATION':
            this.room.deployFormation(guestPlayerId, msg.units, msg.ready, msg.energy);
            break;
          case 'BATTLE_COMMAND':
            this.room.receiveCommand(guestPlayerId, msg.command);
            break;
          case 'LEAVE_ROOM':
            this.room.removePlayer(guestPlayerId);
            break;
        }
      } catch (e) {
        console.error('Failed to process message from guest', e);
      }
    });

    conn.on('close', () => {
      if (this.room && guestPlayerId) {
        this.room.removePlayer(guestPlayerId);
      }
      this.guestConnection = undefined;
    });

    conn.on('error', (err: any) => {
      console.warn('Guest connection error', err);
    });
  }

  setReady(isReady: boolean): void {
    if (this.isHost && this.room) {
      this.room.setPlayerReady(this.playerId, isReady);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'SET_READY',
        isReady,
      });
    }
  }

  preparationReady(phase: PreparationPhase): void {
    if (this.isHost && this.room) {
      this.room.preparationReady(this.playerId, phase);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'PREPARATION_READY',
        phase,
      });
    }
  }

  deployFormation(
    units: DeployedFormationUnit[],
    ready = true,
    energy: Array<{ energyId: string; charges: number }> = [],
  ): void {
    if (this.isHost && this.room) {
      this.room.deployFormation(this.playerId, units, ready, energy);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'DEPLOY_FORMATION',
        units,
        ready,
        energy,
      });
    }
  }

  sendCommand(command: BattleCommand): void {
    command = { ...command, commandId: command.commandId ?? `${this.playerId}-${++this.commandSequence}`, matchId: this.matchId };
    if (this.isHost && this.room) {
      this.room.receiveCommand(this.playerId, command);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'BATTLE_COMMAND',
        command,
      });
    }
  }

  private handleServerMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case 'ROOM_JOINED': {
        clearTimeout(this.joinTimer);
        const expectedVersion = this.options.protocolVersion ?? ONLINE_PROTOCOL_VERSION;
        if (msg.protocolVersion !== expectedVersion) {
          const err = new Error(`Máy chủ không tương thích phiên bản (cần v${expectedVersion}, nhận v${msg.protocolVersion ?? 'lạ'}).`);
          this.joinPromiseRejecter?.(err);
          this.joinPromiseResolver = undefined;
          this.joinPromiseRejecter = undefined;
          this.disconnect();
          return;
        }
        this.playerId = msg.playerId;
        this.teamId = msg.teamId;
        this.joinPromiseResolver?.(msg);
        this.joinPromiseResolver = undefined;
        this.joinPromiseRejecter = undefined;
        break;
      }

      case 'ROOM_UPDATE':
        this.roomUpdateListeners.forEach((l) => l(msg));
        break;

      case 'MATCH_START':
        this.roundResult = undefined;
        this.opponentFormation = undefined;
        this.matchId = msg.matchId ?? '';
        this.preparationPhase = 'BeastRush';
        this.lastReceivedTick = -1;
        this.matchStartListeners.forEach((l) => l(msg));
        break;

      case 'PREPARATION_PHASE':
        this.preparationPhase = msg.phase;
        this.preparationListeners.forEach((l) => l(msg.phase));
        break;

      case 'ENERGY_INVENTORY':
        this.energyListeners.forEach((l) => l(msg));
        break;

      case 'OPPONENT_FORMATION_READY':
        this.opponentFormation = msg;
        this.opponentReadyListeners.forEach((l) => l(msg));
        break;

      case 'ONLINE_BATTLE_START':
        this.lastReceivedTick = msg.snapshot.elapsedTicks;
        this.snapshotListeners.forEach((l) => l(onlinePerspective(msg.snapshot, this.teamId)));
        this.onlineBattleStartListeners.forEach((l) => l(msg));
        break;

      case 'BATTLE_TICK':
        if ((this.matchId && msg.matchId !== this.matchId) || msg.tick <= this.lastReceivedTick) {
          break;
        }
        this.lastReceivedTick = msg.tick;
        this.snapshotListeners.forEach((l) => l(onlinePerspective(msg.snapshot, this.teamId)));
        this.eventsListeners.forEach((l) => l(msg.events));
        break;

      case 'MATCH_END':
        if (this.matchId && msg.matchId !== this.matchId) break;
        if (!validBattleResult(msg)) {
          this.handleErrorMessage({ type: 'ERROR', code: 'INVALID_BATTLE_RESULT', message: 'Kết quả không khớp HP cuối vòng. Hãy tạo phòng mới.' });
          return;
        }
        this.roundResult = msg;
        if (msg.matchFinished !== false) { this.monitors.forEach(timer => clearInterval(timer)); this.monitors.clear(); }
        if (msg.snapshot) this.snapshotListeners.forEach(listener => listener(onlinePerspective(msg.snapshot!, this.teamId)));
        this.statusListeners.forEach((l) =>
          l(msg.winnerTeamId === this.teamId ? 'Win' : 'Lose'),
        );
        break;

      case 'ERROR':
        this.handleErrorMessage(msg);
        break;
    }
  }

  private handleErrorMessage(msg: ErrorMessage): void {
    clearTimeout(this.joinTimer);
    if (this.joinPromiseRejecter) {
      this.joinPromiseRejecter(new Error(`[${msg.code}] ${msg.message}`));
      this.joinPromiseResolver = undefined;
      this.joinPromiseRejecter = undefined;
    }
    this.errorListeners.forEach((l) => l(msg));
  }

  onRoomUpdate(handler: (update: RoomUpdateMessage) => void): UnsubscribeFn {
    this.roomUpdateListeners.add(handler);
    return () => this.roomUpdateListeners.delete(handler);
  }

  onMatchStart(handler: (start: MatchStartMessage) => void): UnsubscribeFn {
    this.matchStartListeners.add(handler);
    return () => this.matchStartListeners.delete(handler);
  }

  onOnlineBattleStart(handler: (start: OnlineBattleStartMessage) => void): UnsubscribeFn {
    this.onlineBattleStartListeners.add(handler);
    return () => this.onlineBattleStartListeners.delete(handler);
  }

  onOpponentFormationReady(handler: (msg: OpponentFormationReadyMessage) => void): UnsubscribeFn {
    this.opponentReadyListeners.add(handler);
    return () => this.opponentReadyListeners.delete(handler);
  }

  onPreparationPhase(handler: (phase: PreparationPhase) => void): UnsubscribeFn {
    this.preparationListeners.add(handler);
    return () => this.preparationListeners.delete(handler);
  }

  onEnergyInventory(handler: (msg: EnergyInventoryMessage) => void): UnsubscribeFn {
    this.energyListeners.add(handler);
    return () => this.energyListeners.delete(handler);
  }

  onSnapshot(handler: (snapshot: AutonomousBattleSnapshot) => void): UnsubscribeFn {
    this.snapshotListeners.add(handler);
    return () => this.snapshotListeners.delete(handler);
  }

  onEvents(handler: (events: BattleEvent[]) => void): UnsubscribeFn {
    this.eventsListeners.add(handler);
    return () => this.eventsListeners.delete(handler);
  }

  onStatus(handler: (status: 'Running' | 'Win' | 'Lose') => void): UnsubscribeFn {
    this.statusListeners.add(handler);
    return () => this.statusListeners.delete(handler);
  }

  onError(handler: (err: ErrorMessage) => void): UnsubscribeFn {
    this.errorListeners.add(handler);
    return () => this.errorListeners.delete(handler);
  }

  disconnect(preserveListeners = false): void {
    this.initialization = undefined;
    this.closing = true;
    this.monitors.forEach(timer => clearInterval(timer));
    this.monitors.clear();
    this.lastActivity.clear();
    clearTimeout(this.connectTimer);
    clearTimeout(this.joinTimer);
    this.connectPromiseRejecter?.(new Error('CONNECTION_CLOSED: Phiên đã đóng.'));
    this.joinPromiseRejecter?.(new Error('CONNECTION_CLOSED: Phiên đã đóng.'));
    this.connectPromiseResolver = undefined;
    this.connectPromiseRejecter = undefined;
    this.joinPromiseResolver = undefined;
    this.joinPromiseRejecter = undefined;
    if (!preserveListeners && this.visibilityHandler && typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibilityHandler);
    if (!preserveListeners) this.visibilityHandler = undefined;
    if (this.room) {
      this.room.dispose();
      this.room = undefined;
    }
    if (this.guestConnection) {
      try { this.guestConnection.close(); } catch {}
      this.guestConnection = undefined;
    }
    if (this.hostConnection) {
      try { this.hostConnection.close(); } catch {}
      this.hostConnection = undefined;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = undefined;
    }

    if (!preserveListeners && typeof window !== 'undefined' && typeof window.removeEventListener === 'function' && this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = undefined;
    }

    this.lastReceivedTick = -1;
    this.matchId = '';
    if (preserveListeners) return;
    this.snapshotListeners.clear();
    this.eventsListeners.clear();
    this.statusListeners.clear();
    this.roomUpdateListeners.clear();
    this.matchStartListeners.clear();
    this.errorListeners.clear();
    this.onlineBattleStartListeners.clear();
    this.opponentReadyListeners.clear();
    this.preparationListeners.clear();
    this.energyListeners.clear();
  }
}

import type { NetworkTransportAdapter } from '../battle/controller/RemoteBattleController';
import type { OnlineSessionAdapter } from './OnlineSessionAdapter';
import type { UnsubscribeFn } from '../battle/controller/IBattleController';
import type { AutonomousBattleSnapshot } from '../battle/BattleTypes';
import type { BattleCommand } from '../battle/commands/BattleCommand';
import type { BattleEvent } from '../battle/events/BattleEvents';
import { onlinePerspective } from './OnlinePerspective';
import type { TeamSide } from '../battle/entities/CombatEntity';
import type { PreparationPhase, EnergyInventoryMessage } from '../../network/protocol/NetworkMessages';
import { ONLINE_PROTOCOL_VERSION } from '../../network/protocol/NetworkMessages';
import type {
  ClientMessage,
  ServerMessage,
  RoomJoinedMessage,
  RoomUpdateMessage,
  MatchStartMessage,
  ErrorMessage,
  GameMode,
  DeployedFormationUnit,
  OnlineBattleStartMessage,
  OpponentFormationReadyMessage,
} from '../../network/protocol/NetworkMessages';

export class WebSocketClientAdapter implements OnlineSessionAdapter {
  playerId = '';
  private commandSequence = 0;
  private matchId = '';
  teamId: TeamSide = 'TeamA';
  preparationPhase: PreparationPhase = 'BeastRush';
  opponentFormation?: OpponentFormationReadyMessage;
  private preparationListeners = new Set<(phase: PreparationPhase) => void>();
  private energyListeners = new Set<(msg: EnergyInventoryMessage) => void>();
  private ws?: WebSocket;
  private serverUrl: string;

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

  constructor(serverUrl = 'ws://localhost:3000') {
    this.serverUrl = serverUrl;
  }

  get isConnected(): boolean {
    return this.ws !== undefined && this.ws.readyState === WebSocket.OPEN;
  }

  async connect(url?: string): Promise<void> {
    if (url) this.serverUrl = url;
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          resolve();
        };

        this.ws.onerror = (evt) => {
          reject(new Error(`WebSocket connection failed: ${evt}`));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString()) as ServerMessage;
            this.handleServerMessage(data);
          } catch (e) {
            console.error('Failed to parse incoming WebSocket message', e);
          }
        };

        this.ws.onclose = () => {
          this.statusListeners.forEach((l) => l('Lose'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async createRoom(playerName: string, mode: GameMode = 'pvp'): Promise<RoomJoinedMessage> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      this.joinPromiseResolver = resolve;
      this.joinPromiseRejecter = reject;
      this.send({
        type: 'CREATE_ROOM',
        playerName,
        mode,
      });
    });
  }

  async joinRoom(roomCode: string, playerName: string): Promise<RoomJoinedMessage> {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      this.joinPromiseResolver = resolve;
      this.joinPromiseRejecter = reject;
      this.send({
        type: 'JOIN_ROOM',
        roomCode,
        playerName,
      });
    });
  }

  setReady(isReady: boolean): void {
    this.send({
      type: 'SET_READY',
      isReady,
    });
  }

  deployFormation(units: DeployedFormationUnit[], ready = true, energy: Array<{ energyId: string; charges: number }> = []): void {
    this.send({
      type: 'DEPLOY_FORMATION',
      units,
      ready,
      energy,
    });
  }

  preparationReady(phase: PreparationPhase): void { this.send({ type: 'PREPARATION_READY', phase }); }
  onPreparationPhase(handler: (phase: PreparationPhase) => void): UnsubscribeFn {
    this.preparationListeners.add(handler);
    return () => this.preparationListeners.delete(handler);
  }
  onEnergyInventory(handler: (msg: EnergyInventoryMessage) => void): UnsubscribeFn {
    this.energyListeners.add(handler);
    return () => this.energyListeners.delete(handler);
  }

  sendCommand(command: BattleCommand): void {
    command = { ...command, commandId: command.commandId ?? `${this.playerId}-${++this.commandSequence}`, matchId: this.matchId };
    this.send({
      type: 'BATTLE_COMMAND',
      command,
    });
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

  onError(handler: (err: ErrorMessage) => void): UnsubscribeFn {
    this.errorListeners.add(handler);
    return () => this.errorListeners.delete(handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
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

  private send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  private handleServerMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case 'ROOM_JOINED': {
        if (msg.protocolVersion !== ONLINE_PROTOCOL_VERSION) {
          this.joinPromiseRejecter?.(new Error('Server đang dùng phiên bản cũ. Khởi động lại npm run server, rồi tạo phòng mới.'));
          this.joinPromiseResolver = undefined;
          this.joinPromiseRejecter = undefined;
          this.ws?.close();
          return;
        }
        this.playerId = msg.playerId;
        this.teamId = msg.teamId;
        this.joinPromiseResolver?.(msg);
        this.joinPromiseResolver = undefined;
        this.joinPromiseRejecter = undefined;
        break;
      }

      case 'ROOM_UPDATE': {
        this.roomUpdateListeners.forEach((l) => l(msg));
        break;
      }

      case 'MATCH_START': {
        this.matchId = msg.matchId ?? '';
        this.matchStartListeners.forEach((l) => l(msg));
        break;
      }

      case 'ONLINE_BATTLE_START': {
        this.snapshotListeners.forEach((l) => l(onlinePerspective(msg.snapshot, this.teamId)));
        this.onlineBattleStartListeners.forEach((l) => l(msg));
        break;
      }

      case 'OPPONENT_FORMATION_READY': {
        this.opponentFormation = msg;
        this.opponentReadyListeners.forEach((l) => l(msg));
        break;
      }

      case 'BATTLE_TICK': {
        this.snapshotListeners.forEach((l) => l(onlinePerspective(msg.snapshot, this.teamId)));
        if (msg.events.length > 0) {
          this.eventsListeners.forEach((l) => l(msg.events));
        }
        break;
      }

      case 'MATCH_END': {
        if (msg.snapshot) this.snapshotListeners.forEach(listener => listener(onlinePerspective(msg.snapshot!, this.teamId)));
        this.statusListeners.forEach((l) => l(msg.winnerTeamId === this.teamId ? 'Win' : 'Lose'));
        break;
      }
      case 'PREPARATION_PHASE': {
        this.preparationPhase = msg.phase;
        this.preparationListeners.forEach(listener => listener(msg.phase));
        break;
      }
      case 'ENERGY_INVENTORY': {
        this.energyListeners.forEach(listener => listener(msg));
        break;
      }

      case 'ERROR': {
        if (this.joinPromiseRejecter) {
          this.joinPromiseRejecter(new Error(msg.message));
          this.joinPromiseResolver = undefined;
          this.joinPromiseRejecter = undefined;
        }
        this.errorListeners.forEach((l) => l(msg));
        break;
      }
    }
  }
}

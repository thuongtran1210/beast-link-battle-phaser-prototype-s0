import type { NetworkTransportAdapter } from '../battle/controller/RemoteBattleController';
import type { UnsubscribeFn } from '../battle/controller/IBattleController';
import type { AutonomousBattleSnapshot } from '../battle/BattleTypes';
import type { BattleCommand } from '../battle/commands/BattleCommand';
import type { BattleEvent } from '../battle/events/BattleEvents';
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

export class WebSocketClientAdapter implements NetworkTransportAdapter {
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

  deployFormation(units: DeployedFormationUnit[]): void {
    this.send({
      type: 'DEPLOY_FORMATION',
      units,
    });
  }

  sendCommand(command: BattleCommand): void {
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
        this.matchStartListeners.forEach((l) => l(msg));
        break;
      }

      case 'ONLINE_BATTLE_START': {
        this.onlineBattleStartListeners.forEach((l) => l(msg));
        this.snapshotListeners.forEach((l) => l(msg.snapshot));
        break;
      }

      case 'OPPONENT_FORMATION_READY': {
        this.opponentReadyListeners.forEach((l) => l(msg));
        break;
      }

      case 'BATTLE_TICK': {
        this.snapshotListeners.forEach((l) => l(msg.snapshot));
        if (msg.events.length > 0) {
          this.eventsListeners.forEach((l) => l(msg.events));
        }
        break;
      }

      case 'MATCH_END': {
        this.statusListeners.forEach((l) => l(msg.winnerTeamId === 'TeamA' ? 'Win' : 'Lose'));
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

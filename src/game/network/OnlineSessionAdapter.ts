import type { TeamSide } from '../battle/entities/CombatEntity';
import type {
  PreparationPhase,
  GameMode,
  RoomJoinedMessage,
  RoomUpdateMessage,
  MatchStartMessage,
  OnlineBattleStartMessage,
  OpponentFormationReadyMessage,
  EnergyInventoryMessage,
  ErrorMessage,
  DeployedFormationUnit,
} from '../../network/protocol/NetworkMessages';
import type { NetworkTransportAdapter } from '../battle/controller/RemoteBattleController';
import type { UnsubscribeFn } from '../battle/controller/IBattleController';
import type { BattleCommand } from '../battle/commands/BattleCommand';

/**
 * Universal interface for online session transport adapters
 * (WebSocket client adapter, PeerJS host/guest adapter, etc.)
 */
export interface OnlineSessionAdapter extends NetworkTransportAdapter {
  readonly playerId: string;
  readonly teamId: TeamSide;
  readonly preparationPhase: PreparationPhase;
  readonly opponentFormation?: OpponentFormationReadyMessage;
  readonly isConnected: boolean;

  connect(target?: string): Promise<void>;
  createRoom(playerName: string, mode?: GameMode): Promise<RoomJoinedMessage>;
  joinRoom(roomCode: string, playerName: string): Promise<RoomJoinedMessage>;
  setReady(isReady: boolean): void;
  preparationReady(phase: PreparationPhase): void;
  deployFormation(
    units: DeployedFormationUnit[],
    ready?: boolean,
    energy?: Array<{ energyId: string; charges: number }>,
  ): void;
  sendCommand(command: BattleCommand): void;
  disconnect(): void;

  onRoomUpdate(handler: (update: RoomUpdateMessage) => void): UnsubscribeFn;
  onMatchStart(handler: (start: MatchStartMessage) => void): UnsubscribeFn;
  onOnlineBattleStart(handler: (start: OnlineBattleStartMessage) => void): UnsubscribeFn;
  onOpponentFormationReady(handler: (msg: OpponentFormationReadyMessage) => void): UnsubscribeFn;
  onPreparationPhase(handler: (phase: PreparationPhase) => void): UnsubscribeFn;
  onEnergyInventory(handler: (msg: EnergyInventoryMessage) => void): UnsubscribeFn;
  onError(handler: (err: ErrorMessage) => void): UnsubscribeFn;
}

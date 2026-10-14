import type { AutonomousBattleSnapshot, BattleRow } from '../../game/battle/BattleTypes';
import type { BeastRole } from '../../game/battle/BeastRoles';
import type { BattleCommand } from '../../game/battle/commands/BattleCommand';
import type { BattleEvent } from '../../game/battle/events/BattleEvents';
import type { TeamSide } from '../../game/battle/entities/CombatEntity';
export const ONLINE_PROTOCOL_VERSION = 3;

export type GameMode = 'pvp' | 'coop';
export type PreparationPhase = 'BeastRush' | 'EnergyRush' | 'BattleSetup';
export type RoomState = 'WAITING' | 'COUNTDOWN' | PreparationPhase | 'BATTLE' | 'ENDED';

export interface RoomPlayerInfo {
  playerId: string;
  playerName: string;
  teamId: TeamSide;
  isReady: boolean;
  connected: boolean;
}

/* ---------------- Client -> Server Messages ---------------- */

export interface CreateRoomMessage {
  type: 'CREATE_ROOM';
  playerName: string;
  mode: GameMode;
  protocolVersion?: number;
}

export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  roomCode: string;
  playerName: string;
  protocolVersion?: number;
}

export interface SetReadyMessage {
  type: 'SET_READY';
  isReady: boolean;
}

export interface BattleCommandMessage {
  type: 'BATTLE_COMMAND';
  command: BattleCommand;
}

export interface PingMessage {
  type: 'PING';
  timestamp: number;
}

export interface DeployedFormationUnit {
  unitId: string;
  beastId: string;
  role: BeastRole;
  star: 1 | 2 | 3;
  slotId: string;
  row: BattleRow;
  column: number;
  maxHp: number;
  currentHp: number;
  damage: number;
}

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
}

export interface DeployFormationMessage {
  type: 'DEPLOY_FORMATION';
  units: DeployedFormationUnit[];
  ready?: boolean;
  energy?: Array<{ energyId: string; charges: number }>;
}

export interface PreparationReadyMessage { type: 'PREPARATION_READY'; phase: PreparationPhase; }
export interface PreparationPhaseMessage { type: 'PREPARATION_PHASE'; phase: PreparationPhase; }
export interface EnergyInventoryMessage { type: 'ENERGY_INVENTORY'; entries: Array<{ energyId: string; charges: number }>; }

export type ClientMessage =
  | PreparationReadyMessage
  | CreateRoomMessage
  | JoinRoomMessage
  | SetReadyMessage
  | BattleCommandMessage
  | PingMessage
  | LeaveRoomMessage
  | DeployFormationMessage;

/* ---------------- Server -> Client Messages ---------------- */

export interface RoomJoinedMessage {
  protocolVersion: number;
  type: 'ROOM_JOINED';
  roomId: string;
  roomCode: string;
  mode: GameMode;
  playerId: string;
  teamId: TeamSide;
}

export interface RoomUpdateMessage {
  type: 'ROOM_UPDATE';
  roomCode: string;
  mode: GameMode;
  state: RoomState;
  players: RoomPlayerInfo[];
  allReady: boolean;
}

export interface MatchStartMessage {
  matchId?: string;
  type: 'MATCH_START';
  seed: number;
  mode: GameMode;
  teamAPlayerId: string;
  teamBPlayerId: string;
  initialSnapshot: AutonomousBattleSnapshot;
}

export interface BattleTickMessage {
  matchId?: string;
  type: 'BATTLE_TICK';
  tick: number;
  snapshot: AutonomousBattleSnapshot;
  events: BattleEvent[];
}

export interface MatchEndMessage {
  matchId?: string;
  snapshot?: AutonomousBattleSnapshot;
  type: 'MATCH_END';
  winnerTeamId: string;
  reason: string;
}

export interface ErrorMessage {
  type: 'ERROR';
  code: string;
  message: string;
}

export interface PongMessage {
  type: 'PONG';
  timestamp: number;
}

export interface OnlineBattleStartMessage {
  type: 'ONLINE_BATTLE_START';
  snapshot: AutonomousBattleSnapshot;
  teamAPlayerId: string;
  teamBPlayerId: string;
}

export interface OpponentFormationReadyMessage {
  type: 'OPPONENT_FORMATION_READY';
  opponentPlayerId: string;
  opponentUnitCount: number;
  units: DeployedFormationUnit[];
  ready: boolean;
}

export type ServerMessage =
  | PreparationPhaseMessage
  | EnergyInventoryMessage
  | RoomJoinedMessage
  | RoomUpdateMessage
  | MatchStartMessage
  | BattleTickMessage
  | MatchEndMessage
  | ErrorMessage
  | PongMessage
  | OnlineBattleStartMessage
  | OpponentFormationReadyMessage;

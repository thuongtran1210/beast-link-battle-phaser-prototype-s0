import type { AutonomousBattleSnapshot } from '../../game/battle/BattleTypes';
import type { BattleCommand } from '../../game/battle/commands/BattleCommand';
import type { BattleEvent } from '../../game/battle/events/BattleEvents';
import type { TeamSide } from '../../game/battle/entities/CombatEntity';

export type GameMode = 'pvp' | 'coop';
export type RoomState = 'WAITING' | 'COUNTDOWN' | 'BATTLE' | 'ENDED';

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
}

export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  roomCode: string;
  playerName: string;
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

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
}

export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | SetReadyMessage
  | BattleCommandMessage
  | PingMessage
  | LeaveRoomMessage;

/* ---------------- Server -> Client Messages ---------------- */

export interface RoomJoinedMessage {
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
  type: 'MATCH_START';
  seed: number;
  mode: GameMode;
  teamAPlayerId: string;
  teamBPlayerId: string;
  initialSnapshot: AutonomousBattleSnapshot;
}

export interface BattleTickMessage {
  type: 'BATTLE_TICK';
  tick: number;
  snapshot: AutonomousBattleSnapshot;
  events: BattleEvent[];
}

export interface MatchEndMessage {
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

export type ServerMessage =
  | RoomJoinedMessage
  | RoomUpdateMessage
  | MatchStartMessage
  | BattleTickMessage
  | MatchEndMessage
  | ErrorMessage
  | PongMessage;

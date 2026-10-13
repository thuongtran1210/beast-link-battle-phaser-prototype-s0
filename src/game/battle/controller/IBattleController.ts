import type { AutonomousBattleSnapshot } from '../BattleTypes';
import type { BattleCommand } from '../commands/BattleCommand';
import type { BattleEvent } from '../events/BattleEvents';

export type SnapshotListener = (snapshot: AutonomousBattleSnapshot) => void;
export type EventsListener = (events: BattleEvent[]) => void;
export type StatusListener = (status: 'Running' | 'Win' | 'Lose') => void;
export type UnsubscribeFn = () => void;

/**
 * Unified Battle Controller interface.
 * Abstracts the execution of combat whether running:
 * 1. Locally on client (PVE / Campaign) via AutonomousBattleModel
 * 2. Remotely on server (PvP / Co-op) via WebSocket / Colyseus room
 *
 * Presentation layers (Phaser Views, HUD, Audio) interact strictly through this interface,
 * allowing instant switching between single-player and multiplayer without UI rewrites.
 */
export interface IBattleController {
  /** True if combat state is authoritative on a remote server */
  readonly isRemote: boolean;

  /** Latest available state snapshot */
  readonly currentSnapshot: AutonomousBattleSnapshot;

  /** Issue a command (Cast energy, Surrender, etc.) */
  sendCommand(command: BattleCommand): boolean;

  /** Subscribe to state snapshot updates */
  onSnapshot(listener: SnapshotListener): UnsubscribeFn;

  /** Subscribe to discrete combat event streams */
  onEvents(listener: EventsListener): UnsubscribeFn;

  /** Subscribe to terminal win/lose status changes */
  onStatus(listener: StatusListener): UnsubscribeFn;

  /** Advance simulation step (used in local execution or client prediction tick) */
  step(deltaSeconds?: number): void;

  /** Dispose all event listeners and timers */
  dispose(): void;
}

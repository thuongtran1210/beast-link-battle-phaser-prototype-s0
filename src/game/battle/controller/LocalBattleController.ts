import type { AutonomousBattleModel } from '../AutonomousBattleModel';
import type { AutonomousBattleSnapshot } from '../BattleTypes';
import type { BattleCommand } from '../commands/BattleCommand';
import type { BattleEvent } from '../events/BattleEvents';
import type { EnergyQueue } from '../../energy/EnergyQueue';
import { SIMULATION_STEP } from '../BattleConfig';
import type {
  IBattleController,
  SnapshotListener,
  EventsListener,
  StatusListener,
  UnsubscribeFn,
} from './IBattleController';

/**
 * Local Battle Controller.
 * Runs deterministic combat directly in-memory using AutonomousBattleModel.
 * Used for Campaign, PVE wave runs, Village defense, and offline play.
 */
export class LocalBattleController implements IBattleController {
  readonly isRemote = false;

  private pendingCommands: BattleCommand[] = [];
  private snapshotListeners = new Set<SnapshotListener>();
  private eventsListeners = new Set<EventsListener>();
  private statusListeners = new Set<StatusListener>();
  private lastReportedStatus: 'Running' | 'Win' | 'Lose';

  constructor(
    private readonly model: AutonomousBattleModel,
    private readonly energyQueue?: EnergyQueue,
  ) {
    this.lastReportedStatus = model.snapshot.status;
  }

  get currentSnapshot(): AutonomousBattleSnapshot {
    return this.model.snapshot;
  }

  get battleModel(): AutonomousBattleModel {
    return this.model;
  }

  sendCommand(command: BattleCommand): boolean {
    if (this.currentSnapshot.status !== 'Running') return false;
    this.pendingCommands.push(command);
    return true;
  }

  onSnapshot(listener: SnapshotListener): UnsubscribeFn {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  onEvents(listener: EventsListener): UnsubscribeFn {
    this.eventsListeners.add(listener);
    return () => this.eventsListeners.delete(listener);
  }

  onStatus(listener: StatusListener): UnsubscribeFn {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  step(deltaSeconds = SIMULATION_STEP): void {
    if (this.currentSnapshot.status !== 'Running') return;

    const commandsToRun = [...this.pendingCommands];
    this.pendingCommands = [];

    const { snapshot, events } = this.model.stepWithCommands(
      deltaSeconds,
      commandsToRun,
      this.energyQueue,
    );

    // Notify snapshot listeners
    this.snapshotListeners.forEach((listener) => listener(snapshot));

    // Notify events listeners
    if (events.length > 0) {
      this.eventsListeners.forEach((listener) => listener(events));
    }

    // Check terminal status transition
    if (snapshot.status !== this.lastReportedStatus) {
      this.lastReportedStatus = snapshot.status;
      this.statusListeners.forEach((listener) => listener(snapshot.status));
    }
  }

  dispose(): void {
    this.snapshotListeners.clear();
    this.eventsListeners.clear();
    this.statusListeners.clear();
    this.pendingCommands = [];
  }
}

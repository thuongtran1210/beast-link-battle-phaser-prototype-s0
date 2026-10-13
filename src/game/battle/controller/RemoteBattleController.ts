import type { AutonomousBattleSnapshot } from '../BattleTypes';
import type { BattleCommand } from '../commands/BattleCommand';
import type { BattleEvent } from '../events/BattleEvents';
import type {
  IBattleController,
  SnapshotListener,
  EventsListener,
  StatusListener,
  UnsubscribeFn,
} from './IBattleController';

export interface NetworkTransportAdapter {
  sendCommand(command: BattleCommand): void;
  onSnapshot(handler: (snapshot: AutonomousBattleSnapshot) => void): UnsubscribeFn;
  onEvents(handler: (events: BattleEvent[]) => void): UnsubscribeFn;
  onStatus(handler: (status: 'Running' | 'Win' | 'Lose') => void): UnsubscribeFn;
  disconnect(): void;
}

/**
 * Remote Battle Controller (Client Network Adapter).
 * Synchronizes with an authoritative game server (e.g. Colyseus room or WebSocket backend).
 *
 * All local inputs are serialized and dispatched via sendCommand().
 * Snapshots and events from server drive the presentation layer.
 */
export class RemoteBattleController implements IBattleController {
  readonly isRemote = true;

  private latestSnapshot: AutonomousBattleSnapshot;
  private snapshotListeners = new Set<SnapshotListener>();
  private eventsListeners = new Set<EventsListener>();
  private statusListeners = new Set<StatusListener>();
  private unsubs: UnsubscribeFn[] = [];

  constructor(
    initialSnapshot: AutonomousBattleSnapshot,
    private readonly transport: NetworkTransportAdapter,
  ) {
    this.latestSnapshot = initialSnapshot;

    // Listen to network stream from server
    this.unsubs.push(
      this.transport.onSnapshot((snapshot) => {
        this.latestSnapshot = snapshot;
        this.snapshotListeners.forEach((l) => l(snapshot));
      }),
    );

    this.unsubs.push(
      this.transport.onEvents((events) => {
        if (events.length > 0) {
          this.eventsListeners.forEach((l) => l(events));
        }
      }),
    );

    this.unsubs.push(
      this.transport.onStatus((status) => {
        this.statusListeners.forEach((l) => l(status));
      }),
    );
  }

  get currentSnapshot(): AutonomousBattleSnapshot {
    return this.latestSnapshot;
  }

  sendCommand(command: BattleCommand): boolean {
    this.transport.sendCommand(command);
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

  step(_deltaSeconds?: number): void {
    // In authoritative multiplayer mode, the remote server drives ticking.
    // Client can run local prediction or visual interpolation here if needed.
  }

  dispose(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.snapshotListeners.clear();
    this.eventsListeners.clear();
    this.statusListeners.clear();
    this.transport.disconnect();
  }
}

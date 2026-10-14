import type { VillageBlock, VillageProductionSnapshot, VillageWorkerPhase, VillageWorkerSnapshot } from './VillageActivity';
import type { VillageActivityKind, VillageActivityStationId } from './VillageCatalog';

export interface VillageJob {
  id: string;
  stationId: VillageActivityStationId;
  kind: VillageActivityKind;
  home: { x: number; y: number };
  work: { x: number; y: number };
  face: number;
}
interface VillageWorker extends VillageJob {
  phase: VillageWorkerPhase;
  remaining: number;
  duration: number;
  x: number;
  y: number;
  from: { x: number; y: number };
  facing: number;
  retryRemaining: number;
  block?: VillageBlock;
}
export interface VillageWorkHooks {
  available?: (kind: VillageActivityKind) => boolean;
  begin: (kind: VillageActivityKind) => number | false;
  advance: (kind: VillageActivityKind, seconds: number) => void;
  rate?: (id: string) => number;
  /** Persisted production is authoritative; leisure uses the local work clock. */
  progress?: (kind: VillageActivityKind) => VillageProductionSnapshot | undefined;
}

export class VillageSimulation {
  private readonly workerStates = new Map<string, VillageWorker>();
  private readonly reservations = new Map<VillageActivityStationId, string>();
  private disposed = false;

  constructor(private readonly complete: (kind: VillageActivityKind) => void | boolean, private readonly hooks?: VillageWorkHooks) {}

  /** Compatibility read API returns detached snapshots, never internal workers. */
  get workers(): ReadonlyMap<string, VillageWorkerSnapshot> {
    return new Map(this.snapshot().map(worker => [worker.id, worker]));
  }

  snapshot(): readonly VillageWorkerSnapshot[] {
    return [...this.workerStates.values()].map(w => {
      const progress = this.hooks?.progress?.(w.kind);
      const block = w.block ?? progress?.block;
      return { id: w.id, stationId: w.stationId, kind: w.kind, phase: w.phase,
        remaining: w.phase === 'work' ? progress?.remaining ?? w.remaining : w.remaining,
        x: w.x, y: w.y, facing: w.facing, jobId: progress?.jobId,gardenStage:progress?.gardenStage,
        block: block ? { ...block } : undefined };
    });
  }

  sync(jobs: readonly VillageJob[]): void {
    if (this.disposed) return;
    const ids = new Set(jobs.map(job => job.id));
    for (const [id, worker] of this.workerStates) {
      if (!ids.has(id)) {
        this.release(worker);
        this.workerStates.delete(id);
      }
    }
    for (const job of jobs) {
      const old = this.workerStates.get(job.id);
      const owned = { ...job, home: { ...job.home }, work: { ...job.work } };
      if (old && old.stationId === job.stationId && old.kind === job.kind
        && old.work.x === job.work.x && old.work.y === job.work.y) {
        Object.assign(old, owned);
        continue;
      }
      if (old) this.release(old);
      this.workerStates.set(job.id, { ...owned, phase: 'rest', remaining: 1 + this.workerStates.size * 2,
        duration: 0, x: job.home.x, y: job.home.y, from: { ...job.home }, facing: 1, retryRemaining: 0 });
    }
  }

  private release(worker: VillageWorker): void {
    if (this.reservations.get(worker.stationId) === worker.id) this.reservations.delete(worker.stationId);
  }

  private travel(worker: VillageWorker, phase: 'walk' | 'return'): void {
    const to = phase === 'walk' ? worker.work : worker.home;
    worker.from = { x: worker.x, y: worker.y };
    worker.duration = Math.max(2, Math.hypot(to.x - worker.x, to.y - worker.y) / 85);
    worker.remaining = worker.duration;
    worker.phase = phase;
    worker.block = undefined;
    worker.retryRemaining = 0;
    if (Math.abs(to.x - worker.x) > .01) worker.facing = to.x < worker.x ? -1 : 1;
  }

  step(seconds: number, paused = false): void {
    if (this.disposed || paused || !Number.isFinite(seconds) || seconds <= 0) return;
    for (const worker of this.workerStates.values()) {
      let budget = seconds;
      for (let guard = 0; budget > 0 && guard < 100; guard++) {
        if (worker.retryRemaining > 0) {
          const wait = Math.min(budget, worker.retryRemaining);
          worker.retryRemaining -= wait;
          budget -= wait;
          if (worker.retryRemaining > 1e-8 || budget <= 0) break;
        }
        const progress = worker.phase === 'work' ? this.hooks?.progress?.(worker.kind) : undefined;
        if (progress) worker.remaining = progress.remaining;
        const requestedRate = this.hooks?.rate?.(worker.id) ?? 1;
        const rate = worker.phase === 'work' && Number.isFinite(requestedRate)
          ? Math.max(.01, Math.min(1, requestedRate)) : 1;
        const wall = Math.min(budget, Math.max(0, worker.remaining) / rate);
        const used = wall * rate;
        worker.remaining -= used;
        budget -= wall;
        if (worker.phase === 'work') {
          this.hooks?.advance(worker.kind, used);
          worker.remaining = this.hooks?.progress?.(worker.kind)?.remaining ?? worker.remaining;
        }
        if (worker.phase === 'walk' || worker.phase === 'return') {
          const to = worker.phase === 'walk' ? worker.work : worker.home;
          const fraction = 1 - worker.remaining / worker.duration;
          worker.x = worker.from.x + (to.x - worker.from.x) * fraction;
          worker.y = worker.from.y + (to.y - worker.from.y) * fraction;
        }
        if (worker.remaining > 1e-8) break;
        if (worker.phase === 'rest') {
          if(this.hooks?.available?.(worker.kind)===false){worker.retryRemaining=1;continue;}
          const holder = this.reservations.get(worker.stationId);
          if (holder && holder !== worker.id) {
            worker.block = { code: 'station-busy', message: 'Trạm đang có cư dân làm việc' };
            worker.retryRemaining = 1;
            continue;
          }
          this.reservations.set(worker.stationId, worker.id);
          this.travel(worker, 'walk');
        } else if (worker.phase === 'walk') {
          const duration = this.hooks?.begin(worker.kind) ?? 8;
          if (duration === false) {
            worker.retryRemaining = 1;
            break;
          }
          worker.phase = 'work';
          worker.remaining = Math.max(0, duration);
          worker.facing = worker.face;
        } else if (worker.phase === 'work') {
          if (this.complete(worker.kind) === false) {
            worker.retryRemaining = 1;
            break;
          }
          this.travel(worker, 'return');
          this.release(worker);
        } else {
          worker.phase = 'rest';
          worker.remaining = 10;
        }
      }
    }
  }

  dispose(): void {
    this.disposed = true;
    this.workerStates.clear();
    this.reservations.clear();
  }
}

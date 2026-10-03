export interface BeastRushPhaseTimerState { active: boolean; remainingSeconds: number; }

/** P1-V14C.1: fixed Beast Rush phase duration, deliberately independent of Combo quality. */
export class BeastRushPhaseTimer {
  private state: BeastRushPhaseTimerState;
  private readonly endListeners = new Set<() => void>();
  constructor(private readonly durationSeconds = 12) { this.state = { active: false, remainingSeconds: durationSeconds }; }
  get snapshot(): Readonly<BeastRushPhaseTimerState> { return { ...this.state }; }
  start(): Readonly<BeastRushPhaseTimerState> { this.state = { active: true, remainingSeconds: this.durationSeconds }; return this.snapshot; }
  update(deltaSeconds: number): Readonly<BeastRushPhaseTimerState> {
    if (!this.state.active || deltaSeconds <= 0) return this.snapshot;
    const remainingSeconds = Math.max(0, this.state.remainingSeconds - deltaSeconds);
    this.state = { active: remainingSeconds > 0, remainingSeconds };
    if (remainingSeconds === 0) for (const listener of this.endListeners) listener();
    return this.snapshot;
  }
  onEnded(listener: () => void): () => void { this.endListeners.add(listener); return () => this.endListeners.delete(listener); }
  reset(): void { this.state = { active: false, remainingSeconds: this.durationSeconds }; }
}

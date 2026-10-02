export interface EnergyRushTimerState {
  active: boolean;
  remainingSeconds: number;
}

/**
 * P1-V1 Experimental Energy Rush Countdown Timer.
 * Fixed 8.0s duration, clamps at 0, emits expiration exactly once.
 */
export class EnergyRushTimer {
  private state: EnergyRushTimerState;
  private readonly endListeners = new Set<() => void>();

  constructor(private readonly durationSeconds: number = 8.0) {
    this.state = { active: false, remainingSeconds: durationSeconds };
  }

  get snapshot(): Readonly<EnergyRushTimerState> {
    return { ...this.state };
  }

  start(): Readonly<EnergyRushTimerState> {
    this.state = { active: true, remainingSeconds: this.durationSeconds };
    return this.snapshot;
  }

  update(deltaSeconds: number): Readonly<EnergyRushTimerState> {
    if (!this.state.active || deltaSeconds <= 0) return this.snapshot;
    const remainingSeconds = Math.max(0, this.state.remainingSeconds - deltaSeconds);
    this.state = { ...this.state, remainingSeconds };
    if (remainingSeconds === 0) {
      this.state = { ...this.state, active: false };
      for (const listener of this.endListeners) {
        listener();
      }
    }
    return this.snapshot;
  }

  onEnded(listener: () => void): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  reset(): void {
    this.state = { active: false, remainingSeconds: this.durationSeconds };
  }
}

export interface EnergyRushTimerState {
  active: boolean;
  remainingSeconds: number;
}

/**
 * P1-V1 / P1-V14C.1a Experimental Energy Rush Countdown Timer.
 * Fixed 12.0s duration, clamps at 0, emits expiration exactly once.
 */
export class EnergyRushTimer {
  private state: EnergyRushTimerState;
  private readonly endListeners = new Set<() => void>();

  constructor(private readonly durationSeconds: number = 12.0) {
    this.state = { active: false, remainingSeconds: durationSeconds };
  }

  get snapshot(): Readonly<EnergyRushTimerState> {
    return { ...this.state };
  }

  get isReady(): boolean {
    return !this.state.active && this.state.remainingSeconds > 0;
  }

  get isActive(): boolean {
    return this.state.active;
  }

  get isEnded(): boolean {
    return !this.state.active && this.state.remainingSeconds === 0;
  }

  start(): Readonly<EnergyRushTimerState> {
    if (this.state.active) return this.snapshot;
    this.state = {
      active: true,
      remainingSeconds: this.state.remainingSeconds > 0 ? this.state.remainingSeconds : this.durationSeconds,
    };
    return this.snapshot;
  }

  update(deltaSeconds: number): Readonly<EnergyRushTimerState> {
    if (!this.state.active || deltaSeconds <= 0) return this.snapshot;
    const remainingSeconds = Math.max(0, this.state.remainingSeconds - deltaSeconds);
    const wasActive = this.state.active;
    this.state = { active: remainingSeconds > 0, remainingSeconds };
    if (wasActive && remainingSeconds === 0) {
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

export interface ComboQualityState { active: boolean; windowSeconds: number; currentStreak: number; bestStreak: number; breakCount: number; completedStreaks: number; }

/** P1-V14C.1: player execution signal only. It never owns phase duration or rewards. */
export class ComboQualityTracker {
  private state: ComboQualityState = { active: false, windowSeconds: 0, currentStreak: 0, bestStreak: 0, breakCount: 0, completedStreaks: 0 };
  constructor(private readonly linkWindowSeconds = 1.5) {}
  get snapshot(): Readonly<ComboQualityState> { return { ...this.state }; }
  registerValidMatch(): Readonly<ComboQualityState> { const currentStreak = this.state.currentStreak + 1; this.state = { ...this.state, active: true, windowSeconds: this.linkWindowSeconds, currentStreak, bestStreak: Math.max(this.state.bestStreak, currentStreak) }; return this.snapshot; }
  breakStreak(): Readonly<ComboQualityState> { if (this.state.currentStreak === 0) return this.snapshot; this.state = { ...this.state, active: false, windowSeconds: 0, currentStreak: 0, breakCount: this.state.breakCount + 1, completedStreaks: this.state.completedStreaks + 1 }; return this.snapshot; }
  update(deltaSeconds: number): Readonly<ComboQualityState> { if (!this.state.active || deltaSeconds <= 0) return this.snapshot; const windowSeconds = Math.max(0, this.state.windowSeconds - deltaSeconds); this.state = { ...this.state, windowSeconds }; if (windowSeconds === 0) return this.breakStreak(); return this.snapshot; }
  reset(): void { this.state = { active: false, windowSeconds: 0, currentStreak: 0, bestStreak: 0, breakCount: 0, completedStreaks: 0 }; }
}

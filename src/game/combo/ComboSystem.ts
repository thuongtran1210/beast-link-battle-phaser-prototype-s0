import { RuleConfig } from '../config/RuleConfig';

export interface ComboTimingConfig {
  initialSeconds: number;
  bonusSeconds: number;
  capSeconds: number;
}

export interface ComboState {
  active: boolean;
  remainingSeconds: number;
  count: number;
}

/**
 * COMBO-001 / 002 / 003 / 004: framework-independent combo timer and count.
 * Defaults to canonical RuleConfig (5.0s initial / +0.3s bonus / 5.0s cap),
 * while supporting explicit experimental overrides (such as P1-V2 8.0s / +0.3s / 8.0s).
 */
export class ComboSystem {
  private state: ComboState = { active: false, remainingSeconds: 0, count: 0 };
  private readonly endListeners = new Set<() => void>();
  private readonly timing: ComboTimingConfig;

  constructor(timingOverride?: Partial<ComboTimingConfig>) {
    this.timing = {
      initialSeconds: timingOverride?.initialSeconds ?? RuleConfig.comboInitialSeconds,
      bonusSeconds: timingOverride?.bonusSeconds ?? RuleConfig.comboBonusSeconds,
      capSeconds: timingOverride?.capSeconds ?? RuleConfig.comboCapSeconds,
    };
  }

  get snapshot(): Readonly<ComboState> {
    return { ...this.state };
  }

  get config(): Readonly<ComboTimingConfig> {
    return { ...this.timing };
  }

  registerValidMatch(): Readonly<ComboState> {
    if (!this.state.active) {
      this.state = { active: true, remainingSeconds: this.timing.initialSeconds, count: 1 };
    } else {
      this.state = {
        active: true,
        remainingSeconds: Math.min(this.timing.capSeconds, this.state.remainingSeconds + this.timing.bonusSeconds),
        count: this.state.count + 1,
      };
    }
    return this.snapshot;
  }

  update(deltaSeconds: number): Readonly<ComboState> {
    if (!this.state.active || deltaSeconds <= 0) return this.snapshot;
    const remainingSeconds = Math.max(0, this.state.remainingSeconds - deltaSeconds);
    this.state = { ...this.state, remainingSeconds };
    if (remainingSeconds === 0) {
      this.state = { ...this.state, active: false };
      for (const listener of this.endListeners) listener();
    }
    return this.snapshot;
  }

  onEnded(listener: () => void): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  reset(): void {
    this.state = { active: false, remainingSeconds: 0, count: 0 };
  }
}

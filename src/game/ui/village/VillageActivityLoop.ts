export interface VillageFrameEnvironment {
  requestFrame(callback: (now: number) => void): number;
  cancelFrame(id: number): void;
  hidden(): boolean;
  onVisibility(callback: () => void): () => void;
  onPageHide(callback: () => void): () => void;
}

/** One owned frame loop; visibility resets the time origin, never catches up. */
export class VillageActivityLoop {
  private frame?: number;
  private last?: number;
  private running = false;
  private disposed = false;
  private cleanup: (() => void)[] = [];

  constructor(private readonly environment: VillageFrameEnvironment,
    private readonly step: (seconds: number) => void, private readonly checkpoint: () => void) {}

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.cleanup = [this.environment.onVisibility(() => {
      this.last = undefined;
      if (this.environment.hidden()) this.checkpoint();
    }), this.environment.onPageHide(() => this.checkpoint())];
    this.frame = this.environment.requestFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.frame = undefined;
    if (!this.running) return;
    if (this.environment.hidden()) this.last = undefined;
    else {
      const seconds = this.last === undefined ? 0 : Math.max(0, Math.min((now - this.last) / 1000, .1));
      this.last = now;
      this.step(seconds);
    }
    if (this.running) this.frame = this.environment.requestFrame(this.tick);
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    if (this.frame !== undefined) this.environment.cancelFrame(this.frame);
    this.frame = undefined;
    this.last = undefined;
    for (const stop of this.cleanup) stop();
    this.cleanup = [];
  }
}

export function browserVillageFrames(): VillageFrameEnvironment {
  return {
    requestFrame: callback => requestAnimationFrame(callback),
    cancelFrame: id => cancelAnimationFrame(id),
    hidden: () => document.hidden,
    onVisibility: callback => {
      document.addEventListener('visibilitychange', callback);
      return () => document.removeEventListener('visibilitychange', callback);
    },
    onPageHide: callback => {
      window.addEventListener('pagehide', callback);
      return () => window.removeEventListener('pagehide', callback);
    },
  };
}

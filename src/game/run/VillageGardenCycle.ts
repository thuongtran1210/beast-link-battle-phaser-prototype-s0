/** Crop presentation states; economy jobs own time/quantity/cost, not animation. */
export type GardenStage = 'empty' | 'sowing' | 'growing' | 'mature' | 'harvesting' | 'waiting-pickup';
export interface GardenCycleProgress {
  readonly remaining: number;
  readonly totalSeconds: number;
  readonly quantity: number;
  readonly jobId: number;
}
export interface GardenCycleSnapshot {
  readonly stage: GardenStage;
  readonly progress: number;
  readonly quantity: number;
  readonly jobId?: number;
}

/** Relative visual stage boundaries preserve one economic work clock. */
export function gardenCycleSnapshot(job?: GardenCycleProgress): GardenCycleSnapshot {
  if (!job) return { stage: 'empty', progress: 0, quantity: 0 };
  const progress = Math.max(0, Math.min(1, 1 - job.remaining / job.totalSeconds));
  const boundaryProgress=progress+1e-9;
  const stage: GardenStage = boundaryProgress >= 1 ? 'waiting-pickup'
    : boundaryProgress < .1 ? 'sowing' : boundaryProgress < .75 ? 'growing'
      : boundaryProgress < .85 ? 'mature' : 'harvesting';
  return { stage, progress, quantity: job.quantity, jobId: job.jobId };
}

/** Village business contracts are independent of DOM and Battle animation. */
import type { VillageActivityKind, VillageActivityStationId, VillageResidentId, VillageStationId } from './VillageCatalog';
import type { ProductionKind, ResourceId } from './VillageEconomy';
import type { VillageIncident } from './VillageIncidents';
import type { GardenStage } from './VillageGardenCycle';
export type VillageWorkerPhase = 'rest' | 'walk' | 'work' | 'return';
export type VillageBlockCode = 'missing-funds' | 'missing-input' | 'storage-full' | 'persistence-failed' | 'not-ready' | 'no-worker' | 'station-busy' | 'waiting-pickup';
export interface VillageBlock {
  readonly code: VillageBlockCode;
  readonly message: string;
}
export interface VillageWorkerSnapshot {
  readonly id: string;
  readonly stationId: VillageActivityStationId;
  readonly kind: VillageActivityKind;
  readonly phase: VillageWorkerPhase;
  /** Movement/presentation clock; persisted production owns actual job progress. */
  readonly remaining: number;
  readonly x: number;
  readonly y: number;
  readonly facing: number;
  readonly jobId?: number;
  readonly gardenStage?: GardenStage;
  readonly block?: VillageBlock;
}
/** Job IDs are the existing persisted economy sequence IDs, never animation IDs. */
export interface VillageProductionSnapshot {
  readonly gardenStage?: GardenStage;
  readonly kind: ProductionKind;
  readonly stationId: VillageStationId;
  readonly workerId: VillageResidentId;
  readonly jobId?: number;
  readonly remaining: number;
  readonly cost: number;
  readonly status: 'ready' | 'working' | 'ready-output' | 'blocked';
  readonly block?: VillageBlock;
}
export type VillageEvent =
  | { readonly type:'production-staged'; readonly kind:ProductionKind; readonly jobId:number }
  | { readonly type: 'garden-harvested'; readonly jobId: number; readonly quantity: number }
  | { readonly type: 'production-started'; readonly kind: ProductionKind; readonly stationId: VillageStationId; readonly workerId: VillageResidentId; readonly jobId: number }
  | { readonly type: 'production-delivered'; readonly kind: ProductionKind; readonly stationId: VillageStationId; readonly workerId: VillageResidentId; readonly jobId: number; readonly resource: ResourceId; readonly quantity: number; readonly incident?: VillageIncident }
  | { readonly type: 'activity-completed'; readonly kind: 'bath' | 'carrot' };
export type VillageCommandResult<T> =
  | { readonly ok: true; readonly value: T; readonly events?: readonly VillageEvent[] }
  | { readonly ok: false; readonly block: VillageBlock };

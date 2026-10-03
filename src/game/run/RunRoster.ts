import { roleBaseStats, type CombatUnit } from '../battle/AutonomousBattleModel';
import type { FormationUnit } from '../battle/BattleFormation';
import type { DeployedUnit } from '../queue/StarConverter';
import { starStatMultiplier, type StarLevel } from './StarProfile';
import { roleForBeast } from '../battle/BeastRoles';
import type { RunLinkShardPool } from './RunLinkShardPool';
export type RunUnitStatus = 'ready' | 'ko';
export interface RunUnitInstance { instanceId: string; beastId: string; star: 1 | 2 | 3; maxHp: number; currentHp: number; status: RunUnitStatus; }
export const P1V14B_ACTIVE_SQUAD_LIMIT = 4;
export interface ConsolidationPreview {
  selectedId: string;
  primaryId: string;
  ingredientIds: string[];
  beastId: string;
  sourceStar: StarLevel;
  targetStar: StarLevel | null;
  eligibleCount: number;
  shardsRequired: number;
  canConsolidate: boolean;
  isShardAssisted: boolean;
}
export interface ConsolidationResult {
  upgraded: RunUnitInstance;
  consumedIds: string[];
  shardsSpent: number;
  isShardAssisted: boolean;
}
export class RunRoster {
  private serial = 0;
  private readonly byId = new Map<string, RunUnitInstance>();
  get units(): RunUnitInstance[] { return [...this.byId.values()].map((u) => ({ ...u })); }
  recruit(units: ReadonlyArray<DeployedUnit>): RunUnitInstance[] { return units.map((unit) => { const instanceId = `run-${++this.serial}`; const maxHp = this.maxHpFor(unit.contentId, unit.star); const created = { instanceId, beastId: unit.contentId, star: unit.star, maxHp, currentHp: maxHp, status: 'ready' as const }; this.byId.set(instanceId, created); return { ...created }; }); }
  deployable(): RunUnitInstance[] { return this.units.filter((u) => u.status === 'ready'); }
  get(instanceId: string): RunUnitInstance | undefined { const unit = this.byId.get(instanceId); return unit && { ...unit }; }
  reconcile(battleUnits: ReadonlyArray<CombatUnit>): void { for (const battle of battleUnits) { const unit = this.byId.get(battle.unitId); if (!unit) continue; unit.currentHp = Math.max(0, Math.min(unit.maxHp, battle.currentHp)); unit.status = unit.currentHp <= 0 ? 'ko' : 'ready'; } }
  reset(): void { this.byId.clear(); this.serial = 0; }
  formationUnits(): Array<DeployedUnit & { instanceId: string }> { return this.units.map((u) => ({ contentId: u.beastId, star: u.star, instanceId: u.instanceId })); }
  canDeploy(unitId: string): boolean { return this.byId.get(unitId)?.status === 'ready'; }
  activeCount(formation: ReadonlyArray<FormationUnit>): number { return formation.filter((u) => u.slotId !== null).length; }
  consolidationPreview(
    selectedId: string,
    deployedUnitIds: ReadonlySet<string> = new Set(),
    availableShards = 0,
  ): ConsolidationPreview | undefined {
    const selected = this.byId.get(selectedId);
    if (!selected || selected.status !== 'ready' || deployedUnitIds.has(selectedId)) return undefined;
    const targetStar = selected.star === 3 ? null : (selected.star + 1) as StarLevel;
    const eligible = this.units.filter((unit) => unit.status === 'ready' && !deployedUnitIds.has(unit.instanceId) && unit.beastId === selected.beastId && unit.star === selected.star)
      .sort((a, b) => this.serialFor(a.instanceId) - this.serialFor(b.instanceId));

    if (eligible.length >= 3) {
      const ingredients = [selected, ...eligible.filter((unit) => unit.instanceId !== selectedId)].slice(0, 3)
        .sort((a, b) => this.serialFor(a.instanceId) - this.serialFor(b.instanceId));
      return {
        selectedId,
        primaryId: ingredients[0]?.instanceId ?? selectedId,
        ingredientIds: ingredients.map((unit) => unit.instanceId),
        beastId: selected.beastId,
        sourceStar: selected.star,
        targetStar,
        eligibleCount: eligible.length,
        shardsRequired: 0,
        canConsolidate: targetStar !== null && ingredients.length === 3,
        isShardAssisted: false,
      };
    } else if (eligible.length === 2) {
      const ingredients = [selected, ...eligible.filter((unit) => unit.instanceId !== selectedId)].slice(0, 2)
        .sort((a, b) => this.serialFor(a.instanceId) - this.serialFor(b.instanceId));
      return {
        selectedId,
        primaryId: ingredients[0]?.instanceId ?? selectedId,
        ingredientIds: ingredients.map((unit) => unit.instanceId),
        beastId: selected.beastId,
        sourceStar: selected.star,
        targetStar,
        eligibleCount: eligible.length,
        shardsRequired: 1,
        canConsolidate: targetStar !== null && ingredients.length === 2 && availableShards >= 1,
        isShardAssisted: true,
      };
    } else {
      return {
        selectedId,
        primaryId: selectedId,
        ingredientIds: [selectedId],
        beastId: selected.beastId,
        sourceStar: selected.star,
        targetStar,
        eligibleCount: eligible.length,
        shardsRequired: 0,
        canConsolidate: false,
        isShardAssisted: false,
      };
    }
  }
  canConsolidate(selectedId: string, deployedUnitIds: ReadonlySet<string> = new Set(), availableShards = 0): boolean {
    const preview = this.consolidationPreview(selectedId, deployedUnitIds, availableShards);
    return Boolean(preview && preview.canConsolidate);
  }
  consolidate(selectedId: string, deployedUnitIds: ReadonlySet<string> = new Set(), shardPool?: RunLinkShardPool): ConsolidationResult | undefined {
    const availableShards = shardPool?.count ?? 0;
    if (!this.canConsolidate(selectedId, deployedUnitIds, availableShards)) return undefined;
    const preview = this.consolidationPreview(selectedId, deployedUnitIds, availableShards)!;
    if (preview.shardsRequired > 0) {
      if (!shardPool || !shardPool.spend(preview.shardsRequired)) return undefined;
    }
    const ingredients = preview.ingredientIds.map((id) => this.byId.get(id)!);
    const primary = this.byId.get(preview.primaryId)!;
    const healthRatio = ingredients.reduce((sum, unit) => sum + unit.currentHp, 0) / ingredients.reduce((sum, unit) => sum + unit.maxHp, 0);
    const targetMaxHp = this.maxHpFor(primary.beastId, preview.targetStar!);
    primary.star = preview.targetStar!;
    primary.maxHp = targetMaxHp;
    primary.currentHp = Math.max(0, Math.min(targetMaxHp, Math.round(targetMaxHp * healthRatio)));
    primary.status = primary.currentHp <= 0 ? 'ko' : 'ready';
    const consumedIds = preview.ingredientIds.filter((id) => id !== primary.instanceId);
    consumedIds.forEach((id) => this.byId.delete(id));
    return {
      upgraded: { ...primary },
      consumedIds,
      shardsSpent: preview.shardsRequired,
      isShardAssisted: preview.isShardAssisted,
    };
  }
  private maxHpFor(beastId: string, star: StarLevel): number { return roleBaseStats(roleForBeast(beastId)).hp * starStatMultiplier(star); }
  private serialFor(instanceId: string): number { return Number(instanceId.replace('run-', '')) || Number.MAX_SAFE_INTEGER; }
}

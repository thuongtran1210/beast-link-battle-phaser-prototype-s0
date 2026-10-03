import { roleBaseStats, type CombatUnit } from '../battle/AutonomousBattleModel';
import type { FormationUnit } from '../battle/BattleFormation';
import type { DeployedUnit } from '../queue/StarConverter';
export type RunUnitStatus = 'ready' | 'ko';
export interface RunUnitInstance { instanceId: string; beastId: string; star: 1 | 2 | 3; maxHp: number; currentHp: number; status: RunUnitStatus; }
const multiplier: Record<1 | 2 | 3, number> = { 1: 1, 2: 1.8, 3: 3.2 };
export const P1V14B_ACTIVE_SQUAD_LIMIT = 4;
export class RunRoster {
  private serial = 0;
  private readonly byId = new Map<string, RunUnitInstance>();
  get units(): RunUnitInstance[] { return [...this.byId.values()].map((u) => ({ ...u })); }
  recruit(units: ReadonlyArray<DeployedUnit>): RunUnitInstance[] { return units.map((unit) => { const instanceId = `run-${++this.serial}`; const maxHp = roleBaseStats((unit.contentId === 'beast-a' || unit.contentId === 'beast-e') ? 'Tanker' : unit.contentId === 'beast-b' ? 'Assassin' : unit.contentId === 'beast-d' ? 'Mage' : 'Ranger').hp * multiplier[unit.star]; const created = { instanceId, beastId: unit.contentId, star: unit.star, maxHp, currentHp: maxHp, status: 'ready' as const }; this.byId.set(instanceId, created); return { ...created }; }); }
  deployable(): RunUnitInstance[] { return this.units.filter((u) => u.status === 'ready'); }
  get(instanceId: string): RunUnitInstance | undefined { const unit = this.byId.get(instanceId); return unit && { ...unit }; }
  reconcile(battleUnits: ReadonlyArray<CombatUnit>): void { for (const battle of battleUnits) { const unit = this.byId.get(battle.unitId); if (!unit) continue; unit.currentHp = Math.max(0, Math.min(unit.maxHp, battle.currentHp)); unit.status = unit.currentHp <= 0 ? 'ko' : 'ready'; } }
  reset(): void { this.byId.clear(); this.serial = 0; }
  formationUnits(): Array<DeployedUnit & { instanceId: string }> { return this.units.map((u) => ({ contentId: u.beastId, star: u.star, instanceId: u.instanceId })); }
  canDeploy(unitId: string): boolean { return this.byId.get(unitId)?.status === 'ready'; }
  activeCount(formation: ReadonlyArray<FormationUnit>): number { return formation.filter((u) => u.slotId !== null).length; }
}

import { type BattleFormation, type FormationUnit } from './BattleFormation';
import type { BeastRole } from './BeastRoles';
import type { EnergyQueue } from '../energy/EnergyQueue';

export type BattleStatus = 'Running' | 'Win' | 'Lose';
export interface CombatUnit { unitId: string; beastId: string; role: BeastRole; star: 1 | 2 | 3; slotId: string; row: 'Front' | 'Mid' | 'Back'; column: number; currentHp: number; maxHp: number; damage: number; }
export interface AutonomousBattleSnapshot { status: BattleStatus; enemyHp: number; enemyMaxHp: number; enemyDamage: number; elapsedTicks: number; units: CombatUnit[]; }

export const EXPERIMENTAL_FRONTLINE_HEAL_HP = 30;
export const FRONTLINE_HEAL_HP = 30;

const baseStats: Readonly<Record<BeastRole, { hp: number; damage: number }>> = {
  Tanker: { hp: 80, damage: 6 }, Assassin: { hp: 35, damage: 14 }, Ranger: { hp: 45, damage: 10 }, Mage: { hp: 40, damage: 9 },
};
const starMultiplier: Readonly<Record<1 | 2 | 3, number>> = { 1: 1, 2: 1.8, 3: 3.2 };

/** Pure P1-S4 deterministic combat with Timed Energy Cast using Experimental / prototype-only fixtures. */
export class AutonomousBattleModel {
  private state: AutonomousBattleSnapshot;
  constructor(formation: BattleFormation) {
    const slots = new Map(formation.slots.filter((slot) => slot.unitId).map((slot) => [slot.slotId, slot]));
    this.state = {
      status: 'Running', enemyHp: 150, enemyMaxHp: 150, enemyDamage: 15, elapsedTicks: 0,
      units: formation.units.filter((unit): unit is FormationUnit & { slotId: string } => unit.slotId !== null).map((unit) => this.createUnit(unit, slots.get(unit.slotId)!)),
    };
    if (!this.state.units.length) this.state.status = 'Lose';
  }
  get snapshot(): AutonomousBattleSnapshot { return { ...this.state, units: this.state.units.map((unit) => ({ ...unit })) }; }
  tick(): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;
    this.state.elapsedTicks += 1;
    const totalDamage = this.state.units.filter((unit) => unit.currentHp > 0).reduce((sum, unit) => sum + unit.damage, 0);
    this.state.enemyHp = Math.max(0, this.state.enemyHp - totalDamage);
    if (this.state.enemyHp === 0) { this.state.status = 'Win'; return this.snapshot; }
    const target = this.target();
    if (!target) { this.state.status = 'Lose'; return this.snapshot; }
    target.currentHp = Math.max(0, target.currentHp - this.state.enemyDamage);
    if (!this.state.units.some((unit) => unit.currentHp > 0)) this.state.status = 'Lose';
    return this.snapshot;
  }
  target(): CombatUnit | undefined {
    const rowOrder = { Front: 0, Mid: 1, Back: 2 } as const;
    return this.state.units.filter((unit) => unit.currentHp > 0).sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column)[0];
  }
  frontmostAliveUnit(): CombatUnit | undefined { return this.target(); }
  castFrontlineHeal(energyId?: string, energyQueue?: EnergyQueue): boolean {
    if (this.state.status !== 'Running') return false;
    const target = this.target();
    if (!target) return false;
    if (energyQueue && energyId) {
      if (!energyQueue.consumeCharge(energyId, 1)) return false;
    }
    target.currentHp = Math.min(target.maxHp, target.currentHp + FRONTLINE_HEAL_HP);
    return true;
  }
  castEnergy(energyId: string, energyQueue: EnergyQueue): boolean { return this.castFrontlineHeal(energyId, energyQueue); }
  cast(energyId?: string, energyQueue?: EnergyQueue): boolean { return this.castFrontlineHeal(energyId, energyQueue); }
  private createUnit(unit: FormationUnit & { slotId: string }, slot: { row: CombatUnit['row']; column: number }): CombatUnit {
    const base = baseStats[unit.role]; const multiplier = starMultiplier[unit.star]; const maxHp = base.hp * multiplier;
    return { unitId: unit.unitId, beastId: unit.beastId, role: unit.role, star: unit.star, slotId: unit.slotId, row: slot.row, column: slot.column, currentHp: maxHp, maxHp, damage: base.damage * multiplier };
  }
}

export function roleBaseStats(role: BeastRole): Readonly<{ hp: number; damage: number }> { return { ...baseStats[role] }; }


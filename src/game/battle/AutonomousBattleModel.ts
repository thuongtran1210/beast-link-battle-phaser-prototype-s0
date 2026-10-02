import { type BattleFormation, type FormationUnit } from './BattleFormation';
import type { BeastRole } from './BeastRoles';
import type { EnergyQueue } from '../energy/EnergyQueue';

export type BattleStatus = 'Running' | 'Win' | 'Lose';
export type BattleRow = 'Front' | 'Mid' | 'Back';

export interface CombatUnit {
  unitId: string;
  beastId: string;
  role: BeastRole;
  star: 1 | 2 | 3;
  slotId: string;
  row: BattleRow;
  column: number;
  currentHp: number;
  maxHp: number;
  damage: number;
}

export interface EnemyFixture {
  enemyId: string;
  slotId: string;
  row: BattleRow;
  column: number;
  maxHp: number;
  damage: number;
}

export interface EnemyCombatUnit extends EnemyFixture {
  currentHp: number;
}

export interface AutonomousBattleSnapshot {
  status: BattleStatus;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  elapsedTicks: number;
  units: CombatUnit[];
  enemies: EnemyCombatUnit[];
}

export const EXPERIMENTAL_FRONTLINE_HEAL_HP = 30;
export const FRONTLINE_HEAL_HP = 30;

export const LEGACY_SINGLE_ENEMY_FIXTURE: ReadonlyArray<EnemyFixture> = [
  {
    enemyId: 'enemy-legacy',
    slotId: 'enemy-front-3',
    row: 'Front',
    column: 3,
    maxHp: 150,
    damage: 15,
  },
];

const baseStats: Readonly<Record<BeastRole, { hp: number; damage: number }>> = {
  Tanker: { hp: 80, damage: 6 },
  Assassin: { hp: 35, damage: 14 },
  Ranger: { hp: 45, damage: 10 },
  Mage: { hp: 40, damage: 9 },
};

const starMultiplier: Readonly<Record<1 | 2 | 3, number>> = {
  1: 1,
  2: 1.8,
  3: 3.2,
};

/**
 * Pure deterministic combat model.
 * Historical P1-S3/S4 behavior uses the legacy single-enemy fixture by default.
 * Experimental variants may inject an explicit enemy squad without changing player rules.
 */
export class AutonomousBattleModel {
  private state: AutonomousBattleSnapshot;

  constructor(
    formation: BattleFormation,
    enemyFixtures: ReadonlyArray<EnemyFixture> = LEGACY_SINGLE_ENEMY_FIXTURE,
  ) {
    const slots = new Map(
      formation.slots
        .filter((slot) => slot.unitId)
        .map((slot) => [slot.slotId, slot]),
    );

    const enemies = enemyFixtures.map((fixture) => ({
      ...fixture,
      currentHp: fixture.maxHp,
    }));

    this.state = {
      status: 'Running',
      enemyHp: 0,
      enemyMaxHp: 0,
      enemyDamage: 0,
      elapsedTicks: 0,
      units: formation.units
        .filter((unit): unit is FormationUnit & { slotId: string } => unit.slotId !== null)
        .map((unit) => this.createUnit(unit, slots.get(unit.slotId)!)),
      enemies,
    };

    this.syncEnemyAggregates();

    if (!this.state.units.length) this.state.status = 'Lose';
    else if (!this.state.enemies.length) this.state.status = 'Win';
  }

  get snapshot(): AutonomousBattleSnapshot {
    return {
      ...this.state,
      units: this.state.units.map((unit) => ({ ...unit })),
      enemies: this.state.enemies.map((enemy) => ({ ...enemy })),
    };
  }

  tick(): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;

    this.state.elapsedTicks += 1;

    const totalPlayerDamage = this.state.units
      .filter((unit) => unit.currentHp > 0)
      .reduce((sum, unit) => sum + unit.damage, 0);

    this.applyDamageToEnemies(totalPlayerDamage);
    this.syncEnemyAggregates();

    if (this.state.enemyHp === 0) {
      this.state.status = 'Win';
      return this.snapshot;
    }

    const target = this.target();
    if (!target) {
      this.state.status = 'Lose';
      return this.snapshot;
    }

    const incomingDamage = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .reduce((sum, enemy) => sum + enemy.damage, 0);

    target.currentHp = Math.max(0, target.currentHp - incomingDamage);

    if (!this.state.units.some((unit) => unit.currentHp > 0)) {
      this.state.status = 'Lose';
    }

    this.syncEnemyAggregates();
    return this.snapshot;
  }

  target(): CombatUnit | undefined {
    const rowOrder: Record<BattleRow, number> = { Front: 0, Mid: 1, Back: 2 };
    return this.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column)[0];
  }

  enemyTarget(): EnemyCombatUnit | undefined {
    const rowOrder: Record<BattleRow, number> = { Front: 0, Mid: 1, Back: 2 };
    return this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column)[0];
  }

  frontmostAliveUnit(): CombatUnit | undefined {
    return this.target();
  }

  frontmostAliveEnemy(): EnemyCombatUnit | undefined {
    return this.enemyTarget();
  }

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

  castEnergy(energyId: string, energyQueue: EnergyQueue): boolean {
    return this.castFrontlineHeal(energyId, energyQueue);
  }

  cast(energyId?: string, energyQueue?: EnergyQueue): boolean {
    return this.castFrontlineHeal(energyId, energyQueue);
  }

  private applyDamageToEnemies(totalDamage: number): void {
    let remaining = Math.max(0, totalDamage);
    if (remaining === 0) return;

    const rowOrder: Record<BattleRow, number> = { Front: 0, Mid: 1, Back: 2 };
    const targets = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column);

    for (const enemy of targets) {
      if (remaining <= 0) break;
      const applied = Math.min(enemy.currentHp, remaining);
      enemy.currentHp = Math.max(0, enemy.currentHp - applied);
      remaining -= applied;
    }
  }

  private syncEnemyAggregates(): void {
    this.state.enemyHp = this.state.enemies.reduce((sum, enemy) => sum + enemy.currentHp, 0);
    this.state.enemyMaxHp = this.state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0);
    this.state.enemyDamage = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .reduce((sum, enemy) => sum + enemy.damage, 0);
  }

  private createUnit(
    unit: FormationUnit & { slotId: string },
    slot: { row: CombatUnit['row']; column: number },
  ): CombatUnit {
    const base = baseStats[unit.role];
    const multiplier = starMultiplier[unit.star];
    const maxHp = base.hp * multiplier;

    return {
      unitId: unit.unitId,
      beastId: unit.beastId,
      role: unit.role,
      star: unit.star,
      slotId: unit.slotId,
      row: slot.row,
      column: slot.column,
      currentHp: maxHp,
      maxHp,
      damage: base.damage * multiplier,
    };
  }
}

export function roleBaseStats(role: BeastRole): Readonly<{ hp: number; damage: number }> {
  return { ...baseStats[role] };
}

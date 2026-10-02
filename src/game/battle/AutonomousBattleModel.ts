import { type BattleFormation, type FormationUnit } from './BattleFormation';
import type { BeastRole } from './BeastRoles';
import type { EnergyQueue } from '../energy/EnergyQueue';

export type BattleStatus = 'Running' | 'Win' | 'Lose';
export type BattleRow = 'Front' | 'Mid' | 'Back';
export type PlayerActionKind = 'GuardStrike' | 'Dive' | 'Snipe' | 'ArcaneBurst';

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

export interface PlayerCombatHit {
  enemyId: string;
  damage: number;
}

export interface PlayerCombatAction {
  unitId: string;
  role: BeastRole;
  kind: PlayerActionKind;
  hits: PlayerCombatHit[];
}

export interface BattleCombatRules {
  rolePositioning: boolean;
}

export const LEGACY_BATTLE_COMBAT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: false,
};

export const P1V8_ROLE_POSITIONING_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
};

export interface AutonomousBattleSnapshot {
  status: BattleStatus;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  elapsedTicks: number;
  units: CombatUnit[];
  enemies: EnemyCombatUnit[];
  lastPlayerActions?: PlayerCombatAction[];
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

const rowOrder: Readonly<Record<BattleRow, number>> = {
  Front: 0,
  Mid: 1,
  Back: 2,
};

/**
 * Pure deterministic combat model.
 * Historical behavior remains the default. Experimental variants may opt into
 * role/position combat rules without mutating legacy P1-S3/S4/V7 behavior.
 */
export class AutonomousBattleModel {
  private state: AutonomousBattleSnapshot;

  constructor(
    formation: BattleFormation,
    enemyFixtures: ReadonlyArray<EnemyFixture> = LEGACY_SINGLE_ENEMY_FIXTURE,
    private readonly combatRules: Readonly<BattleCombatRules> = LEGACY_BATTLE_COMBAT_RULES,
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
      lastPlayerActions: [],
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
      lastPlayerActions: this.state.lastPlayerActions?.map((action) => ({
        ...action,
        hits: action.hits.map((hit) => ({ ...hit })),
      })),
    };
  }

  tick(): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;

    this.state.elapsedTicks += 1;
    this.state.lastPlayerActions = [];

    if (this.combatRules.rolePositioning) {
      this.applyRolePositionPlayerActions();
    } else {
      const totalPlayerDamage = this.state.units
        .filter((unit) => unit.currentHp > 0)
        .reduce((sum, unit) => sum + unit.damage, 0);
      this.applyDamageToEnemies(totalPlayerDamage);
    }

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
    return this.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column)[0];
  }

  enemyTarget(): EnemyCombatUnit | undefined {
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

  private applyRolePositionPlayerActions(): void {
    const attackers = this.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column);

    for (const unit of attackers) {
      if (this.state.enemies.every((enemy) => enemy.currentHp <= 0)) break;

      if (unit.role === 'Tanker') {
        this.resolveTanker(unit);
      } else if (unit.role === 'Assassin') {
        this.resolveAssassin(unit);
      } else if (unit.role === 'Ranger') {
        this.resolveRanger(unit);
      } else {
        this.resolveMage(unit);
      }
    }
  }

  private resolveTanker(unit: CombatUnit): void {
    if (unit.row !== 'Front') return;

    const target = this.nearestEnemyByRowPriority(unit.column, ['Front', 'Mid', 'Back']);
    if (!target) return;

    const damage = this.applyDamage(target, unit.damage);
    if (damage > 0) this.recordAction(unit, 'GuardStrike', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveAssassin(unit: CombatUnit): void {
    if (unit.row === 'Back') return;

    const target = this.nearestEnemyByRowPriority(unit.column, ['Back', 'Mid', 'Front']);
    if (!target) return;

    const damage = this.applyDamage(target, unit.damage);
    if (damage > 0) this.recordAction(unit, 'Dive', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveRanger(unit: CombatUnit): void {
    const target = this.deepEnemyInOrNearLane(unit.column);
    if (!target) return;

    const multiplier = unit.row === 'Back' ? 1 : unit.row === 'Mid' ? 0.8 : 0.6;
    const damage = this.applyDamage(target, unit.damage * multiplier);
    if (damage > 0) this.recordAction(unit, 'Snipe', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveMage(unit: CombatUnit): void {
    const primary = this.deepEnemyInOrNearLane(unit.column);
    if (!primary) return;

    const multiplier = unit.row === 'Front' ? 0.7 : 1;
    const primaryDamage = unit.damage * multiplier;
    const hits: PlayerCombatHit[] = [];

    const appliedPrimary = this.applyDamage(primary, primaryDamage);
    if (appliedPrimary > 0) hits.push({ enemyId: primary.enemyId, damage: appliedPrimary });

    const secondaryTargets = this.state.enemies
      .filter(
        (enemy) =>
          enemy.currentHp > 0 &&
          enemy.enemyId !== primary.enemyId &&
          Math.abs(enemy.column - primary.column) === 1,
      )
      .sort((a, b) => rowOrder[b.row] - rowOrder[a.row] || a.column - b.column);

    for (const enemy of secondaryTargets) {
      const applied = this.applyDamage(enemy, primaryDamage * 0.5);
      if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
    }

    if (hits.length) this.recordAction(unit, 'ArcaneBurst', hits);
  }

  private recordAction(
    unit: CombatUnit,
    kind: PlayerActionKind,
    hits: PlayerCombatHit[],
  ): void {
    this.state.lastPlayerActions?.push({
      unitId: unit.unitId,
      role: unit.role,
      kind,
      hits,
    });
  }

  private nearestEnemyByRowPriority(
    lane: number,
    rowPriority: ReadonlyArray<BattleRow>,
  ): EnemyCombatUnit | undefined {
    const rank = new Map(rowPriority.map((row, index) => [row, index]));
    return this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort(
        (a, b) =>
          (rank.get(a.row) ?? 99) - (rank.get(b.row) ?? 99) ||
          Math.abs(a.column - lane) - Math.abs(b.column - lane) ||
          a.column - b.column,
      )[0];
  }

  private deepEnemyInOrNearLane(lane: number): EnemyCombatUnit | undefined {
    const living = this.state.enemies.filter((enemy) => enemy.currentHp > 0);
    const sameLane = living
      .filter((enemy) => enemy.column === lane)
      .sort((a, b) => rowOrder[b.row] - rowOrder[a.row]);

    if (sameLane.length) return sameLane[0];

    return living.sort(
      (a, b) =>
        Math.abs(a.column - lane) - Math.abs(b.column - lane) ||
        rowOrder[b.row] - rowOrder[a.row] ||
        a.column - b.column,
    )[0];
  }

  private applyDamage(enemy: EnemyCombatUnit, requestedDamage: number): number {
    if (enemy.currentHp <= 0 || requestedDamage <= 0) return 0;
    const applied = Math.min(enemy.currentHp, requestedDamage);
    enemy.currentHp = Math.max(0, enemy.currentHp - applied);
    return applied;
  }

  private applyDamageToEnemies(totalDamage: number): void {
    let remaining = Math.max(0, totalDamage);
    if (remaining === 0) return;

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

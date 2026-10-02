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
  positionX: number;
  positionLane: number;
  targetEnemyId?: string;
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
  positionX: number;
  positionLane: number;
  targetUnitId?: string;
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
  movement: boolean;
}

export const LEGACY_BATTLE_COMBAT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: false,
  movement: false,
};

export const P1V8_ROLE_POSITIONING_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: false,
};

export const P1V9_AUTONOMOUS_MOVEMENT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
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

const PLAYER_SPAWN_X: Readonly<Record<BattleRow, number>> = {
  Front: -1,
  Mid: -2,
  Back: -3,
};

const ENEMY_SPAWN_X: Readonly<Record<BattleRow, number>> = {
  Front: 1,
  Mid: 2,
  Back: 3,
};

const LANE_DISTANCE_SCALE = 0.65;
const PLAYER_MIN_X = -3.4;
const PLAYER_MAX_X = 3.2;
const ENEMY_MIN_X = -3.2;
const ENEMY_MAX_X = 3.4;

const movementProfile: Readonly<Record<BeastRole, {
  speed: number;
  attackRange: number;
  minRange: number;
}>> = {
  Tanker: { speed: 0.75, attackRange: 0.72, minRange: 0 },
  Assassin: { speed: 1.25, attackRange: 0.68, minRange: 0 },
  Ranger: { speed: 0.65, attackRange: 4.2, minRange: 2.6 },
  Mage: { speed: 0.55, attackRange: 3.6, minRange: 1.8 },
};

const ENEMY_MOVE_SPEED = 0.58;
const ENEMY_ATTACK_RANGE = 0.72;

/**
 * Pure deterministic combat model.
 * - Legacy aggregate combat remains the default.
 * - P1-V8 can opt into role-position targeting without movement.
 * - P1-V9 can opt into autonomous model-space movement.
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

    const enemies: EnemyCombatUnit[] = enemyFixtures.map((fixture) => ({
      ...fixture,
      currentHp: fixture.maxHp,
      positionX: ENEMY_SPAWN_X[fixture.row],
      positionLane: fixture.column,
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

    if (this.combatRules.movement) {
      this.resolveMovementBattleTick();
    } else {
      this.resolveStaticBattleTick();
    }

    this.syncEnemyAggregates();
    return this.snapshot;
  }

  target(): CombatUnit | undefined {
    const living = this.state.units.filter((unit) => unit.currentHp > 0);
    if (this.combatRules.movement) {
      return living.sort(
        (a, b) =>
          b.positionX - a.positionX ||
          a.positionLane - b.positionLane ||
          rowOrder[a.row] - rowOrder[b.row],
      )[0];
    }

    return living.sort(
      (a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column,
    )[0];
  }

  enemyTarget(): EnemyCombatUnit | undefined {
    const living = this.state.enemies.filter((enemy) => enemy.currentHp > 0);
    if (this.combatRules.movement) {
      return living.sort(
        (a, b) =>
          a.positionX - b.positionX ||
          a.positionLane - b.positionLane ||
          rowOrder[a.row] - rowOrder[b.row],
      )[0];
    }

    return living.sort(
      (a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column,
    )[0];
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

  private resolveStaticBattleTick(): void {
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
      return;
    }

    const target = this.target();
    if (!target) {
      this.state.status = 'Lose';
      return;
    }

    const incomingDamage = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .reduce((sum, enemy) => sum + enemy.damage, 0);

    target.currentHp = Math.max(0, target.currentHp - incomingDamage);

    if (!this.state.units.some((unit) => unit.currentHp > 0)) {
      this.state.status = 'Lose';
    }
  }

  private resolveMovementBattleTick(): void {
    this.applyMovementPlayerActions();
    this.syncEnemyAggregates();

    if (this.state.enemyHp === 0) {
      this.state.status = 'Win';
      return;
    }

    this.applyEnemyMovementAndAttacks();

    if (!this.state.units.some((unit) => unit.currentHp > 0)) {
      this.state.status = 'Lose';
    }
  }

  private applyMovementPlayerActions(): void {
    const attackers = this.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => b.positionX - a.positionX || a.positionLane - b.positionLane);

    for (const unit of attackers) {
      if (this.state.enemies.every((enemy) => enemy.currentHp <= 0)) break;

      if (unit.role === 'Tanker') {
        this.resolveMovingTanker(unit);
      } else if (unit.role === 'Assassin') {
        this.resolveMovingAssassin(unit);
      } else if (unit.role === 'Ranger') {
        this.resolveMovingRanger(unit);
      } else {
        this.resolveMovingMage(unit);
      }
    }
  }

  private resolveMovingTanker(unit: CombatUnit): void {
    const target = this.nearestEnemyByRowPriority(unit.positionLane, ['Front', 'Mid', 'Back']);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Tanker;
    const distance = this.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange) {
      this.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange);
      return;
    }

    const damage = this.applyDamage(target, unit.damage);
    if (damage > 0) this.recordAction(unit, 'GuardStrike', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveMovingAssassin(unit: CombatUnit): void {
    const target = this.nearestEnemyByRowPriority(unit.positionLane, ['Back', 'Mid', 'Front']);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Assassin;
    const distance = this.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange) {
      this.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange);
      return;
    }

    const damage = this.applyDamage(target, unit.damage);
    if (damage > 0) this.recordAction(unit, 'Dive', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveMovingRanger(unit: CombatUnit): void {
    const target = this.deepEnemyInOrNearLane(unit.positionLane);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Ranger;
    const distance = this.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange) {
      this.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange) {
      const retreated = this.retreatPlayerUnit(unit, profile.speed);
      if (retreated) return;
    }

    const damage = this.applyDamage(target, unit.damage);
    if (damage > 0) this.recordAction(unit, 'Snipe', [{ enemyId: target.enemyId, damage }]);
  }

  private resolveMovingMage(unit: CombatUnit): void {
    const primary = this.deepEnemyInOrNearLane(unit.positionLane);
    if (!primary) return;
    unit.targetEnemyId = primary.enemyId;

    const profile = movementProfile.Mage;
    const distance = this.distance(unit.positionX, unit.positionLane, primary.positionX, primary.positionLane);

    if (distance > profile.attackRange) {
      this.moveTowardPlayerUnit(unit, primary, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange) {
      const retreated = this.retreatPlayerUnit(unit, profile.speed);
      if (retreated) return;
    }

    const hits: PlayerCombatHit[] = [];
    const appliedPrimary = this.applyDamage(primary, unit.damage);
    if (appliedPrimary > 0) hits.push({ enemyId: primary.enemyId, damage: appliedPrimary });

    const secondaryTargets = this.state.enemies
      .filter(
        (enemy) =>
          enemy.currentHp > 0 &&
          enemy.enemyId !== primary.enemyId &&
          Math.abs(enemy.positionLane - primary.positionLane) <= 1.05,
      )
      .sort(
        (a, b) =>
          Math.abs(a.positionLane - primary.positionLane) -
            Math.abs(b.positionLane - primary.positionLane) ||
          a.positionX - b.positionX,
      );

    for (const enemy of secondaryTargets) {
      const applied = this.applyDamage(enemy, unit.damage * 0.5);
      if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
    }

    if (hits.length) this.recordAction(unit, 'ArcaneBurst', hits);
  }

  private applyEnemyMovementAndAttacks(): void {
    const livingEnemies = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => a.positionX - b.positionX || a.positionLane - b.positionLane);

    for (const enemy of livingEnemies) {
      const target = this.target();
      if (!target) return;

      enemy.targetUnitId = target.unitId;
      const distance = this.distance(
        enemy.positionX,
        enemy.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (distance > ENEMY_ATTACK_RANGE) {
        this.moveTowardEnemy(enemy, target, ENEMY_MOVE_SPEED, ENEMY_ATTACK_RANGE);
        continue;
      }

      target.currentHp = Math.max(0, target.currentHp - enemy.damage);
    }
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
          Math.abs(a.positionLane - lane) - Math.abs(b.positionLane - lane) ||
          a.column - b.column,
      )[0];
  }

  private deepEnemyInOrNearLane(lane: number): EnemyCombatUnit | undefined {
    const living = this.state.enemies.filter((enemy) => enemy.currentHp > 0);

    return living.sort(
      (a, b) =>
        Math.abs(a.positionLane - lane) - Math.abs(b.positionLane - lane) ||
        b.positionX - a.positionX ||
        a.column - b.column,
    )[0];
  }

  private moveTowardPlayerUnit(
    unit: CombatUnit,
    target: EnemyCombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    const moved = this.moveToward(
      unit.positionX,
      unit.positionLane,
      target.positionX,
      target.positionLane,
      speed,
      stopRange,
    );
    unit.positionX = clamp(moved.x, PLAYER_MIN_X, PLAYER_MAX_X);
    unit.positionLane = clamp(moved.lane, 1, 6);
  }

  private moveTowardEnemy(
    enemy: EnemyCombatUnit,
    target: CombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    const moved = this.moveToward(
      enemy.positionX,
      enemy.positionLane,
      target.positionX,
      target.positionLane,
      speed,
      stopRange,
    );
    enemy.positionX = clamp(moved.x, ENEMY_MIN_X, ENEMY_MAX_X);
    enemy.positionLane = clamp(moved.lane, 1, 6);
  }

  private moveToward(
    fromX: number,
    fromLane: number,
    toX: number,
    toLane: number,
    speed: number,
    stopRange: number,
  ): { x: number; lane: number } {
    const dx = toX - fromX;
    const dyScaled = (toLane - fromLane) * LANE_DISTANCE_SCALE;
    const distance = Math.hypot(dx, dyScaled);
    const travel = Math.min(speed, Math.max(0, distance - stopRange));

    if (distance <= 0.000001 || travel <= 0) {
      return { x: fromX, lane: fromLane };
    }

    return {
      x: fromX + (dx / distance) * travel,
      lane:
        fromLane +
        ((dyScaled / distance) * travel) / LANE_DISTANCE_SCALE,
    };
  }

  private retreatPlayerUnit(unit: CombatUnit, speed: number): boolean {
    const before = unit.positionX;
    unit.positionX = clamp(unit.positionX - speed, PLAYER_MIN_X, PLAYER_MAX_X);
    return unit.positionX < before - 0.000001;
  }

  private distance(
    ax: number,
    aLane: number,
    bx: number,
    bLane: number,
  ): number {
    return Math.hypot(bx - ax, (bLane - aLane) * LANE_DISTANCE_SCALE);
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
      positionX: PLAYER_SPAWN_X[slot.row],
      positionLane: slot.column,
    };
  }
}

export function roleBaseStats(role: BeastRole): Readonly<{ hp: number; damage: number }> {
  return { ...baseStats[role] };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

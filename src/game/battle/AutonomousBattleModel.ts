import { type BattleFormation, type FormationUnit } from './BattleFormation';
import type { BeastRole } from './BeastRoles';
import type { EnergyQueue } from '../energy/EnergyQueue';

export type BattleStatus = 'Running' | 'Win' | 'Lose';
export type BattleRow = 'Front' | 'Mid' | 'Back';
export type PlayerActionKind = 'GuardStrike' | 'Dive' | 'Snipe' | 'ArcaneBurst';
export type CombatActionState = 'Moving' | 'Windup' | 'Recovering' | 'Idle' | 'Dead';
export type RoleMovementState = 'Hold' | 'AdvanceToRange' | 'Kite' | 'Engage' | 'Dive' | 'Idle';

export interface FormationAnchor {
  x: number;
  lane: number;
}

export interface ActionTimingProfile {
  attackInterval: number;
  windup: number;
}

export const P1V11A_ACTION_TIMING_FIXTURE: Readonly<Record<BeastRole | 'Enemy', ActionTimingProfile>> = {
  Tanker: { attackInterval: 1.4, windup: 0.30 },
  Assassin: { attackInterval: 1.0, windup: 0.18 },
  Ranger: { attackInterval: 1.25, windup: 0.20 },
  Mage: { attackInterval: 1.8, windup: 0.40 },
  Enemy: { attackInterval: 1.4, windup: 0.30 },
};

export const SIMULATION_STEP = 0.1;

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

  // P1-V11A Timeline fields
  actionState?: CombatActionState;
  attackCooldownRemaining?: number;
  attackWindupRemaining?: number;
  recoveryRemaining?: number;

  // P1-V11B Engagement field
  engagedById?: string;

  // P1-V11B.1 Role Positioning Identity fields
  formationAnchor?: FormationAnchor;
  movementPolicyState?: RoleMovementState;
}

export type EnemyArchetype = 'Frontliner' | 'Diver' | 'Ranged';

export interface EnemyFixture {
  enemyId: string;
  slotId: string;
  row: BattleRow;
  column: number;
  maxHp: number;
  damage: number;
  archetype?: EnemyArchetype;
}

export interface EnemyCombatUnit extends EnemyFixture {
  currentHp: number;
  positionX: number;
  positionLane: number;
  targetUnitId?: string;
  archetype?: EnemyArchetype;

  // P1-V11A Timeline fields
  actionState?: CombatActionState;
  attackCooldownRemaining?: number;
  attackWindupRemaining?: number;
  recoveryRemaining?: number;

  // P1-V11B Engagement field
  engagedTargetId?: string;

  // P1-V11C Archetype movement state
  formationAnchor?: FormationAnchor;
  movementPolicyState?: RoleMovementState;
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
  timeline?: boolean;
  engagement?: boolean;
  roleIdentity?: boolean;
  archetypes?: boolean;
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

export const P1V11A_TIMELINE_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
};

export interface EngagementFixture {
  tankGuardRadius: number;
  meleeEngageRange: number;
  disengagePadding: number;
}

export const P1V11B_ENGAGEMENT_FIXTURE: Readonly<EngagementFixture> = {
  tankGuardRadius: 1.25,
  meleeEngageRange: 0.72,
  disengagePadding: 0.25,
};

export const P1V11B_ENGAGEMENT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};

export const P1V11B1_ROLE_IDENTITY_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};

export const P1V11C_ARCHETYPE_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};

export interface EnemyArchetypeProfile {
  speed: number;
  attackRange: number;
  preferredMinRange: number;
  dangerRange: number;
  attackInterval: number;
  windup: number;
}

export const P1V11C_ENEMY_ARCHETYPE_FIXTURE: Readonly<Record<EnemyArchetype, EnemyArchetypeProfile>> = {
  Frontliner: {
    speed: 0.58,
    attackRange: 0.72,
    preferredMinRange: 0,
    dangerRange: 0,
    attackInterval: 1.4,
    windup: 0.30,
  },
  Diver: {
    speed: 0.95,
    attackRange: 0.72,
    preferredMinRange: 0,
    dangerRange: 0,
    attackInterval: 1.2,
    windup: 0.20,
  },
  Ranged: {
    speed: 0.50,
    attackRange: 3.8,
    preferredMinRange: 2.8,
    dangerRange: 1.8,
    attackInterval: 1.5,
    windup: 0.35,
  },
};

export const P1V11C_FIXTURE_A_FRONTLINE: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-2', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 180, damage: 10, archetype: 'Frontliner' },
];

export const P1V11C_FIXTURE_B_DIVERS: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-diver-2', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 120, damage: 12, archetype: 'Diver' },
  { enemyId: 'enemy-diver-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 120, damage: 12, archetype: 'Diver' },
];

export const P1V11C_FIXTURE_C_PROTECTED_RANGED: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-ranged-3', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 100, damage: 11, archetype: 'Ranged' },
  { enemyId: 'enemy-ranged-4', slotId: 'enemy-back-4', row: 'Back', column: 4, maxHp: 100, damage: 11, archetype: 'Ranged' },
];

export interface EngagementBattleEvent {
  type: 'EngagementStarted' | 'EngagementEnded';
  enemyId: string;
  tankId: string;
  time: number;
}

export interface FormationConsequenceMetrics {
  interceptCount: number;
  firstBacklineHitTime?: number;
  firstAssassinContactTime?: number;
  attacksResolvedByUnit: Record<string, number>;
  damageTakenByUnit: Record<string, number>;
  timeEngaged: Record<string, number>;
}

export interface AutonomousBattleSnapshot {
  status: BattleStatus;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  elapsedTicks: number;
  elapsedTime?: number;
  units: CombatUnit[];
  enemies: EnemyCombatUnit[];
  lastPlayerActions?: PlayerCombatAction[];
  engagementEvents?: EngagementBattleEvent[];
  consequenceMetrics?: FormationConsequenceMetrics;
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

export interface RoleMovementConfig {
  speed: number;
  attackRange: number;
  minRange: number;
  preferredMinRange: number;
  dangerRange: number;
  leashRadius: number;
}

const movementProfile: Readonly<Record<BeastRole, RoleMovementConfig>> = {
  Tanker: {
    speed: 0.75,
    attackRange: 0.72,
    minRange: 0,
    preferredMinRange: 0,
    dangerRange: 0,
    leashRadius: 999,
  },
  Assassin: {
    speed: 1.25,
    attackRange: 0.68,
    minRange: 0,
    preferredMinRange: 0,
    dangerRange: 0,
    leashRadius: 999,
  },
  Ranger: {
    speed: 0.65,
    attackRange: 4.2,
    minRange: 2.6,
    preferredMinRange: 3.15,
    dangerRange: 2.10,
    leashRadius: 2.2,
  },
  Mage: {
    speed: 0.55,
    attackRange: 3.6,
    minRange: 1.8,
    preferredMinRange: 2.70,
    dangerRange: 1.80,
    leashRadius: 1.4,
  },
};

const ENEMY_MOVE_SPEED = 0.58;
const ENEMY_ATTACK_RANGE = 0.72;
const COMBAT_DISTANCE_EPSILON = 0.001;

/**
 * Pure deterministic combat model.
 * - Legacy aggregate combat remains the default.
 * - P1-V8 can opt into role-position targeting without movement.
 * - P1-V9 can opt into autonomous model-space movement.
 */
export class AutonomousBattleModel {
  private state: AutonomousBattleSnapshot;
  private engagementEvents: EngagementBattleEvent[] = [];
  private consequenceMetrics: FormationConsequenceMetrics = {
    interceptCount: 0,
    firstBacklineHitTime: undefined,
    attacksResolvedByUnit: {},
    damageTakenByUnit: {},
    timeEngaged: {},
  };

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

    const enemies: EnemyCombatUnit[] = enemyFixtures.map((fixture, index) => {
      const archetype: EnemyArchetype = fixture.archetype ?? 'Frontliner';
      const profile = P1V11C_ENEMY_ARCHETYPE_FIXTURE[archetype];
      const initialCooldown = this.combatRules.timeline
        ? (index * 0.1) % profile.attackInterval
        : 0;
      return {
        ...fixture,
        archetype,
        currentHp: fixture.maxHp,
        positionX: ENEMY_SPAWN_X[fixture.row],
        positionLane: fixture.column,
        formationAnchor: {
          x: ENEMY_SPAWN_X[fixture.row],
          lane: fixture.column,
        },
        movementPolicyState: 'Idle',
        actionState: 'Idle',
        attackCooldownRemaining: initialCooldown,
        attackWindupRemaining: 0,
        recoveryRemaining: initialCooldown,
      };
    });

    this.state = {
      status: 'Running',
      enemyHp: 0,
      enemyMaxHp: 0,
      enemyDamage: 0,
      elapsedTicks: 0,
      elapsedTime: 0,
      units: formation.units
        .filter((unit): unit is FormationUnit & { slotId: string } => unit.slotId !== null)
        .map((unit, index) => this.createUnit(unit, slots.get(unit.slotId)!, index)),
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
      engagementEvents: this.engagementEvents.map((e) => ({ ...e })),
      consequenceMetrics: {
        interceptCount: this.consequenceMetrics.interceptCount,
        firstBacklineHitTime: this.consequenceMetrics.firstBacklineHitTime,
        firstAssassinContactTime: this.consequenceMetrics.firstAssassinContactTime,
        attacksResolvedByUnit: { ...this.consequenceMetrics.attacksResolvedByUnit },
        damageTakenByUnit: { ...this.consequenceMetrics.damageTakenByUnit },
        timeEngaged: { ...this.consequenceMetrics.timeEngaged },
      },
    };
  }

  getConsequenceMetrics(): FormationConsequenceMetrics {
    return {
      interceptCount: this.consequenceMetrics.interceptCount,
      firstBacklineHitTime: this.consequenceMetrics.firstBacklineHitTime,
      firstAssassinContactTime: this.consequenceMetrics.firstAssassinContactTime,
      attacksResolvedByUnit: { ...this.consequenceMetrics.attacksResolvedByUnit },
      damageTakenByUnit: { ...this.consequenceMetrics.damageTakenByUnit },
      timeEngaged: { ...this.consequenceMetrics.timeEngaged },
    };
  }

  step(deltaSeconds = SIMULATION_STEP): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;

    this.state.elapsedTicks += 1;
    this.state.elapsedTime = Math.round(((this.state.elapsedTime ?? 0) + deltaSeconds) * 1000) / 1000;
    this.state.lastPlayerActions = [];

    this.resolveTimelinePlayerUnits(deltaSeconds);
    this.syncEnemyAggregates();

    if (this.state.enemyHp === 0) {
      this.state.status = 'Win';
      this.freezeOnTerminal();
      return this.snapshot;
    }

    this.resolveTimelineEnemies(deltaSeconds);

    if (!this.state.units.some((unit) => unit.currentHp > 0)) {
      this.state.status = 'Lose';
      this.freezeOnTerminal();
    }

    this.syncEnemyAggregates();
    return this.snapshot;
  }

  tick(): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;

    if (this.combatRules.timeline) {
      const stepCount = Math.round(1.0 / SIMULATION_STEP);
      for (let i = 0; i < stepCount && this.state.status === 'Running'; i++) {
        this.step(SIMULATION_STEP);
      }
      return this.snapshot;
    }

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
    if (this.combatRules.movement || this.combatRules.timeline) {
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
    if (this.combatRules.movement || this.combatRules.timeline) {
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

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
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

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
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

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      this.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
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

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      this.moveTowardPlayerUnit(unit, primary, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
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

      if (distance > ENEMY_ATTACK_RANGE + COMBAT_DISTANCE_EPSILON) {
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

    if (distance <= COMBAT_DISTANCE_EPSILON || travel <= COMBAT_DISTANCE_EPSILON) {
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
    index = 0,
  ): CombatUnit {
    const base = baseStats[unit.role];
    const multiplier = starMultiplier[unit.star];
    const maxHp = base.hp * multiplier;
    const profile = P1V11A_ACTION_TIMING_FIXTURE[unit.role];
    const initialCooldown = this.combatRules.timeline
      ? (index * 0.1) % profile.attackInterval
      : 0;

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
      formationAnchor: {
        x: PLAYER_SPAWN_X[slot.row],
        lane: slot.column,
      },
      movementPolicyState: 'Idle',
      actionState: 'Idle',
      attackCooldownRemaining: initialCooldown,
      attackWindupRemaining: 0,
      recoveryRemaining: initialCooldown,
    };
  }

  private resolveTimelinePlayerUnits(deltaSeconds: number): void {
    const attackers = this.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => b.positionX - a.positionX || a.positionLane - b.positionLane);

    for (const unit of attackers) {
      if (this.state.enemies.every((enemy) => enemy.currentHp <= 0)) {
        unit.actionState = 'Idle';
        unit.movementPolicyState = 'Idle';
        continue;
      }

      const profile = movementProfile[unit.role];

      // 1. Target retention or acquisition
      let target: EnemyCombatUnit | undefined;

      if (this.combatRules.roleIdentity) {
        if (unit.role === 'Tanker') {
          target = this.nearestEnemyByRowPriority(unit.positionLane, ['Front', 'Mid', 'Back']);
          unit.targetEnemyId = target?.enemyId;
        } else if (unit.role === 'Assassin') {
          target = this.nearestEnemyByRowPriority(unit.positionLane, ['Back', 'Mid', 'Front']);
          unit.targetEnemyId = target?.enemyId;
        } else {
          // Ranger or Mage:
          if (unit.targetEnemyId) {
            target = this.state.enemies.find((e) => e.enemyId === unit.targetEnemyId && e.currentHp > 0);
            if (target) {
              const currentDist = this.distance(
                unit.positionX,
                unit.positionLane,
                target.positionX,
                target.positionLane,
              );
              // If current target is outside attack range, check if another enemy is in range
              if (currentDist > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
                const inRangeEnemy = this.findBestEnemyInRange(unit, profile.attackRange);
                if (inRangeEnemy) {
                  target = inRangeEnemy;
                  unit.targetEnemyId = target.enemyId;
                }
              }
            } else {
              unit.targetEnemyId = undefined;
            }
          }

          if (!target) {
            const inRangeEnemy = this.findBestEnemyInRange(unit, profile.attackRange);
            if (inRangeEnemy) {
              target = inRangeEnemy;
              unit.targetEnemyId = target.enemyId;
            } else {
              target = this.findBestRangedAdvanceTarget(unit);
              if (target) {
                unit.targetEnemyId = target.enemyId;
              }
            }
          }
        }
      } else {
        if (unit.targetEnemyId) {
          target = this.state.enemies.find((e) => e.enemyId === unit.targetEnemyId && e.currentHp > 0);
          if (!target) {
            unit.targetEnemyId = undefined;
          }
        }
        if (!unit.targetEnemyId) {
          target = this.acquirePlayerTarget(unit);
          if (target) {
            unit.targetEnemyId = target.enemyId;
          }
        }
      }

      if (!target || target.currentHp <= 0) {
        unit.actionState = 'Idle';
        unit.movementPolicyState = 'Idle';
        continue;
      }

      // 2. Cooldown / recovery progression
      if ((unit.attackCooldownRemaining ?? 0) > 0) {
        unit.attackCooldownRemaining = Math.max(0, (unit.attackCooldownRemaining ?? 0) - deltaSeconds);
      }
      if ((unit.recoveryRemaining ?? 0) > 0) {
        unit.recoveryRemaining = Math.max(0, (unit.recoveryRemaining ?? 0) - deltaSeconds);
        if (unit.recoveryRemaining <= COMBAT_DISTANCE_EPSILON && unit.actionState === 'Recovering') {
          unit.actionState = 'Idle';
        }
      }

      // 3. Windup resolution
      if (unit.actionState === 'Windup') {
        if (this.combatRules.roleIdentity && (unit.role === 'Mage' || unit.role === 'Ranger')) {
          unit.movementPolicyState = 'Hold';
        }
        unit.attackWindupRemaining = (unit.attackWindupRemaining ?? 0) - deltaSeconds;
        if (unit.attackWindupRemaining <= COMBAT_DISTANCE_EPSILON) {
          this.resolvePlayerDamage(unit, target);
          const timing = P1V11A_ACTION_TIMING_FIXTURE[unit.role];
          unit.actionState = 'Recovering';
          unit.attackWindupRemaining = 0;
          unit.recoveryRemaining = Math.max(0, timing.attackInterval - timing.windup);
          unit.attackCooldownRemaining = unit.recoveryRemaining;
        }
        continue;
      }

      // 4. Movement / windup initiation
      const distance = this.distance(
        unit.positionX,
        unit.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (!this.combatRules.roleIdentity) {
        if (unit.role === 'Tanker' || unit.role === 'Assassin') {
          if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Moving';
            this.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
          } else {
            if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
              unit.actionState = 'Windup';
              unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE[unit.role].windup;
            } else {
              if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
            }
          }
        } else {
          // Ranger or Mage
          if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Moving';
            this.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange - 0.15);
          } else if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Moving';
            this.retreatPlayerUnit(unit, profile.speed * deltaSeconds);
          } else {
            if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
              unit.actionState = 'Windup';
              unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE[unit.role].windup;
            } else {
              if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
            }
          }
        }
        continue;
      }

      // Role Positioning Identity logic:
      if (unit.role === 'Tanker') {
        if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
          unit.actionState = 'Moving';
          unit.movementPolicyState = unit.engagedById ? 'Engage' : 'AdvanceToRange';
          this.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
        } else {
          unit.movementPolicyState = 'Engage';
          if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Windup';
            unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE.Tanker.windup;
          } else {
            if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
          }
        }
      } else if (unit.role === 'Assassin') {
        unit.movementPolicyState = 'Dive';
        if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
          unit.actionState = 'Moving';
          this.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
        } else {
          if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Windup';
            unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE.Assassin.windup;
          } else {
            if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
          }
        }
      } else {
        // Ranger or Mage
        this.resolveRangedMovementAndAction(unit, target, profile, deltaSeconds);
      }
    }
  }

  private resolveRangedMovementAndAction(
    unit: CombatUnit,
    target: EnemyCombatUnit,
    profile: RoleMovementConfig,
    deltaSeconds: number,
  ): void {
    // 1. Check danger zone (closest living enemy threat)
    let closestEnemyDist = 999;
    for (const enemy of this.state.enemies) {
      if (enemy.currentHp <= 0) continue;
      const d = this.distance(unit.positionX, unit.positionLane, enemy.positionX, enemy.positionLane);
      if (d < closestEnemyDist) {
        closestEnemyDist = d;
      }
    }

    const wasKiting = unit.movementPolicyState === 'Kite';
    const restoreThreshold = profile.preferredMinRange;
    const triggerThreshold = profile.dangerRange;

    const shouldKite = wasKiting
      ? closestEnemyDist < restoreThreshold - COMBAT_DISTANCE_EPSILON
      : closestEnemyDist < triggerThreshold - COMBAT_DISTANCE_EPSILON;

    if (shouldKite) {
      unit.actionState = 'Moving';
      unit.movementPolicyState = 'Kite';
      const retreated = this.retreatPlayerUnit(unit, profile.speed * deltaSeconds);
      if (!retreated) {
        // Reached boundary (PLAYER_MIN_X); cannot retreat further
        unit.movementPolicyState = 'Hold';
        if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
          unit.actionState = 'Windup';
          unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE[unit.role].windup;
        } else {
          unit.actionState = 'Idle';
        }
      }
      return;
    }

    // 2. Safe distance maintained. Is current target in attack range?
    const distanceToTarget = this.distance(
      unit.positionX,
      unit.positionLane,
      target.positionX,
      target.positionLane,
    );

    if (distanceToTarget <= profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      // HOLD position and attack!
      unit.movementPolicyState = 'Hold';
      if ((unit.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
        unit.actionState = 'Windup';
        unit.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE[unit.role].windup;
      } else {
        if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
      }
      return;
    }

    // 3. No target in attack range. Advance only enough to bring target into attack range.
    // Respect living Tank frontline (do not voluntarily run past Tank)
    const livingTanks = this.state.units.filter(
      (u) => u.currentHp > 0 && u.role === 'Tanker' && u.unitId !== unit.unitId,
    );
    const forwardTankX = livingTanks.length
      ? Math.max(...livingTanks.map((t) => t.positionX))
      : undefined;

    // Buffer behind Tank: keep at least 0.25 behind forwardmost living Tank
    const maxSafeX = forwardTankX !== undefined ? forwardTankX - 0.25 : PLAYER_MAX_X;

    if (unit.positionX >= maxSafeX - COMBAT_DISTANCE_EPSILON) {
      // Already at the safe frontline limit behind the Tank! Hold here rather than running past Tank.
      unit.movementPolicyState = 'Hold';
      if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
      return;
    }

    // Check soft leash around formationAnchor:
    const anchorX = unit.formationAnchor?.x ?? PLAYER_SPAWN_X[unit.row];
    const maxAnchorX = anchorX + profile.leashRadius;
    const clampedMaxX = Math.min(maxSafeX, maxAnchorX);

    if (unit.positionX >= clampedMaxX - COMBAT_DISTANCE_EPSILON) {
      unit.movementPolicyState = 'Hold';
      if (unit.actionState !== 'Recovering') unit.actionState = 'Idle';
      return;
    }

    // Advance toward target
    unit.actionState = 'Moving';
    unit.movementPolicyState = 'AdvanceToRange';
    this.moveTowardPlayerUnit(
      unit,
      target,
      profile.speed * deltaSeconds,
      profile.attackRange - 0.15,
    );

    // Apply clamp so unit does not overshoot maxSafeX or maxAnchorX
    if (unit.positionX > clampedMaxX) {
      unit.positionX = clampedMaxX;
    }
  }

  private resolveTimelineEnemies(deltaSeconds: number): void {
    const livingEnemies = this.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => a.positionX - b.positionX || a.positionLane - b.positionLane);

    const currentTime = this.state.elapsedTime ?? (this.state.elapsedTicks * deltaSeconds);

    for (const enemy of livingEnemies) {
      if (!this.state.units.some((u) => u.currentHp > 0)) {
        enemy.actionState = 'Idle';
        continue;
      }

      // Check existing engagement validity
      if (this.combatRules.engagement && enemy.engagedTargetId) {
        const engagedTank = this.state.units.find(
          (u) => u.unitId === enemy.engagedTargetId && u.currentHp > 0 && u.role === 'Tanker',
        );
        if (!engagedTank) {
          this.recordEngagementEvent('EngagementEnded', enemy.enemyId, enemy.engagedTargetId, currentTime);
          enemy.engagedTargetId = undefined;
          enemy.targetUnitId = undefined;
        } else {
          const dist = this.distance(
            enemy.positionX,
            enemy.positionLane,
            engagedTank.positionX,
            engagedTank.positionLane,
          );
          const disengageLimit =
            P1V11B_ENGAGEMENT_FIXTURE.tankGuardRadius + P1V11B_ENGAGEMENT_FIXTURE.disengagePadding;
          if (dist > disengageLimit) {
            this.recordEngagementEvent('EngagementEnded', enemy.enemyId, engagedTank.unitId, currentTime);
            enemy.engagedTargetId = undefined;
            engagedTank.engagedById = undefined;
            enemy.targetUnitId = undefined;
          } else {
            enemy.targetUnitId = engagedTank.unitId;
            engagedTank.engagedById = enemy.enemyId;
            this.consequenceMetrics.timeEngaged[engagedTank.unitId] =
              (this.consequenceMetrics.timeEngaged[engagedTank.unitId] ?? 0) + deltaSeconds;
          }
        }
      }

      // 1. Target retention or acquisition
      let target: CombatUnit | undefined;
      if (enemy.targetUnitId) {
        target = this.state.units.find((u) => u.unitId === enemy.targetUnitId && u.currentHp > 0);
        if (!target) {
          enemy.targetUnitId = undefined;
        }
      }
      if (!enemy.targetUnitId) {
        if (this.combatRules.archetypes) {
          if (enemy.archetype === 'Diver') {
            target = this.acquireDiverTarget(enemy);
          } else if (enemy.archetype === 'Ranged') {
            target = this.acquireRangedEnemyTarget(enemy);
          } else {
            target = this.acquireEnemyTarget(enemy);
          }
        } else {
          target = this.acquireEnemyTarget(enemy);
        }
        if (target) {
          enemy.targetUnitId = target.unitId;
        }
      }

      if (!target || target.currentHp <= 0) {
        enemy.actionState = 'Idle';
        enemy.movementPolicyState = 'Idle';
        continue;
      }

      // If not engaged, test for interception by living player Tanks
      if (this.combatRules.engagement && !enemy.engagedTargetId) {
        const interceptor =
          this.combatRules.archetypes && enemy.archetype === 'Diver'
            ? this.findDiverTankInterceptor(enemy, target)
            : this.findTankInterceptor(enemy, target);

        if (interceptor) {
          enemy.engagedTargetId = interceptor.unitId;
          interceptor.engagedById = enemy.enemyId;
          enemy.targetUnitId = interceptor.unitId;
          target = interceptor;
          this.consequenceMetrics.interceptCount += 1;
          this.recordEngagementEvent('EngagementStarted', enemy.enemyId, interceptor.unitId, currentTime);
        }
      }

      const profile = P1V11C_ENEMY_ARCHETYPE_FIXTURE[enemy.archetype ?? 'Frontliner'];

      // 2. Cooldown / recovery progression
      if ((enemy.attackCooldownRemaining ?? 0) > 0) {
        enemy.attackCooldownRemaining = Math.max(0, (enemy.attackCooldownRemaining ?? 0) - deltaSeconds);
      }
      if ((enemy.recoveryRemaining ?? 0) > 0) {
        enemy.recoveryRemaining = Math.max(0, (enemy.recoveryRemaining ?? 0) - deltaSeconds);
        if (enemy.recoveryRemaining <= COMBAT_DISTANCE_EPSILON && enemy.actionState === 'Recovering') {
          enemy.actionState = 'Idle';
        }
      }

      // 3. Windup resolution
      if (enemy.actionState === 'Windup') {
        if (this.combatRules.archetypes && enemy.archetype === 'Ranged') {
          enemy.movementPolicyState = 'Hold';
        }
        enemy.attackWindupRemaining = (enemy.attackWindupRemaining ?? 0) - deltaSeconds;
        if (enemy.attackWindupRemaining <= COMBAT_DISTANCE_EPSILON) {
          const appliedDamage = Math.min(target.currentHp, enemy.damage);
          target.currentHp = Math.max(0, target.currentHp - appliedDamage);

          this.consequenceMetrics.damageTakenByUnit[target.unitId] =
            (this.consequenceMetrics.damageTakenByUnit[target.unitId] ?? 0) + appliedDamage;

          if (
            (target.role === 'Ranger' || target.role === 'Mage') &&
            this.consequenceMetrics.firstBacklineHitTime === undefined
          ) {
            this.consequenceMetrics.firstBacklineHitTime = currentTime;
          }

          if (target.currentHp <= 0) {
            target.actionState = 'Dead';
            if (enemy.engagedTargetId === target.unitId) {
              this.recordEngagementEvent('EngagementEnded', enemy.enemyId, target.unitId, currentTime);
              enemy.engagedTargetId = undefined;
              target.engagedById = undefined;
            }
            enemy.targetUnitId = undefined;
          }
          enemy.actionState = 'Recovering';
          enemy.attackWindupRemaining = 0;
          enemy.recoveryRemaining = Math.max(0, profile.attackInterval - profile.windup);
          enemy.attackCooldownRemaining = enemy.recoveryRemaining;
        }
        continue;
      }

      // 4. Movement / windup initiation
      const distance = this.distance(
        enemy.positionX,
        enemy.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (!this.combatRules.archetypes) {
        const attackRange = ENEMY_ATTACK_RANGE;
        if (distance > attackRange + COMBAT_DISTANCE_EPSILON) {
          enemy.actionState = 'Moving';
          this.moveTowardEnemy(enemy, target, ENEMY_MOVE_SPEED * deltaSeconds, attackRange);
          if (this.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
            const minAllowedX = target.positionX + attackRange * 0.5;
            if (enemy.positionX < minAllowedX) {
              enemy.positionX = minAllowedX;
            }
          }
        } else {
          if ((enemy.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
            enemy.actionState = 'Windup';
            enemy.attackWindupRemaining = P1V11A_ACTION_TIMING_FIXTURE.Enemy.windup;
          } else {
            if (enemy.actionState !== 'Recovering') enemy.actionState = 'Idle';
          }
        }
        continue;
      }

      // Archetype-driven movement:
      if (enemy.archetype === 'Frontliner') {
        const attackRange = profile.attackRange;
        if (distance > attackRange + COMBAT_DISTANCE_EPSILON) {
          enemy.actionState = 'Moving';
          enemy.movementPolicyState = 'AdvanceToRange';
          this.moveTowardEnemy(enemy, target, profile.speed * deltaSeconds, attackRange);
          if (this.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
            const minAllowedX = target.positionX + attackRange * 0.5;
            if (enemy.positionX < minAllowedX) {
              enemy.positionX = minAllowedX;
            }
          }
        } else {
          enemy.movementPolicyState = 'Engage';
          if ((enemy.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
            enemy.actionState = 'Windup';
            enemy.attackWindupRemaining = profile.windup;
          } else {
            if (enemy.actionState !== 'Recovering') enemy.actionState = 'Idle';
          }
        }
      } else if (enemy.archetype === 'Diver') {
        const attackRange = profile.attackRange;
        if (distance > attackRange + COMBAT_DISTANCE_EPSILON) {
          enemy.actionState = 'Moving';
          enemy.movementPolicyState = 'Dive';
          this.moveTowardEnemy(enemy, target, profile.speed * deltaSeconds, attackRange);
          if (this.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
            const minAllowedX = target.positionX + attackRange * 0.5;
            if (enemy.positionX < minAllowedX) {
              enemy.positionX = minAllowedX;
            }
          }
        } else {
          enemy.movementPolicyState = enemy.engagedTargetId ? 'Engage' : 'Dive';
          if ((enemy.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
            enemy.actionState = 'Windup';
            enemy.attackWindupRemaining = profile.windup;
          } else {
            if (enemy.actionState !== 'Recovering') enemy.actionState = 'Idle';
          }
        }
      } else {
        // Ranged enemy:
        this.resolveRangedEnemyMovementAndAction(enemy, target, profile, deltaSeconds);
      }
    }
  }

  private findDiverTankInterceptor(
    enemy: EnemyCombatUnit,
    intendedTarget: CombatUnit,
  ): CombatUnit | undefined {
    const candidateTanks = this.state.units.filter(
      (unit) => unit.currentHp > 0 && unit.role === 'Tanker',
    );
    if (!candidateTanks.length) return undefined;

    const fixture = P1V11B_ENGAGEMENT_FIXTURE;
    const eligible: Array<{ tank: CombatUnit; distance: number }> = [];

    for (const tank of candidateTanks) {
      const laneDiffToTarget = Math.abs(tank.positionLane - intendedTarget.positionLane);
      const laneDiffToDiver = Math.abs(tank.positionLane - enemy.positionLane);
      if (laneDiffToTarget > 1.05 && laneDiffToDiver > 1.05) continue;

      const distToTarget = this.distance(
        tank.positionX,
        tank.positionLane,
        intendedTarget.positionX,
        intendedTarget.positionLane,
      );
      if (distToTarget > 2.2) continue;

      const distToTank = this.distance(
        enemy.positionX,
        enemy.positionLane,
        tank.positionX,
        tank.positionLane,
      );
      if (distToTank > fixture.tankGuardRadius) continue;

      const enemyAheadOfTank = enemy.positionX >= tank.positionX - COMBAT_DISTANCE_EPSILON;
      const targetBehindOrAtTank =
        intendedTarget.positionX <= tank.positionX + 0.35 || intendedTarget.unitId === tank.unitId;
      if (!enemyAheadOfTank || !targetBehindOrAtTank) continue;

      eligible.push({ tank, distance: distToTank });
    }

    if (!eligible.length) return undefined;

    eligible.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) > COMBAT_DISTANCE_EPSILON) {
        return a.distance - b.distance;
      }
      return a.tank.unitId.localeCompare(b.tank.unitId);
    });

    return eligible[0].tank;
  }

  private findTankInterceptor(
    enemy: EnemyCombatUnit,
    intendedTarget: CombatUnit,
  ): CombatUnit | undefined {
    const candidateTanks = this.state.units.filter(
      (unit) => unit.currentHp > 0 && unit.role === 'Tanker',
    );
    if (!candidateTanks.length) return undefined;

    const fixture = P1V11B_ENGAGEMENT_FIXTURE;
    const eligible: Array<{ tank: CombatUnit; distance: number }> = [];

    for (const tank of candidateTanks) {
      const distToTank = this.distance(
        enemy.positionX,
        enemy.positionLane,
        tank.positionX,
        tank.positionLane,
      );

      if (distToTank > fixture.tankGuardRadius) continue;

      const enemyAheadOfTank = enemy.positionX >= tank.positionX - COMBAT_DISTANCE_EPSILON;
      const targetBehindOrAtTank =
        intendedTarget.positionX <= tank.positionX + 0.35 || intendedTarget.unitId === tank.unitId;
      if (!enemyAheadOfTank || !targetBehindOrAtTank) continue;

      const minLane = Math.min(enemy.positionLane, intendedTarget.positionLane) - 0.5;
      const maxLane = Math.max(enemy.positionLane, intendedTarget.positionLane) + 0.5;
      const inLaneCorridor = tank.positionLane >= minLane && tank.positionLane <= maxLane;
      const laneDiffToEnemy = Math.abs(tank.positionLane - enemy.positionLane);
      if (!inLaneCorridor || laneDiffToEnemy > 1.05) continue;

      eligible.push({ tank, distance: distToTank });
    }

    if (!eligible.length) return undefined;

    eligible.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) > COMBAT_DISTANCE_EPSILON) {
        return a.distance - b.distance;
      }
      if (Math.abs(b.tank.positionX - a.tank.positionX) > COMBAT_DISTANCE_EPSILON) {
        return b.tank.positionX - a.tank.positionX;
      }
      return a.tank.unitId.localeCompare(b.tank.unitId);
    });

    return eligible[0].tank;
  }

  private recordEngagementEvent(
    type: 'EngagementStarted' | 'EngagementEnded',
    enemyId: string,
    tankId: string,
    time: number,
  ): void {
    this.engagementEvents.push({ type, enemyId, tankId, time });
  }

  private findBestEnemyInRange(unit: CombatUnit, maxRange: number): EnemyCombatUnit | undefined {
    const living = this.state.enemies.filter((enemy) => {
      if (enemy.currentHp <= 0) return false;
      const dist = this.distance(unit.positionX, unit.positionLane, enemy.positionX, enemy.positionLane);
      return dist <= maxRange + COMBAT_DISTANCE_EPSILON;
    });
    if (!living.length) return undefined;

    return living.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - unit.positionLane);
      const laneDiffB = Math.abs(b.positionLane - unit.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) {
        return laneDiffA - laneDiffB;
      }
      const distA = this.distance(unit.positionX, unit.positionLane, a.positionX, a.positionLane);
      const distB = this.distance(unit.positionX, unit.positionLane, b.positionX, b.positionLane);
      if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
        return distA - distB;
      }
      return a.enemyId.localeCompare(b.enemyId);
    })[0];
  }

  private findBestRangedAdvanceTarget(unit: CombatUnit): EnemyCombatUnit | undefined {
    const living = this.state.enemies.filter((e) => e.currentHp > 0);
    if (!living.length) return undefined;

    return living.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - unit.positionLane);
      const laneDiffB = Math.abs(b.positionLane - unit.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) >= 1.5) {
        return laneDiffA - laneDiffB;
      }
      const distA = this.distance(unit.positionX, unit.positionLane, a.positionX, a.positionLane);
      const distB = this.distance(unit.positionX, unit.positionLane, b.positionX, b.positionLane);
      if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
        return distA - distB;
      }
      return a.enemyId.localeCompare(b.enemyId);
    })[0];
  }

  private acquirePlayerTarget(unit: CombatUnit): EnemyCombatUnit | undefined {
    if (unit.role === 'Tanker') {
      return this.nearestEnemyByRowPriority(unit.positionLane, ['Front', 'Mid', 'Back']);
    } else if (unit.role === 'Assassin') {
      return this.nearestEnemyByRowPriority(unit.positionLane, ['Back', 'Mid', 'Front']);
    } else {
      return this.deepEnemyInOrNearLane(unit.positionLane);
    }
  }

  private acquireDiverTarget(enemy: EnemyCombatUnit): CombatUnit | undefined {
    const living = this.state.units.filter((u) => u.currentHp > 0);
    if (!living.length) return undefined;

    const carries = living.filter((u) => u.role === 'Mage' || u.role === 'Ranger');
    if (carries.length) {
      return carries.sort((a, b) => {
        const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
        const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
        if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
        if (Math.abs(a.positionX - b.positionX) > COMBAT_DISTANCE_EPSILON) {
          return a.positionX - b.positionX;
        }
        return a.unitId.localeCompare(b.unitId);
      })[0];
    }

    return living.sort((a, b) => {
      if (Math.abs(a.positionX - b.positionX) > 0.4) {
        return a.positionX - b.positionX;
      }
      const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
      const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
      return a.unitId.localeCompare(b.unitId);
    })[0];
  }

  private acquireRangedEnemyTarget(enemy: EnemyCombatUnit): CombatUnit | undefined {
    const living = this.state.units.filter((u) => u.currentHp > 0);
    if (!living.length) return undefined;

    const inRange = living.filter(
      (u) =>
        this.distance(enemy.positionX, enemy.positionLane, u.positionX, u.positionLane) <=
        3.8 + COMBAT_DISTANCE_EPSILON,
    );
    const pool = inRange.length ? inRange : living;

    return pool.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
      const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
      const dx = b.positionX - a.positionX;
      if (Math.abs(dx) > COMBAT_DISTANCE_EPSILON) return dx;
      return a.unitId.localeCompare(b.unitId);
    })[0];
  }

  private resolveRangedEnemyMovementAndAction(
    enemy: EnemyCombatUnit,
    target: CombatUnit,
    profile: EnemyArchetypeProfile,
    deltaSeconds: number,
  ): void {
    let closestPlayerDist = 999;
    for (const playerUnit of this.state.units) {
      if (playerUnit.currentHp <= 0) continue;
      const d = this.distance(enemy.positionX, enemy.positionLane, playerUnit.positionX, playerUnit.positionLane);
      if (d < closestPlayerDist) {
        closestPlayerDist = d;
      }
    }

    const wasKiting = enemy.movementPolicyState === 'Kite';
    const restoreThreshold = profile.preferredMinRange;
    const triggerThreshold = profile.dangerRange;

    const shouldKite = wasKiting
      ? closestPlayerDist < restoreThreshold - COMBAT_DISTANCE_EPSILON
      : closestPlayerDist < triggerThreshold - COMBAT_DISTANCE_EPSILON;

    if (shouldKite) {
      enemy.actionState = 'Moving';
      enemy.movementPolicyState = 'Kite';
      const retreated = this.retreatEnemy(enemy, profile.speed * deltaSeconds);
      if (!retreated) {
        enemy.movementPolicyState = 'Hold';
        if ((enemy.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
          enemy.actionState = 'Windup';
          enemy.attackWindupRemaining = profile.windup;
        } else {
          enemy.actionState = 'Idle';
        }
      }
      return;
    }

    const distanceToTarget = this.distance(
      enemy.positionX,
      enemy.positionLane,
      target.positionX,
      target.positionLane,
    );

    if (distanceToTarget <= profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      enemy.movementPolicyState = 'Hold';
      if ((enemy.attackCooldownRemaining ?? 0) <= COMBAT_DISTANCE_EPSILON) {
        enemy.actionState = 'Windup';
        enemy.attackWindupRemaining = profile.windup;
      } else {
        if (enemy.actionState !== 'Recovering') enemy.actionState = 'Idle';
      }
      return;
    }

    const livingFrontliners = this.state.enemies.filter(
      (e) => e.currentHp > 0 && e.archetype === 'Frontliner' && e.enemyId !== enemy.enemyId,
    );
    const forwardFrontlinerX = livingFrontliners.length
      ? Math.min(...livingFrontliners.map((f) => f.positionX))
      : undefined;

    const minSafeX = forwardFrontlinerX !== undefined ? forwardFrontlinerX + 0.25 : ENEMY_MIN_X;

    if (enemy.positionX <= minSafeX + COMBAT_DISTANCE_EPSILON) {
      enemy.movementPolicyState = 'Hold';
      if (enemy.actionState !== 'Recovering') enemy.actionState = 'Idle';
      return;
    }

    enemy.actionState = 'Moving';
    enemy.movementPolicyState = 'AdvanceToRange';
    this.moveTowardEnemy(
      enemy,
      target,
      profile.speed * deltaSeconds,
      profile.attackRange - 0.20,
    );

    if (enemy.positionX < minSafeX) {
      enemy.positionX = minSafeX;
    }
  }

  private retreatEnemy(enemy: EnemyCombatUnit, speed: number): boolean {
    const before = enemy.positionX;
    enemy.positionX = clamp(enemy.positionX + speed, ENEMY_MIN_X, ENEMY_MAX_X);
    return enemy.positionX > before + 0.000001;
  }

  private acquireEnemyTarget(enemy: EnemyCombatUnit): CombatUnit | undefined {
    const living = this.state.units.filter((unit) => unit.currentHp > 0);
    if (!living.length) return undefined;

    if (this.combatRules.engagement) {
      return living.sort((a, b) => {
        const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
        const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
        if (Math.abs(laneDiffA - laneDiffB) >= 1.5) {
          return laneDiffA - laneDiffB;
        }

        const dx = b.positionX - a.positionX;
        if (Math.abs(dx) > 0.4) {
          return dx;
        }

        if (Math.abs(laneDiffA - laneDiffB) > COMBAT_DISTANCE_EPSILON) {
          return laneDiffA - laneDiffB;
        }

        const distA = this.distance(enemy.positionX, enemy.positionLane, a.positionX, a.positionLane);
        const distB = this.distance(enemy.positionX, enemy.positionLane, b.positionX, b.positionLane);
        if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
          return distA - distB;
        }

        return a.unitId.localeCompare(b.unitId);
      })[0];
    }

    return this.target();
  }

  private resolvePlayerDamage(unit: CombatUnit, target: EnemyCombatUnit): void {
    if (target.currentHp <= 0) return;

    this.consequenceMetrics.attacksResolvedByUnit[unit.unitId] =
      (this.consequenceMetrics.attacksResolvedByUnit[unit.unitId] ?? 0) + 1;

    if (unit.role === 'Tanker') {
      const damage = this.applyDamage(target, unit.damage);
      if (damage > 0) this.recordAction(unit, 'GuardStrike', [{ enemyId: target.enemyId, damage }]);
    } else if (unit.role === 'Assassin') {
      if (this.consequenceMetrics.firstAssassinContactTime === undefined) {
        this.consequenceMetrics.firstAssassinContactTime = this.state.elapsedTime ?? 0;
      }
      const damage = this.applyDamage(target, unit.damage);
      if (damage > 0) this.recordAction(unit, 'Dive', [{ enemyId: target.enemyId, damage }]);
    } else if (unit.role === 'Ranger') {
      const damage = this.applyDamage(target, unit.damage);
      if (damage > 0) this.recordAction(unit, 'Snipe', [{ enemyId: target.enemyId, damage }]);
    } else {
      // Mage
      const hits: PlayerCombatHit[] = [];
      const appliedPrimary = this.applyDamage(target, unit.damage);
      if (appliedPrimary > 0) hits.push({ enemyId: target.enemyId, damage: appliedPrimary });

      const secondaryTargets = this.state.enemies
        .filter(
          (enemy) =>
            enemy.currentHp > 0 &&
            enemy.enemyId !== target.enemyId &&
            Math.abs(enemy.positionLane - target.positionLane) <= 1.05,
        )
        .sort(
          (a, b) =>
            Math.abs(a.positionLane - target.positionLane) -
              Math.abs(b.positionLane - target.positionLane) ||
            a.positionX - b.positionX,
        );

      for (const enemy of secondaryTargets) {
        const applied = this.applyDamage(enemy, unit.damage * 0.5);
        if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
      }

      if (hits.length) this.recordAction(unit, 'ArcaneBurst', hits);
    }

    if (target.currentHp <= 0) {
      target.actionState = 'Dead';
      unit.targetEnemyId = undefined;
    }
  }

  private freezeOnTerminal(): void {
    this.state.units.forEach((u) => {
      if (u.currentHp <= 0) u.actionState = 'Dead';
      else u.actionState = 'Idle';
      u.engagedById = undefined;
      u.movementPolicyState = 'Idle';
    });
    this.state.enemies.forEach((e) => {
      if (e.currentHp <= 0) e.actionState = 'Dead';
      else e.actionState = 'Idle';
      e.engagedTargetId = undefined;
      e.movementPolicyState = 'Idle';
    });
  }
}

export function roleBaseStats(role: BeastRole): Readonly<{ hp: number; damage: number }> {
  return { ...baseStats[role] };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

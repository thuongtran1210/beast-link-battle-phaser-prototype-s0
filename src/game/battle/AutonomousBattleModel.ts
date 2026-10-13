import { type BattleFormation, type FormationUnit } from './BattleFormation';
import { starStatMultiplier } from '../run/StarProfile';
import { signatureForBeast, type BeastRole, type BeastSignatureId } from './BeastRoles';
import type { EnergyQueue } from '../energy/EnergyQueue';
import { BattleEnergySystem } from './systems/BattleEnergySystem';
import { createInitialConsequenceMetrics, cloneConsequenceMetrics, computeValidationMetrics } from './systems/BattleMetricsCalculator';
import { SignatureCombatDispatcher } from './signatures/SignatureCombatDispatcher';
import type { SignatureContext } from './signatures/SignatureContext';
import { BattleTargetingSystem } from './systems/BattleTargetingSystem';
import { BattleMovementSystem } from './systems/BattleMovementSystem';
import { StaticCombatResolver } from './resolvers/StaticCombatResolver';
import { TimelineCombatResolver } from './resolvers/TimelineCombatResolver';
import type { CombatResolverContext } from './resolvers/CombatResolverContext';
import { tacticalEnergyDefinition, type TacticalEnergyKind } from '../energy/TacticalEnergyCatalog';
import type { FormationValidationMetrics } from './FormationValidationHarness';

export * from './BattleTypes';
export { P1V11A_ACTION_TIMING_FIXTURE, SIMULATION_STEP, P1V13A_SIGNATURE_FIXTURE, LEGACY_BATTLE_COMBAT_RULES, P1V8_ROLE_POSITIONING_RULES, P1V9_AUTONOMOUS_MOVEMENT_RULES, P1V11A_TIMELINE_RULES, P1V11B_ENGAGEMENT_FIXTURE, P1V11B_ENGAGEMENT_RULES, P1V11B1_ROLE_IDENTITY_RULES, P1V11C_ARCHETYPE_RULES, P1V13A_SIGNATURE_RULES, P1V11C_ENEMY_ARCHETYPE_FIXTURE, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_FIXTURE_B_DIVERS, P1V11C_FIXTURE_C_PROTECTED_RANGED, EXPERIMENTAL_FRONTLINE_HEAL_HP, FRONTLINE_HEAL_HP, LEGACY_SINGLE_ENEMY_FIXTURE } from './BattleConfig';
import type { BattleStatus, BattleRow, PlayerActionKind, CombatActionState, RoleMovementState, FormationAnchor, ActionTimingProfile, CombatUnit, SignatureBattleEvent, SignatureMetrics, EnemyArchetype, EnemyFixture, EnemyCombatUnit, PlayerCombatHit, PlayerCombatAction, BattleCombatRules, EngagementFixture, EnemyArchetypeProfile, EngagementBattleEvent, FormationConsequenceMetrics, AutonomousBattleSnapshot, RoleMovementConfig, FrontlineHealCastReason, FrontlineHealCastResult, TacticalEnergyAvailability, TacticalEnergyCastReason, TacticalEnergyEligibility, TacticalEnergyCastResult } from './BattleTypes';
import { P1V11A_ACTION_TIMING_FIXTURE, SIMULATION_STEP, P1V13A_SIGNATURE_FIXTURE, LEGACY_BATTLE_COMBAT_RULES, P1V8_ROLE_POSITIONING_RULES, P1V9_AUTONOMOUS_MOVEMENT_RULES, P1V11A_TIMELINE_RULES, P1V11B_ENGAGEMENT_FIXTURE, P1V11B_ENGAGEMENT_RULES, P1V11B1_ROLE_IDENTITY_RULES, P1V11C_ARCHETYPE_RULES, P1V13A_SIGNATURE_RULES, P1V11C_ENEMY_ARCHETYPE_FIXTURE, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_FIXTURE_B_DIVERS, P1V11C_FIXTURE_C_PROTECTED_RANGED, EXPERIMENTAL_FRONTLINE_HEAL_HP, FRONTLINE_HEAL_HP, LEGACY_SINGLE_ENEMY_FIXTURE, baseStats, rowOrder, PLAYER_SPAWN_X, ENEMY_SPAWN_X, LANE_DISTANCE_SCALE, PLAYER_MIN_X, PLAYER_MAX_X, ENEMY_MIN_X, ENEMY_MAX_X, movementProfile, ENEMY_MOVE_SPEED, ENEMY_ATTACK_RANGE, COMBAT_DISTANCE_EPSILON } from './BattleConfig';


/**
 * Pure deterministic combat model.
 * - Legacy aggregate combat remains the default.
 * - P1-V8 can opt into role-position targeting without movement.
 * - P1-V9 can opt into autonomous model-space movement.
 */

export class AutonomousBattleModel {
  private state: AutonomousBattleSnapshot;
  private engagementEvents: EngagementBattleEvent[] = [];
  private signatureEvents: SignatureBattleEvent[] = [];
  private signatureMetrics: SignatureMetrics = { signatureActivationsByUnit: {}, signatureDamageByUnit: {}, shieldDamageAbsorbedByUnit: {}, focusShotsResolved: 0, arcaneBloomTargetsHit: 0, ambushStrikesResolved: 0, guardianBraceAbsorbed: 0 };
  private consequenceMetrics: FormationConsequenceMetrics = createInitialConsequenceMetrics();
  private energySystem!: BattleEnergySystem;

  constructor(
    formation: BattleFormation,
    enemyFixtures: ReadonlyArray<EnemyFixture> = LEGACY_SINGLE_ENEMY_FIXTURE,
    private readonly combatRules: Readonly<BattleCombatRules> = LEGACY_BATTLE_COMBAT_RULES,
    private readonly persistentHpByUnitId: Readonly<Record<string, number>> = {},
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

    this.energySystem = new BattleEnergySystem({
      state: this.state,
      target: () => this.target(),
      frontmostAliveUnit: () => this.frontmostAliveUnit(),
      applyDamage: (enemy, requestedDamage) => this.applyDamage(enemy, requestedDamage),
      syncEnemyAggregates: () => this.syncEnemyAggregates(),
      freezeOnTerminal: () => this.freezeOnTerminal(),
    });

    if (!this.state.units.length) this.state.status = 'Lose';
    else if (!this.state.enemies.length) this.state.status = 'Win';
  }

  get snapshot(): AutonomousBattleSnapshot {
    return {
      ...this.state,
      units: this.state.units.map((unit) => ({ ...unit })),
      enemies: this.state.enemies.map((enemy) => ({ ...enemy })),
      lastEnemyActions: this.state.lastEnemyActions?.map(action => ({ ...action })),
      lastPlayerActions: this.state.lastPlayerActions?.map((action) => ({
        ...action,
        hits: action.hits.map((hit) => ({ ...hit })),
      })),
      engagementEvents: this.engagementEvents.map((e) => ({ ...e })),
      signatureEvents: this.signatureEvents.map((e) => ({ ...e })),
      signatureMetrics: { ...this.signatureMetrics, signatureActivationsByUnit: { ...this.signatureMetrics.signatureActivationsByUnit }, signatureDamageByUnit: { ...this.signatureMetrics.signatureDamageByUnit }, shieldDamageAbsorbedByUnit: { ...this.signatureMetrics.shieldDamageAbsorbedByUnit } },
      consequenceMetrics: cloneConsequenceMetrics(this.consequenceMetrics),
    };
  }

  getConsequenceMetrics(): FormationConsequenceMetrics {
    return cloneConsequenceMetrics(this.consequenceMetrics);
  }

  public getValidationMetrics(): FormationValidationMetrics {
    return computeValidationMetrics(this.state, this.consequenceMetrics);
  }

  step(deltaSeconds = SIMULATION_STEP): AutonomousBattleSnapshot {
    if (this.state.status !== 'Running') return this.snapshot;

    this.state.elapsedTicks += 1;
    this.state.elapsedTime = Math.round(((this.state.elapsedTime ?? 0) + deltaSeconds) * 1000) / 1000;
    this.state.lastPlayerActions = [];
    this.state.lastEnemyActions = [];

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
    this.state.lastEnemyActions = [];

    if (this.combatRules.movement) {
      this.resolveMovementBattleTick();
    } else {
      this.resolveStaticBattleTick();
    }

    this.syncEnemyAggregates();
    return this.snapshot;
  }

  target(): CombatUnit | undefined {
    return BattleTargetingSystem.target(this.state.units, this.combatRules);
  }

  enemyTarget(): EnemyCombatUnit | undefined {
    return BattleTargetingSystem.enemyTarget(this.state.enemies, this.combatRules);
  }

  frontmostAliveUnit(): CombatUnit | undefined {
    return this.target();
  }

  frontmostAliveEnemy(): EnemyCombatUnit | undefined {
    return this.enemyTarget();
  }

  frontlineHealEligibility(energyId: string, energyQueue: EnergyQueue): FrontlineHealCastResult {
    return this.energySystem.frontlineHealEligibility(energyId, energyQueue);
  }

  castFrontlineHealResult(energyId: string, energyQueue: EnergyQueue): FrontlineHealCastResult {
    return this.energySystem.castFrontlineHealResult(energyId, energyQueue);
  }

  castFrontlineHeal(energyId?: string, energyQueue?: EnergyQueue): boolean {
    return this.energySystem.castFrontlineHeal(energyId, energyQueue);
  }

  castEnergy(energyId: string, energyQueue: EnergyQueue): boolean {
    return this.castFrontlineHeal(energyId, energyQueue);
  }

  cast(energyId?: string, energyQueue?: EnergyQueue): boolean {
    return this.castFrontlineHeal(energyId, energyQueue);
  }

  tacticalEnergyEligibility(energyId: string, energyQueue: EnergyQueue): TacticalEnergyEligibility {
    return this.energySystem.tacticalEnergyEligibility(energyId, energyQueue);
  }

  castTacticalEnergy(energyId: string, energyQueue: EnergyQueue): TacticalEnergyCastResult {
    return this.energySystem.castTacticalEnergy(energyId, energyQueue);
  }

  private resolveStaticBattleTick(): void {
    StaticCombatResolver.resolveStaticBattleTick(this.getCombatResolverContext());
  }

  private resolveMovementBattleTick(): void {
    StaticCombatResolver.resolveMovementBattleTick(this.getCombatResolverContext());
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
    return BattleTargetingSystem.nearestEnemyByRowPriority(this.state.enemies, lane, rowPriority as BattleRow[]);
  }

  private deepEnemyInOrNearLane(lane: number): EnemyCombatUnit | undefined {
    return BattleTargetingSystem.deepEnemyInOrNearLane(this.state.enemies, lane);
  }

  private moveTowardPlayerUnit(
    unit: CombatUnit,
    target: EnemyCombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    BattleMovementSystem.moveTowardPlayerUnit(unit, target, speed, stopRange);
  }

  private moveTowardEnemy(
    enemy: EnemyCombatUnit,
    target: CombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    BattleMovementSystem.moveTowardEnemy(enemy, target, speed, stopRange);
  }

  private retreatPlayerUnit(unit: CombatUnit, speed: number): boolean {
    return BattleMovementSystem.retreatPlayerUnit(unit, speed);
  }

  private distance(
    ax: number,
    aLane: number,
    bx: number,
    bLane: number,
  ): number {
    return BattleMovementSystem.distance(ax, aLane, bx, bLane);
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
    const multiplier = starStatMultiplier(unit.star);
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
      currentHp: Math.min(maxHp, Math.max(0, this.persistentHpByUnitId[unit.unitId] ?? maxHp)),
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
      signatureId: this.combatRules.signatures ? signatureForBeast(unit.beastId) : undefined,
      signatureActivationCount: 0,
      temporaryShieldHp: 0,
      temporaryShieldSourceSignatureId: undefined,
      continuousHoldTime: 0,
      focusReady: false,
      ramReady: true,
      volleyAttackCount: 0,
    };
  }

  private resolveTimelinePlayerUnits(deltaSeconds: number): void {
    TimelineCombatResolver.resolveTimelinePlayerUnits(this.getCombatResolverContext(), deltaSeconds);
  }

  private resolveTimelineEnemies(deltaSeconds: number): void {
    TimelineCombatResolver.resolveTimelineEnemies(this.getCombatResolverContext(), deltaSeconds);
  }

  private retreatEnemy(enemy: EnemyCombatUnit, speed: number): boolean {
    return BattleMovementSystem.retreatEnemy(enemy, speed);
  }

  private acquireEnemyTarget(enemy: EnemyCombatUnit): CombatUnit | undefined {
    return BattleTargetingSystem.acquireEnemyTarget(
      enemy,
      this.state.units,
      this.combatRules,
      (x1, y1, x2, y2) => this.distance(x1, y1, x2, y2),
    );
  }

  private getCombatResolverContext(): CombatResolverContext {
    return {
      state: this.state,
      combatRules: this.combatRules,
      consequenceMetrics: this.consequenceMetrics,
      signatureMetrics: this.signatureMetrics,
      signatureEvents: this.signatureEvents,
      engagementEvents: this.engagementEvents,
      target: () => this.target(),
      enemyTarget: () => this.enemyTarget(),
      applyDamage: (enemy, requestedDamage) => this.applyDamage(enemy, requestedDamage),
      applyDamageToEnemies: (totalDamage) => this.applyDamageToEnemies(totalDamage),
      recordAction: (unit, kind, hits) => this.recordAction(unit, kind, hits),
      activateSignature: (unit, targetId) => this.activateSignature(unit, targetId),
      expireShield: (unit) => this.expireShield(unit),
      applyDamageToUnit: (unit, incoming) => this.applyDamageToUnit(unit, incoming),
    };
  }

  private getSignatureContext(): SignatureContext {
    return {
      state: this.state,
      combatRules: this.combatRules,
      consequenceMetrics: this.consequenceMetrics,
      signatureMetrics: this.signatureMetrics,
      signatureEvents: this.signatureEvents,
      distance: (x1, y1, x2, y2) => this.distance(x1, y1, x2, y2),
      applyDamage: (enemy, requestedDamage) => this.applyDamage(enemy, requestedDamage),
      recordAction: (unit, kind, hits) => this.recordAction(unit, kind, hits),
      activateSignature: (unit, targetId) => this.activateSignature(unit, targetId),
    };
  }

  private resolvePlayerDamage(unit: CombatUnit, target: EnemyCombatUnit): void {
    SignatureCombatDispatcher.resolvePlayerDamage(this.getSignatureContext(), unit, target);
  }

  private updateFocusProgress(unit: CombatUnit, target: EnemyCombatUnit, deltaSeconds: number): void {
    SignatureCombatDispatcher.updateFocusProgress(this.getSignatureContext(), unit, target, deltaSeconds);
  }

  private activateGuardianBrace(unit: CombatUnit, targetId: string): void {
    SignatureCombatDispatcher.activateGuardianBrace(this.getSignatureContext(), unit, targetId);
  }

  private activateSignature(unit: CombatUnit, targetId?: string): void {
    unit.signatureActivationCount = (unit.signatureActivationCount ?? 0) + 1;
    this.signatureMetrics.signatureActivationsByUnit[unit.unitId] = (this.signatureMetrics.signatureActivationsByUnit[unit.unitId] ?? 0) + 1;
    this.signatureEvents.push({ type: 'SignatureActivated', unitId: unit.unitId, signatureId: unit.signatureId!, targetId, time: this.state.elapsedTime ?? 0 });
  }

  private expireShield(unit: CombatUnit): void {
    if ((unit.temporaryShieldExpiresAt ?? Infinity) <= (this.state.elapsedTime ?? 0)) {
      unit.temporaryShieldHp = 0;
      unit.temporaryShieldExpiresAt = undefined;
      unit.temporaryShieldSourceSignatureId = undefined;
    }
  }

  private applyDamageToUnit(unit: CombatUnit, incoming: number): number {
    this.expireShield(unit);
    const absorbed = Math.min(unit.temporaryShieldHp ?? 0, incoming);
    if (absorbed > 0) {
      unit.temporaryShieldHp = (unit.temporaryShieldHp ?? 0) - absorbed;
      this.signatureMetrics.guardianBraceAbsorbed += absorbed;
      this.signatureMetrics.shieldDamageAbsorbedByUnit[unit.unitId] = (this.signatureMetrics.shieldDamageAbsorbedByUnit[unit.unitId] ?? 0) + absorbed;
      this.signatureEvents.push({
        type: 'ShieldAbsorbed',
        unitId: unit.unitId,
        signatureId: unit.temporaryShieldSourceSignatureId ?? unit.signatureId ?? 'GuardianBrace',
        amount: absorbed,
        time: this.state.elapsedTime ?? 0,
      });
    }
    const hpDamage = Math.min(unit.currentHp, incoming - absorbed); unit.currentHp = Math.max(0, unit.currentHp - hpDamage); return hpDamage;
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

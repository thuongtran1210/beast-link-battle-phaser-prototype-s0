import type { CombatUnit, EnemyCombatUnit, PlayerCombatHit } from '../BattleTypes';
import type { CombatResolverContext } from './CombatResolverContext';
import {
  rowOrder,
  movementProfile,
  ENEMY_MOVE_SPEED,
  ENEMY_ATTACK_RANGE,
  COMBAT_DISTANCE_EPSILON,
} from '../BattleConfig';
import { BattleTargetingSystem } from '../systems/BattleTargetingSystem';
import { BattleMovementSystem } from '../systems/BattleMovementSystem';

export class StaticCombatResolver {
  static resolveStaticBattleTick(ctx: CombatResolverContext): void {
    if (ctx.combatRules.rolePositioning) {
      this.applyRolePositionPlayerActions(ctx);
    } else {
      const totalPlayerDamage = ctx.state.units
        .filter((unit) => unit.currentHp > 0)
        .reduce((sum, unit) => sum + unit.damage, 0);
      ctx.applyDamageToEnemies(totalPlayerDamage);
    }

    // Check terminal win inside tick caller
    const livingEnemies = ctx.state.enemies.filter((e) => e.currentHp > 0);
    if (!livingEnemies.length) {
      ctx.state.status = 'Win';
      return;
    }

    const target = ctx.target();
    if (!target) {
      ctx.state.status = 'Lose';
      return;
    }

    const incomingDamage = livingEnemies.reduce((sum, enemy) => sum + enemy.damage, 0);
    target.currentHp = Math.max(0, target.currentHp - incomingDamage);

    if (!ctx.state.units.some((unit) => unit.currentHp > 0)) {
      ctx.state.status = 'Lose';
    }
  }

  static applyRolePositionPlayerActions(ctx: CombatResolverContext): void {
    const attackers = ctx.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column);

    for (const unit of attackers) {
      if (ctx.state.enemies.every((enemy) => enemy.currentHp <= 0)) break;

      if (unit.role === 'Tanker') {
        this.resolveTanker(ctx, unit);
      } else if (unit.role === 'Assassin') {
        this.resolveAssassin(ctx, unit);
      } else if (unit.role === 'Ranger') {
        this.resolveRanger(ctx, unit);
      } else {
        this.resolveMage(ctx, unit);
      }
    }
  }

  static resolveTanker(ctx: CombatResolverContext, unit: CombatUnit): void {
    if (unit.row !== 'Front') return;

    const target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.column, ['Front', 'Mid', 'Back']);
    if (!target) return;

    const damage = ctx.applyDamage(target, unit.damage);
    if (damage > 0) ctx.recordAction(unit, 'GuardStrike', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveAssassin(ctx: CombatResolverContext, unit: CombatUnit): void {
    if (unit.row === 'Back') return;

    const target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.column, ['Back', 'Mid', 'Front']);
    if (!target) return;

    const damage = ctx.applyDamage(target, unit.damage);
    if (damage > 0) ctx.recordAction(unit, 'Dive', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveRanger(ctx: CombatResolverContext, unit: CombatUnit): void {
    const target = BattleTargetingSystem.deepEnemyInOrNearLane(ctx.state.enemies, unit.column);
    if (!target) return;

    const multiplier = unit.row === 'Back' ? 1 : unit.row === 'Mid' ? 0.8 : 0.6;
    const damage = ctx.applyDamage(target, unit.damage * multiplier);
    if (damage > 0) ctx.recordAction(unit, 'Snipe', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveMage(ctx: CombatResolverContext, unit: CombatUnit): void {
    const primary = BattleTargetingSystem.deepEnemyInOrNearLane(ctx.state.enemies, unit.column);
    if (!primary) return;

    const multiplier = unit.row === 'Front' ? 0.7 : 1;
    const primaryDamage = unit.damage * multiplier;
    const hits: PlayerCombatHit[] = [];

    const appliedPrimary = ctx.applyDamage(primary, primaryDamage);
    if (appliedPrimary > 0) hits.push({ enemyId: primary.enemyId, damage: appliedPrimary });

    const secondaryTargets = ctx.state.enemies
      .filter(
        (enemy) =>
          enemy.currentHp > 0 &&
          enemy.enemyId !== primary.enemyId &&
          Math.abs(enemy.column - primary.column) === 1,
      )
      .sort((a, b) => rowOrder[b.row] - rowOrder[a.row] || a.column - b.column);

    for (const enemy of secondaryTargets) {
      const applied = ctx.applyDamage(enemy, primaryDamage * 0.5);
      if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
    }

    if (hits.length) ctx.recordAction(unit, 'ArcaneBurst', hits);
  }

  static resolveMovementBattleTick(ctx: CombatResolverContext): void {
    this.applyMovementPlayerActions(ctx);

    const livingEnemies = ctx.state.enemies.filter((e) => e.currentHp > 0);
    if (!livingEnemies.length) {
      ctx.state.status = 'Win';
      return;
    }

    this.applyEnemyMovementAndAttacks(ctx);

    if (!ctx.state.units.some((unit) => unit.currentHp > 0)) {
      ctx.state.status = 'Lose';
    }
  }

  static applyMovementPlayerActions(ctx: CombatResolverContext): void {
    const attackers = ctx.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => b.positionX - a.positionX || a.positionLane - b.positionLane);

    for (const unit of attackers) {
      if (ctx.state.enemies.every((enemy) => enemy.currentHp <= 0)) break;

      if (unit.role === 'Tanker') {
        this.resolveMovingTanker(ctx, unit);
      } else if (unit.role === 'Assassin') {
        this.resolveMovingAssassin(ctx, unit);
      } else if (unit.role === 'Ranger') {
        this.resolveMovingRanger(ctx, unit);
      } else {
        this.resolveMovingMage(ctx, unit);
      }
    }
  }

  static resolveMovingTanker(ctx: CombatResolverContext, unit: CombatUnit): void {
    const target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.positionLane, ['Front', 'Mid', 'Back']);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Tanker;
    const distance = BattleMovementSystem.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange);
      return;
    }

    const damage = ctx.applyDamage(target, unit.damage);
    if (damage > 0) ctx.recordAction(unit, 'GuardStrike', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveMovingAssassin(ctx: CombatResolverContext, unit: CombatUnit): void {
    const target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.positionLane, ['Back', 'Mid', 'Front']);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Assassin;
    const distance = BattleMovementSystem.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange);
      return;
    }

    const damage = ctx.applyDamage(target, unit.damage);
    if (damage > 0) ctx.recordAction(unit, 'Dive', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveMovingRanger(ctx: CombatResolverContext, unit: CombatUnit): void {
    const target = BattleTargetingSystem.deepEnemyInOrNearLane(ctx.state.enemies, unit.positionLane);
    if (!target) return;
    unit.targetEnemyId = target.enemyId;

    const profile = movementProfile.Ranger;
    const distance = BattleMovementSystem.distance(unit.positionX, unit.positionLane, target.positionX, target.positionLane);

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
      const retreated = BattleMovementSystem.retreatPlayerUnit(unit, profile.speed);
      if (retreated) return;
    }

    const damage = ctx.applyDamage(target, unit.damage);
    if (damage > 0) ctx.recordAction(unit, 'Snipe', [{ enemyId: target.enemyId, damage }]);
  }

  static resolveMovingMage(ctx: CombatResolverContext, unit: CombatUnit): void {
    const primary = BattleTargetingSystem.deepEnemyInOrNearLane(ctx.state.enemies, unit.positionLane);
    if (!primary) return;
    unit.targetEnemyId = primary.enemyId;

    const profile = movementProfile.Mage;
    const distance = BattleMovementSystem.distance(unit.positionX, unit.positionLane, primary.positionX, primary.positionLane);

    if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
      BattleMovementSystem.moveTowardPlayerUnit(unit, primary, profile.speed, profile.attackRange - 0.15);
      return;
    }

    if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
      const retreated = BattleMovementSystem.retreatPlayerUnit(unit, profile.speed);
      if (retreated) return;
    }

    const hits: PlayerCombatHit[] = [];
    const appliedPrimary = ctx.applyDamage(primary, unit.damage);
    if (appliedPrimary > 0) hits.push({ enemyId: primary.enemyId, damage: appliedPrimary });

    const secondaryTargets = ctx.state.enemies
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
      const applied = ctx.applyDamage(enemy, unit.damage * 0.5);
      if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
    }

    if (hits.length) ctx.recordAction(unit, 'ArcaneBurst', hits);
  }

  static applyEnemyMovementAndAttacks(ctx: CombatResolverContext): void {
    const livingEnemies = ctx.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => a.positionX - b.positionX || a.positionLane - b.positionLane);

    for (const enemy of livingEnemies) {
      const target = ctx.target();
      if (!target) return;

      enemy.targetUnitId = target.unitId;
      const distance = BattleMovementSystem.distance(
        enemy.positionX,
        enemy.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (distance > ENEMY_ATTACK_RANGE + COMBAT_DISTANCE_EPSILON) {
        BattleMovementSystem.moveTowardEnemy(enemy, target, ENEMY_MOVE_SPEED, ENEMY_ATTACK_RANGE);
        continue;
      }

      target.currentHp = Math.max(0, target.currentHp - enemy.damage);
    }
  }
}

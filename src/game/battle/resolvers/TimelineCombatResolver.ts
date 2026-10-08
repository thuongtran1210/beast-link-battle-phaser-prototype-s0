import type {
  CombatUnit,
  EnemyCombatUnit,
  RoleMovementConfig,
  EnemyArchetypeProfile,
} from '../BattleTypes';
import type { CombatResolverContext } from './CombatResolverContext';
import {
  movementProfile,
  P1V11A_ACTION_TIMING_FIXTURE,
  P1V11B_ENGAGEMENT_FIXTURE,
  P1V11C_ENEMY_ARCHETYPE_FIXTURE,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  PLAYER_SPAWN_X,
  ENEMY_MIN_X,
  ENEMY_MOVE_SPEED,
  ENEMY_ATTACK_RANGE,
  COMBAT_DISTANCE_EPSILON,
} from '../BattleConfig';
import { ambushActivationLimit } from '../../run/StarProfile';
import { BattleTargetingSystem } from '../systems/BattleTargetingSystem';
import { BattleMovementSystem } from '../systems/BattleMovementSystem';
import { SignatureCombatDispatcher } from '../signatures/SignatureCombatDispatcher';

export class TimelineCombatResolver {
  static resolveTimelinePlayerUnits(ctx: CombatResolverContext, deltaSeconds: number): void {
    const attackers = ctx.state.units
      .filter((unit) => unit.currentHp > 0)
      .sort((a, b) => b.positionX - a.positionX || a.positionLane - b.positionLane);

    for (const unit of attackers) {
      ctx.expireShield(unit);
      if (ctx.state.enemies.every((enemy) => enemy.currentHp <= 0)) {
        unit.actionState = 'Idle';
        unit.movementPolicyState = 'Idle';
        continue;
      }

      const profile = movementProfile[unit.role];

      // 1. Target retention or acquisition
      let target: EnemyCombatUnit | undefined;

      if (ctx.combatRules.roleIdentity) {
        if (unit.role === 'Tanker') {
          target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.positionLane, ['Front', 'Mid', 'Back']);
          unit.targetEnemyId = target?.enemyId;
        } else if (unit.role === 'Assassin') {
          target = BattleTargetingSystem.nearestEnemyByRowPriority(ctx.state.enemies, unit.positionLane, ['Back', 'Mid', 'Front']);
          unit.targetEnemyId = target?.enemyId;
          if (
            unit.signatureId === 'AmbushStrike' &&
            target &&
            target.row !== 'Front' &&
            unit.ambushTargetId !== target.enemyId &&
            (unit.signatureActivationCount ?? 0) < ambushActivationLimit(unit.star)
          ) {
            unit.ambushTargetId = target.enemyId;
            unit.ambushReady = true;
            ctx.signatureEvents.push({ type: 'SignatureReady', unitId: unit.unitId, signatureId: 'AmbushStrike', targetId: target.enemyId, time: ctx.state.elapsedTime ?? 0 });
          }
        } else {
          // Ranger or Mage:
          if (unit.targetEnemyId) {
            target = ctx.state.enemies.find((e) => e.enemyId === unit.targetEnemyId && e.currentHp > 0);
            if (target) {
              const currentDist = BattleMovementSystem.distance(
                unit.positionX,
                unit.positionLane,
                target.positionX,
                target.positionLane,
              );
              // If current target is outside attack range, check if another enemy is in range
              if (currentDist > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
                const inRangeEnemy = BattleTargetingSystem.findBestEnemyInRange(
                  unit,
                  ctx.state.enemies,
                  profile.attackRange,
                  BattleMovementSystem.distance,
                );
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
            const inRangeEnemy = BattleTargetingSystem.findBestEnemyInRange(
              unit,
              ctx.state.enemies,
              profile.attackRange,
              BattleMovementSystem.distance,
            );
            if (inRangeEnemy) {
              target = inRangeEnemy;
              unit.targetEnemyId = target.enemyId;
            } else {
              target = BattleTargetingSystem.findBestRangedAdvanceTarget(
                unit,
                ctx.state.enemies,
                BattleMovementSystem.distance,
              );
              if (target) {
                unit.targetEnemyId = target.enemyId;
              }
            }
          }
        }
      } else {
        if (unit.targetEnemyId) {
          target = ctx.state.enemies.find((e) => e.enemyId === unit.targetEnemyId && e.currentHp > 0);
          if (!target) {
            unit.targetEnemyId = undefined;
          }
        }
        if (!unit.targetEnemyId) {
          target = BattleTargetingSystem.acquirePlayerTarget(unit, ctx.state.enemies);
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

      SignatureCombatDispatcher.updateFocusProgress(
        {
          state: ctx.state,
          combatRules: ctx.combatRules,
          consequenceMetrics: ctx.consequenceMetrics,
          signatureMetrics: ctx.signatureMetrics,
          signatureEvents: ctx.signatureEvents,
          distance: BattleMovementSystem.distance,
          applyDamage: (e, d) => ctx.applyDamage(e, d),
          recordAction: (u, k, h) => ctx.recordAction(u, k, h),
          activateSignature: (u, t) => ctx.activateSignature(u, t),
        },
        unit,
        target,
        deltaSeconds,
      );

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
        if (ctx.combatRules.roleIdentity && (unit.role === 'Mage' || unit.role === 'Ranger')) {
          unit.movementPolicyState = 'Hold';
        }
        unit.attackWindupRemaining = (unit.attackWindupRemaining ?? 0) - deltaSeconds;
        if (unit.attackWindupRemaining <= COMBAT_DISTANCE_EPSILON) {
          SignatureCombatDispatcher.resolvePlayerDamage(
            {
              state: ctx.state,
              combatRules: ctx.combatRules,
              consequenceMetrics: ctx.consequenceMetrics,
              signatureMetrics: ctx.signatureMetrics,
              signatureEvents: ctx.signatureEvents,
              distance: BattleMovementSystem.distance,
              applyDamage: (e, d) => ctx.applyDamage(e, d),
              recordAction: (u, k, h) => ctx.recordAction(u, k, h),
              activateSignature: (u, t) => ctx.activateSignature(u, t),
            },
            unit,
            target,
          );
          const timing = P1V11A_ACTION_TIMING_FIXTURE[unit.role];
          unit.actionState = 'Recovering';
          unit.attackWindupRemaining = 0;
          unit.recoveryRemaining = Math.max(0, timing.attackInterval - timing.windup);
          unit.attackCooldownRemaining = unit.recoveryRemaining;
        }
        continue;
      }

      // 4. Movement / windup initiation
      const distance = BattleMovementSystem.distance(
        unit.positionX,
        unit.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (!ctx.combatRules.roleIdentity) {
        if (unit.role === 'Tanker' || unit.role === 'Assassin') {
          if (distance > profile.attackRange + COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Moving';
            BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
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
            BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange - 0.15);
          } else if (distance < profile.minRange - COMBAT_DISTANCE_EPSILON) {
            unit.actionState = 'Moving';
            BattleMovementSystem.retreatPlayerUnit(unit, profile.speed * deltaSeconds);
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
          BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
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
          BattleMovementSystem.moveTowardPlayerUnit(unit, target, profile.speed * deltaSeconds, profile.attackRange);
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
        this.resolveRangedMovementAndAction(ctx, unit, target, profile, deltaSeconds);
      }
    }
  }

  static resolveRangedMovementAndAction(
    ctx: CombatResolverContext,
    unit: CombatUnit,
    target: EnemyCombatUnit,
    profile: RoleMovementConfig,
    deltaSeconds: number,
  ): void {
    // 1. Check danger zone (closest living enemy threat)
    let closestEnemyDist = 999;
    for (const enemy of ctx.state.enemies) {
      if (enemy.currentHp <= 0) continue;
      const d = BattleMovementSystem.distance(unit.positionX, unit.positionLane, enemy.positionX, enemy.positionLane);
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
      if (unit.signatureId === 'FocusShot') { unit.continuousHoldTime = 0; unit.focusReady = false; }
      if (!wasKiting) {
        if (unit.role === 'Ranger') {
          ctx.consequenceMetrics.rangerForcedKiteCount += 1;
        } else if (unit.role === 'Mage') {
          ctx.consequenceMetrics.mageForcedRepositionCount += 1;
        }
      }
      unit.actionState = 'Moving';
      unit.movementPolicyState = 'Kite';
      const retreated = BattleMovementSystem.retreatPlayerUnit(unit, profile.speed * deltaSeconds);
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
    const distanceToTarget = BattleMovementSystem.distance(
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
    const livingTanks = ctx.state.units.filter(
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
    if (unit.signatureId === 'FocusShot') { unit.continuousHoldTime = 0; unit.focusReady = false; }
    BattleMovementSystem.moveTowardPlayerUnit(
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

  static resolveTimelineEnemies(ctx: CombatResolverContext, deltaSeconds: number): void {
    const now = ctx.state.elapsedTime ?? 0;
    for (const bomb of ctx.state.enemies.filter(enemy => enemy.bombAt !== undefined && enemy.bombAt <= now)) {
      const source = ctx.state.units.find(unit => unit.unitId === bomb.bombSourceId);
      const victims = ctx.state.enemies.filter(enemy => enemy.currentHp > 0 &&
        BattleMovementSystem.distance(enemy.positionX, enemy.positionLane, bomb.positionX, bomb.positionLane) <= 1.5)
        .sort((a, b) => BattleMovementSystem.distance(a.positionX, a.positionLane, bomb.positionX, bomb.positionLane) - BattleMovementSystem.distance(b.positionX, b.positionLane, bomb.positionX, bomb.positionLane) || a.enemyId.localeCompare(b.enemyId))
        .slice(0, bomb.bombTargets ?? 1);
      const hits = victims.map(enemy => ({ enemyId: enemy.enemyId, damage: ctx.applyDamage(enemy, bomb.bombDamage ?? 0) }));
      if (source && hits.length) { ctx.activateSignature(source, bomb.enemyId); ctx.recordAction(source, 'ArcaneBurst', hits); }
      bomb.bombAt = undefined;
    }
    const livingEnemies = ctx.state.enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort((a, b) => a.positionX - b.positionX || a.positionLane - b.positionLane);

    const currentTime = ctx.state.elapsedTime ?? (ctx.state.elapsedTicks * deltaSeconds);

    for (const enemy of livingEnemies) {
      if ((enemy.funControlUntil ?? 0) > currentTime) {
        enemy.attackWindupRemaining = 0;
        enemy.actionState = 'Idle';
        if (enemy.funControlKind === 'Carrot') {
          const dx = (enemy.carrotX ?? enemy.positionX) - enemy.positionX;
          const dy = (enemy.carrotLane ?? enemy.positionLane) - enemy.positionLane;
          const length = Math.hypot(dx, dy);
          const step = Math.min(length, ENEMY_MOVE_SPEED * deltaSeconds);
          if (length > .01) {
            enemy.positionX += dx / length * step;
            enemy.positionLane += dy / length * step;
          }
        }
        continue;
      }
      enemy.funControlKind = undefined;

      if (!ctx.state.units.some((u) => u.currentHp > 0)) {
        enemy.actionState = 'Idle';
        continue;
      }

      // Check existing engagement validity
      if (ctx.combatRules.engagement && enemy.engagedTargetId) {
        const engagedTank = ctx.state.units.find(
          (u) => u.unitId === enemy.engagedTargetId && u.currentHp > 0 && u.role === 'Tanker',
        );
        if (!engagedTank) {
          ctx.engagementEvents.push({ type: 'EngagementEnded', enemyId: enemy.enemyId, tankId: enemy.engagedTargetId, time: currentTime });
          enemy.engagedTargetId = undefined;
          enemy.targetUnitId = undefined;
        } else {
          const dist = BattleMovementSystem.distance(
            enemy.positionX,
            enemy.positionLane,
            engagedTank.positionX,
            engagedTank.positionLane,
          );
          const disengageLimit =
            P1V11B_ENGAGEMENT_FIXTURE.tankGuardRadius + P1V11B_ENGAGEMENT_FIXTURE.disengagePadding;
          if (dist > disengageLimit) {
            ctx.engagementEvents.push({ type: 'EngagementEnded', enemyId: enemy.enemyId, tankId: engagedTank.unitId, time: currentTime });
            enemy.engagedTargetId = undefined;
            engagedTank.engagedById = undefined;
            enemy.targetUnitId = undefined;
          } else {
            enemy.targetUnitId = engagedTank.unitId;
            engagedTank.engagedById = enemy.enemyId;
            ctx.consequenceMetrics.timeEngaged[engagedTank.unitId] =
              (ctx.consequenceMetrics.timeEngaged[engagedTank.unitId] ?? 0) + deltaSeconds;
          }
        }
      }

      // 1. Target retention or acquisition
      let target: CombatUnit | undefined;
      if (enemy.targetUnitId) {
        target = ctx.state.units.find((u) => u.unitId === enemy.targetUnitId && u.currentHp > 0);
        if (!target) {
          enemy.targetUnitId = undefined;
        }
      }
      if (!enemy.targetUnitId) {
        if (ctx.combatRules.archetypes) {
          if (enemy.archetype === 'Diver') {
            target = BattleTargetingSystem.acquireDiverTarget(enemy, ctx.state.units);
          } else if (enemy.archetype === 'Ranged') {
            target = BattleTargetingSystem.acquireRangedEnemyTarget(
              enemy,
              ctx.state.units,
              BattleMovementSystem.distance,
            );
          } else {
            target = BattleTargetingSystem.acquireEnemyTarget(
              enemy,
              ctx.state.units,
              ctx.combatRules,
              BattleMovementSystem.distance,
            );
          }
        } else {
          target = BattleTargetingSystem.acquireEnemyTarget(
            enemy,
            ctx.state.units,
            ctx.combatRules,
            BattleMovementSystem.distance,
          );
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
      if (ctx.combatRules.engagement && !enemy.engagedTargetId) {
        const interceptor =
          ctx.combatRules.archetypes && enemy.archetype === 'Diver'
            ? BattleTargetingSystem.findDiverTankInterceptor(
                enemy,
                target,
                ctx.state.units,
                BattleMovementSystem.distance,
              )
            : BattleTargetingSystem.findTankInterceptor(
                enemy,
                target,
                ctx.state.units,
                BattleMovementSystem.distance,
              );

        if (interceptor) {
          enemy.engagedTargetId = interceptor.unitId;
          interceptor.engagedById = enemy.enemyId;
          enemy.targetUnitId = interceptor.unitId;
          target = interceptor;
          ctx.consequenceMetrics.interceptCount += 1;
          if (enemy.archetype === 'Diver') {
            ctx.consequenceMetrics.diverInterceptionCount += 1;
          } else {
            ctx.consequenceMetrics.frontlineInterceptionCount += 1;
          }
          ctx.engagementEvents.push({ type: 'EngagementStarted', enemyId: enemy.enemyId, tankId: interceptor.unitId, time: currentTime });
          SignatureCombatDispatcher.activateGuardianBrace(
            {
              state: ctx.state,
              combatRules: ctx.combatRules,
              consequenceMetrics: ctx.consequenceMetrics,
              signatureMetrics: ctx.signatureMetrics,
              signatureEvents: ctx.signatureEvents,
              distance: BattleMovementSystem.distance,
              applyDamage: (e, d) => ctx.applyDamage(e, d),
              recordAction: (u, k, h) => ctx.recordAction(u, k, h),
              activateSignature: (u, t) => ctx.activateSignature(u, t),
            },
            interceptor,
            enemy.enemyId,
          );
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
        if (ctx.combatRules.archetypes && enemy.archetype === 'Ranged') {
          enemy.movementPolicyState = 'Hold';
        }
        enemy.attackWindupRemaining = (enemy.attackWindupRemaining ?? 0) - deltaSeconds;
        if (enemy.attackWindupRemaining <= COMBAT_DISTANCE_EPSILON) {
          const appliedDamage = ctx.applyDamageToUnit(target, enemy.damage);

          if (ctx.consequenceMetrics.firstPlayerContactTime === undefined) {
            ctx.consequenceMetrics.firstPlayerContactTime = currentTime;
          }

          ctx.consequenceMetrics.damageTakenByUnit[target.unitId] =
            (ctx.consequenceMetrics.damageTakenByUnit[target.unitId] ?? 0) + appliedDamage;

          if (
            (target.role === 'Ranger' || target.role === 'Mage') &&
            ctx.consequenceMetrics.firstBacklineHitTime === undefined
          ) {
            ctx.consequenceMetrics.firstBacklineHitTime = currentTime;
            ctx.consequenceMetrics.firstCarryHitTime = currentTime;
          }

          if (target.currentHp <= 0) {
            if (ctx.consequenceMetrics.unitDeathTimes[target.unitId] === undefined) {
              ctx.consequenceMetrics.unitDeathTimes[target.unitId] = currentTime;
            }
            target.actionState = 'Dead';
            if (enemy.engagedTargetId === target.unitId) {
              ctx.engagementEvents.push({ type: 'EngagementEnded', enemyId: enemy.enemyId, tankId: target.unitId, time: currentTime });
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
      const distance = BattleMovementSystem.distance(
        enemy.positionX,
        enemy.positionLane,
        target.positionX,
        target.positionLane,
      );

      if (!ctx.combatRules.archetypes) {
        const attackRange = ENEMY_ATTACK_RANGE;
        if (distance > attackRange + COMBAT_DISTANCE_EPSILON) {
          enemy.actionState = 'Moving';
          BattleMovementSystem.moveTowardEnemy(enemy, target, ENEMY_MOVE_SPEED * deltaSeconds, attackRange);
          if (ctx.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
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
          BattleMovementSystem.moveTowardEnemy(enemy, target, profile.speed * deltaSeconds, attackRange);
          if (ctx.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
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
          BattleMovementSystem.moveTowardEnemy(enemy, target, profile.speed * deltaSeconds, attackRange);
          if (ctx.combatRules.engagement && enemy.engagedTargetId === target.unitId) {
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
        this.resolveRangedEnemyMovementAndAction(ctx, enemy, target, profile, deltaSeconds);
      }
    }
  }

  static resolveRangedEnemyMovementAndAction(
    ctx: CombatResolverContext,
    enemy: EnemyCombatUnit,
    target: CombatUnit,
    profile: EnemyArchetypeProfile,
    deltaSeconds: number,
  ): void {
    let closestPlayerDist = 999;
    for (const playerUnit of ctx.state.units) {
      if (playerUnit.currentHp <= 0) continue;
      const d = BattleMovementSystem.distance(enemy.positionX, enemy.positionLane, playerUnit.positionX, playerUnit.positionLane);
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
      const retreated = BattleMovementSystem.retreatEnemy(enemy, profile.speed * deltaSeconds);
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

    const distanceToTarget = BattleMovementSystem.distance(
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

    const livingFrontliners = ctx.state.enemies.filter(
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
    BattleMovementSystem.moveTowardEnemy(
      enemy,
      target,
      profile.speed * deltaSeconds,
      profile.attackRange - 0.20,
    );

    if (enemy.positionX < minSafeX) {
      enemy.positionX = minSafeX;
    }
  }
}

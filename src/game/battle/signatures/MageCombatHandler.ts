import type { CombatUnit, EnemyCombatUnit, PlayerCombatHit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import {
  arcaneBloomEchoRatio,
  arcaneBloomRadiusForStar,
  arcaneBloomSecondaryLimitForStar,
  signatureStrengthForStar,
} from '../../run/StarProfile';

export class MageCombatHandler {
  static resolveAttack(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): void {
    const hits: PlayerCombatHit[] = [];
    const appliedPrimary = ctx.applyDamage(target, unit.damage);
    if (appliedPrimary > 0) hits.push({ enemyId: target.enemyId, damage: appliedPrimary });

    const bloomRadius = arcaneBloomRadiusForStar(unit.star);
    const nearbyCount = ctx.state.enemies.filter(
      (enemy) =>
        enemy.currentHp > 0 &&
        ctx.distance(enemy.positionX, enemy.positionLane, target.positionX, target.positionLane) <= bloomRadius,
    ).length;
    const bloom = unit.signatureId === 'ArcaneBloom' && nearbyCount >= 2;

    const secondaryTargets = ctx.state.enemies
      .filter(
        (enemy) =>
          enemy.currentHp > 0 &&
          enemy.enemyId !== target.enemyId &&
          (bloom
            ? ctx.distance(enemy.positionX, enemy.positionLane, target.positionX, target.positionLane) <= bloomRadius
            : !ctx.combatRules.signatures && Math.abs(enemy.positionLane - target.positionLane) <= 1.05),
      )
      .sort(
        (a, b) =>
          ctx.distance(a.positionX, a.positionLane, target.positionX, target.positionLane) -
            ctx.distance(b.positionX, b.positionLane, target.positionX, target.positionLane) ||
          a.enemyId.localeCompare(b.enemyId),
      );

    for (const enemy of bloom
      ? secondaryTargets.slice(0, arcaneBloomSecondaryLimitForStar(unit.star))
      : secondaryTargets) {
      const applied = ctx.applyDamage(
        enemy,
        unit.damage * (bloom ? signatureStrengthForStar('ArcaneBloom', unit.star) : 0.5),
      );
      if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
    }

    if (bloom) {
      if (unit.star >= 2 && !unit.signatureActivationCount) {
        ctx.state.enemies
          .filter(
            (enemy) =>
              enemy.currentHp > 0 &&
              ctx.distance(enemy.positionX, enemy.positionLane, target.positionX, target.positionLane) <= bloomRadius,
          )
          .slice(0, unit.star === 3 ? 3 : 1)
          .forEach((enemy) => {
            enemy.funControlKind = 'Duck';
            enemy.funControlStar = unit.star as 2 | 3;
            enemy.funControlUntil = (ctx.state.elapsedTime ?? 0) + (unit.star === 3 ? 1.5 : 1);
          });
      }
      ctx.activateSignature(unit, target.enemyId);
      ctx.signatureMetrics.arcaneBloomTargetsHit += Math.max(0, hits.length - 1);

      const echoRatio = arcaneBloomEchoRatio(unit.star);
      if (echoRatio > 0) {
        const echoTarget = ctx.state.enemies
          .filter((enemy) => enemy.currentHp > 0)
          .sort((a, b) => a.currentHp - b.currentHp || a.enemyId.localeCompare(b.enemyId))[0];
        if (echoTarget) {
          const echoDamage = ctx.applyDamage(echoTarget, unit.damage * echoRatio);
          if (echoDamage > 0) hits.push({ enemyId: echoTarget.enemyId, damage: echoDamage });
        }
      }
    }

    if (hits.length) ctx.recordAction(unit, 'ArcaneBurst', hits);
  }
}

import type { CombatUnit, EnemyCombatUnit, PlayerCombatHit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import {skillValue} from '../../config/CharacterProjects';
import {
  focusPierceRatio,
  focusPierceTargets,
  signatureStrengthForStar,
  twinVolleyAttackThreshold,
  twinVolleySecondaryTargets,
} from '../../run/StarProfile';

export class RangerCombatHandler {
  static resolveAttack(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): void {
    if (unit.signatureId === 'TwinVolley') {
      const hits: PlayerCombatHit[] = [];
      const primary = ctx.applyDamage(target, unit.damage);
      if (primary > 0) hits.push({ enemyId: target.enemyId, damage: primary });

      unit.volleyAttackCount = (unit.volleyAttackCount ?? 0) + 1;
      const volley = unit.volleyAttackCount >= twinVolleyAttackThreshold(unit.star);
      if (volley) {
        unit.volleyAttackCount = 0;
        const secondary = ctx.state.enemies
          .filter((enemy) => enemy.currentHp > 0 && enemy.enemyId !== target.enemyId)
          .sort(
            (a, b) =>
              ctx.distance(unit.positionX, unit.positionLane, a.positionX, a.positionLane) -
                ctx.distance(unit.positionX, unit.positionLane, b.positionX, b.positionLane) ||
              a.enemyId.localeCompare(b.enemyId),
          )
          .slice(0, twinVolleySecondaryTargets(unit.star));
        for (const enemy of secondary) {
          const applied = ctx.applyDamage(
            enemy,
            unit.damage * signatureStrengthForStar('TwinVolley', unit.star),
          );
          if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
        }
        ctx.activateSignature(unit, target.enemyId);
      }
      if (hits.length) ctx.recordAction(unit, volley ? 'Volley' : 'Snipe', hits);
    } else {
      const focus = unit.signatureId === 'FocusShot' && unit.focusReady;
      const hits: PlayerCombatHit[] = [];
      const damage = ctx.applyDamage(
        target,
        unit.damage * (focus ? signatureStrengthForStar('FocusShot', unit.star) : 1),
      );
      if (damage > 0) hits.push({ enemyId: target.enemyId, damage });

      if (focus) {
        if (unit.star >= 2 && !unit.signatureActivationCount && target.currentHp > 0) {
          target.funControlKind = 'Carrot';
          target.funControlStar = unit.star as 2 | 3;
          target.funControlUntil = (ctx.state.elapsedTime ?? 0) + skillValue('FocusShot',unit.star,'carrotDuration');
          target.carrotX = unit.positionX + 0.7;
          target.carrotLane = unit.positionLane;
        }
        const pierceCount = focusPierceTargets(unit.star);
        if (pierceCount > 0) {
          const secondary = ctx.state.enemies
            .filter((enemy) => enemy.currentHp > 0 && enemy.enemyId !== target.enemyId)
            .sort(
              (a, b) =>
                ctx.distance(unit.positionX, unit.positionLane, a.positionX, a.positionLane) -
                  ctx.distance(unit.positionX, unit.positionLane, b.positionX, b.positionLane) ||
                a.enemyId.localeCompare(b.enemyId),
            )
            .slice(0, pierceCount);
          for (const enemy of secondary) {
            const applied = ctx.applyDamage(enemy, unit.damage * focusPierceRatio(unit.star));
            if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
          }
        }
        ctx.activateSignature(unit, target.enemyId);
        unit.focusReady = false;
        unit.continuousHoldTime = 0;
        ctx.signatureMetrics.focusShotsResolved += 1;
      }

      if (hits.length) ctx.recordAction(unit, 'Snipe', hits);
    }
  }
}

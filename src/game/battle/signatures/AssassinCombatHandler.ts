import type { CombatUnit, EnemyCombatUnit, PlayerCombatHit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import {
  ambushActivationLimit,
  ambushChainRatio,
  signatureStrengthForStar,
} from '../../run/StarProfile';
import { rowOrder } from '../BattleConfig';

export class AssassinCombatHandler {
  static resolveAttack(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): void {
    if (ctx.consequenceMetrics.firstAssassinContactTime === undefined) {
      ctx.consequenceMetrics.firstAssassinContactTime = ctx.state.elapsedTime ?? 0;
    }
    const ambush =
      unit.signatureId === 'AmbushStrike' &&
      unit.ambushReady &&
      unit.ambushTargetId === target.enemyId &&
      (unit.signatureActivationCount ?? 0) < ambushActivationLimit(unit.star);

    const hits: PlayerCombatHit[] = [];
    const damage = ctx.applyDamage(
      target,
      unit.damage * (ambush ? signatureStrengthForStar('AmbushStrike', unit.star) : 1),
    );
    if (damage > 0) hits.push({ enemyId: target.enemyId, damage });

    if (ambush) {
      ctx.activateSignature(unit, target.enemyId);
      unit.ambushReady = false;
      ctx.signatureMetrics.ambushStrikesResolved += 1;

      // 3★ Shadowclaw converts an Ambush kill into one deterministic follow-up strike.
      if (target.currentHp <= 0 && ambushChainRatio(unit.star) > 0) {
        const chainTarget = ctx.state.enemies
          .filter((enemy) => enemy.currentHp > 0 && enemy.enemyId !== target.enemyId)
          .sort(
            (a, b) =>
              rowOrder[b.row] - rowOrder[a.row] ||
              a.currentHp - b.currentHp ||
              a.enemyId.localeCompare(b.enemyId),
          )[0];
        if (chainTarget) {
          const chained = ctx.applyDamage(chainTarget, unit.damage * ambushChainRatio(unit.star));
          if (chained > 0) hits.push({ enemyId: chainTarget.enemyId, damage: chained });
        }
      }
    }

    if (hits.length) ctx.recordAction(unit, 'Dive', hits);
  }
}

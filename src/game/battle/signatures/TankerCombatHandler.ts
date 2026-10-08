import type { CombatUnit, EnemyCombatUnit, PlayerCombatHit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import {
  ironRamCleaveRatio,
  ironRamCleaveTargets,
  ironRamKnockbackForStar,
  ironRamStaggerForStar,
  signatureStrengthForStar,
} from '../../run/StarProfile';
import { ENEMY_MIN_X, ENEMY_MAX_X } from '../BattleConfig';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class TankerCombatHandler {
  static resolveAttack(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): void {
    const ram = unit.signatureId === 'IronRam' && unit.ramReady && target.currentHp > 0;
    const hits: PlayerCombatHit[] = [];
    const damage = ctx.applyDamage(
      target,
      unit.damage * (ram ? signatureStrengthForStar('IronRam', unit.star) : 1),
    );
    if (damage > 0) hits.push({ enemyId: target.enemyId, damage });

    if (ram) {
      unit.ramReady = false;
      target.positionX = clamp(
        target.positionX + ironRamKnockbackForStar(unit.star),
        ENEMY_MIN_X,
        ENEMY_MAX_X,
      );
      const stagger = ironRamStaggerForStar(unit.star);
      if (stagger > 0) {
        target.attackCooldownRemaining = Math.max(target.attackCooldownRemaining ?? 0, stagger);
        target.recoveryRemaining = Math.max(target.recoveryRemaining ?? 0, stagger);
      }

      const cleaveTargets = ironRamCleaveTargets(unit.star);
      if (cleaveTargets > 0) {
        const secondary = ctx.state.enemies
          .filter((enemy) => enemy.currentHp > 0 && enemy.enemyId !== target.enemyId)
          .sort(
            (a, b) =>
              ctx.distance(a.positionX, a.positionLane, target.positionX, target.positionLane) -
                ctx.distance(b.positionX, b.positionLane, target.positionX, target.positionLane) ||
              a.enemyId.localeCompare(b.enemyId),
          )
          .slice(0, cleaveTargets);
        for (const enemy of secondary) {
          const applied = ctx.applyDamage(enemy, unit.damage * ironRamCleaveRatio(unit.star));
          if (applied > 0) hits.push({ enemyId: enemy.enemyId, damage: applied });
        }
      }

      ctx.activateSignature(unit, target.enemyId);
    }

    if (hits.length) ctx.recordAction(unit, ram ? 'Ram' : 'GuardStrike', hits);
  }
}

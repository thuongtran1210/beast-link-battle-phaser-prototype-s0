import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import { signatureStrengthForStar } from '../../run/StarProfile';

export class SupportAbilityHandler {
  static tryTrigger(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): boolean {
    if (unit.signatureId === 'BubbleTrap' || unit.signatureId === 'ToyWorkshop' || unit.signatureId === 'TickingBomb') {
      const now = ctx.state.elapsedTime ?? 0;
      if (now < (unit.supportReadyAt ?? 0)) return true;
      if (unit.signatureId === 'BubbleTrap') {
        const victims = ctx.state.enemies
          .filter((enemy) => enemy.currentHp > 0 && (enemy.funControlUntil ?? 0) <= now)
          .sort(
            (a, b) =>
              ctx.distance(unit.positionX, unit.positionLane, a.positionX, a.positionLane) -
                ctx.distance(unit.positionX, unit.positionLane, b.positionX, b.positionLane) ||
              a.enemyId.localeCompare(b.enemyId),
          )
          .slice(0, unit.star === 3 ? 2 : 1);
        if (!victims.length) return true;
        victims.forEach((enemy) => {
          enemy.funControlKind = 'Bubble';
          enemy.funControlUntil = now + (unit.star === 1 ? 0.8 : 1.2);
        });
        ctx.activateSignature(unit, victims[0].enemyId);
      } else if (unit.signatureId === 'ToyWorkshop') {
        const allies = ctx.state.units
          .filter((ally) => ally.currentHp > 0 && (ally.temporaryShieldHp ?? 0) < 5)
          .sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp || a.unitId.localeCompare(b.unitId))
          .slice(0, unit.star === 3 ? 2 : 1);
        if (!allies.length) return true;
        allies.forEach((ally) => {
          ally.temporaryShieldHp = unit.star === 1 ? 20 : unit.star === 2 ? 32 : 44;
          ally.temporaryShieldExpiresAt = now + 3;
          ally.temporaryShieldSourceSignatureId = 'ToyWorkshop';
        });
        unit.supportTargetIds = allies.map((ally) => ally.unitId);
        unit.supportFxUntil = now + 1.2;
        ctx.activateSignature(unit, allies[0].unitId);
      } else {
        if (target.bombAt !== undefined) return true;
        target.bombAt = now + 1.2;
        target.bombSourceId = unit.unitId;
        target.bombDamage = unit.damage * 1.5;
        target.bombTargets = unit.star;
      }
      unit.supportReadyAt = now + 5;
      return true;
    }

    if (unit.signatureId === 'WoollyRescue') {
      const now = ctx.state.elapsedTime ?? 0;
      if (now >= (unit.supportReadyAt ?? 0)) {
        const allies = ctx.state.units
          .filter((ally) => ally.currentHp > 0 && ally.currentHp < ally.maxHp)
          .sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp || a.unitId.localeCompare(b.unitId))
          .slice(0, unit.star === 3 ? 2 : 1);
        if (allies.length) {
          allies.forEach((ally) => {
            ally.currentHp = Math.min(ally.maxHp, ally.currentHp + signatureStrengthForStar('WoollyRescue', unit.star));
            if (unit.star === 3) {
              ally.temporaryShieldHp = Math.max(ally.temporaryShieldHp ?? 0, 18);
              ally.temporaryShieldExpiresAt = now + 2;
              ally.temporaryShieldSourceSignatureId = 'WoollyRescue';
            }
          });
          unit.supportTargetIds = allies.map((ally) => ally.unitId);
          unit.supportFxUntil = now + 1.2;
          unit.supportReadyAt = now + (unit.star === 1 ? 4 : 3);
          ctx.activateSignature(unit, allies[0].unitId);
        }
      }
      return true;
    }

    return false;
  }
}

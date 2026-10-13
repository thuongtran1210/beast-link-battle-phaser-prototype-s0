import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import { signatureStrengthForStar } from '../../run/StarProfile';
import {skillValue} from '../../config/CharacterProjects';

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
          .slice(0, skillValue('BubbleTrap',unit.star,'targets'));
        if (!victims.length) return true;
        victims.forEach((enemy) => {
          enemy.funControlKind = 'Bubble';
          enemy.funControlUntil = now + skillValue('BubbleTrap',unit.star,'duration');
        });
        ctx.activateSignature(unit, victims[0].enemyId);
      } else if (unit.signatureId === 'ToyWorkshop') {
        const allies = ctx.state.units
          .filter((ally) => ally.currentHp > 0 && (ally.temporaryShieldHp ?? 0) < 5)
          .sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp || a.unitId.localeCompare(b.unitId))
          .slice(0, skillValue('ToyWorkshop',unit.star,'targets'));
        if (!allies.length) return true;
        allies.forEach((ally) => {
          ally.temporaryShieldHp = skillValue('ToyWorkshop',unit.star,'shield');
          ally.temporaryShieldExpiresAt = now + skillValue('ToyWorkshop',unit.star,'duration');
          ally.temporaryShieldSourceSignatureId = 'ToyWorkshop';
        });
        unit.supportTargetIds = allies.map((ally) => ally.unitId);
        unit.supportFxUntil = now + 1.2;
        ctx.activateSignature(unit, allies[0].unitId);
      } else {
        if (target.bombAt !== undefined) return true;
        target.bombAt = now + skillValue('TickingBomb',unit.star,'fuse');
        target.bombSourceId = unit.unitId;
        target.bombDamage = unit.damage * skillValue('TickingBomb',unit.star,'strength');
        target.bombTargets = skillValue('TickingBomb',unit.star,'targets');
      }
      unit.supportReadyAt = now + skillValue(unit.signatureId,unit.star,'cooldown');
      return true;
    }

    if (unit.signatureId === 'WoollyRescue') {
      const now = ctx.state.elapsedTime ?? 0;
      if (now >= (unit.supportReadyAt ?? 0)) {
        const allies = ctx.state.units
          .filter((ally) => ally.currentHp > 0 && ally.currentHp < ally.maxHp)
          .sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp || a.unitId.localeCompare(b.unitId))
          .slice(0, skillValue('WoollyRescue',unit.star,'targets'));
        if (allies.length) {
          allies.forEach((ally) => {
            ally.currentHp = Math.min(ally.maxHp, ally.currentHp + signatureStrengthForStar('WoollyRescue', unit.star));
            if (skillValue('WoollyRescue',unit.star,'shield')>0) {
              ally.temporaryShieldHp = Math.max(ally.temporaryShieldHp ?? 0, skillValue('WoollyRescue',unit.star,'shield'));
              ally.temporaryShieldExpiresAt = now + skillValue('WoollyRescue',unit.star,'shieldDuration');
              ally.temporaryShieldSourceSignatureId = 'WoollyRescue';
            }
          });
          unit.supportTargetIds = allies.map((ally) => ally.unitId);
          unit.supportFxUntil = now + 1.2;
          unit.supportReadyAt = now + skillValue('WoollyRescue',unit.star,'cooldown');
          ctx.activateSignature(unit, allies[0].unitId);
        }
      }
      return true;
    }

    return false;
  }
}

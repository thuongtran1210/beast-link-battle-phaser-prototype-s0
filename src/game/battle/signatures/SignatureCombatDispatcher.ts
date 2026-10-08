import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import { TankerCombatHandler } from './TankerCombatHandler';
import { AssassinCombatHandler } from './AssassinCombatHandler';
import { RangerCombatHandler } from './RangerCombatHandler';
import { MageCombatHandler } from './MageCombatHandler';
import { SupportAbilityHandler } from './SupportAbilityHandler';
import { GuardianBraceHandler } from './GuardianBraceHandler';
import { FocusShotHandler } from './FocusShotHandler';

export class SignatureCombatDispatcher {
  static resolvePlayerDamage(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit): void {
    if (target.currentHp <= 0) return;

    ctx.consequenceMetrics.attacksResolvedByUnit[unit.unitId] =
      (ctx.consequenceMetrics.attacksResolvedByUnit[unit.unitId] ?? 0) + 1;

    // Check support ability signatures first (BubbleTrap, ToyWorkshop, TickingBomb, WoollyRescue)
    if (SupportAbilityHandler.tryTrigger(ctx, unit, target)) {
      return;
    }

    const enemyHpBefore = target.currentHp;

    if (unit.role === 'Tanker') {
      TankerCombatHandler.resolveAttack(ctx, unit, target);
    } else if (unit.role === 'Assassin') {
      AssassinCombatHandler.resolveAttack(ctx, unit, target);
    } else if (unit.role === 'Ranger') {
      RangerCombatHandler.resolveAttack(ctx, unit, target);
    } else {
      MageCombatHandler.resolveAttack(ctx, unit, target);
    }

    if (target.currentHp <= 0) {
      target.actionState = 'Dead';
      unit.targetEnemyId = undefined;
    }
    const dealt = enemyHpBefore - target.currentHp;
    if (unit.signatureActivationCount) {
      ctx.signatureMetrics.signatureDamageByUnit[unit.unitId] =
        (ctx.signatureMetrics.signatureDamageByUnit[unit.unitId] ?? 0) + Math.max(0, dealt - unit.damage);
    }
  }

  static activateGuardianBrace(ctx: SignatureContext, unit: CombatUnit, targetId: string): void {
    GuardianBraceHandler.activate(ctx, unit, targetId);
  }

  static updateFocusProgress(ctx: SignatureContext, unit: CombatUnit, target: EnemyCombatUnit, deltaSeconds: number): void {
    FocusShotHandler.updateProgress(ctx, unit, target, deltaSeconds);
  }
}

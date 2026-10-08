import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import type { SignatureContext } from './SignatureContext';
import {
  guardianBraceActivationLimit,
  guardianBraceShareRatio,
  signatureStrengthForStar,
} from '../../run/StarProfile';
import { P1V13A_SIGNATURE_FIXTURE } from '../BattleConfig';

export class GuardianBraceHandler {
  static activate(ctx: SignatureContext, unit: CombatUnit, targetId: string): void {
    if (
      !ctx.combatRules.signatures ||
      unit.signatureId !== 'GuardianBrace' ||
      (unit.signatureActivationCount ?? 0) >= guardianBraceActivationLimit(unit.star)
    ) return;

    const shield = signatureStrengthForStar('GuardianBrace', unit.star);
    const expiresAt = (ctx.state.elapsedTime ?? 0) + P1V13A_SIGNATURE_FIXTURE.guardianBraceDuration;
    unit.temporaryShieldHp = Math.max(unit.temporaryShieldHp ?? 0, shield);
    unit.temporaryShieldExpiresAt = expiresAt;
    unit.temporaryShieldSourceSignatureId = 'GuardianBrace';
    ctx.activateSignature(unit, targetId);

    // 3★ Snowguard extends part of the Brace to the most pressured ally.
    const shareRatio = guardianBraceShareRatio(unit.star);
    if (shareRatio > 0) {
      const ally = ctx.state.units
        .filter((candidate) => candidate.currentHp > 0 && candidate.unitId !== unit.unitId)
        .sort(
          (a, b) =>
            a.currentHp / a.maxHp - b.currentHp / b.maxHp ||
            a.unitId.localeCompare(b.unitId),
        )[0];
      if (ally) {
        ally.temporaryShieldHp = Math.max(ally.temporaryShieldHp ?? 0, shield * shareRatio);
        ally.temporaryShieldExpiresAt = expiresAt;
        ally.temporaryShieldSourceSignatureId = 'GuardianBrace';
      }
    }
  }
}

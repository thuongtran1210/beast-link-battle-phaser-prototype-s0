import type { CombatUnit } from '../../battle/AutonomousBattleModel';
import { ambushActivationLimit, focusHoldThresholdForStar, guardianBraceActivationLimit, twinVolleyAttackThreshold } from '../../run/StarProfile';
import { skillValue } from '../../config/CharacterProjects';

export interface SkillReadiness { ratio: number; label: string; ready: boolean }
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Presentation only: conditional signatures must never look like timed cooldowns. */
export function battleSkillReadiness(unit: CombatUnit, now: number): SkillReadiness | undefined {
  if (!unit.signatureId || unit.currentHp <= 0) return undefined;
  const activations = unit.signatureActivationCount ?? 0;
  switch (unit.signatureId) {
    case 'FocusShot': {
      const ratio = unit.focusReady ? 1 : clamp((unit.continuousHoldTime ?? 0) / Math.max(.001, focusHoldThresholdForStar(unit.star)));
      return { ratio, ready: !!unit.focusReady, label: unit.focusReady ? 'SẴN SÀNG' : 'TẬP TRUNG' };
    }
    case 'TwinVolley': {
      const threshold = twinVolleyAttackThreshold(unit.star);
      const count = unit.volleyAttackCount ?? 0;
      return { ratio: clamp(count / threshold), ready: count >= threshold - 1, label: `${count}/${threshold} ĐÒN` };
    }
    case 'GuardianBrace': {
      const available = activations < guardianBraceActivationLimit(unit.star);
      return { ratio: available ? 1 : 0, ready: false, label: available ? 'CHỜ CHẶN' : 'ĐÃ DÙNG' };
    }
    case 'AmbushStrike': {
      const available = activations < ambushActivationLimit(unit.star);
      return { ratio: available && unit.ambushReady ? 1 : 0, ready: available && !!unit.ambushReady, label: !available ? 'ĐÃ DÙNG' : unit.ambushReady ? 'SẴN SÀNG' : 'CHỜ ÁP SÁT' };
    }
    case 'IronRam':
      return { ratio: unit.ramReady ? 1 : 0, ready: !!unit.ramReady, label: unit.ramReady ? 'ĐÒN HÚC KẾ' : 'ĐÃ DÙNG' };
    case 'ArcaneBloom':
      // This ability tests the surviving cluster after primary damage, at impact.
      return { ratio: 0, ready: false, label: 'CẦN CỤM ĐỊCH' };
    default: {
      const cooldown = skillValue(unit.signatureId, unit.star, 'cooldown');
      const remaining = Math.max(0, (unit.supportReadyAt ?? 0) - now);
      return { ratio: remaining === 0 ? 1 : clamp(1 - remaining / Math.max(.001, cooldown)), ready: remaining === 0, label: remaining > 0 ? `${remaining.toFixed(1)}s` : 'CHỜ MỤC TIÊU' };
    }
  }
}

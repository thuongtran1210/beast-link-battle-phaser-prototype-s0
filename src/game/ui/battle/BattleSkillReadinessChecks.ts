import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES } from '../../battle/AutonomousBattleModel';
import { BattleFormation } from '../../battle/BattleFormation';
import { focusHoldThresholdForStar, guardianBraceActivationLimit } from '../../run/StarProfile';
import { battleSkillReadiness } from './BattleSkillReadiness';

export function battleSkillReadinessChecks(): void {
  const expect = (ok: boolean, message: string) => { if (!ok) throw Error(`Skill HUD: ${message}`); };
  const formation = new BattleFormation([{ contentId: 'beast-c', star: 1 }]);
  formation.place('unit-1', 'back-3');
  const model = new AutonomousBattleModel(formation, [], P1V13A_SIGNATURE_RULES);
  const unit = model.snapshot.units[0];
  const before = JSON.stringify(unit);
  battleSkillReadiness(unit, 0);
  expect(JSON.stringify(unit) === before, 'reading HUD must not mutate authoritative state');
  const halfway = { ...unit, continuousHoldTime: focusHoldThresholdForStar(unit.star) / 2 };
  expect(battleSkillReadiness(halfway, 0)?.ratio === .5, 'Focus reflects actual hold progress');
  expect(battleSkillReadiness({ ...halfway, continuousHoldTime: 0 }, 0)?.ratio === 0, 'reset hold drops progress rather than continuing a local timer');
  expect(battleSkillReadiness({ ...unit, focusReady: true }, 0)?.ready === true, 'authoritative ready flag fills Focus');
  expect(!battleSkillReadiness({ ...unit, currentHp: 0 }, 0), 'KO hides skill HUD');
  const spent = { ...unit, signatureId: 'GuardianBrace' as const, signatureActivationCount: guardianBraceActivationLimit(unit.star) };
  expect(battleSkillReadiness(spent, 0)?.label === 'ĐÃ DÙNG', 'limited reaction skill is spent, not a fake cooldown');
  const support = { ...unit, signatureId: 'WoollyRescue' as const, supportReadyAt: 8 };
  expect(battleSkillReadiness(support, 7)!.ratio < battleSkillReadiness(support, 8)!.ratio, 'support follows snapshot clock');
  expect(battleSkillReadiness(support, 8)?.label === 'CHỜ MỤC TIÊU', 'expired cooldown still requires a valid target');
}

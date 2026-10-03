import { AutonomousBattleModel, P1V13A_SIGNATURE_FIXTURE, P1V13A_SIGNATURE_RULES, SIMULATION_STEP, type EnemyFixture } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { signatureForBeast } from './BeastRoles';
const expect = (value: boolean, message: string) => { if (!value) throw new Error(`P1-V13A check failed: ${message}`); };
const formation = (beasts: string[]) => { const f = new BattleFormation(beasts.map((contentId) => ({ contentId, star: 1 }))); beasts.forEach((beast, i) => f.place(`unit-${i + 1}`, `${beast === 'beast-a' || beast === 'beast-b' ? 'front' : 'back'}-${i + 3}`)); return f; };
const enemy = (enemyId: string, row: 'Front' | 'Mid' | 'Back', column: number, hp = 500): EnemyFixture => ({ enemyId, slotId: enemyId, row, column, maxHp: hp, damage: 12, archetype: 'Frontliner' });
export function runP1V13AChecks(): void {
  expect(signatureForBeast('beast-a') === 'GuardianBrace' && signatureForBeast('beast-b') === 'AmbushStrike', 'signature comes from beast definition');
  const tankBattle = new AutonomousBattleModel(formation(['beast-a']), [enemy('e', 'Front', 3)], P1V13A_SIGNATURE_RULES);
  expect(tankBattle.snapshot.units[0].temporaryShieldHp === 0, 'Brace is absent at battle start');
  for (let i = 0; i < 30; i++) tankBattle.step(SIMULATION_STEP);
  expect((tankBattle.snapshot.units[0].signatureActivationCount ?? 0) === 1, 'Brace activates exactly once on interception');
  const assassinBattle = new AutonomousBattleModel(formation(['beast-b']), [enemy('front', 'Front', 3), enemy('back', 'Back', 3)], P1V13A_SIGNATURE_RULES);
  for (let i = 0; i < 45; i++) assassinBattle.step(SIMULATION_STEP);
  expect((assassinBattle.snapshot.signatureMetrics?.ambushStrikesResolved ?? 0) === 1, 'Ambush resolves once for committed deep target');
  const rangerBattle = new AutonomousBattleModel(formation(['beast-c']), [enemy('far', 'Front', 3)], P1V13A_SIGNATURE_RULES);
  for (let i = 0; i < 45; i++) rangerBattle.step(SIMULATION_STEP);
  expect((rangerBattle.snapshot.signatureMetrics?.focusShotsResolved ?? 0) > 0, 'Safe Hold builds and consumes Focus');
  const mageBattle = new AutonomousBattleModel(formation(['beast-d']), [enemy('p', 'Front', 3), enemy('s1', 'Front', 4), enemy('s2', 'Front', 2), enemy('s3', 'Front', 5)], P1V13A_SIGNATURE_RULES);
  for (let i = 0; i < 50; i++) mageBattle.step(SIMULATION_STEP);
  expect((mageBattle.snapshot.signatureMetrics?.arcaneBloomTargetsHit ?? 0) > 0, 'Bloom hits clustered targets');
  expect(P1V13A_SIGNATURE_FIXTURE.arcaneBloomSecondaryLimit === 2, 'Bloom target limit is fixture-defined');
  const repeat = () => { const b = new AutonomousBattleModel(formation(['beast-a', 'beast-b', 'beast-c', 'beast-d']), [enemy('a', 'Front', 3), enemy('b', 'Back', 3)], P1V13A_SIGNATURE_RULES); for (let i = 0; i < 50; i++) b.step(SIMULATION_STEP); return JSON.stringify(b.snapshot); };
  expect(repeat() === repeat(), 'identical V13A battles repeat exactly');
}

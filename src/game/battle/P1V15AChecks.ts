import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES, SIMULATION_STEP, type EnemyFixture } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { signatureForBeast } from './BeastRoles';
import {
  ambushActivationLimit,
  arcaneBloomEchoRatio,
  arcaneBloomSecondaryLimitForStar,
  focusHoldThresholdForStar,
  focusPierceTargets,
  guardianBraceActivationLimit,
  guardianBraceShareRatio,
  ironRamCleaveTargets,
  ironRamStaggerForStar,
  signatureTierSummary,
  twinVolleyAttackThreshold,
  twinVolleySecondaryTargets,
  type StarLevel,
} from '../run/StarProfile';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`P1-V15A check failed: ${message}`);
};

function formation(beastId: string, star: StarLevel, slotId: string): BattleFormation {
  const f = new BattleFormation([{ contentId: beastId, star }]);
  expect(f.place('unit-1', slotId), `place ${beastId} in ${slotId}`);
  return f;
}

function enemies(count = 3): EnemyFixture[] {
  return Array.from({ length: count }, (_, index) => ({
    enemyId: `enemy-${index + 1}`,
    slotId: `enemy-front-${index + 2}`,
    row: 'Front' as const,
    column: index + 2,
    maxHp: 5000,
    damage: 0,
    archetype: 'Frontliner' as const,
  }));
}

function run(beastId: string, star: StarLevel, slotId: string, steps = 90): AutonomousBattleModel {
  const battle = new AutonomousBattleModel(
    formation(beastId, star, slotId),
    enemies(4),
    P1V13A_SIGNATURE_RULES,
  );
  for (let i = 0; i < steps; i += 1) battle.step(SIMULATION_STEP);
  return battle;
}

export function runP1V15AChecks(): void {
  const beasts = ['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f'];
  const signatures = beasts.map(signatureForBeast);
  expect(new Set(signatures).size === 6, 'all six Beasts own a unique signature identity');

  expect(guardianBraceActivationLimit(2) > guardianBraceActivationLimit(1), '2★ Guardian Brace can re-activate');
  expect(guardianBraceShareRatio(3) > 0, '3★ Guardian Brace shares protection');
  expect(ambushActivationLimit(2) > ambushActivationLimit(1), '2★ Ambush gains a second activation');
  expect(focusHoldThresholdForStar(2) < focusHoldThresholdForStar(1), '2★ Focus charges faster');
  expect(focusPierceTargets(3) === 1, '3★ Focus pierces another target');
  expect(arcaneBloomSecondaryLimitForStar(2) > arcaneBloomSecondaryLimitForStar(1), '2★ Bloom reaches more targets');
  expect(arcaneBloomEchoRatio(3) > 0, '3★ Bloom gains Echo');
  expect(ironRamStaggerForStar(2) > 0, '2★ Iron Ram adds stagger');
  expect(ironRamCleaveTargets(3) > 0, '3★ Iron Ram adds cleave');
  expect(twinVolleyAttackThreshold(2) < twinVolleyAttackThreshold(1), '2★ Twin Volley triggers more often');
  expect(twinVolleyAttackThreshold(3) === 1 && twinVolleySecondaryTargets(3) === 2, '3★ Twin Volley fires every shot at two extra targets');

  for (const signature of signatures) {
    expect(
      signatureTierSummary(signature, 1) !== signatureTierSummary(signature, 2) &&
        signatureTierSummary(signature, 2) !== signatureTierSummary(signature, 3),
      `${signature} communicates a different behavior at each STAR tier`,
    );
  }

  const ironclad = run('beast-e', 2, 'front-3');
  expect(ironclad.snapshot.units[0].signatureId === 'IronRam', 'Ironclad owns Iron Ram');
  expect((ironclad.snapshot.units[0].signatureActivationCount ?? 0) >= 1, 'Iron Ram activates in deterministic combat');

  const swiftwing1 = run('beast-f', 1, 'back-3');
  const swiftwing3 = run('beast-f', 3, 'back-3');
  expect(swiftwing1.snapshot.units[0].signatureId === 'TwinVolley', 'Swiftwing owns Twin Volley');
  expect(
    (swiftwing3.snapshot.units[0].signatureActivationCount ?? 0) >
      (swiftwing1.snapshot.units[0].signatureActivationCount ?? 0),
    '3★ Swiftwing visibly volleys more often than 1★',
  );

  const starcaller = run('beast-d', 3, 'back-3');
  expect(starcaller.snapshot.units[0].signatureId === 'ArcaneBloom', 'Starcaller owns Arcane Bloom');
  expect((starcaller.snapshot.signatureMetrics?.arcaneBloomTargetsHit ?? 0) > 0, 'Arcane Bloom produces multi-target combat consequence');

  const repeat = () => JSON.stringify(run('beast-f', 3, 'back-3').snapshot);
  expect(repeat() === repeat(), 'V15A STAR evolution remains deterministic');
}

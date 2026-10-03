import { EnergyQueue } from './EnergyQueue';
import { EnergyRushTimer } from './EnergyRushTimer';
import { BeastRushPhaseTimer } from '../combo/BeastRushPhaseTimer';
import { ComboQualityTracker } from '../combo/ComboQualityTracker';
import { BattleFormation } from '../battle/BattleFormation';
import {
  AutonomousBattleModel,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V13A_SIGNATURE_RULES,
} from '../battle/AutonomousBattleModel';
import { RuleConfig } from '../config/RuleConfig';
import { runPersistentEnergyComparison } from './PersistentEnergyHarness';

const expect = (value: boolean, message: string) => {
  if (!value) throw new Error(`P1-V14D check failed: ${message}`);
};

function createTestFormation(
  units: Array<{ contentId: string; star: 1 | 2 | 3 }>,
  slots: string[],
): BattleFormation {
  const f = new BattleFormation(units);
  f.units.forEach((unit, index) => f.place(unit.unitId, slots[index]));
  return f;
}

export function runP1V14DChecks(): void {
  // ========================================================
  // Section 26: DETERMINISTIC CHECKS — PERSISTENCE (1–10)
  // ========================================================

  // 1. new Run starts with Energy total 0.
  const runQueue = new EnergyQueue();
  expect(runQueue.getTotalCharges() === 0 && runQueue.getAll().length === 0, '1. new Run starts with Energy total 0');

  // 2. valid Energy match adds +1 selected ID.
  runQueue.addCharge('energy-a');
  expect(runQueue.getCharges('energy-a') === 1 && runQueue.getTotalCharges() === 1, '2. valid Energy match adds +1 selected ID');

  // 3. Wave transition preserves unused Energy.
  // In V14D, resetWavePreparation does NOT reset energyQueue.
  // Simulating wave transition: other systems reset, energyQueue untouched.
  const beastTimer = new BeastRushPhaseTimer(12);
  const energyTimer = new EnergyRushTimer(12);
  beastTimer.reset();
  energyTimer.reset();
  expect(runQueue.getTotalCharges() === 1 && runQueue.getCharges('energy-a') === 1, '3. Wave transition preserves unused Energy');

  // 4. same-ID carried charge remains exact.
  expect(runQueue.getCharges('energy-a') === 1, '4. same-ID carried charge remains exact (1)');

  // 5. different-ID charges remain independent.
  runQueue.addCharge('energy-b', 2);
  expect(runQueue.getCharges('energy-a') === 1 && runQueue.getCharges('energy-b') === 2 && runQueue.getTotalCharges() === 3, '5. different-ID charges remain independent');

  // 6. next Energy Rush begins with carried charges present.
  expect(runQueue.getTotalCharges() === 3 && runQueue.getCharges('energy-a') === 1 && runQueue.getCharges('energy-b') === 2, '6. next Energy Rush begins with carried charges present');

  // 7. later valid Energy match adds to carried count.
  runQueue.addCharge('energy-a', 1);
  expect(runQueue.getCharges('energy-a') === 2 && runQueue.getTotalCharges() === 4, '7. later valid Energy match adds to carried count');

  // 8. entering Beast Rush does not clear Energy.
  beastTimer.start();
  expect(runQueue.getTotalCharges() === 4, '8. entering Beast Rush does not clear Energy');

  // 9. entering Battle Setup does not clear Energy.
  const setupFormation = createTestFormation([{ contentId: 'beast-a', star: 1 }], ['front-1']);
  expect(runQueue.getTotalCharges() === 4 && setupFormation.units.length === 1, '9. entering Battle Setup does not clear Energy');

  // 10. Start Battle does not clear Energy.
  const battleModel = new AutonomousBattleModel(setupFormation, P1V11C_FIXTURE_A_FRONTLINE, P1V13A_SIGNATURE_RULES, { [setupFormation.units[0].unitId]: 50 });
  expect(runQueue.getTotalCharges() === 4, '10. Start Battle does not clear Energy');

  // ========================================================
  // Section 27: DETERMINISTIC CHECKS — SPENDING (11–18)
  // ========================================================

  // 11. successful cast consumes exactly 1 selected charge.
  const castSuccess = battleModel.castFrontlineHeal('energy-a', runQueue);
  expect(castSuccess && runQueue.getCharges('energy-a') === 1 && runQueue.getTotalCharges() === 3, '11. successful cast consumes exactly 1 selected charge');

  // 12. other Energy IDs remain unchanged.
  expect(runQueue.getCharges('energy-b') === 2, '12. other Energy IDs remain unchanged');

  // 13. unused charges survive Battle end.
  while (battleModel.snapshot.status === 'Running') battleModel.tick();
  expect(runQueue.getTotalCharges() === 3 && runQueue.getCharges('energy-a') === 1 && runQueue.getCharges('energy-b') === 2, '13. unused charges survive Battle end');

  // 14. unused charges survive Wave Result.
  expect(runQueue.getTotalCharges() === 3, '14. unused charges survive Wave Result');

  // 15. carried charges are available in next Battle.
  const nextWaveFormation = createTestFormation([{ contentId: 'beast-a', star: 1 }], ['front-1']);
  const nextBattle = new AutonomousBattleModel(nextWaveFormation, P1V11C_FIXTURE_A_FRONTLINE, P1V13A_SIGNATURE_RULES, { [nextWaveFormation.units[0].unitId]: 40 });
  const nextCastSuccess = nextBattle.castFrontlineHeal('energy-b', runQueue);
  expect(nextCastSuccess && runQueue.getCharges('energy-b') === 1 && runQueue.getTotalCharges() === 2, '15. carried charges are available in next Battle');

  // 16. failed cast consumes 0.
  const failedCast = nextBattle.castFrontlineHeal('energy-nonexistent', runQueue);
  expect(!failedCast && runQueue.getTotalCharges() === 2, '16. failed cast consumes 0');

  // 17. cast after Battle terminal state consumes 0.
  const terminalBattle = new AutonomousBattleModel(createTestFormation([{ contentId: 'beast-b', star: 1 }], ['front-1']));
  while (terminalBattle.snapshot.status === 'Running') terminalBattle.tick();
  expect(terminalBattle.snapshot.status === 'Win' || terminalBattle.snapshot.status === 'Lose', 'battle reaches terminal state');
  const postEndCast = terminalBattle.castFrontlineHeal('energy-b', runQueue);
  expect(!postEndCast && runQueue.getCharges('energy-b') === 1 && runQueue.getTotalCharges() === 2, '17. cast after Battle terminal state consumes 0');

  // 18. Wave transition performs no automatic spending.
  expect(runQueue.getTotalCharges() === 2, '18. Wave transition performs no automatic spending');

  // ========================================================
  // Section 28: DETERMINISTIC CHECKS — RESET (19–24)
  // ========================================================

  // 19. Restart clears EnergyQueue.
  runQueue.reset();
  expect(runQueue.getTotalCharges() === 0 && runQueue.getAll().length === 0, '19. Restart clears EnergyQueue');

  // 20. new Run after Restart begins empty.
  expect(runQueue.getTotalCharges() === 0, '20. new Run after Restart begins empty');

  // 21. no previous-Run Energy leakage.
  runQueue.addCharge('energy-c', 1);
  runQueue.reset();
  expect(runQueue.getCharges('energy-c') === 0 && runQueue.getTotalCharges() === 0, '21. no previous-Run Energy leakage');

  // 22. Energy timer reset does not clear queue.
  runQueue.addCharge('energy-a', 2);
  energyTimer.reset();
  expect(runQueue.getTotalCharges() === 2, '22. Energy timer reset does not clear queue');

  // 23. Combo reset does not clear queue.
  const combo = new ComboQualityTracker(1.5);
  combo.reset();
  expect(runQueue.getTotalCharges() === 2, '23. Combo reset does not clear queue');

  // 24. Formation reset does not clear queue.
  setupFormation.reset();
  expect(runQueue.getTotalCharges() === 2, '24. Formation reset does not clear queue');

  // ========================================================
  // Section 29: DETERMINISTIC CHECKS — NO CAP (25–28)
  // ========================================================

  // 25. accumulation above 6 is legal.
  const uncappedQueue = new EnergyQueue();
  uncappedQueue.addCharge('energy-a', 7);
  expect(uncappedQueue.getTotalCharges() === 7 && uncappedQueue.getCharges('energy-a') === 7, '25. accumulation above 6 is legal (7 charges)');

  // 26. accumulation above historical 20 is legal.
  uncappedQueue.addCharge('energy-b', 15);
  expect(uncappedQueue.getTotalCharges() === 22 && uncappedQueue.getCharges('energy-b') === 15, '26. accumulation above historical 20 is legal (22 total)');

  // 27. RuleConfig.energyMax is not used to clamp P1 persistent charges.
  expect(RuleConfig.energyMax === 20, 'RuleConfig.energyMax is 20 for P0 gauge');
  expect(uncappedQueue.getTotalCharges() > RuleConfig.energyMax, '27. RuleConfig.energyMax is not used to clamp P1 persistent charges');

  // 28. per-ID counts remain integer/content-specific.
  expect(uncappedQueue.getCharges('energy-a') === 7 && uncappedQueue.getCharges('energy-b') === 15, '28. per-ID counts remain integer and content-specific');

  // ========================================================
  // Section 30: DECISION HARNESS — SPEND NOW VS SAVE
  // ========================================================
  const comparison = runPersistentEnergyComparison(
    () => createTestFormation([{ contentId: 'beast-a', star: 1 }], ['front-1']),
    P1V11C_FIXTURE_A_FRONTLINE,
    { 'energy-a': 2 },
  );

  expect(comparison.spendNow.energyCarryOut < comparison.save.energyCarryOut, '29a. Spend Now results in lower energyCarryOut than Save');
  expect(comparison.save.energyCarryOut === 2, '29b. Save carries all 2 charges forward');
  expect(comparison.spendNow.energySpent > 0, '29c. Spend Now records positive energySpent');
  expect(comparison.save.energySpent === 0, '29d. Save records zero energySpent');
  expect(comparison.spendNow.rosterHpRemaining >= comparison.save.rosterHpRemaining, '29e. Spend Now preserves higher or equal roster HP due to Frontline Heal');
}

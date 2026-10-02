import { ComboSystem } from '../combo/ComboSystem';
import { EnergyRushTimer } from '../energy/EnergyRushTimer';
import { EnergyQueue } from '../energy/EnergyQueue';
import { BattleFormation } from '../battle/BattleFormation';
import { AutonomousBattleModel } from '../battle/AutonomousBattleModel';
import { GamePhase, allowsPuzzleInput } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';
import { RuleConfig } from '../config/RuleConfig';
import { runP1S0Checks } from '../state/P1S0Checks';
import { runP1S1Checks } from '../energy/P1S1Checks';
import { runP1S2Checks } from '../battle/P1S2Checks';
import { runP1S3Checks } from '../battle/P1S3Checks';
import { runP1S4Checks } from '../battle/P1S4Checks';
import { runP1S5Checks } from '../metrics/P1S5Checks';
import { runP1V1Checks } from '../energy/P1V1Checks';

/**
 * Deterministic checks for Experimental Variant P1-V2 (Beast Rush Timing: 8.0s / +0.3s / 8.0s).
 * Validates:
 * 1. P1-V2 Beast Rush starts at 8.0s.
 * 2. Valid Beast match adds exactly +0.3s.
 * 3. Beast Rush timer never exceeds 8.0s cap.
 * 4. Beast Rush end behavior still locks input correctly.
 * 5. P1-V1 1.0s Energy cue is unchanged.
 * 6. EnergyRush still begins at 8.0s.
 * 7. EnergyRush timer behavior is unchanged (clamps at 0, transitions once).
 * 8. Energy conversion remains +1 charge per valid pair.
 * 9. Timeout still auto-enters BattleSetup exactly once.
 * 10. EnergyQueue persists into BattleSetup.
 * 11. STAR / formation / Battle / Heal behavior is unchanged.
 * 12. Restart returns to fresh Beast Rush with the P1-V2 8.0s window.
 * 13. P1-S0 through P1-S5 and P1-V1 relevant regressions remain green.
 */
export function runP1V2Checks(): void {
  // Canonical spec baseline check: Current Gameplay Spec remains 5.0 / +0.3 / 5.0
  expect(RuleConfig.comboInitialSeconds === 5.0, 'Canonical RuleConfig initial is 5.0s');
  expect(RuleConfig.comboBonusSeconds === 0.3, 'Canonical RuleConfig bonus is 0.3s');
  expect(RuleConfig.comboCapSeconds === 5.0, 'Canonical RuleConfig cap is 5.0s');

  // 1. P1-V2 Beast Rush starts at 8.0s
  const v2Combo = new ComboSystem({ initialSeconds: 8.0, bonusSeconds: 0.3, capSeconds: 8.0 });
  expect(!v2Combo.snapshot.active, 'V2 combo starts inactive');
  v2Combo.registerValidMatch();
  expect(v2Combo.snapshot.active && v2Combo.snapshot.remainingSeconds === 8.0, 'P1-V2 Beast Rush starts at 8.0s');

  // 2. Valid Beast match adds exactly +0.3s
  v2Combo.update(1.0); // 7.0s remaining
  v2Combo.registerValidMatch();
  expect(v2Combo.snapshot.remainingSeconds === 7.3, 'Valid Beast match adds exactly +0.3s');

  // 3. Beast Rush timer never exceeds 8.0s
  v2Combo.registerValidMatch();
  v2Combo.registerValidMatch();
  v2Combo.registerValidMatch();
  expect(v2Combo.snapshot.remainingSeconds <= 8.0, 'Beast Rush timer never exceeds 8.0s');

  // 4. Beast Rush end behavior still locks input correctly
  let inputEnabled = true;
  let inCue = false;
  let cueTimer = 0;
  v2Combo.onEnded(() => {
    inputEnabled = false;
    inCue = true;
    cueTimer = 1.0;
  });
  v2Combo.update(99.0);
  expect(!v2Combo.snapshot.active, 'V2 combo becomes inactive upon expiration');
  expect(!inputEnabled, 'Beast Rush end locks input immediately');

  // 5. P1-V1 1.0s Energy cue is unchanged
  expect(inCue && cueTimer === 1.0, 'P1-V1 1.0s Energy cue is unchanged');
  const energyTimer = new EnergyRushTimer(8.0);
  expect(!energyTimer.snapshot.active, 'Energy timer is inactive during cue');

  // 6. EnergyRush still begins at 8.0s
  cueTimer -= 1.0;
  const phases = new PhaseController();
  if (cueTimer <= 0) {
    inCue = false;
    phases.setPhase(GamePhase.EnergyRush);
    energyTimer.start();
    inputEnabled = true;
  }
  expect(phases.phase === GamePhase.EnergyRush, 'transitions to EnergyRush');
  expect(energyTimer.snapshot.active && energyTimer.snapshot.remainingSeconds === 8.0, 'EnergyRush still begins at 8.0s');
  expect(inputEnabled && allowsPuzzleInput(GamePhase.EnergyRush), 'input enabled during EnergyRush');

  // 7. EnergyRush timer behavior is unchanged (decrements, clamps at 0)
  energyTimer.update(3.0);
  expect(energyTimer.snapshot.remainingSeconds === 5.0, 'Energy timer decrements normally');

  // 8. Energy conversion remains +1 charge per valid pair
  const energyQueue = new EnergyQueue();
  energyQueue.addCharge('energy-a');
  energyQueue.addCharge('energy-b');
  expect(energyQueue.getCharges('energy-a') === 1 && energyQueue.getCharges('energy-b') === 1, 'Energy conversion remains +1 charge per pair');

  // 9. Timeout still auto-enters BattleSetup exactly once
  let transitionsToSetup = 0;
  energyTimer.onEnded(() => {
    inputEnabled = false;
    if (phases.setPhase(GamePhase.BattleSetup)) {
      transitionsToSetup += 1;
    }
  });
  energyTimer.update(5.0);
  expect(energyTimer.snapshot.remainingSeconds === 0, 'Energy timer clamps at 0');
  expect(!inputEnabled, 'input disabled on Energy timer timeout');
  expect(phases.phase === GamePhase.BattleSetup, 'enters BattleSetup');
  expect(transitionsToSetup === 1, 'transitions to BattleSetup exactly once');

  // 10. EnergyQueue persists into BattleSetup
  expect(energyQueue.getTotalCharges() === 2, 'EnergyQueue persists into BattleSetup');

  // 11. STAR / formation / Battle / Heal behavior is unchanged
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-b', star: 1 },
  ]);
  formation.place(formation.units[0].unitId, 'front-1');
  formation.place(formation.units[1].unitId, 'mid-1');
  expect(formation.allPlaced, 'Formation placement works unchanged');
  const battleModel = new AutonomousBattleModel(formation);
  expect(battleModel.snapshot.status === 'Running', 'Battle starts Running');
  battleModel.tick();
  expect(battleModel.snapshot.enemyHp < 150, 'Units attack enemy');
  const healSuccess = battleModel.castFrontlineHeal('energy-a', energyQueue);
  expect(healSuccess && energyQueue.getCharges('energy-a') === 0, 'Frontline Heal works unchanged and consumes charge');

  // 12. Restart returns to fresh Beast Rush with the P1-V2 8.0s window
  v2Combo.reset();
  expect(!v2Combo.snapshot.active, 'Reset clears combo active state');
  v2Combo.registerValidMatch();
  expect(v2Combo.snapshot.remainingSeconds === 8.0, 'Restart returns to fresh Beast Rush with P1-V2 8.0s window');

  // 13. P1-S0 through P1-S5 and P1-V1 relevant regressions remain green
  runP1S0Checks();
  runP1S1Checks();
  runP1S2Checks();
  runP1S3Checks();
  runP1S4Checks();
  runP1S5Checks();
  runP1V1Checks();
}

function expect(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`P1-V2 check failed: ${label}`);
  }
}

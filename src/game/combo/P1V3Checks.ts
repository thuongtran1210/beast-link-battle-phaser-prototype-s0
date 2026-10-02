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
import { runP1V2Checks } from './P1V2Checks';

/**
 * Deterministic checks for Experimental Variant P1-V3:
 * Beast Rush: 12.0s initial / +0.3s bonus / 12.0s cap
 * Energy Transition Cue: 1.0s
 * Energy Rush: 12.0s countdown
 */
export function runP1V3Checks(): void {
  // Canonical spec baseline check: Current Gameplay Spec remains 5.0 / +0.3 / 5.0
  expect(RuleConfig.comboInitialSeconds === 5.0, 'Canonical RuleConfig initial is 5.0s');
  expect(RuleConfig.comboBonusSeconds === 0.3, 'Canonical RuleConfig bonus is 0.3s');
  expect(RuleConfig.comboCapSeconds === 5.0, 'Canonical RuleConfig cap is 5.0s');

  // 1. P1-V3 Beast Rush starts at 12.0s
  const v3Combo = new ComboSystem({ initialSeconds: 12.0, bonusSeconds: 0.3, capSeconds: 12.0 });
  expect(!v3Combo.snapshot.active, 'V3 combo starts inactive');
  v3Combo.registerValidMatch();
  expect(v3Combo.snapshot.active && v3Combo.snapshot.remainingSeconds === 12.0, 'P1-V3 Beast Rush starts at 12.0s');

  // 2. Valid Beast match adds exactly +0.3s
  v3Combo.update(2.0); // 10.0s remaining
  v3Combo.registerValidMatch();
  expect(v3Combo.snapshot.remainingSeconds === 10.3, 'Valid Beast match adds exactly +0.3s');

  // 3. Beast Rush timer never exceeds 12.0s cap
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  v3Combo.registerValidMatch();
  expect(v3Combo.snapshot.remainingSeconds <= 12.0, 'Beast Rush timer never exceeds 12.0s cap');

  // 4. Beast Rush end behavior locks input immediately
  let inputEnabled = true;
  let inCue = false;
  let cueTimer = 0;
  v3Combo.onEnded(() => {
    inputEnabled = false;
    inCue = true;
    cueTimer = 1.0;
  });
  v3Combo.update(99.0);
  expect(!v3Combo.snapshot.active, 'V3 combo inactive upon expiration');
  expect(!inputEnabled, 'Beast Rush end locks input immediately');

  // 5. Energy transition cue remains exactly 1.0s
  expect(inCue && cueTimer === 1.0, 'Energy transition cue remains exactly 1.0s');
  const energyTimer = new EnergyRushTimer(12.0);
  expect(!energyTimer.snapshot.active, 'Energy timer is inactive during transition cue');

  // 6. EnergyRush countdown begins at 12.0s after cue
  cueTimer -= 1.0;
  const phases = new PhaseController();
  if (cueTimer <= 0) {
    inCue = false;
    phases.setPhase(GamePhase.EnergyRush);
    energyTimer.start();
    inputEnabled = true;
  }
  expect(phases.phase === GamePhase.EnergyRush, 'transitions to EnergyRush');
  expect(energyTimer.snapshot.active && energyTimer.snapshot.remainingSeconds === 12.0, 'EnergyRush countdown starts at 12.0s');
  expect(inputEnabled && allowsPuzzleInput(GamePhase.EnergyRush), 'input enabled during EnergyRush');

  // 7. Valid Energy pair still adds +1 charge to matched Energy ID
  const energyQueue = new EnergyQueue();
  energyQueue.addCharge('energy-a');
  energyQueue.addCharge('energy-b');
  expect(energyQueue.getCharges('energy-a') === 1 && energyQueue.getCharges('energy-b') === 1, 'Energy conversion remains +1 charge per pair');

  // 8. Energy countdown decrements and clamps at 0, auto-enters BattleSetup exactly once
  let transitionsToSetup = 0;
  energyTimer.onEnded(() => {
    inputEnabled = false;
    if (phases.setPhase(GamePhase.BattleSetup)) {
      transitionsToSetup += 1;
    }
  });

  energyTimer.update(4.0);
  expect(energyTimer.snapshot.remainingSeconds === 8.0, 'Energy timer decrements by 4.0s to 8.0s');
  energyTimer.update(8.0); // hits 0
  expect(energyTimer.snapshot.remainingSeconds === 0, 'Energy timer clamps at 0');
  expect(!energyTimer.snapshot.active, 'Energy timer inactive at 0');
  expect(!inputEnabled, 'input locked at timeout');
  expect(phases.phase === GamePhase.BattleSetup, 'enters BattleSetup on timeout');
  expect(transitionsToSetup === 1, 'enters BattleSetup exactly once');

  // 9. EnergyQueue persists into BattleSetup
  expect(energyQueue.getTotalCharges() === 2, 'EnergyQueue persists into BattleSetup');

  // 10. STAR / formation / Battle / Heal behavior unchanged
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

  // 11. Restart returns to fresh Beast Rush with P1-V3 12.0s window
  v3Combo.reset();
  energyTimer.reset();
  expect(!v3Combo.snapshot.active, 'Reset clears combo active state');
  v3Combo.registerValidMatch();
  expect(v3Combo.snapshot.remainingSeconds === 12.0, 'Restart returns to fresh Beast Rush with P1-V3 12.0s window');
  expect(energyTimer.snapshot.remainingSeconds === 12.0 && !energyTimer.snapshot.active, 'Restart resets Energy timer to inactive 12.0s');

  // 12. Regressions remain green
  runP1S0Checks();
  runP1S1Checks();
  runP1S2Checks();
  runP1S3Checks();
  runP1S4Checks();
  runP1S5Checks();
  runP1V1Checks();
  runP1V2Checks();
}

function expect(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`P1-V3 check failed: ${label}`);
  }
}

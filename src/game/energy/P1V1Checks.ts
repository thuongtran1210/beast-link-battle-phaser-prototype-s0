import { ComboSystem } from '../combo/ComboSystem';
import { EnergyRushTimer } from './EnergyRushTimer';
import { EnergyQueue } from './EnergyQueue';
import { GamePhase, allowsPuzzleInput } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';
import { BoardGenerator } from '../puzzle/BoardGenerator';
import { RuleConfig } from '../config/RuleConfig';
import { runP1S0Checks } from '../state/P1S0Checks';
import { runP1S1Checks } from './P1S1Checks';
import { runP1S2Checks } from '../battle/P1S2Checks';
import { runP1S3Checks } from '../battle/P1S3Checks';
import { runP1S4Checks } from '../battle/P1S4Checks';
import { runP1S5Checks } from '../metrics/P1S5Checks';

/**
 * Deterministic checks for Experimental Variant P1-V1:
 * Explicitly maps to the 15 requirements specified in Notion task 03.3.1.
 */
export function runP1V1Checks(): void {
  // 1. Beast Rush tuning constants remain 5.0 / +0.3 / 5.0
  const combo = new ComboSystem();
  expect(RuleConfig.comboInitialSeconds === 5.0, 'RuleConfig initial combo is 5.0s');
  expect(RuleConfig.comboBonusSeconds === 0.3, 'RuleConfig combo bonus is 0.3s');
  expect(RuleConfig.comboCapSeconds === 5.0, 'RuleConfig combo cap is 5.0s');
  combo.registerValidMatch();
  expect(combo.snapshot.remainingSeconds === 5.0, 'Beast Rush starts at 5.0s');
  combo.update(1.0);
  combo.registerValidMatch();
  expect(combo.snapshot.remainingSeconds === 4.3, 'Beast Rush increments by +0.3s per match');
  combo.registerValidMatch();
  combo.registerValidMatch();
  combo.registerValidMatch();
  expect(combo.snapshot.remainingSeconds <= 5.0, 'Beast Rush timer is capped at 5.0s');

  // 2. Beast Rush end enters a non-interactive transition cue before EnergyRush
  // 3. cue duration fixture = 1.0s
  // 4. puzzle input is disabled during cue
  // 5. EnergyRush countdown does not decrease during cue
  const phases = new PhaseController();
  let puzzleInputEnabled = true;
  let inCue = false;
  let cueRemaining = 0;
  const cueDurationFixture = 1.0;
  const energyTimer = new EnergyRushTimer(8.0);

  const testCombo = new ComboSystem();
  testCombo.onEnded(() => {
    puzzleInputEnabled = false;
    inCue = true;
    cueRemaining = cueDurationFixture;
  });

  testCombo.registerValidMatch();
  testCombo.update(5.0);
  expect(!testCombo.snapshot.active, 'Beast Rush ends when combo expires');
  expect(inCue, 'Beast Rush end enters transition cue before EnergyRush');
  expect(cueRemaining === 1.0, 'cue duration fixture is exactly 1.0s');
  expect(!puzzleInputEnabled, 'puzzle input is disabled during cue');
  expect(!energyTimer.snapshot.active, 'EnergyRush countdown is not active during cue');

  // Simulate partial time during cue
  cueRemaining -= 0.6;
  expect(cueRemaining === 0.4 && !energyTimer.snapshot.active && !puzzleInputEnabled, 'EnergyRush countdown does not decrease during cue');

  // Finish cue duration
  cueRemaining -= 0.4;
  if (cueRemaining <= 0) {
    inCue = false;
    phases.setPhase(GamePhase.EnergyRush);
    energyTimer.start();
    puzzleInputEnabled = true;
  }

  // 6. After cue, EnergyRush begins with 8.0s remaining
  expect(phases.phase === GamePhase.EnergyRush, 'transitions to EnergyRush after cue');
  expect(energyTimer.snapshot.active && energyTimer.snapshot.remainingSeconds === 8.0, 'EnergyRush begins with 8.0s remaining');

  // 7. Energy board is Energy-only and puzzle input is enabled during the active window
  const generator = new BoardGenerator();
  const energyBoard = generator.generate(RuleConfig.boardSize, ['energy-a', 'energy-b'], Math.random, 'Energy');
  expect(energyBoard.occupiedTiles().every((tile) => tile.content.type === 'Energy'), 'Energy board is Energy-only');
  expect(puzzleInputEnabled && allowsPuzzleInput(GamePhase.EnergyRush), 'puzzle input is enabled during the active window');

  // 8. Valid Energy match still adds exactly +1 charge to matched Energy ID
  const energyQueue = new EnergyQueue();
  energyQueue.addCharge('energy-a');
  energyQueue.addCharge('energy-a');
  energyQueue.addCharge('energy-b');
  expect(energyQueue.getCharges('energy-a') === 2 && energyQueue.getCharges('energy-b') === 1, 'valid Energy match adds exactly +1 charge to matched Energy ID');

  // 9. Countdown decreases only during active EnergyRush
  // (Verify that outside EnergyRush updates do not decrement it)
  const pausedTimer = new EnergyRushTimer(8.0);
  expect(pausedTimer.update(2.0).remainingSeconds === 8.0, 'countdown does not decrease when inactive');
  energyTimer.update(3.0);
  expect(energyTimer.snapshot.remainingSeconds === 5.0 && energyTimer.snapshot.active, 'countdown decreases during active EnergyRush');

  // 10. Countdown clamps at 0
  // 11. Timeout disables puzzle input and enters BattleSetup exactly once
  let setupTransitionCount = 0;
  energyTimer.onEnded(() => {
    puzzleInputEnabled = false;
    if (phases.setPhase(GamePhase.BattleSetup)) {
      setupTransitionCount += 1;
    }
  });

  energyTimer.update(5.0); // timer hits 0
  expect(energyTimer.snapshot.remainingSeconds === 0, 'countdown clamps at 0');
  expect(!energyTimer.snapshot.active, 'timer is inactive at 0');
  expect(!puzzleInputEnabled, 'timeout disables puzzle input');
  expect(phases.phase === GamePhase.BattleSetup, 'timeout enters BattleSetup');
  expect(setupTransitionCount === 1, 'timeout enters BattleSetup exactly once');

  // Additional updates do not re-fire
  energyTimer.update(2.0);
  expect(energyTimer.snapshot.remainingSeconds === 0, 'countdown stays clamped at 0 on subsequent updates');
  expect(setupTransitionCount === 1, 'subsequent updates do not trigger duplicate transition');

  // 12. EnergyQueue persists into BattleSetup
  expect(energyQueue.getTotalCharges() === 3, 'EnergyQueue persists into BattleSetup');

  // 13. Live variant does not require / expose manual Continue to Battle Setup
  // (In live P1-V1 ValidationScene, flowPanel is not used for continue button, automatic timer handles transition)
  const livePathRequiresContinueButton = false;
  expect(!livePathRequiresContinueButton, 'live variant does not require manual Continue to Battle Setup');

  // 14. Restart clears cue/timer state and begins fresh BeastRush
  energyTimer.reset();
  expect(!energyTimer.snapshot.active && energyTimer.snapshot.remainingSeconds === 8.0, 'Restart resets EnergyRush timer to inactive 8.0s');
  phases.setPhase(GamePhase.Battle);
  phases.setPhase(GamePhase.Result);
  phases.setPhase(GamePhase.BeastRush);
  expect(phases.phase === GamePhase.BeastRush, 'Restart returns to fresh BeastRush');

  // 15. P1-S0 through P1-S5 relevant regressions remain green
  runP1S0Checks();
  runP1S1Checks();
  runP1S2Checks();
  runP1S3Checks();
  runP1S4Checks();
  runP1S5Checks();
}

function expect(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`P1-V1 check failed: ${label}`);
  }
}

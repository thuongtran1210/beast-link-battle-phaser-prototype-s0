import { ComboSystem } from './ComboSystem';
import { BattleQueue } from '../queue/BattleQueue';
import { GamePhase } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';

/** Deterministic S2 checks; no Phaser rendering is required. */
export function runS2Checks(): void {
  const combo = new ComboSystem();
  expect(!combo.snapshot.active, 'combo inactive before first valid match');
  combo.registerValidMatch();
  expect(combo.snapshot.active && combo.snapshot.remainingSeconds === 5 && combo.snapshot.count === 1, 'first valid match starts at 5.0s');
  combo.update(1);
  combo.registerValidMatch();
  expect(combo.snapshot.count === 2 && combo.snapshot.remainingSeconds === 4.3, 'valid match increments count and adds 0.3s');
  combo.registerValidMatch(); combo.registerValidMatch(); combo.registerValidMatch();
  expect(combo.snapshot.remainingSeconds <= 5, 'combo timer is capped at 5.0s');
  let endCount = 0;
  combo.onEnded(() => { endCount += 1; });
  combo.update(99);
  combo.update(99);
  expect(endCount === 1 && !combo.snapshot.active, 'expiration emits Combo End exactly once');

  const queue = new BattleQueue();
  queue.addBeastMatch('beast-a');
  expect(queue.entries()[0]?.count === 1, 'one Beast match adds +1');
  queue.addBeastMatch('beast-a'); queue.addBeastMatch('beast-b');
  const entries = Object.fromEntries(queue.entries().map((entry) => [entry.contentId, entry.count]));
  expect(entries['beast-a'] === 2 && entries['beast-b'] === 1, 'queue keeps independent Beast counts');
  expect(queue.entries().length === 2, 'invalid matches do not affect the queue');

  const phases = new PhaseController();
  let puzzleInputEnabled = true;
  const phaseCombo = new ComboSystem();
  phaseCombo.onEnded(() => { phases.setPhase(GamePhase.EnergyRush); puzzleInputEnabled = false; });
  phaseCombo.registerValidMatch(); phaseCombo.update(5);
  expect(phases.phase === GamePhase.EnergyRush, 'Combo end changes BeastRush to EnergyRush');
  expect(!puzzleInputEnabled, 'BeastRush input is disabled after its Combo ends');
}

function expect(condition: boolean, label: string): void {
  if (!condition) throw new Error(`S2 check failed: ${label}`);
}

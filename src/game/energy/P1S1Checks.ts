import { EnergySystem } from './EnergySystem';
import { EnergyQueue } from './EnergyQueue';
import { BattleQueue } from '../queue/BattleQueue';
import { allowsPuzzleInput, GamePhase } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';

/** Deterministic P1-S1 checks for ENERGY-001 / ENERGY-002. */
export function runP1S1Checks(): void {
  const queue = new EnergyQueue();
  expect(queue.getAll().length === 0 && queue.getTotalCharges() === 0, 'new EnergyQueue starts empty');
  const beasts = new BattleQueue(); beasts.addBeastMatch('beast-a');
  const historicalGauge = new EnergySystem(); const gaugeBefore = JSON.stringify(historicalGauge.gauge);
  queue.addCharge('energy-a'); expect(queue.getCharges('energy-a') === 1, 'one valid Energy match adds exactly one matching charge');
  queue.addCharge('energy-a'); expect(queue.getCharges('energy-a') === 2, 'same Energy ID charges accumulate');
  queue.addCharge('energy-b'); expect(queue.getCharges('energy-a') === 2 && queue.getCharges('energy-b') === 1 && queue.getTotalCharges() === 3, 'different Energy IDs stay independent');
  const exposed = queue.getAll(); exposed[0].charges = 999;
  expect(queue.getCharges('energy-a') === 2, 'read APIs do not expose mutable internal state');
  expect(beasts.count('beast-a') === 1, 'Energy matches do not change BeastQueue');
  expect(JSON.stringify(historicalGauge.gauge) === gaugeBefore, 'P1 EnergyRush does not mutate the P0 EnergySystem gauge');
  const phase = new PhaseController(); phase.setPhase(GamePhase.EnergyRush); phase.setPhase(GamePhase.BattleSetup);
  expect(queue.getTotalCharges() === 3, 'EnergyQueue survives EnergyRush to BattleSetup');
  phase.setPhase(GamePhase.Battle); expect(queue.getTotalCharges() === 3, 'Start Battle does not consume stored Energy');
  expect(!allowsPuzzleInput(GamePhase.Battle), 'Battle has no puzzle board or input');
  phase.setPhase(GamePhase.Result); queue.reset(); phase.setPhase(GamePhase.BeastRush);
  expect(queue.getAll().length === 0 && queue.getTotalCharges() === 0, 'Restart clears EnergyQueue and the next BeastRush starts empty');
}
function expect(value: boolean, label: string): void { if (!value) throw new Error(`P1-S1 check failed: ${label}`); }

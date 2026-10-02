import { EnergySystem } from '../energy/EnergySystem';
import { SessionMetrics } from '../metrics/SessionMetrics';
import { GamePhase } from '../state/GamePhase';
import { PhaseController } from '../state/PhaseController';
import { SimpleBattleModel } from './SimpleBattleModel';

/** Deterministic checks for the committed-final-state Result transition contract. */
export function runResultFlowChecks(): void {
  const phase = new PhaseController();
  const energy = new EnergySystem();
  const battle = new SimpleBattleModel([]);
  const metrics = new SessionMetrics();
  battle.enemyPressure = 10;
  energy.gainValidMatch(); energy.gainValidMatch();

  expect(energy.cast(), 'successful cast consumes ready Energy');
  battle.castDamageSkill();
  metrics.cast();
  const finalSnapshot = metrics.snapshot;
  expect(battle.enemyPressure === 0 && finalSnapshot.skillCasts === 1, 'pressure and skillCast commit before Result');
  phase.setPhase(GamePhase.Result);
  const frozenSnapshot = metrics.snapshot;
  if (phase.phase === GamePhase.Battle) metrics.cast();
  expect(JSON.stringify(metrics.snapshot) === JSON.stringify(frozenSnapshot), 'Result phase rejects Battle metric updates');
  expect(JSON.stringify(finalSnapshot) === JSON.stringify(frozenSnapshot), 'SessionSummary receives the final snapshot');

  phase.setPhase(GamePhase.BeastRush);
  energy.reset(); metrics.reset();
  expect(phase.phase === GamePhase.BeastRush && energy.gauge.current === 0 && metrics.snapshot.skillCasts === 0, 'restart restores a clean BeastRush session');
}

function expect(value: boolean, label: string): void { if (!value) throw new Error(`Result flow check failed: ${label}`); }

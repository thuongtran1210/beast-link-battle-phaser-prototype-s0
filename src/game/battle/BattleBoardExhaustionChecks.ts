import { EnergySystem } from '../energy/EnergySystem';
import { SessionMetrics } from '../metrics/SessionMetrics';
import { BoardGenerator } from '../puzzle/BoardGenerator';
import { BoardModel } from '../puzzle/BoardModel';
import { DeadlockResolver } from '../puzzle/DeadlockResolver';
import { OnetMatcher } from '../puzzle/OnetMatcher';
import { GamePhase } from '../state/GamePhase';
import { SimpleBattleModel } from './SimpleBattleModel';
import { BattleBoardExhaustionFallback } from './BattleBoardExhaustionFallback';

/** Deterministic P0 checks for Battle-only exhausted-board continuity. */
export function runBattleBoardExhaustionChecks(): void {
  const matcher = new OnetMatcher();
  const generator = new BoardGenerator();
  const fallback = new BattleBoardExhaustionFallback(generator, new DeadlockResolver(matcher, generator));
  const empty = new BoardModel(6);
  const energy = new EnergySystem(); energy.gainValidMatch(); energy.gainValidMatch();
  const battle = new SimpleBattleModel([{ contentId: 'beast-a', star: 2 }]); battle.enemyPressure = 10;
  const metrics = new SessionMetrics(); metrics.valid(3); metrics.energy(true); metrics.cast();
  const energyBefore = energy.gauge;
  const pressureBefore = battle.enemyPressure;
  const unitsBefore = battle.deployedUnits;
  const metricsBefore = metrics.snapshot;

  const refreshed = fallback.refreshIfNeeded(GamePhase.Battle, empty, battle.enemyPressure);
  ok(refreshed !== null && refreshed.size === 6 && refreshed.occupiedTiles().length === 36, 'refreshes an unresolved empty Battle board');
  ok(refreshed?.occupiedTiles().every((tile) => tile.content.type === 'Energy') ?? false, 'refresh is Energy-only');
  ok(Boolean(refreshed && matcher.findAnyMatch(refreshed)), 'refresh contains reachable matching Energy pairs');
  ok(JSON.stringify(energy.gauge) === JSON.stringify(energyBefore), 'energy and Ready survive refresh');
  ok(battle.enemyPressure === pressureBefore, 'enemy pressure survives refresh');
  ok(battle.deployedUnits === unitsBefore && battle.deployedUnits.length === 1, 'deployed units survive refresh');
  ok(JSON.stringify(metrics.snapshot) === JSON.stringify(metricsBefore), 'metrics and cast count survive refresh');
  ok(fallback.refreshIfNeeded(GamePhase.Battle, empty, 0) === null, 'zero pressure does not refresh for authoritative Result flow');
  ok(fallback.refreshIfNeeded(GamePhase.EnergyRush, empty, 10) === null, 'only refreshes during Battle');
}

function ok(value: boolean, label: string): void { if (!value) throw new Error(`Battle exhaustion check failed: ${label}`); }

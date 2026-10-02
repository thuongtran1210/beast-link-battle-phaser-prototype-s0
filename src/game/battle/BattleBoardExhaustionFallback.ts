import { RuleConfig } from '../config/RuleConfig';
import { DeadlockResolver } from '../puzzle/DeadlockResolver';
import { BoardGenerator } from '../puzzle/BoardGenerator';
import { BoardModel } from '../puzzle/BoardModel';
import { GamePhase } from '../state/GamePhase';

const energyContentIds = ['energy-a', 'energy-b', 'energy-c', 'energy-d', 'energy-e', 'energy-f'];

/**
 * P0 continuity only: replace an exhausted Energy board during an unresolved Battle.
 * This deliberately owns no combat, energy, unit, or metrics state.
 */
export class BattleBoardExhaustionFallback {
  constructor(private readonly generator: BoardGenerator, private readonly deadlockResolver: DeadlockResolver) {}

  refreshIfNeeded(phase: GamePhase, board: BoardModel, enemyPressure: number): BoardModel | null {
    if (phase !== GamePhase.Battle || board.occupiedTiles().length !== 0 || enemyPressure <= 0) return null;
    const refreshed = this.generator.generate(RuleConfig.boardSize, energyContentIds, Math.random, 'Energy');
    const recovery = this.deadlockResolver.ensurePlayable(refreshed);
    if (!recovery.recovered) throw new Error(recovery.error ?? 'Fresh Energy board could not be made playable.');
    return refreshed;
  }
}

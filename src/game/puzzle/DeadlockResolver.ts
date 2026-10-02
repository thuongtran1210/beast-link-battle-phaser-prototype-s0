import { BoardGenerator } from './BoardGenerator';
import { BoardModel } from './BoardModel';
import { OnetMatcher } from './OnetMatcher';

export interface DeadlockResolution {
  recovered: boolean;
  reshuffled: boolean;
  attempts: number;
  error?: string;
}

/** DEADLOCK-001: bounded no-match recovery while preserving remaining content counts. */
export class DeadlockResolver {
  constructor(
    private readonly matcher: OnetMatcher,
    private readonly generator: BoardGenerator,
    private readonly maxRetries = 20,
  ) {}

  ensurePlayable(board: BoardModel, random = Math.random): DeadlockResolution {
    if (board.occupiedTiles().length < 2 || this.matcher.findAnyMatch(board)) {
      return { recovered: true, reshuffled: false, attempts: 0 };
    }

    for (let attempts = 1; attempts <= this.maxRetries; attempts += 1) {
      this.generator.reshuffleRemaining(board, random);
      if (this.matcher.findAnyMatch(board)) return { recovered: true, reshuffled: true, attempts };
    }
    return {
      recovered: false,
      reshuffled: true,
      attempts: this.maxRetries,
      error: `Deadlock recovery exhausted ${this.maxRetries} reshuffle attempts.`,
    };
  }
}

import { RuleConfig } from '../config/RuleConfig';
import { BoardGenerator } from '../puzzle/BoardGenerator';
import { allowsPuzzleInput, GamePhase } from './GamePhase';
import { PhaseController } from './PhaseController';

/** Deterministic P1-S0 graph and phase-presentation checks. */
export function runP1S0Checks(): void {
  const phase = new PhaseController();
  expect(phase.phase === GamePhase.BeastRush, 'initial phase is BeastRush');
  const generator = new BoardGenerator();
  const beasts = generator.generate(RuleConfig.boardSize, ['beast-a', 'beast-b'], Math.random, 'Beast');
  expect(beasts.occupiedTiles().every((tile) => tile.content.type === 'Beast') && allowsPuzzleInput(GamePhase.BeastRush), 'BeastRush is Beast-only with puzzle input');
  expect(phase.setPhase(GamePhase.EnergyRush) && phase.phase === GamePhase.EnergyRush, 'BeastRush ends at EnergyRush');
  const energy = generator.generate(RuleConfig.boardSize, ['energy-a', 'energy-b'], Math.random, 'Energy');
  expect(energy.occupiedTiles().every((tile) => tile.content.type === 'Energy') && allowsPuzzleInput(GamePhase.EnergyRush), 'EnergyRush is Energy-only with puzzle input');
  expect(phase.setPhase(GamePhase.BattleSetup) && phase.phase === GamePhase.BattleSetup, 'EnergyRush reaches BattleSetup');
  expect(!allowsPuzzleInput(GamePhase.BattleSetup), 'BattleSetup rejects puzzle input');
  expect(phase.setPhase(GamePhase.Battle) && phase.phase === GamePhase.Battle, 'Start Battle reaches Battle');
  expect(!allowsPuzzleInput(GamePhase.Battle), 'Battle has no puzzle board or input');
  expect(phase.setPhase(GamePhase.Result) && phase.phase === GamePhase.Result, 'Complete S0 Battle reaches Result');
  expect(phase.setPhase(GamePhase.BeastRush) && phase.phase === GamePhase.BeastRush, 'Restart returns to BeastRush');
  expect(!phase.setPhase(GamePhase.Battle) && phase.phase === GamePhase.BeastRush, 'illegal state skips are rejected');
}

function expect(value: boolean, label: string): void { if (!value) throw new Error(`P1-S0 check failed: ${label}`); }

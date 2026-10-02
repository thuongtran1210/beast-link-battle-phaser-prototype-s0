export enum GamePhase {
  BeastRush = 'BeastRush',
  EnergyRush = 'EnergyRush',
  BattleSetup = 'BattleSetup',
  Battle = 'Battle',
  Result = 'Result',
}

export function allowsPuzzleInput(phase: GamePhase): boolean {
  return phase === GamePhase.BeastRush || phase === GamePhase.EnergyRush;
}

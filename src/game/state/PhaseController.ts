import { GamePhase } from './GamePhase';

export type PhaseChangedHandler = (phase: GamePhase) => void;

/**
 * P1-S0 FLOW-001 state graph. Later slices add behavior within these states.
 */
export class PhaseController {
  private currentPhase = GamePhase.BeastRush;
  private readonly listeners = new Set<PhaseChangedHandler>();

  get phase(): GamePhase {
    return this.currentPhase;
  }

  setPhase(nextPhase: GamePhase): boolean {
    if (nextPhase === this.currentPhase) return true;
    if (!isLegalTransition(this.currentPhase, nextPhase)) return false;

    this.currentPhase = nextPhase;
    for (const listener of this.listeners) {
      listener(this.currentPhase);
    }
    return true;
  }

  subscribe(listener: PhaseChangedHandler): () => void {
    this.listeners.add(listener);
    listener(this.currentPhase);

    return () => this.listeners.delete(listener);
  }
}

function isLegalTransition(from: GamePhase, to: GamePhase): boolean {
  return (from === GamePhase.BeastRush && to === GamePhase.EnergyRush)
    || (from === GamePhase.EnergyRush && to === GamePhase.BattleSetup)
    || (from === GamePhase.BattleSetup && to === GamePhase.Battle)
    || (from === GamePhase.Battle && to === GamePhase.Result)
    || (from === GamePhase.Result && to === GamePhase.BeastRush);
}

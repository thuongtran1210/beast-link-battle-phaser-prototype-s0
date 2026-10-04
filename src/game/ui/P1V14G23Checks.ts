import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { tacticalEnergyCastFeedback } from './TacticalEnergyPresentation';

export function runP1V14G23Checks(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  formation.place('unit-1', 'front-1');
  const battle = new AutonomousBattleModel(formation, [], P1V13A_SIGNATURE_RULES, { 'unit-1': 50 });
  const feedback = tacticalEnergyCastFeedback({ success: true, energyId: 'energy-a', kind: 'Mend', reason: 'ok', targetUnitId: 'unit-1', amount: 30 }, battle.snapshot);
  if (feedback !== 'MEND → SNOWGUARD +30') throw new Error('P1V14G2 canonical Beast display name feedback failed');
}

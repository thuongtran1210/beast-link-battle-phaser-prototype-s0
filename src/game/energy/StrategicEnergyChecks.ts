import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES, type AutonomousBattleSnapshot } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { EnergyQueue } from './EnergyQueue';
import { STRATEGIC_ENERGY_POOL } from './TacticalEnergyCatalog';
export function strategicEnergyChecks(): void {
  const expect = (value: boolean, label: string) => { if (!value) throw new Error(`Strategic Energy: ${label}`); };
  const formation = new BattleFormation([{contentId: 'beast-a', star: 1}]);
  formation.place('unit-1', 'front-3');
  const model = new AutonomousBattleModel(formation, [{enemyId: 'e1', row: 'Front', column: 3, slotId: 'enemy-front-3', maxHp: 500, damage: 20}], P1V13A_SIGNATURE_RULES);
  const fixture = model as unknown as {state: AutonomousBattleSnapshot; resolveTimelineEnemies(dt: number): void};
  const queue = new EnergyQueue(); queue.addCharge('energy-e', 2); queue.addCharge('energy-f', 2);
  const hp = fixture.state.units[0].currentHp;
  expect(model.castTacticalEnergy('energy-e', queue).success, 'Guard works at full HP');
  expect(fixture.state.units[0].currentHp === hp && fixture.state.units[0].temporaryShieldHp === 60, 'Guard shields instead of heals');
  expect(!model.castTacticalEnergy('energy-e', queue).success && queue.getCharges('energy-e') === 1, 'active shield prevents charge waste');
  fixture.state.enemies[0].attackWindupRemaining = .5;
  expect(model.tacticalEnergyEligibility('energy-f', queue).availability === 'suggested', 'Disrupt suggests enemy windup');
  expect(model.castTacticalEnergy('energy-f', queue).success, 'Disrupt casts');
  expect(fixture.state.enemies[0].attackWindupRemaining === 0 && fixture.state.enemies[0].currentHp === 500, 'Disrupt cancels attack without damage');
  expect(!model.castTacticalEnergy('energy-f', queue).success && queue.getCharges('energy-f') === 1, 'already controlled enemy is excluded');
  fixture.state.elapsedTime = 1.1; fixture.resolveTimelineEnemies(.1);
  expect(fixture.state.enemies[0].funControlKind === undefined, 'Disrupt expires');
  expect(STRATEGIC_ENERGY_POOL.join(',') === 'energy-a,energy-e,energy-c,energy-f', 'player pool contains four strategic identities');
}

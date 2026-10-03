import { AutonomousBattleModel } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { P1V14B_ACTIVE_SQUAD_LIMIT } from '../run/RunRoster';

function expect(value: unknown, label: string): asserts value { if (!value) throw new Error(`P1-V14F.1 check failed: ${label}`); }
function model(): AutonomousBattleModel { const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]); formation.place(formation.units[0].unitId, 'front-1'); return new AutonomousBattleModel(formation); }
export function runP1V14F1Checks(): void {
  expect(P1V14B_ACTIVE_SQUAD_LIMIT === 4, 'production Active Squad cap remains 4');
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]); expect(formation.slots.length === 18, 'formation remains 18 positions');
  formation.place(formation.units[0].unitId, 'front-1'); const battle = new AutonomousBattleModel(formation, undefined, undefined, { [formation.units[0].unitId]: 62 }); const energy = new EnergyQueue(); energy.addCharge('energy-a', 2); const target = battle.frontmostAliveUnit()!;
  const eligibility = battle.frontlineHealEligibility('energy-a', energy); expect(eligibility.success && eligibility.healedAmount === 18, 'damaged frontline is eligible for actual missing amount');
  const success = battle.castFrontlineHealResult('energy-a', energy); expect(success.success && success.targetUnitId === target.unitId && success.healedAmount === 18, 'successful cast reports target and actual heal'); expect(energy.getCharges('energy-a') === 1, 'successful cast consumes exactly one selected charge');
  const full = battle.castFrontlineHealResult('energy-a', energy); expect(!full.success && full.reason === 'target-full-hp' && full.healedAmount === 0, 'full frontline reports deterministic failure'); expect(energy.getCharges('energy-a') === 1, 'full frontline consumes zero energy');
  const noCharge = battle.frontlineHealEligibility('energy-b', energy); expect(!noCharge.success && noCharge.reason === 'no-charge', 'missing selected charge is deterministic');
}

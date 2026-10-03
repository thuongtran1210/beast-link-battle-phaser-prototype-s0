import { AutonomousBattleModel, type EnemyFixture, P1V13A_SIGNATURE_RULES } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { V14G_ENERGY_RUSH_POOL, tacticalEnergyDefinition } from './TacticalEnergyCatalog';
import { EnergyQueue } from './EnergyQueue';

function expect(value: unknown, label: string): asserts value { if (!value) throw new Error(`P1-V14G.1 check failed: ${label}`); }
const enemy = (enemyId: string, archetype: 'Frontliner' | 'Diver' | 'Ranged', maxHp = 100, row: 'Front' | 'Mid' | 'Back' = 'Front'): EnemyFixture => ({ enemyId, slotId: enemyId, row, column: 3, maxHp, damage: 10, archetype });
function battle(units: Array<{ contentId: string; slot: string }>, enemies: EnemyFixture[], hp: Record<string, number> = {}): AutonomousBattleModel {
  const formation = new BattleFormation(units.map(({ contentId }) => ({ contentId, star: 1 as const })));
  formation.units.forEach((unit, index) => formation.place(unit.unitId, units[index].slot));
  return new AutonomousBattleModel(formation, enemies, P1V13A_SIGNATURE_RULES, hp);
}

export function runP1V14G1Checks(): void {
  // Catalog / generation compatibility.
  expect(tacticalEnergyDefinition('energy-a')?.kind === 'Mend', '1 catalog maps A to MEND');
  expect(tacticalEnergyDefinition('energy-b')?.kind === 'Rescue', '2 catalog maps B to RESCUE');
  expect(tacticalEnergyDefinition('energy-c')?.kind === 'Break', '3 catalog maps C to BREAK');
  expect(tacticalEnergyDefinition('energy-d')?.kind === 'Pierce', '4 catalog maps D to PIERCE');
  expect(V14G_ENERGY_RUSH_POOL.join(',') === 'energy-a,energy-b,energy-c,energy-d', '5 active pool is exactly A-D');
  const generic = new EnergyQueue(); generic.addCharge('energy-e', 2); generic.addCharge('energy-f');
  expect(generic.getTotalCharges() === 3 && generic.consumeCharge('energy-e'), '6 generic queue keeps E/F compatibility');

  const mend = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('front', 'Frontliner')], { 'unit-1': 50 });
  const mendQueue = new EnergyQueue(); mendQueue.addCharge('energy-a', 2);
  expect(mend.tacticalEnergyEligibility('energy-a', mendQueue).availability === 'suggested', '7 injured frontline suggests MEND');
  const mendCast = mend.castTacticalEnergy('energy-a', mendQueue);
  expect(mendCast.success && mendCast.amount === 30 && mendQueue.getCharges('energy-a') === 1, '8 MEND heals 30 and consumes one');
  const mendPartial = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('front', 'Frontliner')], { 'unit-1': 62 });
  const partialQueue = new EnergyQueue(); partialQueue.addCharge('energy-a');
  expect(mendPartial.castTacticalEnergy('energy-a', partialQueue).amount === 18 && partialQueue.getCharges('energy-a') === 0, '9 MEND heals exact missing HP');
  expect(mendPartial.tacticalEnergyEligibility('energy-a', partialQueue).reason === 'no-charge', '10 no selected charge disables tactical energy');
  const full = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('front', 'Frontliner')]); const fullQueue = new EnergyQueue(); fullQueue.addCharge('energy-a');
  expect(full.tacticalEnergyEligibility('energy-a', fullQueue).reason === 'target-full-hp' && !full.castTacticalEnergy('energy-a', fullQueue).success && fullQueue.getCharges('energy-a') === 1, '11 full MEND consumes zero');
  expect(full.frontlineHealEligibility('energy-a', fullQueue).reason === 'target-full-hp', '12 legacy frontline heal remains authoritative');

  const rescue = battle([{ contentId: 'beast-a', slot: 'front-1' }, { contentId: 'beast-c', slot: 'mid-1' }, { contentId: 'beast-d', slot: 'back-1' }], [enemy('front', 'Frontliner')], { 'unit-2': 5, 'unit-3': 10 });
  const rescueQueue = new EnergyQueue(); rescueQueue.addCharge('energy-b', 2);
  expect(rescue.tacticalEnergyEligibility('energy-b', rescueQueue).targetUnitId === 'unit-2', '13 RESCUE chooses highest missing HP');
  expect(rescue.castTacticalEnergy('energy-b', rescueQueue).amount === 30 && rescueQueue.getCharges('energy-b') === 1, '14 RESCUE heals and consumes one');
  const rescueTie = battle([{ contentId: 'beast-a', slot: 'front-1' }, { contentId: 'beast-c', slot: 'mid-1' }, { contentId: 'beast-d', slot: 'back-1' }], [enemy('front', 'Frontliner')], { 'unit-2': 15, 'unit-3': 10 });
  const rescueTieQueue = new EnergyQueue(); rescueTieQueue.addCharge('energy-b');
  expect(rescueTie.tacticalEnergyEligibility('energy-b', rescueTieQueue).targetUnitId === 'unit-2' && rescueTie.tacticalEnergyEligibility('energy-b', rescueTieQueue).availability === 'suggested', '15 RESCUE tie breaks by stable ID and suggests low HP');
  const frontOnly = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('front', 'Frontliner')], { 'unit-1': 10 }); const frontOnlyQueue = new EnergyQueue(); frontOnlyQueue.addCharge('energy-b');
  expect(frontOnly.tacticalEnergyEligibility('energy-b', frontOnlyQueue).reason === 'no-target' && !frontOnly.castTacticalEnergy('energy-b', frontOnlyQueue).success && frontOnlyQueue.getCharges('energy-b') === 1, '16 RESCUE excludes Front row');

  const breakBattle = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('far', 'Frontliner', 100, 'Back'), enemy('near', 'Frontliner', 12, 'Front')]); const breakQueue = new EnergyQueue(); breakQueue.addCharge('energy-c', 2);
  expect(breakBattle.tacticalEnergyEligibility('energy-c', breakQueue).targetEnemyId === 'near' && breakBattle.tacticalEnergyEligibility('energy-c', breakQueue).availability === 'suggested', '17 BREAK chooses closest frontline and suggests pressure');
  const breakCast = breakBattle.castTacticalEnergy('energy-c', breakQueue);
  expect(breakCast.success && breakCast.amount === 12 && breakQueue.getCharges('energy-c') === 1 && breakBattle.snapshot.enemies.find((entry) => entry.enemyId === 'near')?.currentHp === 0, '18 BREAK clamps damage, consumes once, and syncs target');
  expect(breakBattle.snapshot.enemyHp === 100 && breakBattle.snapshot.lastPlayerActions?.length === 0, '19 BREAK updates aggregate without Beast action');
  const noBreak = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('ranged', 'Ranged')]); const noBreakQueue = new EnergyQueue(); noBreakQueue.addCharge('energy-c');
  expect(noBreak.tacticalEnergyEligibility('energy-c', noBreakQueue).reason === 'no-frontliner' && !noBreak.castTacticalEnergy('energy-c', noBreakQueue).success && noBreakQueue.getCharges('energy-c') === 1, '20 no BREAK target consumes zero');

  const pierceBattle = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('front', 'Frontliner'), enemy('ranged-b', 'Ranged', 20, 'Back'), enemy('ranged-a', 'Ranged', 20, 'Back')]); const pierceQueue = new EnergyQueue(); pierceQueue.addCharge('energy-d');
  const beforeTarget = pierceBattle.snapshot.units[0].targetEnemyId;
  expect(pierceBattle.tacticalEnergyEligibility('energy-d', pierceQueue).targetEnemyId === 'ranged-a' && pierceBattle.tacticalEnergyEligibility('energy-d', pierceQueue).availability === 'suggested', '21 PIERCE uses HP then ID and suggests protected ranged');
  expect(pierceBattle.castTacticalEnergy('energy-d', pierceQueue).amount === 20 && pierceQueue.getCharges('energy-d') === 0 && pierceBattle.snapshot.units[0].targetEnemyId === beforeTarget, '22 PIERCE bypasses target ordering without changing it');
  const loneRanged = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('ranged', 'Ranged')]); const loneQueue = new EnergyQueue(); loneQueue.addCharge('energy-d');
  expect(loneRanged.tacticalEnergyEligibility('energy-d', loneQueue).availability === 'ready', '23 lone Ranged makes PIERCE ready');
  const terminalQueue = new EnergyQueue(); terminalQueue.addCharge('energy-c'); const terminal = battle([{ contentId: 'beast-a', slot: 'front-1' }], [enemy('last', 'Frontliner', 12)]);
  expect(terminal.castTacticalEnergy('energy-c', terminalQueue).success && terminal.snapshot.status === 'Win' && terminal.snapshot.enemyHp === 0, '24 direct Energy kill synchronizes terminal Win');
  expect(!terminal.castTacticalEnergy('energy-c', terminalQueue).success && terminalQueue.getCharges('energy-c') === 0, '25 terminal cast consumes zero');
  expect(mend.tacticalEnergyEligibility('energy-e', generic).reason === 'unsupported-energy' && !mend.castTacticalEnergy('energy-f', generic).success, '26 E/F are unsupported tactical casts');
  expect(mendQueue.getCharges('energy-a') === 1, '27 suggestion never auto-casts');
}

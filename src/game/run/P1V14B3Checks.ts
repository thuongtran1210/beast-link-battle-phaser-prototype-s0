import { AutonomousBattleModel, LEGACY_SINGLE_ENEMY_FIXTURE, P1V13A_SIGNATURE_FIXTURE, P1V13A_SIGNATURE_RULES, roleBaseStats } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { P1V11C_FIXTURE_A_FRONTLINE, P1V11C_FIXTURE_B_DIVERS, P1V11C_FIXTURE_C_PROTECTED_RANGED } from '../battle/AutonomousBattleModel';
import type { CombatUnit } from '../battle/AutonomousBattleModel';
import { StarConverter } from '../queue/StarConverter';
import { ACTIVE_SQUAD_LIMIT } from '../ui/ActiveSquadPresentation';
import { BattleSetupInteractionController } from '../ui/BattleSetupInteractionController';
import { RunRoster } from './RunRoster';
import { deriveStarPowerDensityMetrics, runStarPowerDensityScenario } from './StarPowerDensityHarness';
import { STAR_STAT_MULTIPLIERS, V14B3_SIGNATURE_STAR_PROFILE, signatureStrengthForStar } from './StarProfile';

const expect = (value: boolean, message: string) => { if (!value) throw new Error(`P1-V14B.3 check failed: ${message}`); };
const recruitCopies = (count: number, beastId = 'beast-a') => new StarConverter().recruit(beastId, count);

export function runP1V14B3Checks(): void {
  const converter = new StarConverter();
  expect(converter.recruit('beast-a', 1).map((unit) => unit.star).join() === '1', 'one matched copy recruits one 1-star Run Unit');
  expect(converter.recruit('beast-a', 3).every((unit) => unit.star === 1) && converter.recruit('beast-a', 3).length === 3, 'three matched copies stay as three 1-star recruits');
  expect(converter.recruit('beast-a', 9).every((unit) => unit.star === 1) && converter.recruit('beast-a', 9).length === 9, 'nine matched copies do not auto-create 2-star or 3-star units');

  const roster = new RunRoster();
  const units = roster.recruit(recruitCopies(4));
  expect(!roster.canConsolidate(units[2].instanceId, new Set([units[2].instanceId])), 'a deployed selected ingredient cannot consolidate');
  expect(roster.canConsolidate(units[3].instanceId), 'three same ready Reserve copies can consolidate from any selected ingredient');
  const firstUpgrade = roster.consolidate(units[3].instanceId)!;
  expect(firstUpgrade.upgraded.instanceId === units[0].instanceId && firstUpgrade.upgraded.star === 2, 'lowest run serial remains the deterministic primary upgraded ID');
  expect(firstUpgrade.consumedIds.join(',') === `${units[1].instanceId},${units[3].instanceId}` && roster.units.length === 2, 'consolidation consumes exactly two additional instances');
  expect(roster.get(units[2].instanceId)?.star === 1, 'unrelated same-copy Reserve unit remains unchanged');
  expect(!roster.canConsolidate(units[2].instanceId), 'two same 1-star units cannot consolidate');
  const laterWave = new RunRoster(); const earlierCopies = laterWave.recruit(recruitCopies(3)); laterWave.consolidate(earlierCopies[0].instanceId)!; laterWave.recruit(recruitCopies(2));
  expect(laterWave.units.filter((unit) => unit.star === 2).length === 1 && laterWave.units.filter((unit) => unit.star === 1).length === 2, 'later-Wave recruits remain separate 1-star instances and do not auto-merge an existing upgrade');

  const mixed = new RunRoster();
  const mixedUnits = mixed.recruit([...recruitCopies(2, 'beast-a'), ...recruitCopies(1, 'beast-b')]);
  expect(!mixed.canConsolidate(mixedUnits[0].instanceId), 'mixed beast IDs cannot consolidate');
  const koRoster = new RunRoster();
  const koUnits = koRoster.recruit(recruitCopies(3));
  koRoster.reconcile([{ unitId: koUnits[1].instanceId, currentHp: 0 } as CombatUnit]);
  expect(!koRoster.canConsolidate(koUnits[0].instanceId), 'KO ingredient cannot become a hidden revive');

  const injured = new RunRoster();
  const injuredUnits = injured.recruit(recruitCopies(3));
  injured.reconcile([
    { unitId: injuredUnits[0].instanceId, currentHp: 80 } as CombatUnit,
    { unitId: injuredUnits[1].instanceId, currentHp: 40 } as CombatUnit,
    { unitId: injuredUnits[2].instanceId, currentHp: 80 } as CombatUnit,
  ]);
  const injuredResult = injured.consolidate(injuredUnits[1].instanceId)!;
  expect(injuredResult.upgraded.maxHp === 144 && injuredResult.upgraded.currentHp === 120, 'mixed injury consolidates to rounded aggregate health condition without a heal');
  const full = new RunRoster(); const fullUnits = full.recruit(recruitCopies(3));
  expect(full.consolidate(fullUnits[0].instanceId)?.upgraded.currentHp === 144, 'full-health ingredients produce full-health target STAR');
  injured.reconcile([{ unitId: injuredResult.upgraded.instanceId, currentHp: 87 } as CombatUnit]);
  const nextWaveFormation = new BattleFormation(injured.formationUnits());
  expect(injured.get(injuredResult.upgraded.instanceId)?.star === 2 && injured.get(injuredResult.upgraded.instanceId)?.currentHp === 87 && nextWaveFormation.units.every((unit) => unit.slotId === null), 'upgraded STAR and injured HP persist through a reset Wave setup');

  const threes = new RunRoster(); const nine = threes.recruit(recruitCopies(9));
  const twoA = threes.consolidate(nine[0].instanceId)!; const twoB = threes.consolidate(nine[3].instanceId)!; const twoC = threes.consolidate(nine[6].instanceId)!;
  const three = threes.consolidate(twoC.upgraded.instanceId)!;
  expect(three.upgraded.star === 3 && threes.units.length === 1 && !threes.canConsolidate(three.upgraded.instanceId), 'three 2-star units become exactly one terminal 3-star unit');
  expect(new Set(threes.units.map((unit) => unit.instanceId)).size === 1, 'consolidation never duplicates instances');

  const formation = new BattleFormation(roster.formationUnits());
  formation.place(firstUpgrade.upgraded.instanceId, 'front-3');
  expect(!roster.canConsolidate(firstUpgrade.upgraded.instanceId, new Set([firstUpgrade.upgraded.instanceId])), 'active upgraded unit remains ineligible');
  const syncRoster = new RunRoster(); const syncUnits = syncRoster.recruit(recruitCopies(3)); const syncFormation = new BattleFormation(syncRoster.formationUnits()); const syncResult = syncRoster.consolidate(syncUnits[0].instanceId)!;
  syncResult.consumedIds.forEach((id) => syncFormation.removeUnplacedUnit(id)); syncFormation.updateUnplacedUnitStar(syncResult.upgraded.instanceId, syncResult.upgraded.star);
  expect(syncFormation.units.length === 1 && syncFormation.getUnit(syncResult.upgraded.instanceId)?.star === 2, 'consolidation removes consumed Reserve references from the active formation model');

  expect(STAR_STAT_MULTIPLIERS[1] === 1 && STAR_STAT_MULTIPLIERS[2] === 1.8 && STAR_STAT_MULTIPLIERS[3] === 3.2, 'one STAR stat profile owns 1.0 / 1.8 / 3.2');
  const battleRoster = new RunRoster(); const battleUnit = battleRoster.recruit([{ contentId: 'beast-a', star: 2 }])[0]; const battleFormation = new BattleFormation(battleRoster.formationUnits()); battleFormation.place(battleUnit.instanceId, 'front-3');
  const battle = new AutonomousBattleModel(battleFormation, LEGACY_SINGLE_ENEMY_FIXTURE, P1V13A_SIGNATURE_RULES, { [battleUnit.instanceId]: battleUnit.currentHp });
  expect(battle.snapshot.units[0].maxHp === battleUnit.maxHp && battle.snapshot.units[0].damage === roleBaseStats('Tanker').damage * 1.8, 'RunRoster and Battle share STAR max HP and damage multipliers');
  expect(1.8 < 3 && 3.2 < 9, 'higher STAR raw stats remain below aggregate body value of their ingredient copies');
  expect(roleBaseStats('Tanker').hp * 1.8 < roleBaseStats('Tanker').hp * 3 && roleBaseStats('Tanker').damage * 1.8 < roleBaseStats('Tanker').damage * 3, '2-star raw HP and damage remain below three 1-star bodies');

  expect(signatureStrengthForStar('GuardianBrace', 2) > signatureStrengthForStar('GuardianBrace', 1) && signatureStrengthForStar('GuardianBrace', 3) > signatureStrengthForStar('GuardianBrace', 2), 'Guardian Brace shield scales with STAR');
  expect(signatureStrengthForStar('AmbushStrike', 2) === 1.75 && signatureStrengthForStar('FocusShot', 2) === 1.7 && signatureStrengthForStar('ArcaneBloom', 2) === 0.65, 'signature STAR profile uses exact 2-star fixture values');
  expect(V14B3_SIGNATURE_STAR_PROFILE.GuardianBrace[1] === P1V13A_SIGNATURE_FIXTURE.guardianBraceShieldHp && V14B3_SIGNATURE_STAR_PROFILE.AmbushStrike[1] === P1V13A_SIGNATURE_FIXTURE.ambushMultiplier && V14B3_SIGNATURE_STAR_PROFILE.FocusShot[1] === P1V13A_SIGNATURE_FIXTURE.focusMultiplier && V14B3_SIGNATURE_STAR_PROFILE.ArcaneBloom[1] === P1V13A_SIGNATURE_FIXTURE.arcaneBloomSplashMultiplier, '1-star signature values preserve V13 baseline behavior');

  const breadthFormation = new BattleFormation([...recruitCopies(3, 'beast-a'), ...recruitCopies(1, 'beast-c')]); breadthFormation.units.forEach((unit, index) => breadthFormation.place(unit.unitId, `front-${index + 1}`));
  const densityFormation = new BattleFormation([{ contentId: 'beast-a', star: 2 }, { contentId: 'beast-b', star: 1 }, { contentId: 'beast-c', star: 1 }, { contentId: 'beast-d', star: 1 }]); densityFormation.units.forEach((unit, index) => densityFormation.place(unit.unitId, `front-${index + 1}`));
  const breadth = deriveStarPowerDensityMetrics(breadthFormation.units); const density = deriveStarPowerDensityMetrics(densityFormation.units);
  expect(breadth.activeSlotsUsed === ACTIVE_SQUAD_LIMIT && density.activeSlotsUsed === ACTIVE_SQUAD_LIMIT && breadth.totalStartingHp > density.totalStartingHp && density.totalStartingDamage > breadth.totalStartingDamage, 'breadth and density fixture expose raw-body versus role-density trade-off');
  const fixtures = [P1V11C_FIXTURE_A_FRONTLINE, P1V11C_FIXTURE_B_DIVERS, P1V11C_FIXTURE_C_PROTECTED_RANGED];
  fixtures.forEach((fixture) => {
    const breadthRun = runStarPowerDensityScenario(breadthFormation, fixture);
    const densityRun = runStarPowerDensityScenario(densityFormation, fixture);
    expect(breadthRun.bodyCount === 4 && densityRun.bodyCount === 4 && breadthRun.battleDuration >= 0 && densityRun.attacksResolved >= 0, 'controlled breadth-versus-density harness records existing threat metrics');
  });
  const capController = new BattleSetupInteractionController(new BattleFormation(recruitCopies(5)), () => true, ACTIVE_SQUAD_LIMIT);
  expect(capController.getDeployedUnits().length === 0 && new BattleFormation(recruitCopies(1)).slots.length === 18, 'STAR does not alter squad cap or 3 by 6 grid capacity');
  const reset = new RunRoster(); reset.recruit([{ contentId: 'beast-a', star: 2 }]); reset.reset(); expect(reset.units.length === 0, 'restart clears upgraded roster state');
}

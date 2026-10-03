import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { P1V13A1_LEVELS, fixturesForLevel } from '../battle/ValidationLevels';
import { RunRoster } from './RunRoster';
import { BattleSetupInteractionController } from '../ui/BattleSetupInteractionController';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`P1-V14B check failed: ${m}`); };
export function runP1V14BChecks(): void {
  const roster = new RunRoster(); const units = roster.recruit([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }]);
  expect(new Set(units.map((u) => u.instanceId)).size === 3, 'duplicate beasts receive stable unique identities');
  const formation = new BattleFormation(roster.formationUnits()); expect(!formation.allPlaced, 'zero deployed units is not ready');
  formation.place(units[0].instanceId, 'front-3'); expect(formation.units.filter((u) => u.slotId !== null).length === 1, 'one active unit permits partial deployment while reserve remains');
  const hp = units[0].maxHp - 15; const battle = new AutonomousBattleModel(formation, fixturesForLevel(P1V13A1_LEVELS[0]), P1V13A_SIGNATURE_RULES, { [units[0].instanceId]: hp });
  expect(battle.snapshot.units[0].currentHp === hp, 'battle spawns from persistent HP');
  battle.snapshot.units[0].currentHp; roster.reconcile([{ ...battle.snapshot.units[0], currentHp: hp - 10 }]);
  expect(roster.get(units[0].instanceId)?.currentHp === hp - 10, 'battle HP reconciles by instance ID');
  roster.reconcile([{ ...battle.snapshot.units[0], currentHp: 0 }]); expect(roster.get(units[0].instanceId)?.status === 'ko' && !roster.canDeploy(units[0].instanceId), 'KO persists and cannot deploy');
  const capRoster = new RunRoster(); const capUnits = capRoster.recruit([1, 2, 3, 4, 5].map(() => ({ contentId: 'beast-c', star: 1 as const }))); const capFormation = new BattleFormation(capRoster.formationUnits()); const controller = new BattleSetupInteractionController(capFormation, (id) => capRoster.canDeploy(id), 4);
  capUnits.slice(0, 4).forEach((unit, index) => { controller.startDragFromTray(unit.instanceId); controller.commitDrop(`front-${index + 1}`, false); });
  controller.startDragFromTray(capUnits[4].instanceId); expect(controller.commitDrop('front-5', false).type === 'rejected', 'fifth living unit is rejected at placement time');
}

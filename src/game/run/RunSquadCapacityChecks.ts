import { RunRoster } from './RunRoster';
import { RunLinkShardPool } from './RunLinkShardPool';
import { BattleFormation } from '../battle/BattleFormation';
import { BattleSetupInteractionController } from '../ui/BattleSetupInteractionController';
import { formationBoardSummary } from '../ui/BattleSetupPresentation';

export function runSquadCapacityChecks(): void {
  const expect = (ok: boolean, message: string) => { if (!ok) throw new Error(`Squad capacity: ${message}`); };
  const roster = new RunRoster();
  const shards = new RunLinkShardPool();
  shards.award(1);
  expect(!roster.buyFifthSlot(shards) && shards.count === 1 && roster.squadLimit === 4, 'insufficient shards preserve state');
  const formation = new BattleFormation(Array.from({ length: 6 }, () => ({ contentId: 'beast-a', star: 1 as const })));
  const controller = new BattleSetupInteractionController(formation, () => true, () => roster.squadLimit);
  const place = (unit: number, slot: string) => { controller.selectUnit(`unit-${unit}`); return controller.clickSlot(slot); };
  for (let i = 1; i <= 4; i++) expect(place(i, `front-${i}`).type === 'placed', 'initial four deploy');
  expect(place(5, 'front-5').type === 'rejected', 'fifth blocked before upgrade');
  shards.award(2);
  expect(roster.buyFifthSlot(shards) && shards.count === 1 && roster.squadLimit === 5, 'purchase costs exactly two');
  expect(!roster.buyFifthSlot(shards) && shards.count === 1, 'repeat purchase cannot spend');
  expect(place(5, 'front-5').type === 'placed', 'fifth deploys after upgrade');
  expect(place(6, 'front-6').type === 'rejected', 'sixth blocked');
  expect(place(1, 'back-1').type === 'moved', 'deployed unit moves at capacity');
  roster.recruit([{ contentId: 'beast-a', star: 1 }]);
  roster.reconcile([]);
  expect(roster.squadLimit === 5 && formationBoardSummary(5, 18, roster.squadLimit).includes('5 / 5'), 'wave roster operations preserve cap and summary');
  roster.reset();
  expect(roster.squadLimit === 4, 'new Run resets capacity');
}

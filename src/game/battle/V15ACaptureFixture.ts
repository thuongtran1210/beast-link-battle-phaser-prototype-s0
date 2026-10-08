import type { DeployedUnit } from '../queue/StarConverter';
import { BattleFormation } from '../battle/BattleFormation';
import type { EnemyFixture } from '../battle/AutonomousBattleModel';
import type { BattleQueue } from '../queue/BattleQueue';
import type { RunRoster } from '../run/RunRoster';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { RunLinkShardPool } from '../run/RunLinkShardPool';
import type { BattleFixtureManager } from '../battle/BattleFixtureManager';

export const V15A_CAPTURE_ENEMY_FIXTURES: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'capture-front-2', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 320, damage: 3, archetype: 'Frontliner' },
  { enemyId: 'capture-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 320, damage: 3, archetype: 'Frontliner' },
  { enemyId: 'capture-diver-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 260, damage: 3, archetype: 'Diver' },
  { enemyId: 'capture-ranged-3', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 280, damage: 3, archetype: 'Ranged' },
];

export function setupV15ACapturePreset(
  battleQueue: BattleQueue,
  runRoster: RunRoster,
  energyQueue: EnergyQueue,
  shardPool: RunLinkShardPool,
  fixtureManager: BattleFixtureManager,
): { formation: BattleFormation; captureEnemyFixtures: ReadonlyArray<EnemyFixture> } {
  battleQueue.clear();
  runRoster.reset();
  energyQueue.reset();
  shardPool.reset();
  fixtureManager.clearActiveKey();

  runRoster.recruit([
    { contentId: 'beast-d', star: 3 }, // Starcaller — Arcane Bloom III
    { contentId: 'beast-e', star: 2 }, // Ironclad — Iron Ram II
    { contentId: 'beast-f', star: 2 }, // Swiftwing — Twin Volley II
    { contentId: 'beast-a', star: 1 }, // Snowguard — Guardian Brace I
    { contentId: 'beast-c', star: 1 }, // Windstrider reserve
    { contentId: 'beast-b', star: 3 }, // Shadowclaw reserve
  ] as DeployedUnit[]);

  const formation = new BattleFormation(runRoster.formationUnits());
  const units = runRoster.units;
  const byBeast = (beastId: string) => units.find((unit) => unit.beastId === beastId)?.instanceId;
  const placements: Array<[string | undefined, string]> = [
    [byBeast('beast-d'), 'back-2'],
    [byBeast('beast-e'), 'front-3'],
    [byBeast('beast-f'), 'back-4'],
    [byBeast('beast-a'), 'front-4'],
  ];
  placements.forEach(([unitId, slotId]) => {
    if (unitId) formation.place(unitId, slotId);
  });

  ['energy-a', 'energy-b', 'energy-c', 'energy-d'].forEach((energyId) => {
    energyQueue.addCharge(energyId, 3);
  });
  shardPool.award(2);

  return { formation, captureEnemyFixtures: V15A_CAPTURE_ENEMY_FIXTURES };
}

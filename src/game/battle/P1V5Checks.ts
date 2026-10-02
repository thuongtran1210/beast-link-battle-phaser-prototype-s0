import { AutonomousBattleModel, type EnemyFixture } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';

export const P1V5_ENEMY_FIXTURES: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-a', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 65, damage: 6 },
  { enemyId: 'enemy-b', slotId: 'enemy-front-5', row: 'Front', column: 5, maxHp: 65, damage: 6 },
  { enemyId: 'enemy-c', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 65, damage: 6 },
  { enemyId: 'enemy-d', slotId: 'enemy-mid-4', row: 'Mid', column: 4, maxHp: 65, damage: 6 },
];

export function runP1V5Checks(): void {
  const formation = makeFormation();
  const battle = new AutonomousBattleModel(formation, P1V5_ENEMY_FIXTURES);

  expect(battle.snapshot.enemies.length === 4, 'P1-V5 starts with four enemies');
  expect(battle.snapshot.enemyHp === 260 && battle.snapshot.enemyMaxHp === 260, 'aggregate enemy HP is 260');
  expect(battle.snapshot.enemyDamage === 24, 'opening aggregate enemy damage is 24');

  expect(
    battle.frontmostAliveEnemy()?.enemyId === 'enemy-a',
    'player targeting prioritizes Front row then lower enemy column',
  );

  const beforeHp = battle.snapshot.units[0].currentHp;
  battle.tick();
  expect(
    battle.snapshot.units[0].currentHp === Math.max(0, beforeHp - 24),
    'all living enemies contribute to frontline incoming damage',
  );

  const strong = new AutonomousBattleModel(strongFormation(), P1V5_ENEMY_FIXTURES);
  const damageBefore = strong.snapshot.enemyDamage;
  while (strong.snapshot.status === 'Running' && strong.snapshot.enemies.filter((enemy) => enemy.currentHp > 0).length === 4) {
    strong.tick();
  }
  expect(strong.snapshot.enemyDamage < damageBefore, 'enemy squad pressure decreases after an enemy is defeated');

  while (strong.snapshot.status === 'Running') strong.tick();
  expect(strong.snapshot.status === 'Win', 'strong P1-V5 fixture can defeat the full enemy squad');
}

function makeFormation(): BattleFormation {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  formation.place(formation.units[0].unitId, 'front-1');
  return formation;
}

function strongFormation(): BattleFormation {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 3 },
    { contentId: 'beast-b', star: 3 },
    { contentId: 'beast-c', star: 3 },
    { contentId: 'beast-d', star: 3 },
  ]);
  ['front-1', 'front-2', 'mid-1', 'back-1'].forEach((slot, index) => {
    formation.place(formation.units[index].unitId, slot);
  });
  return formation;
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-V5 check failed: ${label}`);
}

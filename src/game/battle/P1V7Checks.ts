import { AutonomousBattleModel, type EnemyFixture } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';

export const P1V7_ENEMY_FIXTURES: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-a', slotId: 'enemy-front-1', row: 'Front', column: 1, maxHp: 160, damage: 3 },
  { enemyId: 'enemy-b', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 160, damage: 3 },
  { enemyId: 'enemy-c', slotId: 'enemy-front-5', row: 'Front', column: 5, maxHp: 160, damage: 3 },
  { enemyId: 'enemy-d', slotId: 'enemy-mid-2', row: 'Mid', column: 2, maxHp: 160, damage: 3 },
  { enemyId: 'enemy-e', slotId: 'enemy-mid-4', row: 'Mid', column: 4, maxHp: 160, damage: 3 },
  { enemyId: 'enemy-f', slotId: 'enemy-mid-6', row: 'Mid', column: 6, maxHp: 160, damage: 3 },
];

/**
 * P1-V7 validation-only combat pressure fixture.
 * Goal: prevent 1–2 second battles and create enough time for formation/Heal decisions.
 */
export function runP1V7Checks(): void {
  const formation = representativeFormation();
  const battle = new AutonomousBattleModel(formation, P1V7_ENEMY_FIXTURES);

  expect(battle.snapshot.enemies.length === 6, 'P1-V7 starts with six enemies');
  expect(battle.snapshot.enemyHp === 960 && battle.snapshot.enemyMaxHp === 960, 'aggregate enemy HP is 960');
  expect(battle.snapshot.enemyDamage === 18, 'opening aggregate enemy damage is 18 per tick');

  let ticks = 0;
  let sawPressureDrop = false;
  let previousDamage = battle.snapshot.enemyDamage;

  while (battle.snapshot.status === 'Running' && ticks < 60) {
    battle.tick();
    ticks += 1;
    if (battle.snapshot.enemyDamage < previousDamage) sawPressureDrop = true;
    previousDamage = battle.snapshot.enemyDamage;
  }

  expect(ticks >= 10, 'representative battle does not resolve before 10 ticks');
  expect(ticks <= 30, 'representative battle resolves within a practical validation window');
  expect(battle.snapshot.status === 'Win', 'representative validation formation can defeat the squad');
  expect(sawPressureDrop, 'enemy pressure decreases as squad members are defeated');
}

function representativeFormation(): BattleFormation {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-f', star: 1 },
    { contentId: 'beast-f', star: 1 },
    { contentId: 'beast-c', star: 1 },
    { contentId: 'beast-c', star: 1 },
    { contentId: 'beast-b', star: 1 },
    { contentId: 'beast-b', star: 1 },
  ]);

  const slots = [
    'front-3',
    'back-3',
    'back-4',
    'mid-3',
    'mid-4',
    'front-4',
    'front-5',
  ];

  slots.forEach((slotId, index) => {
    formation.place(formation.units[index].unitId, slotId);
  });

  return formation;
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-V7 check failed: ${label}`);
}

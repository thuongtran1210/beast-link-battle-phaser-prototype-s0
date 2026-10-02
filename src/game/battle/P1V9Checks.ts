import {
  AutonomousBattleModel,
  P1V9_AUTONOMOUS_MOVEMENT_RULES,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';

const duelEnemy: ReadonlyArray<EnemyFixture> = [
  {
    enemyId: 'enemy-front',
    slotId: 'enemy-front-3',
    row: 'Front',
    column: 3,
    maxHp: 200,
    damage: 5,
  },
];

export function runP1V9Checks(): void {
  spawnAndMeleeMovementCheck();
  rangerUptimeCheck();
  assassinDeepTargetMovementCheck();
  movementFrontlineHealCheck();
}

function spawnAndMeleeMovementCheck(): void {
  const battle = new AutonomousBattleModel(
    formation([{ contentId: 'beast-a', star: 1 }], ['front-3']),
    duelEnemy,
    P1V9_AUTONOMOUS_MOVEMENT_RULES,
  );

  const start = battle.snapshot;
  expect(start.units[0].positionX === -1 && start.units[0].positionLane === 3, 'Front unit spawns from deployment position');
  expect(start.enemies[0].positionX === 1 && start.enemies[0].positionLane === 3, 'Enemy Front spawns opposite player');

  battle.tick();
  const afterMove = battle.snapshot;
  expect(afterMove.units[0].positionX > -1, 'Tanker advances toward enemy before contact');
  expect(afterMove.enemies[0].positionX < 1, 'Enemy advances toward player before contact');
  expect(afterMove.enemyHp === 200, 'Tanker does not deal melee damage while still closing distance');
  expect(afterMove.units[0].currentHp === 80, 'Enemy does not deal melee damage while still closing distance');

  battle.tick();
  const afterContact = battle.snapshot;
  expect(afterContact.enemyHp < 200, 'Tanker attacks after reaching melee range');
  expect(afterContact.units[0].currentHp < 80, 'Enemy attacks only after reaching melee range');
}

function rangerUptimeCheck(): void {
  const back = new AutonomousBattleModel(
    formation([{ contentId: 'beast-c', star: 1 }], ['back-3']),
    duelEnemy,
    P1V9_AUTONOMOUS_MOVEMENT_RULES,
  );
  const front = new AutonomousBattleModel(
    formation([{ contentId: 'beast-c', star: 1 }], ['front-3']),
    duelEnemy,
    P1V9_AUTONOMOUS_MOVEMENT_RULES,
  );

  back.tick();
  front.tick();

  expect(back.snapshot.lastPlayerActions?.[0]?.kind === 'Snipe', 'Back Ranger can fire immediately from safe starting range');
  expect((front.snapshot.lastPlayerActions?.length ?? 0) === 0, 'Front Ranger retreats/repositions instead of receiving a row damage penalty');
  expect(front.snapshot.units[0].positionX < -1, 'Front Ranger visibly retreats toward player side');

  let guard = 0;
  while ((front.snapshot.lastPlayerActions?.length ?? 0) === 0 && guard < 10) {
    front.tick();
    guard += 1;
  }
  const firstFrontShot = front.snapshot.lastPlayerActions?.[0];
  expect(firstFrontShot?.kind === 'Snipe', 'Front Ranger eventually establishes range and attacks');
  expect(firstFrontShot?.hits[0]?.damage === 10, 'Ranger uses full base damage after establishing range; no V8 row multiplier remains');
}

function assassinDeepTargetMovementCheck(): void {
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
    { enemyId: 'back', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(
    formation([{ contentId: 'beast-b', star: 1 }], ['mid-3']),
    enemies,
    P1V9_AUTONOMOUS_MOVEMENT_RULES,
  );

  battle.tick();
  expect(battle.snapshot.units[0].targetEnemyId === 'back', 'Assassin acquires deepest enemy target');
  expect((battle.snapshot.lastPlayerActions?.length ?? 0) === 0, 'Assassin moves before melee attack when target is far away');

  let guard = 0;
  while ((battle.snapshot.lastPlayerActions?.length ?? 0) === 0 && guard < 10) {
    battle.tick();
    guard += 1;
  }
  expect(battle.snapshot.lastPlayerActions?.[0]?.kind === 'Dive', 'Assassin eventually reaches deep target and attacks');
  expect(battle.snapshot.lastPlayerActions?.[0]?.hits[0]?.enemyId === 'back', 'Assassin attacks the deep target it moved toward');
}

function movementFrontlineHealCheck(): void {
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'enemy', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 500, damage: 4 },
  ];
  const battle = new AutonomousBattleModel(
    formation(
      [
        { contentId: 'beast-a', star: 1 },
        { contentId: 'beast-b', star: 1 },
      ],
      ['back-1', 'front-3'],
    ),
    enemies,
    P1V9_AUTONOMOUS_MOVEMENT_RULES,
  );

  battle.tick();
  const frontline = battle.frontmostAliveUnit();
  expect(frontline?.role === 'Assassin', 'movement frontline is selected by actual forward position, not original row');

  const assassin = battle.snapshot.units.find((unit) => unit.role === 'Assassin');
  if (!assassin) throw new Error('P1-V9 check failed: Assassin fixture missing');

  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 1);

  // Ensure the current movement frontline is damaged before healing.
  let guard = 0;
  while ((battle.frontmostAliveUnit()?.currentHp ?? 0) === (battle.frontmostAliveUnit()?.maxHp ?? 0) && guard < 10) {
    battle.tick();
    guard += 1;
  }

  const before = battle.frontmostAliveUnit();
  expect(!!before && before.currentHp < before.maxHp, 'movement frontline takes damage before Heal test');
  const healedUnitId = before!.unitId;
  const hpBefore = before!.currentHp;

  expect(battle.castFrontlineHeal('energy-a', queue), 'Frontline Heal succeeds in movement combat');
  const after = battle.snapshot.units.find((unit) => unit.unitId === healedUnitId);
  expect(!!after && after.currentHp > hpBefore, 'Heal follows actual movement frontline');
}

function formation(
  units: Array<{ contentId: string; star: 1 | 2 | 3 }>,
  slots: string[],
): BattleFormation {
  const f = new BattleFormation(units);
  f.units.forEach((unit, index) => f.place(unit.unitId, slots[index]));
  return f;
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-V9 check failed: ${label}`);
}

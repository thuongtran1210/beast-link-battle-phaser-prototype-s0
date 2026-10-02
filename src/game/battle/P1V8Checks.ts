import {
  AutonomousBattleModel,
  P1V8_ROLE_POSITIONING_RULES,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';

const enemies: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
  { enemyId: 'mid', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 200, damage: 0 },
  { enemyId: 'back', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 0 },
  { enemyId: 'side', slotId: 'enemy-mid-4', row: 'Mid', column: 4, maxHp: 200, damage: 0 },
];

export function runP1V8Checks(): void {
  rangerPositionCheck();
  assassinDiveCheck();
  tankerFrontCheck();
  mageLaneBurstCheck();
}

function rangerPositionCheck(): void {
  const back = new AutonomousBattleModel(
    formation([{ contentId: 'beast-c', star: 1 }], ['back-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  const mid = new AutonomousBattleModel(
    formation([{ contentId: 'beast-c', star: 1 }], ['mid-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  const front = new AutonomousBattleModel(
    formation([{ contentId: 'beast-c', star: 1 }], ['front-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );

  const beforeBack = back.snapshot.enemyHp;
  const beforeMid = mid.snapshot.enemyHp;
  const beforeFront = front.snapshot.enemyHp;
  back.tick(); mid.tick(); front.tick();

  const backDamage = beforeBack - back.snapshot.enemyHp;
  const midDamage = beforeMid - mid.snapshot.enemyHp;
  const frontDamage = beforeFront - front.snapshot.enemyHp;

  expect(backDamage > midDamage && midDamage > frontDamage, 'Ranger output Back > Mid > Front');
  expect(back.snapshot.lastPlayerActions?.[0]?.hits[0]?.enemyId === 'back', 'Back Ranger snipes deep same-lane enemy');
}

function assassinDiveCheck(): void {
  const battle = new AutonomousBattleModel(
    formation([{ contentId: 'beast-b', star: 1 }], ['mid-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  battle.tick();
  expect(battle.snapshot.lastPlayerActions?.[0]?.kind === 'Dive', 'Assassin uses Dive action');
  expect(battle.snapshot.lastPlayerActions?.[0]?.hits[0]?.enemyId === 'back', 'Assassin bypasses frontline to deepest enemy');
}

function tankerFrontCheck(): void {
  const front = new AutonomousBattleModel(
    formation([{ contentId: 'beast-a', star: 1 }], ['front-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  const back = new AutonomousBattleModel(
    formation([{ contentId: 'beast-a', star: 1 }], ['back-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  front.tick();
  back.tick();
  expect((front.snapshot.lastPlayerActions?.length ?? 0) === 1, 'Front Tanker performs Guard Strike');
  expect((back.snapshot.lastPlayerActions?.length ?? 0) === 0, 'Back Tanker does not attack in V8');
}

function mageLaneBurstCheck(): void {
  const battle = new AutonomousBattleModel(
    formation([{ contentId: 'beast-d', star: 1 }], ['mid-3']),
    enemies,
    P1V8_ROLE_POSITIONING_RULES,
  );
  battle.tick();
  const action = battle.snapshot.lastPlayerActions?.[0];
  expect(action?.kind === 'ArcaneBurst', 'Mage uses Arcane Burst');
  expect((action?.hits.length ?? 0) >= 2, 'Mage damages primary plus adjacent-lane enemy');
}

function formation(units: Array<{ contentId: string; star: 1 | 2 | 3 }>, slots: string[]): BattleFormation {
  const f = new BattleFormation(units);
  f.units.forEach((unit, index) => f.place(unit.unitId, slots[index]));
  return f;
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-V8 check failed: ${label}`);
}

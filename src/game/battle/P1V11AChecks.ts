import {
  AutonomousBattleModel,
  P1V11A_TIMELINE_RULES,
  P1V11A_ACTION_TIMING_FIXTURE,
  SIMULATION_STEP,
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

export function runP1V11AChecks(): void {
  deterministicRepeatCheck();
  independentTimingCheck();
  attackIntervalCheck();
  windupCheck();
  movementScalingCheck();
  targetPersistenceCheck();
  retargetAfterDeathCheck();
  rangerRangeBehaviorCheck();
  enemyContactRequirementCheck();
  frontlineHealCheck();
  terminalFreezeCheck();
  historicalRegressionsCheck();
}

function deterministicRepeatCheck(): void {
  const f1 = formation([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }], ['front-3', 'back-3']);
  const f2 = formation([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }], ['front-3', 'back-3']);
  const b1 = new AutonomousBattleModel(f1, duelEnemy, P1V11A_TIMELINE_RULES);
  const b2 = new AutonomousBattleModel(f2, duelEnemy, P1V11A_TIMELINE_RULES);

  for (let step = 0; step < 40; step++) {
    b1.step(SIMULATION_STEP);
    b2.step(SIMULATION_STEP);
    expect(
      JSON.stringify(b1.snapshot) === JSON.stringify(b2.snapshot),
      `step ${step} is deterministically identical`,
    );
  }
}

function independentTimingCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const bigEnemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'boss', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 500, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, bigEnemy, P1V11A_TIMELINE_RULES);

  const tankerResolutions: number[] = [];
  const rangerResolutions: number[] = [];

  for (let step = 1; step <= 50; step++) {
    battle.step(SIMULATION_STEP);
    const actions = battle.snapshot.lastPlayerActions ?? [];
    for (const action of actions) {
      if (action.role === 'Tanker') tankerResolutions.push(step);
      if (action.role === 'Ranger') rangerResolutions.push(step);
    }
  }

  expect(tankerResolutions.length > 0 && rangerResolutions.length > 0, 'both Tanker and Ranger attacked');
  const commonResolutions = tankerResolutions.filter((t) => rangerResolutions.includes(t));
  expect(
    commonResolutions.length < tankerResolutions.length,
    'Tanker and Ranger operate on independent action timelines',
  );
}

function attackIntervalCheck(): void {
  const f = formation([{ contentId: 'beast-b', star: 1 }], ['front-3']);
  const bigEnemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'boss', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 500, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, bigEnemy, P1V11A_TIMELINE_RULES);

  const attackSteps: number[] = [];
  for (let step = 1; step <= 40; step++) {
    battle.step(SIMULATION_STEP);
    if ((battle.snapshot.lastPlayerActions?.length ?? 0) > 0) {
      attackSteps.push(step);
    }
  }

  expect(attackSteps.length >= 2, 'Assassin attacked at least twice');
  for (let i = 1; i < attackSteps.length; i++) {
    const intervalSteps = attackSteps[i] - attackSteps[i - 1];
    const minSteps = Math.floor(P1V11A_ACTION_TIMING_FIXTURE.Assassin.attackInterval / SIMULATION_STEP);
    expect(
      intervalSteps >= minSteps,
      `Assassin attack interval ${intervalSteps} steps >= expected minimum ${minSteps}`,
    );
  }
}

function windupCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['back-3']);
  const enemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'target', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 100, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemy, P1V11A_TIMELINE_RULES);

  battle.step(SIMULATION_STEP);
  const snap1 = battle.snapshot;
  expect(snap1.units[0].actionState === 'Windup', 'Ranger enters Windup state');
  expect(snap1.enemyHp === 100, 'Damage is not applied at attack start / during windup');

  battle.step(SIMULATION_STEP);
  const snap2 = battle.snapshot;
  expect(snap2.enemyHp === 100, 'Damage still not applied halfway through windup');

  battle.step(SIMULATION_STEP);
  const snap3 = battle.snapshot;
  expect(snap3.enemyHp < 100, 'Damage is applied when windup resolves');
  expect(snap3.lastPlayerActions?.[0]?.kind === 'Snipe', 'Snipe action recorded upon windup completion');
}

function movementScalingCheck(): void {
  const f = formation([{ contentId: 'beast-a', star: 1 }], ['front-3']);
  const distantEnemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'far', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, distantEnemy, P1V11A_TIMELINE_RULES);

  const startX = battle.snapshot.units[0].positionX;
  expect(startX === -1, 'Tanker starts at x = -1');

  for (let i = 0; i < 10; i++) {
    battle.step(SIMULATION_STEP);
  }

  const endX = battle.snapshot.units[0].positionX;
  const distanceMoved = endX - startX;
  const expectedTravel = 0.75 * 1.0;
  expect(
    Math.abs(distanceMoved - expectedTravel) < 0.05,
    `Movement scaled by deltaSeconds: moved ~${distanceMoved.toFixed(2)}, expected ~${expectedTravel}`,
  );
  expect(distanceMoved < 2.0, 'Movement speed is not 10x multiplied by 0.1s steps');
}

function targetPersistenceCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['back-3']);
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
    { enemyId: 'e2', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11A_TIMELINE_RULES);

  battle.step(SIMULATION_STEP);
  const firstTarget = battle.snapshot.units[0].targetEnemyId;
  expect(!!firstTarget, 'Unit acquired an initial target');

  for (let i = 0; i < 5; i++) {
    battle.step(SIMULATION_STEP);
    expect(
      battle.snapshot.units[0].targetEnemyId === firstTarget,
      'Unit retains the same living target across steps',
    );
  }
}

function retargetAfterDeathCheck(): void {
  const f = formation([{ contentId: 'beast-a', star: 1 }], ['front-3']);
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'fragile', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 5, damage: 0 },
    { enemyId: 'boss', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11A_TIMELINE_RULES);

  let guard = 0;
  while (battle.snapshot.enemies.find((e) => e.enemyId === 'fragile')!.currentHp > 0 && guard < 30) {
    battle.step(SIMULATION_STEP);
    guard++;
  }

  expect(battle.snapshot.enemies.find((e) => e.enemyId === 'fragile')!.currentHp === 0, 'First target defeated');

  battle.step(SIMULATION_STEP);
  expect(
    battle.snapshot.units[0].targetEnemyId === 'boss',
    'Unit reacquires next living target after first target dies',
  );
}

function rangerRangeBehaviorCheck(): void {
  const fClose = formation([{ contentId: 'beast-c', star: 1 }], ['front-3']);
  const closeEnemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'close', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
  ];
  const bClose = new AutonomousBattleModel(fClose, closeEnemy, P1V11A_TIMELINE_RULES);
  const startX = bClose.snapshot.units[0].positionX;
  bClose.step(SIMULATION_STEP);
  expect(bClose.snapshot.units[0].positionX < startX, 'Ranger retreats when enemy is within minRange');
}

function enemyContactRequirementCheck(): void {
  const f = formation([{ contentId: 'beast-a', star: 1 }], ['front-3']);
  const enemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemy, P1V11A_TIMELINE_RULES);

  for (let i = 0; i < 5; i++) {
    battle.step(SIMULATION_STEP);
    expect(battle.snapshot.units[0].currentHp === 80, 'Enemy deals 0 damage while still closing distance');
    expect(battle.snapshot.enemies[0].actionState === 'Moving', 'Enemy is in Moving state before contact');
  }
}

function frontlineHealCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemy, P1V11A_TIMELINE_RULES);

  let guard = 0;
  while (battle.snapshot.units.find((u) => u.role === 'Tanker')!.currentHp === 80 && guard < 30) {
    battle.step(SIMULATION_STEP);
    guard++;
  }

  const tanker = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(tanker.currentHp < 80, 'Tanker took damage');
  const hpBeforeHeal = tanker.currentHp;
  const cooldownBefore = tanker.attackCooldownRemaining;
  const windupBefore = tanker.attackWindupRemaining;
  const stateBefore = tanker.actionState;

  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 1);
  const healSuccess = battle.castFrontlineHeal('energy-a', queue);
  expect(healSuccess, 'Frontline Heal succeeds');

  const tankerAfter = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(tankerAfter.currentHp > hpBeforeHeal, 'Frontmost unit received HP');
  expect(tankerAfter.actionState === stateBefore, 'Heal does not alter action state');
  expect(tankerAfter.attackCooldownRemaining === cooldownBefore, 'Heal does not reset attack cooldown');
  expect(tankerAfter.attackWindupRemaining === windupBefore, 'Heal does not reset attack windup');
}

function terminalFreezeCheck(): void {
  const f = formation([{ contentId: 'beast-b', star: 3 }], ['front-3']);
  const weakEnemy: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'weak', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 10, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, weakEnemy, P1V11A_TIMELINE_RULES);

  let guard = 0;
  while (battle.snapshot.status === 'Running' && guard < 50) {
    battle.step(SIMULATION_STEP);
    guard++;
  }

  expect(battle.snapshot.status === 'Win', 'Battle ends with Win');
  const finalSnapshot = JSON.stringify(battle.snapshot);

  for (let i = 0; i < 10; i++) {
    battle.step(SIMULATION_STEP);
    expect(JSON.stringify(battle.snapshot) === finalSnapshot, 'Terminal state freezes completely');
  }
}

function historicalRegressionsCheck(): void {
  const f = formation([{ contentId: 'beast-a', star: 1 }], ['front-3']);
  const legacy = new AutonomousBattleModel(f);
  legacy.tick();
  expect(legacy.snapshot.elapsedTicks === 1, 'Legacy model ticks 1.0s');
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
  if (!value) throw new Error(`P1-V11A check failed: ${label}`);
}

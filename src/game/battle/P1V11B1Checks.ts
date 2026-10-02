import {
  AutonomousBattleModel,
  P1V11B1_ROLE_IDENTITY_RULES,
  SIMULATION_STEP,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { runP1V9Checks } from './P1V9Checks';
import { runP1V11AChecks } from './P1V11AChecks';
import { runP1V11BChecks } from './P1V11BChecks';

export function runP1V11B1Checks(): void {
  rangerHoldsWhenTargetInRangeCheck();
  rangerAdvancesOnlyUntilRangeCheck();
  rangerKitesCloseThreatCheck();
  magePreservesBacklineCheck();
  mageDoesNotChaseDuringValidCastCheck();
  roleFormationShapeCheck();
  frontlineProtectionRangerCheck();
  frontlineProtectionMageCheck();
  assassinRegressionCheck();
  tankRegressionCheck();
  deterministicRepeatCheck();
  historicalRegressionsCheck();
}

/**
 * 1. RANGER HOLDS WHEN TARGET IN RANGE
 * Ranger deployed at back-3 (X = -3). Enemy at front-3 (X = 0).
 * Target is inside attackRange (3.0 <= 4.2) and outside dangerRange (3.0 > 2.1).
 * Assert: Ranger position remains stable, Ranger attacks, Ranger does not advance.
 */
function rangerHoldsWhenTargetInRangeCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['back-3']); // Ranger
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 100, damage: 0 },
  ];
  // Start enemy at X = 0 so distance is exactly 3.0
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);
  const initialEnemy = battle.snapshot.enemies[0];
  initialEnemy.positionX = 0; // In firing band: distance = 3.0

  const initialRangerX = battle.snapshot.units[0].positionX;
  expect(initialRangerX === -3, 'Ranger spawns at backline X = -3');

  let attacksFired = 0;
  for (let i = 0; i < 20; i++) {
    battle.step(SIMULATION_STEP);
    const ranger = battle.snapshot.units[0];
    expect(
      Math.abs(ranger.positionX - initialRangerX) < 0.001,
      `Ranger position remains stable while target in range (step ${i}: X = ${ranger.positionX})`,
    );
    expect(
      ranger.movementPolicyState === 'Hold',
      `Ranger maintains Hold movement state (step ${i}: ${ranger.movementPolicyState})`,
    );
  }

  const metrics = battle.getConsequenceMetrics();
  attacksFired = metrics.attacksResolvedByUnit[battle.snapshot.units[0].unitId] ?? 0;
  expect(attacksFired > 0, 'Ranger attacks while holding position');
}

/**
 * 2. RANGER ADVANCES ONLY UNTIL RANGE
 * Target initially outside attackRange (e.g. enemy at X = 3.0, Ranger at X = -3.0; distance = 6.0 > 4.2).
 * Assert: Ranger advances; once target enters firing range, Ranger stops moving forward and holds.
 */
function rangerAdvancesOnlyUntilRangeCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['back-3']); // Ranger
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  let stoppedAdvancing = false;
  let stablePositionX = -999;

  for (let i = 0; i < 40; i++) {
    battle.step(SIMULATION_STEP);
    const ranger = battle.snapshot.units[0];
    const enemy = battle.snapshot.enemies[0];
    const dist = enemy.positionX - ranger.positionX;

    if (!stoppedAdvancing) {
      if (ranger.movementPolicyState === 'Hold') {
        stoppedAdvancing = true;
        stablePositionX = ranger.positionX;
        expect(dist <= 4.2 + 0.05, `Target entered attack range when Ranger stopped advancing (dist=${dist})`);
      }
    } else {
      expect(
        Math.abs(ranger.positionX - stablePositionX) < 0.001,
        `Ranger does not continue advancing into melee range once in range (step ${i}: X=${ranger.positionX})`,
      );
    }
  }

  expect(stoppedAdvancing, 'Ranger transitioned to Hold upon reaching attack range');
}

/**
 * 3. RANGER KITES CLOSE THREAT
 * Melee enemy enters danger range (< 2.10).
 * Assert: Ranger retreats away, does not run toward enemy, and stops retreating once safe range is restored or wall is hit.
 */
function rangerKitesCloseThreatCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['front-3']); // Ranger at X = -1
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 5 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  let sawKite = false;
  const initialRangerX = battle.snapshot.units[0].positionX;

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const ranger = battle.snapshot.units[0];
    if (ranger.movementPolicyState === 'Kite') {
      sawKite = true;
      expect(ranger.positionX < initialRangerX, 'Ranger retreats backward away from threat during Kite');
    }
  }

  expect(sawKite, 'Ranger triggered Kite when melee enemy entered danger range');
}

/**
 * 4. MAGE PRESERVES BACKLINE
 * Mage deployed behind Tank (Tank front-3 at X=-1, Mage back-3 at X=-3).
 * Enemy approaches Tank in lane 3.
 * Assert: Mage remains behind Tank while cast target is available, does not walk into melee cluster.
 */
function magePreservesBacklineCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }],
    ['front-3', 'back-3'],
  ); // Tank front-3, Mage back-3
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  for (let i = 0; i < 30; i++) {
    battle.step(SIMULATION_STEP);
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    const mage = battle.snapshot.units.find((u) => u.role === 'Mage')!;

    expect(
      mage.positionX < tank.positionX,
      `Mage remains behind Tank throughout combat (Mage X=${mage.positionX}, Tank X=${tank.positionX})`,
    );
    expect(
      mage.positionX <= -2.5,
      `Mage preserves backline positioning without drifting forward (Mage X=${mage.positionX})`,
    );
  }
}

/**
 * 5. MAGE DOES NOT CHASE DURING VALID CAST
 * If Mage has a target in range:
 * Assert: Mage holds position through windup; spell resolves without forward drift.
 */
function mageDoesNotChaseDuringValidCastCheck(): void {
  const f = formation([{ contentId: 'beast-d', star: 1 }], ['back-3']); // Mage at X = -3
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);
  const e = battle.snapshot.enemies[0];
  e.positionX = 0; // Distance = 3.0 <= 3.6 (Mage attackRange)

  let sawWindup = false;
  let windupX = -999;
  let spellResolvedWithoutDrift = false;

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const mage = battle.snapshot.units[0];

    if (mage.actionState === 'Windup') {
      if (!sawWindup) {
        sawWindup = true;
        windupX = mage.positionX;
      }
      expect(
        Math.abs(mage.positionX - windupX) < 0.001,
        'Mage holds position strictly during cast windup',
      );
    }

    if (sawWindup && mage.actionState === 'Recovering') {
      expect(
        Math.abs(mage.positionX - windupX) < 0.001,
        'Spell resolves without forward drift',
      );
      spellResolvedWithoutDrift = true;
      break;
    }
  }

  expect(sawWindup, 'Mage entered Windup state for spellcast');
  expect(spellResolvedWithoutDrift, 'Mage completed spellcast without moving forward');
}

/**
 * 6. ROLE FORMATION SHAPE
 * Setup: Tank Front (front-3), Ranger Back (back-4), Mage Back (back-2), Assassin Mid (mid-3).
 * After several seconds:
 * Assert: Tank remains more forward than Ranger/Mage; Assassin is deeper than or equal to Tank;
 * Ranger/Mage have not collapsed into Tank position.
 */
function roleFormationShapeCheck(): void {
  const f = formation(
    [
      { contentId: 'beast-a', star: 1 }, // Tank
      { contentId: 'beast-b', star: 1 }, // Assassin
      { contentId: 'beast-c', star: 1 }, // Ranger
      { contentId: 'beast-d', star: 1 }, // Mage
    ],
    ['front-3', 'mid-3', 'back-4', 'back-2'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 300, damage: 8 },
    { enemyId: 'e2', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 300, damage: 8 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  for (let i = 0; i < 30; i++) {
    battle.step(SIMULATION_STEP);
  }

  const snap = battle.snapshot;
  const tank = snap.units.find((u) => u.role === 'Tanker')!;
  const assassin = snap.units.find((u) => u.role === 'Assassin')!;
  const ranger = snap.units.find((u) => u.role === 'Ranger')!;
  const mage = snap.units.find((u) => u.role === 'Mage')!;

  expect(tank.positionX > ranger.positionX, 'Tank is more forward than Ranger');
  expect(tank.positionX > mage.positionX, 'Tank is more forward than Mage');
  expect(assassin.positionX >= tank.positionX, 'Assassin dives ahead of or at frontline');
  expect(
    tank.positionX - ranger.positionX >= 0.8,
    `Ranger has not collapsed into Tank position (gap = ${tank.positionX - ranger.positionX})`,
  );
  expect(
    tank.positionX - mage.positionX >= 0.8,
    `Mage has not collapsed into Tank position (gap = ${tank.positionX - mage.positionX})`,
  );
}

/**
 * 7. FRONTLINE PROTECTION + RANGER
 * With Tank protecting Ranger (Formation A): Ranger gains safe attack uptime.
 * Move Tank away (Formation B): Ranger is threatened earlier / forced to kite earlier.
 */
function frontlineProtectionRangerCheck(): void {
  const fA = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const fB = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-1', 'back-3'],
  );
  const enemiesA: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 12 },
  ];
  const enemiesB: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 12 },
  ];

  const battleA = new AutonomousBattleModel(fA, enemiesA, P1V11B1_ROLE_IDENTITY_RULES);
  const battleB = new AutonomousBattleModel(fB, enemiesB, P1V11B1_ROLE_IDENTITY_RULES);

  let bKitedEarlier = false;

  for (let i = 0; i < 50; i++) {
    battleA.step(SIMULATION_STEP);
    battleB.step(SIMULATION_STEP);

    const rangerA = battleA.snapshot.units.find((u) => u.role === 'Ranger')!;
    const rangerB = battleB.snapshot.units.find((u) => u.role === 'Ranger')!;

    if (rangerB.movementPolicyState === 'Kite' && rangerA.movementPolicyState !== 'Kite') {
      bKitedEarlier = true;
    }
  }

  expect(bKitedEarlier, 'Unprotected Ranger was forced to kite while protected Ranger stayed safe');

  const metricsA = battleA.getConsequenceMetrics();
  const metricsB = battleB.getConsequenceMetrics();
  const rangerIdA = battleA.snapshot.units.find((u) => u.role === 'Ranger')!.unitId;
  const rangerIdB = battleB.snapshot.units.find((u) => u.role === 'Ranger')!.unitId;

  const dmgA = metricsA.damageTakenByUnit[rangerIdA] ?? 0;
  const dmgB = metricsB.damageTakenByUnit[rangerIdB] ?? 0;
  expect(dmgA <= dmgB, `Protected Ranger took less or equal damage: ${dmgA} vs ${dmgB}`);
}

/**
 * 8. FRONTLINE PROTECTION + MAGE
 * With Tank protecting Mage (Formation A): Mage can complete casts from backline.
 * Without protection (Formation B): Mage must retreat or gets contacted earlier.
 */
function frontlineProtectionMageCheck(): void {
  const fA = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }],
    ['front-3', 'back-3'],
  );
  const fB = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }],
    ['front-1', 'back-3'],
  );
  const enemiesA: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 12 },
  ];
  const enemiesB: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 12 },
  ];

  const battleA = new AutonomousBattleModel(fA, enemiesA, P1V11B1_ROLE_IDENTITY_RULES);
  const battleB = new AutonomousBattleModel(fB, enemiesB, P1V11B1_ROLE_IDENTITY_RULES);

  let bThreatenedEarlier = false;

  for (let i = 0; i < 50; i++) {
    battleA.step(SIMULATION_STEP);
    battleB.step(SIMULATION_STEP);

    const mageA = battleA.snapshot.units.find((u) => u.role === 'Mage')!;
    const mageB = battleB.snapshot.units.find((u) => u.role === 'Mage')!;

    if (mageB.movementPolicyState === 'Kite' && mageA.movementPolicyState !== 'Kite') {
      bThreatenedEarlier = true;
    }
  }

  expect(bThreatenedEarlier, 'Unprotected Mage was threatened / forced to retreat earlier');
}

/**
 * 9. ASSASSIN REGRESSION
 * Assassin still performs deep-target dive behavior.
 */
function assassinRegressionCheck(): void {
  const f = formation([{ contentId: 'beast-b', star: 1 }], ['front-3']); // Assassin
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0 },
    { enemyId: 'e-back', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
  }

  const assassin = battle.snapshot.units[0];
  expect(assassin.movementPolicyState === 'Dive', 'Assassin operates in Dive movement state');
  expect(assassin.targetEnemyId === 'e-back', 'Assassin prioritizes backline deep target');
  expect(assassin.positionX > 0, 'Assassin dives into enemy side');
}

/**
 * 10. TANK REGRESSION
 * Tank interception remains active under V11B.1 rules.
 */
function tankRegressionCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  let intercepted = false;
  for (let i = 0; i < 30; i++) {
    battle.step(SIMULATION_STEP);
    const e = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (e.engagedTargetId === tank.unitId) {
      intercepted = true;
      break;
    }
  }

  expect(intercepted, 'Tank interception remains fully functional under V11B.1');
}

/**
 * 11. DETERMINISTIC REPEAT
 * Two identical V11B.1 battles produce identical states, positions, attacks, and engagements.
 */
function deterministicRepeatCheck(): void {
  const f1 = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-c', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['front-3', 'mid-3', 'back-4', 'back-2'],
  );
  const f2 = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-c', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['front-3', 'mid-3', 'back-4', 'back-2'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];

  const b1 = new AutonomousBattleModel(f1, enemies, P1V11B1_ROLE_IDENTITY_RULES);
  const b2 = new AutonomousBattleModel(f2, enemies, P1V11B1_ROLE_IDENTITY_RULES);

  for (let i = 0; i < 35; i++) {
    b1.step(SIMULATION_STEP);
    b2.step(SIMULATION_STEP);
    expect(
      JSON.stringify(b1.snapshot) === JSON.stringify(b2.snapshot),
      `Deterministic state match at step ${i}`,
    );
  }
}

/**
 * 12. HISTORICAL REGRESSIONS
 * Run P1V9, P1V11A, and P1V11B checks to ensure zero regressions across historical suites.
 */
function historicalRegressionsCheck(): void {
  runP1V9Checks();
  runP1V11AChecks();
  runP1V11BChecks();
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
  if (!value) throw new Error(`P1-V11B.1 check failed: ${label}`);
}

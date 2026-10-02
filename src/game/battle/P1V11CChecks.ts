import {
  AutonomousBattleModel,
  P1V11C_ARCHETYPE_RULES,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V11C_FIXTURE_B_DIVERS,
  P1V11C_FIXTURE_C_PROTECTED_RANGED,
  SIMULATION_STEP,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';
import { runP1V9Checks } from './P1V9Checks';
import { runP1V11AChecks } from './P1V11AChecks';
import { runP1V11BChecks } from './P1V11BChecks';
import { runP1V11B1Checks } from './P1V11B1Checks';

export function runP1V11CChecks(): void {
  frontlinerUsesFrontlineCheck();
  wrongLaneTankExposesBacklineCheck();
  diverPrefersDeepTargetCheck();
  diverIsNotGlobalTauntedCheck();
  localTankCanProtectAgainstDiverCheck();
  diverTargetPersistenceCheck();
  enemyRangedHoldsRangeCheck();
  assassinThreatensEnemyRangedCheck();
  assassinFormationChangesAccessTimeCheck();
  enemyCompositionChangesFormationValueCheck();
  sameEnemyDifferentFormationCheck();
  v11b1RoleIdentityRegressionCheck();
  frontlineHealRegressionCheck();
  deterministicRepeatCheck();
  historicalRegressionsCheck();
}

/**
 * 1. FRONTLINER USES FRONTLINE
 * Tank in relevant lane (front-3), Frontliner approaching in lane 3.
 * Frontliner moves toward frontline, Tank interception occurs, Frontliner does not bypass to backline.
 */
function frontlinerUsesFrontlineCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10, archetype: 'Frontliner' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

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

  expect(intercepted, 'Frontliner intercepts with Tank in same lane');

  // Verify Frontliner does not bypass Tank while Tank is alive
  for (let i = 0; i < 20; i++) {
    battle.step(SIMULATION_STEP);
    const ranger = battle.snapshot.units.find((u) => u.role === 'Ranger')!;
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (tank.currentHp > 0) {
      expect(ranger.currentHp === ranger.maxHp, 'Frontliner does not bypass Tank to hit Ranger');
    }
  }
}

/**
 * 2. WRONG-LANE TANK EXPOSES BACKLINE
 * Same Frontliner fixture in lane 3. Move Tank away to lane 1 (front-1), Ranger at back-3.
 * Backline is contacted earlier or forced to kite earlier.
 */
function wrongLaneTankExposesBacklineCheck(): void {
  const fProtected = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const fExposed = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-1', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10, archetype: 'Frontliner' },
  ];

  const bProt = new AutonomousBattleModel(fProtected, enemies, P1V11C_ARCHETYPE_RULES);
  const bExpo = new AutonomousBattleModel(fExposed, enemies, P1V11C_ARCHETYPE_RULES);

  let expoKitedEarlier = false;
  for (let i = 0; i < 50; i++) {
    bProt.step(SIMULATION_STEP);
    bExpo.step(SIMULATION_STEP);

    const rProt = bProt.snapshot.units.find((u) => u.role === 'Ranger')!;
    const rExpo = bExpo.snapshot.units.find((u) => u.role === 'Ranger')!;

    if (rExpo.movementPolicyState === 'Kite' && rProt.movementPolicyState !== 'Kite') {
      expoKitedEarlier = true;
    }
  }

  expect(expoKitedEarlier, 'Wrong-lane Tank exposes Ranger, forcing early kiting');
}

/**
 * 3. DIVER PREFERS DEEP TARGET
 * Player squad has Tank (front-3), Ranger (back-4), Mage (back-2).
 * Diver in enemy lane 3.
 * Diver initially selects a deep target (Mage or Ranger), not the forward Tank.
 */
function diverPrefersDeepTargetCheck(): void {
  const f = formation(
    [
      { contentId: 'beast-a', star: 1 }, // Tank at front-3 (X=-1)
      { contentId: 'beast-c', star: 1 }, // Ranger at back-4 (X=-3)
      { contentId: 'beast-d', star: 1 }, // Mage at back-2 (X=-3)
    ],
    ['front-3', 'back-4', 'back-2'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-diver', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 150, damage: 12, archetype: 'Diver' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  battle.step(SIMULATION_STEP);
  const diver = battle.snapshot.enemies[0];
  const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  const targetUnit = battle.snapshot.units.find((u) => u.unitId === diver.targetUnitId);

  expect(diver.targetUnitId !== undefined, 'Diver acquired a target');
  expect(diver.targetUnitId !== tank.unitId, 'Diver does NOT target forward Tank');
  expect(
    targetUnit?.role === 'Mage' || targetUnit?.role === 'Ranger',
    `Diver selects a deep carry target (selected: ${targetUnit?.role})`,
  );
  expect(diver.movementPolicyState === 'Dive', 'Diver operates in Dive movement state');
}

/**
 * 4. DIVER IS NOT GLOBAL-TAUNTED
 * Diver in lane 4 aiming for Ranger in lane 4. Place Tank far away in lane 1 (front-1).
 * Distant Tank in lane 1 does not magically pull or intercept Diver.
 */
function diverIsNotGlobalTauntedCheck(): void {
  const f = formation(
    [
      { contentId: 'beast-a', star: 1 }, // Tank at front-1
      { contentId: 'beast-c', star: 1 }, // Ranger at back-4
    ],
    ['front-1', 'back-4'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-diver', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 150, damage: 12, archetype: 'Diver' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const diver = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    expect(diver.engagedTargetId !== tank.unitId, 'Distant Tank does not globally intercept Diver');
    expect(diver.targetUnitId !== tank.unitId, 'Diver does not get pulled toward distant Tank');
  }
}

/**
 * 5. LOCAL TANK CAN PROTECT AGAINST DIVER
 * Position Tank near vulnerable carry / dive corridor (Formation A: Tank front-3 guarding Mage back-3).
 * Compare to exposed Formation B (Tank front-1 far from Mage back-3).
 * Assert: In Formation A, Tank intercepts Diver; Mage takes less damage or is hit later.
 */
function localTankCanProtectAgainstDiverCheck(): void {
  const fProtected = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }],
    ['mid-3', 'back-3'], // Tank mid-3 guards Mage back-3
  );
  const fExposed = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-d', star: 1 }],
    ['front-1', 'back-3'], // Tank front-1 leaves Mage back-3 exposed
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-diver', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 12, archetype: 'Diver' },
  ];

  const bProt = new AutonomousBattleModel(fProtected, enemies, P1V11C_ARCHETYPE_RULES);
  const bExpo = new AutonomousBattleModel(fExposed, enemies, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 55; i++) {
    bProt.step(SIMULATION_STEP);
    bExpo.step(SIMULATION_STEP);
  }

  const metricsProt = bProt.getConsequenceMetrics();
  const metricsExpo = bExpo.getConsequenceMetrics();

  expect(metricsProt.interceptCount > 0, 'Local Tank intercepted incoming Diver');

  const mageIdProt = bProt.snapshot.units.find((u) => u.role === 'Mage')!.unitId;
  const mageIdExpo = bExpo.snapshot.units.find((u) => u.role === 'Mage')!.unitId;

  const dmgProt = metricsProt.damageTakenByUnit[mageIdProt] ?? 0;
  const dmgExpo = metricsExpo.damageTakenByUnit[mageIdExpo] ?? 0;

  expect(dmgProt < dmgExpo, `Local Tank protection reduces carry damage: ${dmgProt} vs ${dmgExpo}`);
}

/**
 * 6. DIVER TARGET PERSISTENCE
 * Diver keeps a valid target across simulation steps without flickering.
 */
function diverTargetPersistenceCheck(): void {
  const f = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-c', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['front-1', 'back-3', 'back-5'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-diver', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0, archetype: 'Diver' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  battle.step(SIMULATION_STEP);
  const initialTargetId = battle.snapshot.enemies[0].targetUnitId;
  expect(initialTargetId !== undefined, 'Diver acquired initial target');

  for (let i = 0; i < 20; i++) {
    battle.step(SIMULATION_STEP);
    const currentTargetId = battle.snapshot.enemies[0].targetUnitId;
    expect(
      currentTargetId === initialTargetId,
      `Diver retains target across steps without flickering (step ${i}: ${currentTargetId} vs ${initialTargetId})`,
    );
  }
}

/**
 * 7. ENEMY RANGED HOLDS RANGE
 * Ranged enemy has valid player target in range (distance <= 3.8).
 * Assert: Enemy Ranged stops advancing, attacks from range, does not enter melee.
 */
function enemyRangedHoldsRangeCheck(): void {
  const f = formation([{ contentId: 'beast-c', star: 1 }], ['mid-3']); // Ranger at X = -2 (holds position at 3.0 distance)
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-ranged', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 100, damage: 8, archetype: 'Ranged' },
  ];
  // Distance from enemy (X=1, col=3) to Ranger (X=-2, col=3) is 3.0, which is <= 3.8 (attackRange) and >= 1.8 (dangerRange).
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  let initialEnemyX = -999;
  for (let i = 0; i < 20; i++) {
    battle.step(SIMULATION_STEP);
    const enemy = battle.snapshot.enemies[0];
    if (i === 0) initialEnemyX = enemy.positionX;

    expect(
      enemy.movementPolicyState === 'Hold',
      `Enemy Ranged maintains Hold movement state (step ${i}: ${enemy.movementPolicyState})`,
    );
    expect(
      Math.abs(enemy.positionX - initialEnemyX) < 0.001,
      `Enemy Ranged holds position without advancing into melee (step ${i}: X = ${enemy.positionX})`,
    );
  }
}

/**
 * 8. ASSASSIN THREATENS ENEMY RANGED
 * Setup: Enemy Frontliner + Enemy Ranged (Back row). Player Assassin.
 * Assert: Assassin deep-target behavior targets / dives into enemy Ranged appropriately.
 */
function assassinThreatensEnemyRangedCheck(): void {
  const f = formation([{ contentId: 'beast-b', star: 1 }], ['front-3']); // Assassin
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-front', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 0, archetype: 'Frontliner' },
    { enemyId: 'e-ranged', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 100, damage: 0, archetype: 'Ranged' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  battle.step(SIMULATION_STEP);
  const assassin = battle.snapshot.units[0];
  expect(
    assassin.targetEnemyId === 'e-ranged',
    `Assassin prioritizes deep enemy Ranged over Frontliner (target = ${assassin.targetEnemyId})`,
  );

  for (let i = 0; i < 45; i++) {
    battle.step(SIMULATION_STEP);
  }

  const snap = battle.snapshot;
  const rangedEnemy = snap.enemies.find((e) => e.enemyId === 'e-ranged')!;
  expect(rangedEnemy.currentHp < rangedEnemy.maxHp, 'Assassin reached and damaged deep enemy Ranged');
}

/**
 * 9. ASSASSIN FORMATION CHANGES ACCESS TIME
 * Formation A: Assassin in same lane as enemy Ranged (front-3 vs back-3).
 * Formation B: Assassin in distant lane (front-1 vs back-5).
 * Assert: firstAssassinContactTime(A) < firstAssassinContactTime(B).
 */
function assassinFormationChangesAccessTimeCheck(): void {
  const fA = formation([{ contentId: 'beast-b', star: 1 }], ['front-3']); // Same lane 3
  const fB = formation([{ contentId: 'beast-b', star: 1 }], ['front-1']); // Distant lane 1

  const enemiesA: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-ranged', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 200, damage: 0, archetype: 'Ranged' },
  ];
  const enemiesB: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-ranged', slotId: 'enemy-back-5', row: 'Back', column: 5, maxHp: 200, damage: 0, archetype: 'Ranged' },
  ];

  const bA = new AutonomousBattleModel(fA, enemiesA, P1V11C_ARCHETYPE_RULES);
  const bB = new AutonomousBattleModel(fB, enemiesB, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 35; i++) {
    bA.step(SIMULATION_STEP);
    bB.step(SIMULATION_STEP);
  }

  const contactA = bA.getConsequenceMetrics().firstAssassinContactTime ?? 999;
  const contactB = bB.getConsequenceMetrics().firstAssassinContactTime ?? 999;

  expect(
    contactA < contactB,
    `Aligned Assassin reaches deep Ranged target faster: ${contactA}s vs ${contactB}s`,
  );
}

/**
 * 10. ENEMY COMPOSITION CHANGES FORMATION VALUE
 * Same player squad (Tank, Assassin, Ranger, Mage in standard formation)
 * against Fixture A (Frontline Pressure) vs Fixture B (Backline Dive).
 * Tactical metrics differ significantly.
 */
function enemyCompositionChangesFormationValueCheck(): void {
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

  const bFront = new AutonomousBattleModel(f1, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);
  const bDiver = new AutonomousBattleModel(f2, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 65; i++) {
    bFront.step(SIMULATION_STEP);
    bDiver.step(SIMULATION_STEP);
  }

  const metricsFront = bFront.getConsequenceMetrics();
  const metricsDiver = bDiver.getConsequenceMetrics();

  // In Fixture B (Divers), carry is contacted much earlier than in Frontline pressure
  const hitFront = metricsFront.firstBacklineHitTime ?? 999;
  const hitDiver = metricsDiver.firstBacklineHitTime ?? 999;

  expect(
    hitDiver < hitFront,
    `Diver composition threatens backline earlier than Frontline composition: ${hitDiver}s vs ${hitFront}s`,
  );
}

/**
 * 11. SAME ENEMY / DIFFERENT FORMATION
 * Against Fixture B (Divers):
 * Run Formation A (Tank guarding carry lane) vs Formation B (Tank far away).
 * Produces clearly different trajectory metrics.
 */
function sameEnemyDifferentFormationCheck(): void {
  const fGood = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['mid-3', 'back-3'], // Tank mid-3 protects Mage back-3
  );
  const fBad = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['front-1', 'back-3'], // Tank front-1 leaves Mage back-3 exposed
  );

  const bGood = new AutonomousBattleModel(fGood, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);
  const bBad = new AutonomousBattleModel(fBad, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 55; i++) {
    bGood.step(SIMULATION_STEP);
    bBad.step(SIMULATION_STEP);
  }

  const mGood = bGood.getConsequenceMetrics();
  const mBad = bBad.getConsequenceMetrics();

  const mageGood = bGood.snapshot.units.find((u) => u.role === 'Mage')!.unitId;
  const mageBad = bBad.snapshot.units.find((u) => u.role === 'Mage')!.unitId;

  const dmgGood = mGood.damageTakenByUnit[mageGood] ?? 0;
  const dmgBad = mBad.damageTakenByUnit[mageBad] ?? 0;

  expect(
    dmgGood < dmgBad,
    `Good formation against Divers protects carry better: ${dmgGood} vs ${dmgBad} damage taken`,
  );
}

/**
 * 12. V11B.1 ROLE IDENTITY REGRESSION
 * In mixed battle, all 4 roles preserve their spatial identity:
 * Tank frontline, Assassin dives, Ranger HOLD/KITE, Mage preserves backline.
 */
function v11b1RoleIdentityRegressionCheck(): void {
  const f = formation(
    [
      { contentId: 'beast-a', star: 1 },
      { contentId: 'beast-b', star: 1 },
      { contentId: 'beast-c', star: 1 },
      { contentId: 'beast-d', star: 1 },
    ],
    ['front-3', 'mid-3', 'back-4', 'back-2'],
  );
  const battle = new AutonomousBattleModel(f, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 25; i++) {
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
  expect(tank.positionX - ranger.positionX >= 0.8, 'Ranger maintains backline spacing');
  expect(tank.positionX - mage.positionX >= 0.8, 'Mage maintains backline spacing');
}

/**
 * 13. FRONTLINE HEAL REGRESSION
 * Frontline Heal still targets forward living player unit during combat with archetypes.
 */
function frontlineHealRegressionCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 3);

  const battle = new AutonomousBattleModel(f, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);

  // Step until Tank takes damage
  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (tank.currentHp < tank.maxHp) break;
  }

  const tankBefore = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  const hpBefore = tankBefore.currentHp;
  const healed = battle.castFrontlineHeal('energy-a', queue);

  expect(healed, 'Frontline Heal succeeds during archetype combat');
  const tankAfter = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(tankAfter.currentHp > hpBefore, 'Forward living Tank received healing');
}

/**
 * 14. DETERMINISTIC REPEAT
 * Two identical V11C battles produce identical states across steps.
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

  const b1 = new AutonomousBattleModel(f1, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);
  const b2 = new AutonomousBattleModel(f2, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);

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
 * 15. HISTORICAL REGRESSIONS
 * Run P1V9, P1V11A, P1V11B, and P1V11B1 checks to verify zero regressions.
 */
function historicalRegressionsCheck(): void {
  runP1V9Checks();
  runP1V11AChecks();
  runP1V11BChecks();
  runP1V11B1Checks();
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
  if (!value) throw new Error(`P1-V11C check failed: ${label}`);
}

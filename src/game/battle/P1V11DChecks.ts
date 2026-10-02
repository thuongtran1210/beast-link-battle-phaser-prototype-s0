import { BattleFormation } from './BattleFormation';
import {
  AutonomousBattleModel,
  P1V11C_ARCHETYPE_RULES,
  P1V11C_FIXTURE_A_FRONTLINE,
  P1V11C_FIXTURE_B_DIVERS,
  P1V11C_FIXTURE_C_PROTECTED_RANGED,
  SIMULATION_STEP,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { EnergyQueue } from '../energy/EnergyQueue';
import {
  V11D_PRESETS,
  V11D_FIXED_PLAYER_SQUAD,
  applyFormationPreset,
  compareFormationRuns,
  createPresetFormation,
} from './FormationValidationHarness';

// Historical regression imports
import { runP1V9Checks } from './P1V9Checks';
import { runP1V11AChecks } from './P1V11AChecks';
import { runP1V11BChecks } from './P1V11BChecks';
import { runP1V11B1Checks } from './P1V11B1Checks';
import { runP1V11CChecks } from './P1V11CChecks';

function expect(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`P1-V11D check failed: ${message}`);
  }
}

/**
 * 1. SAME STATE SAME RESULT
 * Deterministic repeatability: same fixture, formation, squad -> identical metrics.
 */
function sameStateSameResultCheck(): void {
  const f1 = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const f2 = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);

  const b1 = new AutonomousBattleModel(f1, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);
  const b2 = new AutonomousBattleModel(f2, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 50; i++) {
    b1.step(SIMULATION_STEP);
    b2.step(SIMULATION_STEP);
  }

  const m1 = b1.getValidationMetrics();
  const m2 = b2.getValidationMetrics();

  expect(m1.firstBacklineHitTime === m2.firstBacklineHitTime, 'Backline hit time matches identically');
  expect(m1.tankDamageTaken === m2.tankDamageTaken, 'Tank damage matches identically');
  expect(m1.rangerAttacksResolved === m2.rangerAttacksResolved, 'Ranger attacks match identically');
  expect(m1.mageCastsResolved === m2.mageCastsResolved, 'Mage casts match identically');
  expect(m1.battleDuration === m2.battleDuration, 'Battle duration matches identically');
}

/**
 * 2. FRONTLINE FORMATION DIFFERENCE
 * Fixture A (Frontline Pressure).
 * Covered Tank formation (Preset A) vs Misaligned Tank formation (Preset B).
 * In Preset A, Tank protects backline; in Preset B, carries are contacted earlier.
 */
function frontlineFormationDifferenceCheck(): void {
  const fA = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const fB = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetB);

  const bA = new AutonomousBattleModel(fA, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);
  const bB = new AutonomousBattleModel(fB, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 60; i++) {
    bA.step(SIMULATION_STEP);
    bB.step(SIMULATION_STEP);
  }

  const mA = bA.getValidationMetrics();
  const mB = bB.getValidationMetrics();

  const hitA = mA.firstBacklineHitTime ?? 999;
  const hitB = mB.firstBacklineHitTime ?? 999;

  expect(
    hitA > hitB ||
    mA.rangerForcedKiteCount < mB.rangerForcedKiteCount ||
    mA.tankDamageTaken > mB.tankDamageTaken,
    `Covered Tank holds frontline and prevents backline kiting: kiteCount=${mA.rangerForcedKiteCount} vs ${mB.rangerForcedKiteCount}, tankDamage=${mA.tankDamageTaken} vs ${mB.tankDamageTaken}`,
  );
}

/**
 * 3. DIVER FORMATION DIFFERENCE
 * Fixture B (Backline Dive).
 * Carry Guard (Preset A: Tank at mid-3) vs Exposed Backline (Preset B: Tank at front-1).
 * In Preset A, carry takes less damage or is hit later than in Preset B.
 */
function diverFormationDifferenceCheck(): void {
  const fProt = createPresetFormation(V11D_PRESETS['backline-dive'].presetA);
  const fExpo = createPresetFormation(V11D_PRESETS['backline-dive'].presetB);

  const bProt = new AutonomousBattleModel(fProt, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);
  const bExpo = new AutonomousBattleModel(fExpo, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 45; i++) {
    bProt.step(SIMULATION_STEP);
    bExpo.step(SIMULATION_STEP);
  }

  const mProt = bProt.getValidationMetrics();
  const mExpo = bExpo.getValidationMetrics();

  expect(
    mProt.diverInterceptionCount > mExpo.diverInterceptionCount ||
    mProt.carryDamageTaken < mExpo.carryDamageTaken,
    `Protected formation intercepts more divers or carry takes less damage: intercepts=${mProt.diverInterceptionCount} vs ${mExpo.diverInterceptionCount}, carryDmg=${mProt.carryDamageTaken} vs ${mExpo.carryDamageTaken}`,
  );
}

/**
 * 4. DIVER LOCALITY
 * Tank far away (lane 1) does not magically intercept Diver in lane 4.
 */
function diverLocalityCheck(): void {
  const f = new BattleFormation([
    { contentId: 'beast-a', star: 1 }, // Tank at front-1
    { contentId: 'beast-c', star: 1 }, // Ranger at back-4
  ]);
  f.place('unit-1', 'front-1');
  f.place('unit-2', 'back-4');

  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-diver', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 150, damage: 10, archetype: 'Diver' },
  ];

  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const diver = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    expect(diver.engagedTargetId !== tank.unitId, 'Distant Tank in lane 1 does not intercept Diver in lane 4');
  }

  const metrics = battle.getValidationMetrics();
  expect(metrics.diverInterceptionCount === 0, 'Distant Tank achieves 0 diver interceptions');
}

/**
 * 5. ASSASSIN ACCESS DIFFERENCE
 * Fixture C (Protected Ranged).
 * Aligned Assassin (Preset A: lane 4) vs Misaligned Assassin (Preset B: lane 1).
 * Aligned Assassin reaches deep Ranged target faster.
 */
function assassinAccessDifferenceCheck(): void {
  const fA = createPresetFormation(V11D_PRESETS['protected-ranged'].presetA);
  const fB = createPresetFormation(V11D_PRESETS['protected-ranged'].presetB);

  const bA = new AutonomousBattleModel(fA, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);
  const bB = new AutonomousBattleModel(fB, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 50; i++) {
    bA.step(SIMULATION_STEP);
    bB.step(SIMULATION_STEP);
  }

  const mA = bA.getValidationMetrics();
  const mB = bB.getValidationMetrics();

  const contactA = mA.firstAssassinContactTime ?? 999;
  const contactB = mB.firstAssassinContactTime ?? 999;

  expect(
    contactA < contactB,
    `Aligned Assassin reaches deep enemy Ranged earlier: ${contactA}s vs ${contactB}s`,
  );
}

/**
 * 6. ENEMY RANGED UPTIME DIFFERENCE
 * In Fixture C, earlier Assassin contact reduces enemy Ranged attack freedom.
 */
function enemyRangedUptimeDifferenceCheck(): void {
  const fA = createPresetFormation(V11D_PRESETS['protected-ranged'].presetA);
  const fB = createPresetFormation(V11D_PRESETS['protected-ranged'].presetB);

  const bA = new AutonomousBattleModel(fA, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);
  const bB = new AutonomousBattleModel(fB, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 45; i++) {
    bA.step(SIMULATION_STEP);
    bB.step(SIMULATION_STEP);
  }

  const snapA = bA.snapshot;
  const snapB = bB.snapshot;

  // The targeted enemy Ranged in row Back, col 4 takes damage earlier in A
  const rangedEnemyA = snapA.enemies.find((e) => e.column === 4 && e.archetype === 'Ranged')!;
  const rangedEnemyB = snapB.enemies.find((e) => e.column === 4 && e.archetype === 'Ranged')!;

  expect(
    rangedEnemyA.currentHp < rangedEnemyB.currentHp,
    `Enemy Ranged in lane 4 is suppressed earlier in aligned formation: ${rangedEnemyA.currentHp} vs ${rangedEnemyB.currentHp}`,
  );
}

/**
 * 7. SAME FORMATION / DIFFERENT ENEMY
 * Run the exact same player squad & formation against Fixture A, B, and C.
 * Assert distinct tactical trajectory metrics across fixtures.
 */
function sameFormationDifferentEnemyCheck(): void {
  const fA = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const fB = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const fC = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);

  const bA = new AutonomousBattleModel(fA, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);
  const bB = new AutonomousBattleModel(fB, P1V11C_FIXTURE_B_DIVERS, P1V11C_ARCHETYPE_RULES);
  const bC = new AutonomousBattleModel(fC, P1V11C_FIXTURE_C_PROTECTED_RANGED, P1V11C_ARCHETYPE_RULES);

  for (let i = 0; i < 55; i++) {
    bA.step(SIMULATION_STEP);
    bB.step(SIMULATION_STEP);
    bC.step(SIMULATION_STEP);
  }

  const mA = bA.getValidationMetrics();
  const mB = bB.getValidationMetrics();
  const mC = bC.getValidationMetrics();

  // Distinct metrics prove that the same formation experiences different spatial pressures
  const hitA = mA.firstBacklineHitTime ?? 999;
  const hitB = mB.firstBacklineHitTime ?? 999;

  expect(
    hitB < hitA || mB.carryDamageTaken !== mA.carryDamageTaken,
    `Divers produce different carry pressure than Frontliners: hitB=${hitB}s vs hitA=${hitA}s`,
  );
  expect(
    mA.diverInterceptionCount !== mB.diverInterceptionCount ||
    mA.tankDamageTaken !== mC.tankDamageTaken,
    'Different enemy fixtures yield distinct interception or frontline absorption metrics',
  );
}

/**
 * 8. ROLE IDENTITY REMAINS READABLE
 * Tank engages/holds, Assassin dives, Ranger/Mage hold/kite without collapsing.
 */
function roleIdentityRemainsReadableCheck(): void {
  const f = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const battle = new AutonomousBattleModel(f, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);

  battle.step(SIMULATION_STEP);
  const snap = battle.snapshot;

  const tank = snap.units.find((u) => u.role === 'Tanker')!;
  const assassin = snap.units.find((u) => u.role === 'Assassin')!;
  const ranger = snap.units.find((u) => u.role === 'Ranger')!;
  const mage = snap.units.find((u) => u.role === 'Mage')!;

  expect(
    tank.movementPolicyState === 'Engage' || tank.movementPolicyState === 'AdvanceToRange',
    `Tank adopts Engage/AdvanceToRange identity (got ${tank.movementPolicyState})`,
  );
  expect(assassin.movementPolicyState === 'Dive', 'Assassin adopts Dive identity');
  expect(ranger.movementPolicyState === 'Hold' || ranger.movementPolicyState === 'AdvanceToRange', 'Ranger adopts Hold/AdvanceToRange identity');
  expect(mage.movementPolicyState === 'Hold' || mage.movementPolicyState === 'AdvanceToRange', 'Mage adopts Hold/AdvanceToRange identity');
}

/**
 * 9. NO ROW BONUS REGRESSION
 * Verify damage applied equals unit damage, with no row-based artificial multipliers.
 */
function noRowBonusRegressionCheck(): void {
  // Test unit at Front row
  const fFront = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  fFront.place('unit-1', 'front-3');
  const enemies1: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 500, damage: 0, archetype: 'Frontliner' },
  ];
  const bFront = new AutonomousBattleModel(fFront, enemies1, P1V11C_ARCHETYPE_RULES);
  const baseDamage = bFront.snapshot.units[0].damage;

  let damageFront = 0;
  for (let i = 0; i < 25; i++) {
    bFront.step(SIMULATION_STEP);
    if (bFront.snapshot.enemies[0].currentHp < 500) {
      damageFront = 500 - bFront.snapshot.enemies[0].currentHp;
      break;
    }
  }

  expect(
    damageFront === baseDamage,
    `Frontline unit deals exact base damage (${baseDamage}), no row multiplier (${damageFront})`,
  );
}

/**
 * 10. NO CLASS BONUS REGRESSION
 * Verify Assassin dealing damage to Ranged does not have hard-coded rock-paper-scissors class multipliers.
 */
function noClassBonusRegressionCheck(): void {
  const f = new BattleFormation([{ contentId: 'beast-b', star: 1 }]); // Assassin
  f.place('unit-1', 'front-3');

  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e-ranged', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 500, damage: 0, archetype: 'Ranged' },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11C_ARCHETYPE_RULES);

  const assassin = battle.snapshot.units[0];
  const baseAssassinDamage = assassin.damage;

  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const snap = battle.snapshot;
    if (snap.enemies[0].currentHp < 500) {
      const damageDealt = 500 - snap.enemies[0].currentHp;
      expect(
        damageDealt === baseAssassinDamage,
        `Assassin damage to Ranged matches exact base damage (${baseAssassinDamage}), no class multiplier (${damageDealt})`,
      );
      return;
    }
  }
}

/**
 * 11. ENERGY REGRESSION
 * Stored Energy Heal still functions deterministically during V11D battle without corrupting metrics.
 */
function energyRegressionCheck(): void {
  const f = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 2);

  const battle = new AutonomousBattleModel(f, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);

  // Step until forward living unit takes damage
  for (let i = 0; i < 25; i++) {
    battle.step(SIMULATION_STEP);
    const forwardUnit = battle.target();
    if (forwardUnit && forwardUnit.currentHp < forwardUnit.maxHp) break;
  }

  const forwardBefore = battle.target();
  expect(forwardBefore !== undefined, 'Found forward living player unit');
  const hpBefore = forwardBefore!.currentHp;
  const targetId = forwardBefore!.unitId;

  const healed = battle.castFrontlineHeal('energy-a', queue);

  expect(healed, 'Frontline Heal succeeds in V11D battle');
  expect(queue.getCharges('energy-a') === 1, 'Consumes exactly 1 charge from queue');

  const forwardAfter = battle.snapshot.units.find((u) => u.unitId === targetId)!;
  expect(forwardAfter.currentHp > hpBefore, 'Forward living unit received healing');

  const metrics = battle.getValidationMetrics();
  expect(metrics.tankDamageTaken > 0 || metrics.carryDamageTaken > 0 || metrics.assassinAttacksResolved > 0, 'Formation validation metrics remain valid after heal cast');
}

/**
 * 12. MANUAL DEPLOYMENT COMPATIBILITY
 * Load preset, manually move a unit to another slot, start battle.
 * Assert AutonomousBattleModel initializes using the actual modified position.
 */
function manualDeploymentCompatibilityCheck(): void {
  const f = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  const tank = f.units.find((u) => u.role === 'Tanker')!;
  expect(tank.slotId === 'front-3', 'Tank originally at front-3');

  // Manually move Tank to mid-3
  f.place(tank.unitId, 'mid-3');
  expect(f.units.find((u) => u.role === 'Tanker')?.slotId === 'mid-3', 'Tank moved to mid-3');

  const battle = new AutonomousBattleModel(f, P1V11C_FIXTURE_A_FRONTLINE, P1V11C_ARCHETYPE_RULES);
  const battleTank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(battleTank.positionX === -2, `AutonomousBattleModel uses modified manual position (X = -2, actual = ${battleTank.positionX})`);
}

/**
 * 13. PRESET RESTART CLEANUP
 * Verify BattleFormation reset and preset re-application produces a clean state.
 */
function presetRestartCleanupCheck(): void {
  const f = createPresetFormation(V11D_PRESETS['frontline-pressure'].presetA);
  expect(f.allPlaced, 'All units placed in Preset A');

  f.reset();
  expect(!f.allPlaced, 'All units unplaced after reset');
  expect(f.units.every((u) => u.slotId === null), 'Every unit slotId is null');
  expect(f.slots.every((s) => s.unitId === null), 'Every slot unitId is null');

  applyFormationPreset(f, V11D_PRESETS['frontline-pressure'].presetB);
  expect(f.allPlaced, 'All units placed in Preset B cleanly');
}

/**
 * 14. RESULT COMPARISON FACTS
 * Assert compareFormationRuns returns objective facts without scores or subjective tiers.
 */
function resultComparisonFactsCheck(): void {
  const runA = {
    tankDamageTaken: 80,
    rangerDamageTaken: 0,
    mageDamageTaken: 0,
    carryDamageTaken: 0,
    rangerAttacksResolved: 6,
    mageCastsResolved: 4,
    assassinAttacksResolved: 5,
    rangerForcedKiteCount: 0,
    mageForcedRepositionCount: 0,
    diverInterceptionCount: 2,
    frontlineInterceptionCount: 1,
    rangerSurvivalTime: 8.0,
    mageSurvivalTime: 8.0,
    battleDuration: 8.0,
    battleResult: 'Win' as const,
    firstBacklineHitTime: undefined,
    firstCarryHitTime: undefined,
    firstAssassinContactTime: 2.5,
  };

  const runB = {
    tankDamageTaken: 40,
    rangerDamageTaken: 25,
    mageDamageTaken: 30,
    carryDamageTaken: 55,
    rangerAttacksResolved: 3,
    mageCastsResolved: 1,
    assassinAttacksResolved: 4,
    rangerForcedKiteCount: 2,
    mageForcedRepositionCount: 2,
    diverInterceptionCount: 0,
    frontlineInterceptionCount: 0,
    rangerSurvivalTime: 5.2,
    mageSurvivalTime: 4.8,
    battleDuration: 7.5,
    battleResult: 'Lose' as const,
    firstBacklineHitTime: 3.5,
    firstCarryHitTime: 3.5,
    firstAssassinContactTime: 3.7,
  };

  const comparison = compareFormationRuns(runA, runB);

  expect(comparison.rangerAttacksDelta === 3, `Ranger attack delta is +3 (got ${comparison.rangerAttacksDelta})`);
  expect(comparison.mageCastsDelta === 3, `Mage casts delta is +3 (got ${comparison.mageCastsDelta})`);
  expect(comparison.carryDamageDelta === -55, `Carry damage delta is -55 (got ${comparison.carryDamageDelta})`);
  expect(comparison.diverInterceptionsDelta === 2, `Diver interceptions delta is +2 (got ${comparison.diverInterceptionsDelta})`);
  expect(comparison.statements.length > 0, 'Generates factual statements');

  // Verify no gamified tiering
  const fullText = comparison.statements.join(' ');
  expect(!fullText.includes('S-tier'), 'No gamified S-tier ratings');
  expect(!fullText.includes('Best formation'), 'No subjective "Best formation" claims');
}

/**
 * 15. HISTORICAL REGRESSION
 * All previous suites (V9, V11A, V11B, V11B.1, V11C) remain green.
 */
function historicalRegressionCheck(): void {
  runP1V9Checks();
  runP1V11AChecks();
  runP1V11BChecks();
  runP1V11B1Checks();
  runP1V11CChecks();
}

export function runP1V11DChecks(): void {
  sameStateSameResultCheck();
  frontlineFormationDifferenceCheck();
  diverFormationDifferenceCheck();
  diverLocalityCheck();
  assassinAccessDifferenceCheck();
  enemyRangedUptimeDifferenceCheck();
  sameFormationDifferentEnemyCheck();
  roleIdentityRemainsReadableCheck();
  noRowBonusRegressionCheck();
  noClassBonusRegressionCheck();
  energyRegressionCheck();
  manualDeploymentCompatibilityCheck();
  presetRestartCleanupCheck();
  resultComparisonFactsCheck();
  historicalRegressionCheck();
}

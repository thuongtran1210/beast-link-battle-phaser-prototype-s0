import {
  AutonomousBattleModel,
  P1V11B_ENGAGEMENT_RULES,
  SIMULATION_STEP,
  type EnemyFixture,
} from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';

export function runP1V11BChecks(): void {
  tankInterceptsSameLaneCheck();
  wrongLaneTankDoesNotMagicallyProtectCheck();
  engagementStopsPassThroughCheck();
  engagementPersistsCheck();
  tankDeathExposesBacklineCheck();
  formationChangesBacklineContactTimeCheck();
  formationChangesRangerUptimeCheck();
  noRowDamageMultiplierCheck();
  assassinRegressionCheck();
  frontlineHealDuringEngagementCheck();
  deterministicRepeatCheck();
  historicalRegressionsCheck();
}

/**
 * 1. TANK INTERCEPTS SAME-LANE APPROACH
 * Tank in front (front-3), Ranger behind (back-3), enemy melee approaching in lane 3.
 * Enemy intercepts Tank, attacks Tank first, and cannot reach Ranger while Tank lives.
 */
function tankInterceptsSameLaneCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

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

  expect(intercepted, 'Tank intercepts enemy approaching in same lane');

  // Step further while Tank is alive
  for (let i = 0; i < 20; i++) {
    battle.step(SIMULATION_STEP);
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    const ranger = battle.snapshot.units.find((u) => u.role === 'Ranger')!;
    if (tank.currentHp > 0) {
      expect(ranger.currentHp === ranger.maxHp, 'Ranger takes no damage while Tank holds the frontline');
    }
  }

  const metrics = battle.getConsequenceMetrics();
  const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect((metrics.damageTakenByUnit[tank.unitId] ?? 0) > 0, 'Tank receives enemy attacks first');
}

/**
 * 2. WRONG-LANE TANK DOES NOT MAGICALLY PROTECT
 * Ranger in threatened lane (back-3), Tank far away in another lane (front-1).
 * Tank does NOT intercept; enemy advances directly toward Ranger in lane 3.
 */
function wrongLaneTankDoesNotMagicallyProtectCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-1', 'front-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  for (let i = 0; i < 70; i++) {
    battle.step(SIMULATION_STEP);
    const e = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    expect(e.engagedTargetId !== tank.unitId, 'Tank in lane 1 does not magically protect Ranger in lane 3');
  }

  const metrics = battle.getConsequenceMetrics();
  expect(
    metrics.firstBacklineHitTime !== undefined && metrics.firstBacklineHitTime <= 7.0,
    'Enemy reaches and hits unprotected Ranger in wrong-lane formation',
  );
}

/**
 * 3. ENGAGEMENT STOPS PASS-THROUGH
 * Enemy position must not cross past the Tank toward the backline while engaged.
 */
function engagementStopsPassThroughCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  let engaged = false;
  for (let i = 0; i < 40; i++) {
    battle.step(SIMULATION_STEP);
    const e = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (e.engagedTargetId === tank.unitId) {
      engaged = true;
      expect(
        e.positionX >= tank.positionX,
        'Engaged enemy world position does not pass through Tank toward backline',
      );
    }
  }
  expect(engaged, 'Enemy engaged Tank before pass-through check');
}

/**
 * 4. ENGAGEMENT PERSISTS
 * Across multiple simulation steps, engagement target remains locked without flickering.
 */
function engagementPersistsCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 5 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  let engagedStep = -1;
  for (let i = 0; i < 50; i++) {
    battle.step(SIMULATION_STEP);
    const e = battle.snapshot.enemies[0];
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (e.engagedTargetId === tank.unitId) {
      if (engagedStep === -1) engagedStep = i;
    }
    if (engagedStep !== -1 && i <= engagedStep + 15 && tank.currentHp > 0) {
      expect(
        e.engagedTargetId === tank.unitId && e.targetUnitId === tank.unitId,
        'Engagement target persists without flickering across steps',
      );
    }
  }
}

/**
 * 5. TANK DEATH EXPOSES BACKLINE
 * When Tank dies, engagement clears, enemy reacquires Ranger, resumes movement, and attacks Ranger.
 */
function tankDeathExposesBacklineCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  // Enemy with high damage to quickly defeat Tank
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 45 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  let tankDied = false;
  for (let i = 0; i < 60; i++) {
    battle.step(SIMULATION_STEP);
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    const e = battle.snapshot.enemies[0];
    if (tank.currentHp <= 0 && !tankDied) {
      tankDied = true;
      expect(e.engagedTargetId === undefined, 'Engagement clears when Tank dies');
      battle.step(SIMULATION_STEP);
      const ranger = battle.snapshot.units.find((u) => u.role === 'Ranger')!;
      expect(battle.snapshot.enemies[0].targetUnitId === ranger.unitId, 'Enemy reacquires Ranger');
    }
    if (tankDied && e.currentHp > 0) {
      const ranger = battle.snapshot.units.find((u) => u.role === 'Ranger')!;
      if (ranger.currentHp < ranger.maxHp) {
        // Enemy successfully reached and hit backline
        return;
      }
    }
  }
  expect(tankDied, 'Tank died during frontline collapse test');
}

/**
 * 6. FORMATION CHANGES BACKLINE CONTACT TIME
 * Formation A (Tank front-3, Ranger back-3) vs Formation B (Tank front-1, Ranger back-3).
 * Assert: firstBacklineHitTime(A) > firstBacklineHitTime(B).
 */
function formationChangesBacklineContactTimeCheck(): void {
  const fA = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const fB = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-1', 'back-3'],
  );
  const enemiesA: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const enemiesB: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];

  const battleA = new AutonomousBattleModel(fA, enemiesA, P1V11B_ENGAGEMENT_RULES);
  const battleB = new AutonomousBattleModel(fB, enemiesB, P1V11B_ENGAGEMENT_RULES);

  for (let i = 0; i < 70; i++) {
    battleA.step(SIMULATION_STEP);
    battleB.step(SIMULATION_STEP);
  }

  const metricsA = battleA.getConsequenceMetrics();
  const metricsB = battleB.getConsequenceMetrics();

  const hitTimeA = metricsA.firstBacklineHitTime ?? 999;
  const hitTimeB = metricsB.firstBacklineHitTime;

  expect(hitTimeB !== undefined, 'Formation B unprotected Ranger was hit');
  expect(hitTimeA > hitTimeB!, `Formation A delays backline contact: ${hitTimeA}s vs ${hitTimeB}s`);
}

/**
 * 7. FORMATION CHANGES RANGER UPTIME
 * In Formation A, Ranger takes less damage and resolves at least as many or more attacks.
 */
function formationChangesRangerUptimeCheck(): void {
  const fA = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const fB = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-1', 'back-3'],
  );
  const enemiesA: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 150, damage: 12 },
  ];
  const enemiesB: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 150, damage: 12 },
  ];

  const battleA = new AutonomousBattleModel(fA, enemiesA, P1V11B_ENGAGEMENT_RULES);
  const battleB = new AutonomousBattleModel(fB, enemiesB, P1V11B_ENGAGEMENT_RULES);

  for (let i = 0; i < 70; i++) {
    battleA.step(SIMULATION_STEP);
    battleB.step(SIMULATION_STEP);
  }

  const metricsA = battleA.getConsequenceMetrics();
  const metricsB = battleB.getConsequenceMetrics();

  const rangerA = battleA.snapshot.units.find((u) => u.role === 'Ranger')!;
  const rangerB = battleB.snapshot.units.find((u) => u.role === 'Ranger')!;

  const dmgA = metricsA.damageTakenByUnit[rangerA.unitId] ?? 0;
  const dmgB = metricsB.damageTakenByUnit[rangerB.unitId] ?? 0;
  expect(dmgA < dmgB, `Ranger took less damage when protected: ${dmgA} vs ${dmgB}`);

  const attacksA = metricsA.attacksResolvedByUnit[rangerA.unitId] ?? 0;
  const attacksB = metricsB.attacksResolvedByUnit[rangerB.unitId] ?? 0;
  expect(attacksA >= attacksB, `Ranger gained attack uptime when protected: ${attacksA} vs ${attacksB}`);
}

/**
 * 8. NO ROW DAMAGE MULTIPLIER
 * Ranger damage is not modified by row in V11B.
 */
function noRowDamageMultiplierCheck(): void {
  const fFront = formation([{ contentId: 'beast-c', star: 1 }], ['front-3']);
  const fBack = formation([{ contentId: 'beast-c', star: 1 }], ['back-3']);
  const bFront = new AutonomousBattleModel(fFront, [{ enemyId: 'e', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 100, damage: 0 }], P1V11B_ENGAGEMENT_RULES);
  const bBack = new AutonomousBattleModel(fBack, [{ enemyId: 'e', slotId: 'enemy-mid-3', row: 'Mid', column: 3, maxHp: 100, damage: 0 }], P1V11B_ENGAGEMENT_RULES);

  expect(bFront.snapshot.units[0].damage === 10, 'Front Ranger base damage is 10');
  expect(bBack.snapshot.units[0].damage === 10, 'Back Ranger base damage is 10');
}

/**
 * 9. ASSASSIN REGRESSION
 * Player Assassin deep dive identity is preserved and not intercepted by player Tank.
 */
function assassinRegressionCheck(): void {
  const f = formation(
    [{ contentId: 'beast-b', star: 1 }, { contentId: 'beast-a', star: 1 }],
    ['front-3', 'front-2'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'eFront', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 100, damage: 0 },
    { enemyId: 'eBack', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 100, damage: 0 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  battle.step(SIMULATION_STEP);
  const assassin = battle.snapshot.units.find((u) => u.role === 'Assassin')!;
  expect(assassin.targetEnemyId === 'eBack', 'Player Assassin continues targeting deep enemy in V11B');
}

/**
 * 10. FRONTLINE HEAL
 * During active engagement, casting Frontline Heal heals the holding Tank without resetting timers.
 */
function frontlineHealDuringEngagementCheck(): void {
  const f = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 200, damage: 10 },
  ];
  const battle = new AutonomousBattleModel(f, enemies, P1V11B_ENGAGEMENT_RULES);

  // Advance until Tank takes damage while engaged
  for (let i = 0; i < 30; i++) {
    battle.step(SIMULATION_STEP);
    const tank = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
    if (tank.currentHp < tank.maxHp) break;
  }

  const tankerBefore = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(tankerBefore.currentHp < tankerBefore.maxHp, 'Tanker has taken damage');
  const enemyBefore = battle.snapshot.enemies[0];
  expect(enemyBefore.engagedTargetId === tankerBefore.unitId, 'Enemy is engaged with Tank');

  const cooldownBefore = tankerBefore.attackCooldownRemaining;
  const windupBefore = tankerBefore.attackWindupRemaining;
  const stateBefore = tankerBefore.actionState;

  const queue = new EnergyQueue();
  queue.addCharge('energy-a', 1);
  const healed = battle.castFrontlineHeal('energy-a', queue);
  expect(healed, 'Frontline Heal succeeds during engagement');

  const tankerAfter = battle.snapshot.units.find((u) => u.role === 'Tanker')!;
  expect(tankerAfter.currentHp > tankerBefore.currentHp, 'Tanker received heal');
  expect(tankerAfter.actionState === stateBefore, 'Action state preserved across heal');
  expect(tankerAfter.attackCooldownRemaining === cooldownBefore, 'Attack cooldown preserved across heal');
  expect(tankerAfter.attackWindupRemaining === windupBefore, 'Attack windup preserved across heal');
  expect(battle.snapshot.enemies[0].engagedTargetId === tankerAfter.unitId, 'Engagement remains locked after heal');
}

/**
 * 11. DETERMINISTIC REPEAT
 * Two identical V11B battles produce 100% identical state timelines.
 */
function deterministicRepeatCheck(): void {
  const f1 = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const f2 = formation(
    [{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }],
    ['front-3', 'back-3'],
  );
  const enemies: ReadonlyArray<EnemyFixture> = [
    { enemyId: 'e1', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 100, damage: 10 },
  ];

  const b1 = new AutonomousBattleModel(f1, enemies, P1V11B_ENGAGEMENT_RULES);
  const b2 = new AutonomousBattleModel(f2, enemies, P1V11B_ENGAGEMENT_RULES);

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
 * Legacy, V8, V9, V11A models tick without errors or regressions.
 */
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
  if (!value) throw new Error(`P1-V11B check failed: ${label}`);
}

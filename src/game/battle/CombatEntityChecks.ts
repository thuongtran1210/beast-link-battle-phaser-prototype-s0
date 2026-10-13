import {
  unitToCombatEntity,
  enemyToCombatEntity,
  syncEntityToUnit,
  syncEntityToEnemy,
  isEntityAlive,
  entityDistance,
  type CombatEntity,
} from './entities/CombatEntity';
import { BattleTargetingSystem } from './systems/BattleTargetingSystem';
import { BattleMovementSystem } from './systems/BattleMovementSystem';
import {
  P1V11C_ARCHETYPE_RULES,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  ENEMY_MIN_X,
  ENEMY_MAX_X,
} from './BattleConfig';
import type { CombatUnit, EnemyCombatUnit } from './BattleTypes';

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`CombatEntity Check Failed: ${message}`);
}

export function runCombatEntityChecks(): void {
  // Test 1: Unit to CombatEntity conversion & sync back
  const sampleUnit: CombatUnit = {
    unitId: 'beast-tank-1',
    beastId: 'duck-guardian',
    role: 'Tanker',
    star: 2,
    slotId: 'front-1',
    row: 'Front',
    column: 2,
    currentHp: 180,
    maxHp: 200,
    damage: 18,
    positionX: 3.5,
    positionLane: 2,
    targetEnemyId: 'enemy-front-1',
    actionState: 'Windup',
  };

  const entityA = unitToCombatEntity(sampleUnit, 'TeamA');
  expect(entityA.entityId === 'beast-tank-1', 'entityId must match unitId');
  expect(entityA.teamId === 'TeamA', 'teamId must be TeamA');
  expect(entityA.displayName === 'duck-guardian', 'displayName must match beastId');
  expect(entityA.targetEntityId === 'enemy-front-1', 'targetEntityId must match targetEnemyId');
  expect(isEntityAlive(entityA), 'entityA must be alive');

  // Mutation and sync back
  entityA.currentHp = 120;
  entityA.positionX = 4.2;
  entityA.actionState = 'Recovering';
  entityA.targetEntityId = 'enemy-front-2';
  syncEntityToUnit(entityA, sampleUnit);

  expect(sampleUnit.currentHp === 120, 'sampleUnit currentHp must sync back to 120');
  expect(sampleUnit.positionX === 4.2, 'sampleUnit positionX must sync back to 4.2');
  expect(sampleUnit.actionState === 'Recovering', 'sampleUnit actionState must sync back to Recovering');
  expect(sampleUnit.targetEnemyId === 'enemy-front-2', 'sampleUnit targetEnemyId must sync back');

  // Test 2: Enemy to CombatEntity conversion & sync back
  const sampleEnemy: EnemyCombatUnit = {
    enemyId: 'crow-1',
    slotId: 'enemy-mid-1',
    row: 'Mid',
    column: 3,
    maxHp: 150,
    currentHp: 150,
    damage: 15,
    positionX: 7.0,
    positionLane: 3,
    archetype: 'Diver',
    targetUnitId: 'beast-tank-1',
  };

  const entityB = enemyToCombatEntity(sampleEnemy, 'TeamB');
  expect(entityB.entityId === 'crow-1', 'entityId must match enemyId');
  expect(entityB.teamId === 'TeamB', 'teamId must be TeamB');
  expect(entityB.targetEntityId === 'beast-tank-1', 'targetEntityId must match targetUnitId');

  entityB.currentHp = 0;
  expect(!isEntityAlive(entityB), 'Dead entity must report !isEntityAlive');
  syncEntityToEnemy(entityB, sampleEnemy);
  expect(sampleEnemy.currentHp === 0, 'Enemy currentHp must sync back to 0');

  // Test 3: entityDistance calculation
  const dist = entityDistance(entityA, entityB, 30);
  expect(dist > 0, 'Distance must be positive');

  // Test 4: BattleTargetingSystem.targetEntity matches legacy targeting logic
  const unitList: CombatUnit[] = [
    {
      unitId: 'u1',
      beastId: 'b1',
      role: 'Tanker',
      star: 1,
      slotId: 's1',
      row: 'Front',
      column: 1,
      currentHp: 100,
      maxHp: 100,
      damage: 10,
      positionX: 4.5,
      positionLane: 1,
    },
    {
      unitId: 'u2',
      beastId: 'b2',
      role: 'Ranger',
      star: 1,
      slotId: 's2',
      row: 'Back',
      column: 2,
      currentHp: 80,
      maxHp: 80,
      damage: 15,
      positionX: 2.0,
      positionLane: 2,
    },
  ];

  const legacyUnitTarget = BattleTargetingSystem.target(unitList, P1V11C_ARCHETYPE_RULES);
  const entitiesA = unitList.map((u) => unitToCombatEntity(u, 'TeamA'));
  const entityTargetResult = BattleTargetingSystem.targetEntity(entitiesA, P1V11C_ARCHETYPE_RULES, 'TeamA');

  expect(
    legacyUnitTarget?.unitId === entityTargetResult?.entityId,
    'Unified targetEntity must match legacy target() for TeamA',
  );

  // Test 5: Movement System bounds and directions
  const movingEntityA: CombatEntity = {
    entityId: 'eA',
    teamId: 'TeamA',
    displayName: 'A',
    row: 'Front',
    column: 1,
    currentHp: 100,
    maxHp: 100,
    damage: 10,
    positionX: -1.0,
    positionLane: 2,
  };

  const targetEntityB: CombatEntity = {
    entityId: 'eB',
    teamId: 'TeamB',
    displayName: 'B',
    row: 'Front',
    column: 1,
    currentHp: 100,
    maxHp: 100,
    damage: 10,
    positionX: 1.5,
    positionLane: 2,
  };

  BattleMovementSystem.moveEntityToward(movingEntityA, targetEntityB, 2.0, 1.0);
  expect(movingEntityA.positionX <= PLAYER_MAX_X, `TeamA positionX must not exceed PLAYER_MAX_X (${PLAYER_MAX_X})`);

  // Retreat Entity direction check
  const startX = movingEntityA.positionX;
  BattleMovementSystem.retreatEntity(movingEntityA, 0.5);
  expect(movingEntityA.positionX < startX, 'TeamA retreat must move positionX backwards');

  const startEnemyX = targetEntityB.positionX;
  BattleMovementSystem.retreatEntity(targetEntityB, 0.5);
  expect(targetEntityB.positionX > startEnemyX, 'TeamB retreat must move positionX forward towards enemy baseline');
}

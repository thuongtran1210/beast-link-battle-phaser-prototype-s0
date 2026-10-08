// Battle tuning constants and rule presets. Extracted verbatim from AutonomousBattleModel.ts.
// Values are gameplay-frozen; the battle golden master guards them.
import type { BeastRole } from './BeastRoles';
import type { BattleRow, ActionTimingProfile, EnemyArchetype, EnemyFixture, BattleCombatRules, EngagementFixture, EnemyArchetypeProfile, RoleMovementConfig } from './BattleTypes';

export const P1V11A_ACTION_TIMING_FIXTURE: Readonly<Record<BeastRole | 'Enemy', ActionTimingProfile>> = {
  Tanker: { attackInterval: 1.4, windup: 0.30 },
  Assassin: { attackInterval: 1.0, windup: 0.18 },
  Ranger: { attackInterval: 1.25, windup: 0.20 },
  Mage: { attackInterval: 1.8, windup: 0.40 },
  Enemy: { attackInterval: 1.4, windup: 0.30 },
};

export const SIMULATION_STEP = 0.1;

export const P1V13A_SIGNATURE_FIXTURE = { guardianBraceShieldHp: 70, guardianBraceDuration: 2.4, ambushMultiplier: 1.55, focusHoldThreshold: 1.6, focusMultiplier: 1.5, arcaneBloomRadius: 1.25, arcaneBloomSplashMultiplier: 0.5, arcaneBloomSecondaryLimit: 2 } as const;

export const LEGACY_BATTLE_COMBAT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: false,
  movement: false,
};

export const P1V8_ROLE_POSITIONING_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: false,
};

export const P1V9_AUTONOMOUS_MOVEMENT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
};

export const P1V11A_TIMELINE_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
};

export const P1V11B_ENGAGEMENT_FIXTURE: Readonly<EngagementFixture> = {
  tankGuardRadius: 1.25,
  meleeEngageRange: 0.72,
  disengagePadding: 0.25,
};

export const P1V11B_ENGAGEMENT_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};

export const P1V11B1_ROLE_IDENTITY_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};

export const P1V11C_ARCHETYPE_RULES: Readonly<BattleCombatRules> = {
  rolePositioning: true,
  movement: true,
  timeline: true,
  engagement: true,
  roleIdentity: true,
  archetypes: true,
};
export const P1V13A_SIGNATURE_RULES: Readonly<BattleCombatRules> = { ...P1V11C_ARCHETYPE_RULES, signatures: true };

export const P1V11C_ENEMY_ARCHETYPE_FIXTURE: Readonly<Record<EnemyArchetype, EnemyArchetypeProfile>> = {
  Frontliner: {
    speed: 0.58,
    attackRange: 0.72,
    preferredMinRange: 0,
    dangerRange: 0,
    attackInterval: 1.4,
    windup: 0.30,
  },
  Diver: {
    speed: 0.95,
    attackRange: 0.72,
    preferredMinRange: 0,
    dangerRange: 0,
    attackInterval: 1.2,
    windup: 0.20,
  },
  Ranged: {
    speed: 0.50,
    attackRange: 3.8,
    preferredMinRange: 2.8,
    dangerRange: 1.8,
    attackInterval: 1.5,
    windup: 0.35,
  },
};

export const P1V11C_FIXTURE_A_FRONTLINE: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-2', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 180, damage: 10, archetype: 'Frontliner' },
];

export const P1V11C_FIXTURE_B_DIVERS: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-diver-2', slotId: 'enemy-front-2', row: 'Front', column: 2, maxHp: 120, damage: 12, archetype: 'Diver' },
  { enemyId: 'enemy-diver-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 120, damage: 12, archetype: 'Diver' },
];

export const P1V11C_FIXTURE_C_PROTECTED_RANGED: ReadonlyArray<EnemyFixture> = [
  { enemyId: 'enemy-front-3', slotId: 'enemy-front-3', row: 'Front', column: 3, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-front-4', slotId: 'enemy-front-4', row: 'Front', column: 4, maxHp: 180, damage: 10, archetype: 'Frontliner' },
  { enemyId: 'enemy-ranged-3', slotId: 'enemy-back-3', row: 'Back', column: 3, maxHp: 100, damage: 11, archetype: 'Ranged' },
  { enemyId: 'enemy-ranged-4', slotId: 'enemy-back-4', row: 'Back', column: 4, maxHp: 100, damage: 11, archetype: 'Ranged' },
];

export const EXPERIMENTAL_FRONTLINE_HEAL_HP = 30;
export const FRONTLINE_HEAL_HP = 30;

export const LEGACY_SINGLE_ENEMY_FIXTURE: ReadonlyArray<EnemyFixture> = [
  {
    enemyId: 'enemy-legacy',
    slotId: 'enemy-front-3',
    row: 'Front',
    column: 3,
    maxHp: 150,
    damage: 15,
  },
];

export const baseStats: Readonly<Record<BeastRole, { hp: number; damage: number }>> = {
  Tanker: { hp: 80, damage: 6 },
  Assassin: { hp: 35, damage: 14 },
  Ranger: { hp: 45, damage: 10 },
  Mage: { hp: 40, damage: 9 },
};

export const rowOrder: Readonly<Record<BattleRow, number>> = {
  Front: 0,
  Mid: 1,
  Back: 2,
};

export const PLAYER_SPAWN_X: Readonly<Record<BattleRow, number>> = {
  Front: -1,
  Mid: -2,
  Back: -3,
};

export const ENEMY_SPAWN_X: Readonly<Record<BattleRow, number>> = {
  Front: 1,
  Mid: 2,
  Back: 3,
};

export const LANE_DISTANCE_SCALE = 0.65;
export const PLAYER_MIN_X = -3.4;
export const PLAYER_MAX_X = 3.2;
export const ENEMY_MIN_X = -3.2;
export const ENEMY_MAX_X = 3.4;

export const movementProfile: Readonly<Record<BeastRole, RoleMovementConfig>> = {
  Tanker: {
    speed: 0.75,
    attackRange: 0.72,
    minRange: 0,
    preferredMinRange: 0,
    dangerRange: 0,
    leashRadius: 999,
  },
  Assassin: {
    speed: 1.25,
    attackRange: 0.68,
    minRange: 0,
    preferredMinRange: 0,
    dangerRange: 0,
    leashRadius: 999,
  },
  Ranger: {
    speed: 0.65,
    attackRange: 4.2,
    minRange: 2.6,
    preferredMinRange: 3.15,
    dangerRange: 2.10,
    leashRadius: 2.2,
  },
  Mage: {
    speed: 0.55,
    attackRange: 3.6,
    minRange: 1.8,
    preferredMinRange: 2.70,
    dangerRange: 1.80,
    leashRadius: 1.4,
  },
};

export const ENEMY_MOVE_SPEED = 0.58;
export const ENEMY_ATTACK_RANGE = 0.72;
export const COMBAT_DISTANCE_EPSILON = 0.001;

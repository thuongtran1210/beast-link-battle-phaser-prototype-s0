import type {
  BattleRow,
  CombatActionState,
  FormationAnchor,
  RoleMovementState,
  CombatUnit,
  EnemyCombatUnit,
  EnemyArchetype,
} from '../BattleTypes';
import type { BeastRole, BeastSignatureId } from '../BeastRoles';

export type TeamSide = 'TeamA' | 'TeamB';
export type TeamSideAlias = TeamSide | 'Player' | 'Opponent';

export function normalizeTeamSide(team: TeamSideAlias): TeamSide {
  if (team === 'Player') return 'TeamA';
  if (team === 'Opponent') return 'TeamB';
  return team;
}

/**
 * Unified Combat Entity representing any participant in combat
 * (Player Beast, Opponent Beast in PvP, or NPC Mob/Boss).
 */
export interface CombatEntity {
  /** Unique entity ID within the battle match */
  entityId: string;
  /** Team affiliation */
  teamId: TeamSide;
  /** Display name or catalog identifier */
  displayName: string;
  /** Tactical positioning */
  row: BattleRow;
  column: number;
  /** Core combat attributes */
  currentHp: number;
  maxHp: number;
  damage: number;
  /** Model-space continuous coordinates */
  positionX: number;
  positionLane: number;
  formationAnchor?: FormationAnchor;
  /** Action lifecycle states */
  actionState?: CombatActionState;
  movementPolicyState?: RoleMovementState;
  attackCooldownRemaining?: number;
  attackWindupRemaining?: number;
  recoveryRemaining?: number;
  /** Targeting & engagement links */
  targetEntityId?: string;
  engagedById?: string;
  engagedTargetId?: string;
  /** Optional role & signature attributes (primarily TeamA beasts or PvP units) */
  role?: BeastRole;
  beastId?: string;
  star?: 1 | 2 | 3;
  signatureId?: BeastSignatureId;
  signatureActivationCount?: number;
  temporaryShieldHp?: number;
  temporaryShieldExpiresAt?: number;
  temporaryShieldSourceSignatureId?: BeastSignatureId;
  guardUntil?: number;
  supportReadyAt?: number;
  supportTargetIds?: string[];
  supportFxUntil?: number;
  ambushReady?: boolean;
  ambushTargetId?: string;
  continuousHoldTime?: number;
  focusReady?: boolean;
  ramReady?: boolean;
  volleyAttackCount?: number;
  /** Optional enemy archetype / fun control attributes (for NPC enemies) */
  archetype?: EnemyArchetype;
  funControlUntil?: number;
  funControlKind?: 'Duck' | 'Carrot' | 'Bubble' | 'Disrupt';
  funControlStar?: 2 | 3;
  bombAt?: number;
  bombSourceId?: string;
  bombDamage?: number;
  bombTargets?: number;
  carrotX?: number;
  carrotLane?: number;
}

/** Check if an entity is alive */
export function isEntityAlive(entity: CombatEntity): boolean {
  return entity.currentHp > 0;
}

/** Euclidean-like combat distance taking lane scale into account */
export function entityDistance(
  a: CombatEntity,
  b: CombatEntity,
  laneDistanceScale = 30,
): number {
  const dx = a.positionX - b.positionX;
  const dLane = (a.positionLane - b.positionLane) * laneDistanceScale;
  return Math.sqrt(dx * dx + dLane * dLane);
}

/** Convert a player CombatUnit to a unified CombatEntity */
export function unitToCombatEntity(
  unit: CombatUnit,
  teamId: TeamSideAlias = 'TeamA',
): CombatEntity {
  return {
    ...unit,
    entityId: unit.unitId,
    teamId: normalizeTeamSide(teamId),
    displayName: unit.beastId,
    targetEntityId: unit.targetEnemyId,
  };
}

/** Convert an EnemyCombatUnit to a unified CombatEntity */
export function enemyToCombatEntity(
  enemy: EnemyCombatUnit,
  teamId: TeamSideAlias = 'TeamB',
): CombatEntity {
  return {
    ...enemy,
    entityId: enemy.enemyId,
    teamId: normalizeTeamSide(teamId),
    displayName: enemy.archetype ?? 'Frontliner',
    targetEntityId: enemy.targetUnitId,
  };
}

/** Sync back mutations from CombatEntity to CombatUnit */
export function syncEntityToUnit(entity: CombatEntity, unit: CombatUnit): void {
  unit.currentHp = entity.currentHp;
  unit.positionX = entity.positionX;
  unit.positionLane = entity.positionLane;
  unit.actionState = entity.actionState;
  unit.movementPolicyState = entity.movementPolicyState;
  unit.attackCooldownRemaining = entity.attackCooldownRemaining;
  unit.attackWindupRemaining = entity.attackWindupRemaining;
  unit.recoveryRemaining = entity.recoveryRemaining;
  unit.targetEnemyId = entity.targetEntityId;
  unit.engagedById = entity.engagedById;
  unit.temporaryShieldHp = entity.temporaryShieldHp;
  unit.temporaryShieldExpiresAt = entity.temporaryShieldExpiresAt;
  unit.temporaryShieldSourceSignatureId = entity.temporaryShieldSourceSignatureId;
  unit.guardUntil = entity.guardUntil;
  unit.supportReadyAt = entity.supportReadyAt;
  unit.supportTargetIds = entity.supportTargetIds;
  unit.supportFxUntil = entity.supportFxUntil;
  unit.ambushReady = entity.ambushReady;
  unit.ambushTargetId = entity.ambushTargetId;
  unit.continuousHoldTime = entity.continuousHoldTime;
  unit.focusReady = entity.focusReady;
  unit.ramReady = entity.ramReady;
  unit.volleyAttackCount = entity.volleyAttackCount;
  unit.signatureActivationCount = entity.signatureActivationCount;
}

/** Sync back mutations from CombatEntity to EnemyCombatUnit */
export function syncEntityToEnemy(entity: CombatEntity, enemy: EnemyCombatUnit): void {
  enemy.currentHp = entity.currentHp;
  enemy.positionX = entity.positionX;
  enemy.positionLane = entity.positionLane;
  enemy.actionState = entity.actionState;
  enemy.movementPolicyState = entity.movementPolicyState;
  enemy.attackCooldownRemaining = entity.attackCooldownRemaining;
  enemy.attackWindupRemaining = entity.attackWindupRemaining;
  enemy.recoveryRemaining = entity.recoveryRemaining;
  enemy.targetUnitId = entity.targetEntityId;
  enemy.engagedTargetId = entity.engagedTargetId;
  enemy.funControlUntil = entity.funControlUntil;
  enemy.funControlKind = entity.funControlKind;
  enemy.funControlStar = entity.funControlStar;
  enemy.bombAt = entity.bombAt;
  enemy.bombSourceId = entity.bombSourceId;
  enemy.bombDamage = entity.bombDamage;
  enemy.bombTargets = entity.bombTargets;
  enemy.carrotX = entity.carrotX;
  enemy.carrotLane = entity.carrotLane;
}

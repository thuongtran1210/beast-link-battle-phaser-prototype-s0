// Battle domain types. Extracted verbatim from AutonomousBattleModel.ts (behavior-preserving refactor).
import type { BeastRole, BeastSignatureId } from './BeastRoles';
import type { TacticalEnergyKind } from '../energy/TacticalEnergyCatalog';

export type BattleStatus = 'Running' | 'Win' | 'Lose';
export type BattleRow = 'Front' | 'Mid' | 'Back';
export type PlayerActionKind = 'GuardStrike' | 'Ram' | 'Dive' | 'Snipe' | 'Volley' | 'ArcaneBurst';
export type CombatActionState = 'Moving' | 'Windup' | 'Recovering' | 'Idle' | 'Dead';
export type RoleMovementState = 'Hold' | 'AdvanceToRange' | 'Kite' | 'Engage' | 'Dive' | 'Idle';

export interface FormationAnchor {
  x: number;
  lane: number;
}

export interface ActionTimingProfile {
  attackInterval: number;
  windup: number;
}

export interface CombatUnit {
  guardUntil?: number;
  supportReadyAt?: number;
  supportTargetIds?: string[];
  supportFxUntil?: number;
  unitId: string;
  beastId: string;
  role: BeastRole;
  star: 1 | 2 | 3;
  slotId: string;
  row: BattleRow;
  column: number;
  currentHp: number;
  maxHp: number;
  damage: number;
  positionX: number;
  positionLane: number;
  targetEnemyId?: string;

  // P1-V11A Timeline fields
  actionState?: CombatActionState;
  attackCooldownRemaining?: number;
  attackWindupRemaining?: number;
  recoveryRemaining?: number;

  // P1-V11B Engagement field
  engagedById?: string;

  // P1-V11B.1 Role Positioning Identity fields
  formationAnchor?: FormationAnchor;
  movementPolicyState?: RoleMovementState;
  signatureId?: BeastSignatureId;
  signatureActivationCount?: number;
  temporaryShieldHp?: number;
  temporaryShieldExpiresAt?: number;
  temporaryShieldSourceSignatureId?: BeastSignatureId;
  ambushReady?: boolean;
  ambushTargetId?: string;
  continuousHoldTime?: number;
  focusReady?: boolean;
  ramReady?: boolean;
  volleyAttackCount?: number;
}

export interface SignatureBattleEvent { type: 'SignatureReady' | 'SignatureActivated' | 'ShieldAbsorbed'; unitId: string; signatureId: BeastSignatureId; targetId?: string; amount?: number; time: number; }
export interface SignatureMetrics { signatureActivationsByUnit: Record<string, number>; signatureDamageByUnit: Record<string, number>; shieldDamageAbsorbedByUnit: Record<string, number>; focusShotsResolved: number; arcaneBloomTargetsHit: number; ambushStrikesResolved: number; guardianBraceAbsorbed: number; }

export type EnemyArchetype = 'Frontliner' | 'Diver' | 'Ranged';

export interface EnemyFixture {
  enemyId: string;
  slotId: string;
  row: BattleRow;
  column: number;
  maxHp: number;
  damage: number;
  archetype?: EnemyArchetype;
}

export interface EnemyCombatUnit extends EnemyFixture {
  funControlUntil?: number;
  funControlKind?: 'Duck' | 'Carrot' | 'Bubble' | 'Disrupt';
  funControlStar?: 2 | 3;
  bombAt?: number;
  bombSourceId?: string;
  bombDamage?: number;
  bombTargets?: number;
  carrotX?: number;
  carrotLane?: number;
  currentHp: number;
  positionX: number;
  positionLane: number;
  targetUnitId?: string;
  archetype?: EnemyArchetype;

  // P1-V11A Timeline fields
  actionState?: CombatActionState;
  attackCooldownRemaining?: number;
  attackWindupRemaining?: number;
  recoveryRemaining?: number;

  // P1-V11B Engagement field
  engagedTargetId?: string;

  // P1-V11C Archetype movement state
  formationAnchor?: FormationAnchor;
  movementPolicyState?: RoleMovementState;
}

export interface PlayerCombatHit {
  enemyId: string;
  damage: number;
}

export interface EnemyCombatAction {
  enemyId: string;
  targetUnitId: string;
  archetype: EnemyArchetype;
  damage: number;
  absorbed: number;
  defeated: boolean;
}

export interface PlayerCombatAction {
  unitId: string;
  role: BeastRole;
  kind: PlayerActionKind;
  hits: PlayerCombatHit[];
}

export interface BattleCombatRules {
  rolePositioning: boolean;
  movement: boolean;
  timeline?: boolean;
  engagement?: boolean;
  roleIdentity?: boolean;
  archetypes?: boolean;
  signatures?: boolean;
}

export interface EngagementFixture {
  tankGuardRadius: number;
  meleeEngageRange: number;
  disengagePadding: number;
}

export interface EnemyArchetypeProfile {
  speed: number;
  attackRange: number;
  preferredMinRange: number;
  dangerRange: number;
  attackInterval: number;
  windup: number;
}

export interface EngagementBattleEvent {
  type: 'EngagementStarted' | 'EngagementEnded';
  enemyId: string;
  tankId: string;
  time: number;
}

export interface FormationConsequenceMetrics {
  interceptCount: number;
  diverInterceptionCount: number;
  frontlineInterceptionCount: number;
  firstPlayerContactTime?: number;
  firstBacklineHitTime?: number;
  firstCarryHitTime?: number;
  firstAssassinContactTime?: number;
  attacksResolvedByUnit: Record<string, number>;
  damageTakenByUnit: Record<string, number>;
  timeEngaged: Record<string, number>;
  rangerForcedKiteCount: number;
  mageForcedRepositionCount: number;
  unitDeathTimes: Record<string, number>;
}

export interface AutonomousBattleSnapshot {
  status: BattleStatus;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  elapsedTicks: number;
  elapsedTime?: number;
  units: CombatUnit[];
  enemies: EnemyCombatUnit[];
  lastPlayerActions?: PlayerCombatAction[];
  lastEnemyActions?: EnemyCombatAction[];
  engagementEvents?: EngagementBattleEvent[];
  consequenceMetrics?: FormationConsequenceMetrics;
  signatureEvents?: SignatureBattleEvent[];
  signatureMetrics?: SignatureMetrics;
}

export interface RoleMovementConfig {
  speed: number;
  attackRange: number;
  minRange: number;
  preferredMinRange: number;
  dangerRange: number;
  leashRadius: number;
}

export type FrontlineHealCastReason = 'ok' | 'battle-not-running' | 'no-charge' | 'no-target' | 'target-full-hp';
export interface FrontlineHealCastResult { success: boolean; reason: FrontlineHealCastReason; energyId: string; targetUnitId?: string; healedAmount: number; }
export type TacticalEnergyAvailability = 'disabled' | 'ready' | 'suggested';
export type TacticalEnergyCastReason = FrontlineHealCastReason | 'no-frontliner' | 'no-ranged' | 'unsupported-energy' | 'shield-active';
export interface TacticalEnergyEligibility { energyId: string; kind?: TacticalEnergyKind; availability: TacticalEnergyAvailability; reason: TacticalEnergyCastReason; targetUnitId?: string; targetEnemyId?: string; suggestedReason?: string; }
export interface TacticalEnergyCastResult { success: boolean; energyId: string; kind?: TacticalEnergyKind; reason: TacticalEnergyCastReason; targetUnitId?: string; targetEnemyId?: string; amount: number; }

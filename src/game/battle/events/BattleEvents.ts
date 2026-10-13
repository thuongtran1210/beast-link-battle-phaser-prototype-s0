/**
 * Battle Event Stream Protocol (Output DTOs).
 * Generated deterministically during battle simulation ticks.
 * Presentation layers (Phaser Views / SFX / Network Broadcasts) consume
 * these events directly without diffing raw state snapshots.
 */

export type BattleEventKind =
  | 'EntityDamaged'
  | 'EntityHealed'
  | 'EntityDefeated'
  | 'ShieldAbsorbed'
  | 'SignatureActivated'
  | 'TacticalEnergyCast'
  | 'BattleEnded';

export interface BaseBattleEvent {
  type: BattleEventKind;
  tick: number;
  time: number;
}

export interface EntityDamagedEvent extends BaseBattleEvent {
  type: 'EntityDamaged';
  sourceEntityId?: string;
  targetEntityId: string;
  damage: number;
  absorbed: number;
  remainingHp: number;
  isCrit?: boolean;
}

export interface EntityHealedEvent extends BaseBattleEvent {
  type: 'EntityHealed';
  sourceEntityId?: string;
  targetEntityId: string;
  amount: number;
  newHp: number;
}

export interface EntityDefeatedEvent extends BaseBattleEvent {
  type: 'EntityDefeated';
  entityId: string;
  killerEntityId?: string;
  teamId: string;
}

export interface ShieldAbsorbedEvent extends BaseBattleEvent {
  type: 'ShieldAbsorbed';
  entityId: string;
  amount: number;
  remainingShield: number;
}

export interface SignatureActivatedEvent extends BaseBattleEvent {
  type: 'SignatureActivated';
  entityId: string;
  signatureId: string;
  targetEntityId?: string;
  amount?: number;
}

export interface TacticalEnergyCastEvent extends BaseBattleEvent {
  type: 'TacticalEnergyCast';
  energyId: string;
  kind: string;
  targetEntityId?: string;
  amount: number;
  success: boolean;
  reason?: string;
}

export interface BattleEndedEvent extends BaseBattleEvent {
  type: 'BattleEnded';
  status: 'Win' | 'Lose';
  winnerTeamId?: string;
}

export type BattleEvent =
  | EntityDamagedEvent
  | EntityHealedEvent
  | EntityDefeatedEvent
  | ShieldAbsorbedEvent
  | SignatureActivatedEvent
  | TacticalEnergyCastEvent
  | BattleEndedEvent;

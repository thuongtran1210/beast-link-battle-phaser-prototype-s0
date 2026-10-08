import type {
  AutonomousBattleSnapshot,
  BattleCombatRules,
  CombatUnit,
  EnemyCombatUnit,
  FormationConsequenceMetrics,
  PlayerActionKind,
  PlayerCombatHit,
  SignatureBattleEvent,
  SignatureMetrics,
} from '../BattleTypes';

export interface CombatResolverContext {
  readonly state: AutonomousBattleSnapshot;
  readonly combatRules: Readonly<BattleCombatRules>;
  readonly consequenceMetrics: FormationConsequenceMetrics;
  readonly signatureMetrics: SignatureMetrics;
  readonly signatureEvents: SignatureBattleEvent[];
  readonly engagementEvents: Array<{ type: 'EngagementStarted' | 'EngagementEnded'; enemyId: string; tankId: string; time: number }>;
  
  target(): CombatUnit | undefined;
  enemyTarget(): EnemyCombatUnit | undefined;
  applyDamage(enemy: EnemyCombatUnit, requestedDamage: number): number;
  applyDamageToEnemies(totalDamage: number): void;
  recordAction(unit: CombatUnit, kind: PlayerActionKind, hits: PlayerCombatHit[]): void;
  activateSignature(unit: CombatUnit, targetId?: string): void;
  expireShield(unit: CombatUnit): void;
  applyDamageToUnit(unit: CombatUnit, incoming: number): number;
}

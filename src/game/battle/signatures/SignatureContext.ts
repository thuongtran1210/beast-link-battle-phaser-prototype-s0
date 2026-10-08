import type {
  CombatUnit,
  EnemyCombatUnit,
  PlayerCombatHit,
  PlayerActionKind,
  AutonomousBattleSnapshot,
  SignatureMetrics,
  SignatureBattleEvent,
  FormationConsequenceMetrics,
  BattleCombatRules,
} from '../BattleTypes';
import type { BeastSignatureId } from '../BeastRoles';

export interface SignatureContext {
  state: AutonomousBattleSnapshot;
  combatRules: Readonly<BattleCombatRules>;
  consequenceMetrics: FormationConsequenceMetrics;
  signatureMetrics: SignatureMetrics;
  signatureEvents: SignatureBattleEvent[];
  distance(x1: number, y1: number, x2: number, y2: number): number;
  applyDamage(enemy: EnemyCombatUnit, requestedDamage: number): number;
  recordAction(unit: CombatUnit, kind: PlayerActionKind, hits: PlayerCombatHit[]): void;
  activateSignature(unit: CombatUnit, targetId?: string): void;
}

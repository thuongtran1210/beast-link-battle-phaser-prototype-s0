import type {
  AutonomousBattleSnapshot,
  PlayerActionKind,
  EnemyArchetype,
} from './AutonomousBattleModel';
import type { BeastRole, BeastSignatureId } from './BeastRoles';

export interface BattleAttackerPresentation {
  unitId: string;
  role: BeastRole;
  kind?: PlayerActionKind;
  targetEnemyIds: string[];
}

export interface EnemyDamagePresentation {
  enemyId: string;
  damage: number;
  defeated: boolean;
  hpBefore?: number;
  hpAfter?: number;
}

export interface UnitDamagePresentation {
  unitId: string;
  damage: number;
  defeated: boolean;
  hpBefore: number;
  hpAfter: number;
}

export interface AttackWindupPresentation {
  unitId: string;
  isPlayer: boolean;
  targetId?: string;
  role?: BeastRole;
  archetype?: EnemyArchetype;
}

export interface UnitHpBarPresentation {
  ratio: number;
  isDead: boolean;
  currentHp: number;
  maxHp: number;
}

export interface SignatureFxPresentation {
  unitId: string;
  signatureId: BeastSignatureId;
  targetIds: string[];
  amount?: number;
}

export interface BattleTickPresentation {
  attackers: BattleAttackerPresentation[];
  enemyDamage: number;
  enemyDamages: EnemyDamagePresentation[];
  enemyTargetId?: string;
  targetDamage: number;
  unitDamages: UnitDamagePresentation[];
  attackWindups: AttackWindupPresentation[];
  defeatedUnitIds: string[];
  defeatedEnemyIds: string[];
  signatureFx: SignatureFxPresentation[];
  enemyDefeated: boolean;
}

export interface BattleHealPresentation {
  unitId?: string;
  amount: number;
  hpBefore?: number;
  hpAfter?: number;
}

export function deriveHpBarPresentation(currentHp: number, maxHp: number): UnitHpBarPresentation {
  const safeMax = Math.max(1, maxHp);
  const clampedHp = Math.max(0, Math.min(safeMax, currentHp));
  return {
    ratio: Math.max(0, Math.min(1, clampedHp / safeMax)),
    isDead: clampedHp <= 0,
    currentHp: clampedHp,
    maxHp: safeMax,
  };
}

export function deriveBattleTickPresentation(
  before: AutonomousBattleSnapshot,
  after: AutonomousBattleSnapshot,
): BattleTickPresentation {
  const actionMap = new Map(
    (after.lastPlayerActions ?? []).map((action) => [action.unitId, action]),
  );

  const hasExplicitActions = after.lastPlayerActions !== undefined;
  const attackers = before.units
    .filter((unit) => unit.currentHp > 0)
    .map((unit) => {
      const action = actionMap.get(unit.unitId);
      return {
        unitId: unit.unitId,
        role: unit.role,
        kind: action?.kind,
        targetEnemyIds: action?.hits.map((hit) => hit.enemyId) ?? [],
      };
    })
    .filter((attacker) => (hasExplicitActions ? attacker.targetEnemyIds.length > 0 : true));

  const enemyDamage = Math.max(0, before.enemyHp - after.enemyHp);
  const enemyDamages: EnemyDamagePresentation[] = [];
  const defeatedEnemyIds: string[] = [];

  for (const beforeEnemy of before.enemies) {
    const afterEnemy = after.enemies.find((candidate) => candidate.enemyId === beforeEnemy.enemyId);
    if (!afterEnemy) continue;
    const damage = Math.max(0, beforeEnemy.currentHp - afterEnemy.currentHp);
    const defeated = beforeEnemy.currentHp > 0 && afterEnemy.currentHp === 0;
    if (damage > 0 || defeated) {
      enemyDamages.push({
        enemyId: beforeEnemy.enemyId,
        damage,
        defeated,
        hpBefore: beforeEnemy.currentHp,
        hpAfter: afterEnemy.currentHp,
      });
    }
    if (defeated) defeatedEnemyIds.push(beforeEnemy.enemyId);
  }

  let enemyTargetId: string | undefined;
  let targetDamage = 0;
  const unitDamages: UnitDamagePresentation[] = [];
  const defeatedUnitIds: string[] = [];

  for (const beforeUnit of before.units) {
    const afterUnit = after.units.find((candidate) => candidate.unitId === beforeUnit.unitId);
    if (!afterUnit) continue;

    const damage = Math.max(0, beforeUnit.currentHp - afterUnit.currentHp);
    const defeated = beforeUnit.currentHp > 0 && afterUnit.currentHp === 0;
    if (damage > 0 || defeated) {
      unitDamages.push({
        unitId: beforeUnit.unitId,
        damage,
        defeated,
        hpBefore: beforeUnit.currentHp,
        hpAfter: afterUnit.currentHp,
      });
      enemyTargetId = beforeUnit.unitId;
      targetDamage = damage;
    }
    if (defeated) {
      defeatedUnitIds.push(beforeUnit.unitId);
    }
  }

  const attackWindups: AttackWindupPresentation[] = [];
  for (const afterUnit of after.units) {
    const beforeUnit = before.units.find((candidate) => candidate.unitId === afterUnit.unitId);
    if (
      afterUnit.currentHp > 0 &&
      afterUnit.actionState === 'Windup' &&
      beforeUnit?.actionState !== 'Windup'
    ) {
      attackWindups.push({
        unitId: afterUnit.unitId,
        isPlayer: true,
        targetId: afterUnit.targetEnemyId,
        role: afterUnit.role,
      });
    }
  }

  for (const afterEnemy of after.enemies) {
    const beforeEnemy = before.enemies.find((candidate) => candidate.enemyId === afterEnemy.enemyId);
    if (
      afterEnemy.currentHp > 0 &&
      afterEnemy.actionState === 'Windup' &&
      beforeEnemy?.actionState !== 'Windup'
    ) {
      attackWindups.push({
        unitId: afterEnemy.enemyId,
        isPlayer: false,
        targetId: afterEnemy.targetUnitId,
        archetype: afterEnemy.archetype,
      });
    }
  }

  const beforeSignatureCount = before.signatureEvents?.length ?? 0;
  const newSignatureEvents = (after.signatureEvents ?? []).slice(beforeSignatureCount);
  const signatureFx: SignatureFxPresentation[] = newSignatureEvents
    .filter((event) => event.type === 'SignatureActivated' || event.type === 'ShieldAbsorbed')
    .map((event) => {
      const action = actionMap.get(event.unitId);
      return {
        unitId: event.unitId,
        signatureId: event.signatureId,
        targetIds: action?.hits.map((hit) => hit.enemyId) ?? (event.targetId ? [event.targetId] : []),
        amount: event.amount,
      };
    });

  return {
    attackers,
    enemyDamage,
    enemyDamages,
    enemyTargetId,
    targetDamage,
    unitDamages,
    attackWindups,
    defeatedUnitIds,
    defeatedEnemyIds,
    signatureFx,
    enemyDefeated: before.enemyHp > 0 && after.enemyHp === 0,
  };
}

export function deriveBattleHealPresentation(
  before: AutonomousBattleSnapshot,
  after: AutonomousBattleSnapshot,
): BattleHealPresentation {
  for (const beforeUnit of before.units) {
    const afterUnit = after.units.find((candidate) => candidate.unitId === beforeUnit.unitId);
    if (!afterUnit) continue;
    const amount = Math.max(0, afterUnit.currentHp - beforeUnit.currentHp);
    if (amount > 0) {
      return {
        unitId: beforeUnit.unitId,
        amount,
        hpBefore: beforeUnit.currentHp,
        hpAfter: afterUnit.currentHp,
      };
    }
  }
  return { amount: 0 };
}

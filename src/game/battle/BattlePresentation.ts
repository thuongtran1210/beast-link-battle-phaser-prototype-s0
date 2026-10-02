import type { AutonomousBattleSnapshot } from './AutonomousBattleModel';
import type { BeastRole } from './BeastRoles';

export interface BattleAttackerPresentation {
  unitId: string;
  role: BeastRole;
}

export interface EnemyDamagePresentation {
  enemyId: string;
  damage: number;
  defeated: boolean;
}

export interface BattleTickPresentation {
  attackers: BattleAttackerPresentation[];
  enemyDamage: number;
  enemyDamages: EnemyDamagePresentation[];
  enemyTargetId?: string;
  targetDamage: number;
  defeatedUnitIds: string[];
  defeatedEnemyIds: string[];
  enemyDefeated: boolean;
}

export interface BattleHealPresentation {
  unitId?: string;
  amount: number;
}

/**
 * Converts deterministic model deltas into UI events without changing battle rules.
 */
export function deriveBattleTickPresentation(
  before: AutonomousBattleSnapshot,
  after: AutonomousBattleSnapshot,
): BattleTickPresentation {
  const attackers = before.units
    .filter((unit) => unit.currentHp > 0)
    .map((unit) => ({ unitId: unit.unitId, role: unit.role }));

  const enemyDamage = Math.max(0, before.enemyHp - after.enemyHp);
  const enemyDamages: EnemyDamagePresentation[] = [];
  const defeatedEnemyIds: string[] = [];

  for (const beforeEnemy of before.enemies) {
    const afterEnemy = after.enemies.find((candidate) => candidate.enemyId === beforeEnemy.enemyId);
    if (!afterEnemy) continue;
    const damage = Math.max(0, beforeEnemy.currentHp - afterEnemy.currentHp);
    const defeated = beforeEnemy.currentHp > 0 && afterEnemy.currentHp === 0;
    if (damage > 0 || defeated) {
      enemyDamages.push({ enemyId: beforeEnemy.enemyId, damage, defeated });
    }
    if (defeated) defeatedEnemyIds.push(beforeEnemy.enemyId);
  }

  let enemyTargetId: string | undefined;
  let targetDamage = 0;
  const defeatedUnitIds: string[] = [];

  for (const beforeUnit of before.units) {
    const afterUnit = after.units.find((candidate) => candidate.unitId === beforeUnit.unitId);
    if (!afterUnit) continue;

    const damage = Math.max(0, beforeUnit.currentHp - afterUnit.currentHp);
    if (damage > 0) {
      enemyTargetId = beforeUnit.unitId;
      targetDamage = damage;
    }
    if (beforeUnit.currentHp > 0 && afterUnit.currentHp === 0) {
      defeatedUnitIds.push(beforeUnit.unitId);
    }
  }

  return {
    attackers,
    enemyDamage,
    enemyDamages,
    enemyTargetId,
    targetDamage,
    defeatedUnitIds,
    defeatedEnemyIds,
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
    if (amount > 0) return { unitId: beforeUnit.unitId, amount };
  }
  return { amount: 0 };
}

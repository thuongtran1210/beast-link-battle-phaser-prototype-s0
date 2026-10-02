import type { AutonomousBattleSnapshot, BeastRole } from './AutonomousBattleModel';

export interface BattleAttackerPresentation {
  unitId: string;
  role: BeastRole;
}

export interface BattleTickPresentation {
  attackers: BattleAttackerPresentation[];
  enemyDamage: number;
  enemyTargetId?: string;
  targetDamage: number;
  defeatedUnitIds: string[];
  enemyDefeated: boolean;
}

export interface BattleHealPresentation {
  unitId?: string;
  amount: number;
}

/**
 * P1-V4 presentation derivation only.
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
    enemyTargetId,
    targetDamage,
    defeatedUnitIds,
    enemyDefeated: before.enemyHp > 0 && after.enemyHp === 0,
  };
}

/** Presentation-only heal delta used by the P1-V4 UI layer. */
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

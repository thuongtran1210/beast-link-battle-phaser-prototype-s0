import type { AutonomousBattleSnapshot, CombatUnit, EnemyCombatUnit } from '../battle/BattleTypes';
import type { TeamSide } from '../battle/entities/CombatEntity';

export function relativeStatus(status: 'Running' | 'Win' | 'Lose', team: TeamSide): 'Running' | 'Win' | 'Lose' {
  return team === 'TeamA' || status === 'Running' ? status : status === 'Win' ? 'Lose' : 'Win';
}

/** Pure view conversion. Canonical server IDs are retained for commands/targets. */
export function onlinePerspective(snapshot: AutonomousBattleSnapshot, team: TeamSide): AutonomousBattleSnapshot {
  if (team === 'TeamA') return snapshot;
  const units: CombatUnit[] = snapshot.enemies.map(enemy => ({
    ...enemy, unitId: enemy.enemyId, beastId: enemy.beastId ?? 'beast-a',
    role: enemy.role ?? 'Tanker', star: enemy.star ?? 1,
    positionX: -enemy.positionX,
    formationAnchor: enemy.formationAnchor ? { ...enemy.formationAnchor, x: -enemy.formationAnchor.x } : undefined,
    targetEnemyId: enemy.targetUnitId, engagedById: enemy.engagedTargetId,
  }));
  const enemies: EnemyCombatUnit[] = snapshot.units.map(unit => ({
    ...unit, enemyId: unit.unitId, positionX: -unit.positionX,
    formationAnchor: unit.formationAnchor ? { ...unit.formationAnchor, x: -unit.formationAnchor.x } : undefined,
    archetype: unit.role === 'Tanker' ? 'Frontliner' : unit.role === 'Assassin' ? 'Diver' : 'Ranged',
    targetUnitId: unit.targetEnemyId, engagedTargetId: unit.engagedById,
  }));
  return {
    ...snapshot, status: relativeStatus(snapshot.status, team), units, enemies,
    enemyHp: enemies.reduce((sum, enemy) => sum + enemy.currentHp, 0),
    enemyMaxHp: enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0),
    enemyDamage: enemies.reduce((sum, enemy) => sum + enemy.damage, 0),
    lastPlayerActions: snapshot.lastEnemyActions?.map(action => ({
      unitId: action.enemyId, role: units.find(unit => unit.unitId === action.enemyId)?.role ?? 'Tanker',
      kind: 'GuardStrike', hits: [{ enemyId: action.targetUnitId, damage: action.damage }],
    })),
    lastEnemyActions: snapshot.lastPlayerActions?.flatMap(action => action.hits.map(hit => ({
      enemyId: action.unitId, targetUnitId: hit.enemyId,
      archetype: action.role === 'Tanker' ? 'Frontliner' as const : action.role === 'Assassin' ? 'Diver' as const : 'Ranged' as const,
      damage: hit.damage, absorbed: 0, defeated: (units.find(unit => unit.unitId === hit.enemyId)?.currentHp ?? 1) <= 0,
    }))),
  };
}

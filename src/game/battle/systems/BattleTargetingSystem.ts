import type {
  CombatUnit,
  EnemyCombatUnit,
  BattleCombatRules,
  BattleRow,
} from '../BattleTypes';
import {
  P1V11B_ENGAGEMENT_FIXTURE,
  COMBAT_DISTANCE_EPSILON,
  rowOrder,
} from '../BattleConfig';

export class BattleTargetingSystem {
  static target(
    units: CombatUnit[],
    rules: Readonly<BattleCombatRules>,
  ): CombatUnit | undefined {
    const living = units.filter((unit) => unit.currentHp > 0);
    if (rules.movement || rules.timeline) {
      return living.sort(
        (a, b) =>
          b.positionX - a.positionX ||
          a.positionLane - b.positionLane ||
          rowOrder[a.row] - rowOrder[b.row],
      )[0];
    }

    return living.sort(
      (a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column,
    )[0];
  }

  static enemyTarget(
    enemies: EnemyCombatUnit[],
    rules: Readonly<BattleCombatRules>,
  ): EnemyCombatUnit | undefined {
    const living = enemies.filter((enemy) => enemy.currentHp > 0);
    if (rules.movement || rules.timeline) {
      return living.sort(
        (a, b) =>
          a.positionX - b.positionX ||
          a.positionLane - b.positionLane ||
          rowOrder[a.row] - rowOrder[b.row],
      )[0];
    }

    return living.sort(
      (a, b) => rowOrder[a.row] - rowOrder[b.row] || a.column - b.column,
    )[0];
  }

  static nearestEnemyByRowPriority(
    enemies: EnemyCombatUnit[],
    lane: number,
    rowPriority: BattleRow[],
  ): EnemyCombatUnit | undefined {
    const rank = new Map(rowPriority.map((row, index) => [row, index]));
    return enemies
      .filter((enemy) => enemy.currentHp > 0)
      .sort(
        (a, b) =>
          (rank.get(a.row) ?? 99) - (rank.get(b.row) ?? 99) ||
          Math.abs(a.positionLane - lane) - Math.abs(b.positionLane - lane) ||
          a.column - b.column,
      )[0];
  }

  static deepEnemyInOrNearLane(
    enemies: EnemyCombatUnit[],
    lane: number,
  ): EnemyCombatUnit | undefined {
    const living = enemies.filter((enemy) => enemy.currentHp > 0);

    return living.sort(
      (a, b) =>
        Math.abs(a.positionLane - lane) - Math.abs(b.positionLane - lane) ||
        b.positionX - a.positionX ||
        a.column - b.column,
    )[0];
  }

  static acquirePlayerTarget(
    unit: CombatUnit,
    enemies: EnemyCombatUnit[],
  ): EnemyCombatUnit | undefined {
    if (unit.role === 'Tanker') {
      return this.nearestEnemyByRowPriority(enemies, unit.positionLane, ['Front', 'Mid', 'Back']);
    } else if (unit.role === 'Assassin') {
      return this.nearestEnemyByRowPriority(enemies, unit.positionLane, ['Back', 'Mid', 'Front']);
    } else {
      return this.deepEnemyInOrNearLane(enemies, unit.positionLane);
    }
  }

  static acquireEnemyTarget(
    enemy: EnemyCombatUnit,
    units: CombatUnit[],
    rules: Readonly<BattleCombatRules>,
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): CombatUnit | undefined {
    const living = units.filter((unit) => unit.currentHp > 0);
    if (!living.length) return undefined;

    if (rules.engagement) {
      return living.sort((a, b) => {
        const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
        const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
        if (Math.abs(laneDiffA - laneDiffB) >= 1.5) {
          return laneDiffA - laneDiffB;
        }

        const dx = b.positionX - a.positionX;
        if (Math.abs(dx) > 0.4) {
          return dx;
        }

        if (Math.abs(laneDiffA - laneDiffB) > COMBAT_DISTANCE_EPSILON) {
          return laneDiffA - laneDiffB;
        }

        const distA = calcDistance(enemy.positionX, enemy.positionLane, a.positionX, a.positionLane);
        const distB = calcDistance(enemy.positionX, enemy.positionLane, b.positionX, b.positionLane);
        if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
          return distA - distB;
        }

        return a.unitId.localeCompare(b.unitId);
      })[0];
    }

    return this.target(units, rules);
  }

  static acquireDiverTarget(
    enemy: EnemyCombatUnit,
    units: CombatUnit[],
  ): CombatUnit | undefined {
    const living = units.filter((u) => u.currentHp > 0);
    if (!living.length) return undefined;

    const carries = living.filter((u) => u.role === 'Mage' || u.role === 'Ranger');
    if (carries.length) {
      return carries.sort((a, b) => {
        const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
        const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
        if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
        if (Math.abs(a.positionX - b.positionX) > COMBAT_DISTANCE_EPSILON) {
          return a.positionX - b.positionX;
        }
        return a.unitId.localeCompare(b.unitId);
      })[0];
    }

    return living.sort((a, b) => {
      if (Math.abs(a.positionX - b.positionX) > 0.4) {
        return a.positionX - b.positionX;
      }
      const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
      const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
      return a.unitId.localeCompare(b.unitId);
    })[0];
  }

  static acquireRangedEnemyTarget(
    enemy: EnemyCombatUnit,
    units: CombatUnit[],
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): CombatUnit | undefined {
    const living = units.filter((u) => u.currentHp > 0);
    if (!living.length) return undefined;

    const inRange = living.filter(
      (u) =>
        calcDistance(enemy.positionX, enemy.positionLane, u.positionX, u.positionLane) <=
        3.8 + COMBAT_DISTANCE_EPSILON,
    );
    const pool = inRange.length ? inRange : living;

    return pool.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - enemy.positionLane);
      const laneDiffB = Math.abs(b.positionLane - enemy.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) return laneDiffA - laneDiffB;
      const dx = b.positionX - a.positionX;
      if (Math.abs(dx) > COMBAT_DISTANCE_EPSILON) return dx;
      return a.unitId.localeCompare(b.unitId);
    })[0];
  }

  static findBestEnemyInRange(
    unit: CombatUnit,
    enemies: EnemyCombatUnit[],
    maxRange: number,
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): EnemyCombatUnit | undefined {
    const living = enemies.filter((enemy) => {
      if (enemy.currentHp <= 0) return false;
      const dist = calcDistance(unit.positionX, unit.positionLane, enemy.positionX, enemy.positionLane);
      return dist <= maxRange + COMBAT_DISTANCE_EPSILON;
    });
    if (!living.length) return undefined;

    return living.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - unit.positionLane);
      const laneDiffB = Math.abs(b.positionLane - unit.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) > 0.5) {
        return laneDiffA - laneDiffB;
      }
      const distA = calcDistance(unit.positionX, unit.positionLane, a.positionX, a.positionLane);
      const distB = calcDistance(unit.positionX, unit.positionLane, b.positionX, b.positionLane);
      if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
        return distA - distB;
      }
      return a.enemyId.localeCompare(b.enemyId);
    })[0];
  }

  static findBestRangedAdvanceTarget(
    unit: CombatUnit,
    enemies: EnemyCombatUnit[],
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): EnemyCombatUnit | undefined {
    const living = enemies.filter((e) => e.currentHp > 0);
    if (!living.length) return undefined;

    return living.sort((a, b) => {
      const laneDiffA = Math.abs(a.positionLane - unit.positionLane);
      const laneDiffB = Math.abs(b.positionLane - unit.positionLane);
      if (Math.abs(laneDiffA - laneDiffB) >= 1.5) {
        return laneDiffA - laneDiffB;
      }
      const distA = calcDistance(unit.positionX, unit.positionLane, a.positionX, a.positionLane);
      const distB = calcDistance(unit.positionX, unit.positionLane, b.positionX, b.positionLane);
      if (Math.abs(distA - distB) > COMBAT_DISTANCE_EPSILON) {
        return distA - distB;
      }
      return a.enemyId.localeCompare(b.enemyId);
    })[0];
  }

  static findDiverTankInterceptor(
    enemy: EnemyCombatUnit,
    intendedTarget: CombatUnit,
    units: CombatUnit[],
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): CombatUnit | undefined {
    const candidateTanks = units.filter(
      (unit) => unit.currentHp > 0 && unit.role === 'Tanker',
    );
    if (!candidateTanks.length) return undefined;

    const fixture = P1V11B_ENGAGEMENT_FIXTURE;
    const eligible: Array<{ tank: CombatUnit; distance: number }> = [];

    for (const tank of candidateTanks) {
      const laneDiffToTarget = Math.abs(tank.positionLane - intendedTarget.positionLane);
      const laneDiffToDiver = Math.abs(tank.positionLane - enemy.positionLane);
      if (laneDiffToTarget > 1.05 && laneDiffToDiver > 1.05) continue;

      const distToTarget = calcDistance(
        tank.positionX,
        tank.positionLane,
        intendedTarget.positionX,
        intendedTarget.positionLane,
      );
      if (distToTarget > 2.2) continue;

      const distToTank = calcDistance(
        enemy.positionX,
        enemy.positionLane,
        tank.positionX,
        tank.positionLane,
      );
      if (distToTank > fixture.tankGuardRadius) continue;

      const enemyAheadOfTank = enemy.positionX >= tank.positionX - COMBAT_DISTANCE_EPSILON;
      const targetBehindOrAtTank =
        intendedTarget.positionX <= tank.positionX + 0.35 || intendedTarget.unitId === tank.unitId;
      if (!enemyAheadOfTank || !targetBehindOrAtTank) continue;

      eligible.push({ tank, distance: distToTank });
    }

    if (!eligible.length) return undefined;

    eligible.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) > COMBAT_DISTANCE_EPSILON) {
        return a.distance - b.distance;
      }
      return a.tank.unitId.localeCompare(b.tank.unitId);
    });

    return eligible[0].tank;
  }

  static findTankInterceptor(
    enemy: EnemyCombatUnit,
    intendedTarget: CombatUnit,
    units: CombatUnit[],
    calcDistance: (x1: number, y1: number, x2: number, y2: number) => number,
  ): CombatUnit | undefined {
    const candidateTanks = units.filter(
      (unit) => unit.currentHp > 0 && unit.role === 'Tanker',
    );
    if (!candidateTanks.length) return undefined;

    const fixture = P1V11B_ENGAGEMENT_FIXTURE;
    const eligible: Array<{ tank: CombatUnit; distance: number }> = [];

    for (const tank of candidateTanks) {
      const distToTank = calcDistance(
        enemy.positionX,
        enemy.positionLane,
        tank.positionX,
        tank.positionLane,
      );

      if (distToTank > fixture.tankGuardRadius) continue;

      const enemyAheadOfTank = enemy.positionX >= tank.positionX - COMBAT_DISTANCE_EPSILON;
      const targetBehindOrAtTank =
        intendedTarget.positionX <= tank.positionX + 0.35 || intendedTarget.unitId === tank.unitId;
      if (!enemyAheadOfTank || !targetBehindOrAtTank) continue;

      const minLane = Math.min(enemy.positionLane, intendedTarget.positionLane) - 0.5;
      const maxLane = Math.max(enemy.positionLane, intendedTarget.positionLane) + 0.5;
      const inLaneCorridor = tank.positionLane >= minLane && tank.positionLane <= maxLane;
      const laneDiffToEnemy = Math.abs(tank.positionLane - enemy.positionLane);
      if (!inLaneCorridor || laneDiffToEnemy > 1.05) continue;

      eligible.push({ tank, distance: distToTank });
    }

    if (!eligible.length) return undefined;

    eligible.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) > COMBAT_DISTANCE_EPSILON) {
        return a.distance - b.distance;
      }
      if (Math.abs(b.tank.positionX - a.tank.positionX) > COMBAT_DISTANCE_EPSILON) {
        return b.tank.positionX - a.tank.positionX;
      }
      return a.tank.unitId.localeCompare(b.tank.unitId);
    });

    return eligible[0].tank;
  }
}

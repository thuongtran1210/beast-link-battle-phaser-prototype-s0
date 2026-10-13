import type { CombatUnit, EnemyCombatUnit } from '../BattleTypes';
import {
  LANE_DISTANCE_SCALE,
  COMBAT_DISTANCE_EPSILON,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  ENEMY_MIN_X,
  ENEMY_MAX_X,
} from '../BattleConfig';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class BattleMovementSystem {
  static distance(
    ax: number,
    aLane: number,
    bx: number,
    bLane: number,
  ): number {
    return Math.hypot(bx - ax, (bLane - aLane) * LANE_DISTANCE_SCALE);
  }

  static moveToward(
    fromX: number,
    fromLane: number,
    toX: number,
    toLane: number,
    speed: number,
    stopRange: number,
  ): { x: number; lane: number } {
    const dx = toX - fromX;
    const dyScaled = (toLane - fromLane) * LANE_DISTANCE_SCALE;
    const dist = Math.hypot(dx, dyScaled);
    const travel = Math.min(speed, Math.max(0, dist - stopRange));

    if (dist <= COMBAT_DISTANCE_EPSILON || travel <= COMBAT_DISTANCE_EPSILON) {
      return { x: fromX, lane: fromLane };
    }

    return {
      x: fromX + (dx / dist) * travel,
      lane: fromLane + ((dyScaled / dist) * travel) / LANE_DISTANCE_SCALE,
    };
  }

  static moveTowardPlayerUnit(
    unit: CombatUnit,
    target: EnemyCombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    const moved = this.moveToward(
      unit.positionX,
      unit.positionLane,
      target.positionX,
      target.positionLane,
      speed,
      stopRange,
    );
    unit.positionX = clamp(moved.x, PLAYER_MIN_X, PLAYER_MAX_X);
    unit.positionLane = clamp(moved.lane, 1, 6);
  }

  static moveTowardEnemy(
    enemy: EnemyCombatUnit,
    target: CombatUnit,
    speed: number,
    stopRange: number,
  ): void {
    const moved = this.moveToward(
      enemy.positionX,
      enemy.positionLane,
      target.positionX,
      target.positionLane,
      speed,
      stopRange,
    );
    enemy.positionX = clamp(moved.x, ENEMY_MIN_X, ENEMY_MAX_X);
    enemy.positionLane = clamp(moved.lane, 1, 6);
  }

  static moveEntityToward(
    entity: { positionX: number; positionLane: number; teamId?: string },
    target: { positionX: number; positionLane: number },
    speed: number,
    stopRange: number,
    bounds?: { minX: number; maxX: number },
  ): void {
    const isTeamA = !entity.teamId || entity.teamId === 'TeamA' || entity.teamId === 'Player';
    const effectiveBounds = bounds ?? (isTeamA
      ? { minX: PLAYER_MIN_X, maxX: PLAYER_MAX_X }
      : { minX: ENEMY_MIN_X, maxX: ENEMY_MAX_X });

    const moved = this.moveToward(
      entity.positionX,
      entity.positionLane,
      target.positionX,
      target.positionLane,
      speed,
      stopRange,
    );
    entity.positionX = clamp(moved.x, effectiveBounds.minX, effectiveBounds.maxX);
    entity.positionLane = clamp(moved.lane, 1, 6);
  }

  static retreatPlayerUnit(unit: CombatUnit, speed: number): boolean {
    const before = unit.positionX;
    unit.positionX = clamp(unit.positionX - speed, PLAYER_MIN_X, PLAYER_MAX_X);
    return unit.positionX < before - 0.000001;
  }

  static retreatEnemy(enemy: EnemyCombatUnit, speed: number): boolean {
    const before = enemy.positionX;
    enemy.positionX = clamp(enemy.positionX + speed, ENEMY_MIN_X, ENEMY_MAX_X);
    return enemy.positionX > before + 0.000001;
  }

  static retreatEntity(
    entity: { positionX: number; teamId?: string },
    speed: number,
  ): boolean {
    const isTeamA = !entity.teamId || entity.teamId === 'TeamA' || entity.teamId === 'Player';
    const before = entity.positionX;
    if (isTeamA) {
      entity.positionX = clamp(entity.positionX - speed, PLAYER_MIN_X, PLAYER_MAX_X);
      return entity.positionX < before - 0.000001;
    } else {
      entity.positionX = clamp(entity.positionX + speed, ENEMY_MIN_X, ENEMY_MAX_X);
      return entity.positionX > before + 0.000001;
    }
  }
}

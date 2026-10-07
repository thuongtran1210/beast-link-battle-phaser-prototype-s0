import type { BattleRow } from '../battle/AutonomousBattleModel';

export interface BattleFieldLayout {
  baseX: number;
  baseY: number;
  dividerX: number;
  dividerY: number;
  dividerHeight: number;
  playerFrontX: number;
  enemyFrontX: number;
  topLaneY: number;
  depthGap: number;
  laneGap: number;
  slotWidth: number;
  slotHeight: number;
  panelX: number;
}

/**
 * Creates the landscape 16:9 battlefield layout.
 * Optimized for ~1280×720 resolution.
 */
export function createBattleFieldLayout(baseX = 20, baseY = 80): BattleFieldLayout {
  const dividerX = baseX + 400;
  return {
    baseX,
    baseY,
    dividerX,
    dividerY: baseY + 265,
    dividerHeight: 440,
    playerFrontX: dividerX - 70,
    enemyFrontX: dividerX + 70,
    topLaneY: baseY + 96,
    depthGap: 84,
    laneGap: 70,
    slotWidth: 68,
    slotHeight: 58,
    panelX: 910,
  };
}

export function rowIndex(row: BattleRow): number {
  return row === 'Front' ? 0 : row === 'Mid' ? 1 : 2;
}

/**
 * Player faces right:
 * Front is closest to center, then Mid, then Back further left.
 * column 1..6 maps top-to-bottom as vertical battlefield lanes.
 */
export function playerSlotPosition(
  layout: BattleFieldLayout,
  row: BattleRow,
  column: number,
): { x: number; y: number } {
  return {
    x: layout.playerFrontX - rowIndex(row) * layout.depthGap,
    y: layout.topLaneY + (column - 1) * layout.laneGap,
  };
}

/**
 * Enemy faces left:
 * Front is closest to center, then Mid, then Back further right.
 * Matching column numbers share the same vertical lane as the player side.
 */
export function enemySlotPosition(
  layout: BattleFieldLayout,
  row: BattleRow,
  column: number,
): { x: number; y: number } {
  return {
    x: layout.enemyFrontX + rowIndex(row) * layout.depthGap,
    y: layout.topLaneY + (column - 1) * layout.laneGap,
  };
}

/**
 * Convert P1-V9 model-space coordinates to battlefield pixels.
 * x: player side negative, enemy side positive, center = 0.
 * lane: 1..6 from top to bottom.
 */
export function battleModelPosition(
  layout: BattleFieldLayout,
  positionX: number,
  positionLane: number,
): { x: number; y: number } {
  const pixelsPerDepth = layout.depthGap;
  return {
    x: layout.dividerX + positionX * pixelsPerDepth,
    y: layout.topLaneY + (positionLane - 1) * layout.laneGap,
  };
}

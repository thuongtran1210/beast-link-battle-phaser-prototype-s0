import type { BattleRow } from '../battle/AutonomousBattleModel';

export interface BattleFieldLayout {
  baseX: number;
  baseY: number;
  playerFirstX: number;
  enemyFirstX: number;
  topY: number;
  colGap: number;
  rowGap: number;
  slotWidth: number;
  slotHeight: number;
  dividerX: number;
  dividerY: number;
  dividerHeight: number;
  panelX: number;
}

export function createBattleFieldLayout(baseX = 18, baseY = 105): BattleFieldLayout {
  return {
    baseX,
    baseY,
    playerFirstX: baseX + 40,
    enemyFirstX: baseX + 540,
    topY: baseY + 180,
    colGap: 42,
    rowGap: 112,
    slotWidth: 38,
    slotHeight: 54,
    dividerX: baseX + 291,
    dividerY: baseY + 332,
    dividerHeight: 360,
    panelX: 620,
  };
}

export function rowIndex(row: BattleRow): number {
  return row === 'Front' ? 0 : row === 'Mid' ? 1 : 2;
}

export function playerSlotPosition(
  layout: BattleFieldLayout,
  row: BattleRow,
  column: number,
): { x: number; y: number } {
  return {
    x: layout.playerFirstX + (column - 1) * layout.colGap,
    y: layout.topY + rowIndex(row) * layout.rowGap,
  };
}

export function enemySlotPosition(
  layout: BattleFieldLayout,
  row: BattleRow,
  column: number,
): { x: number; y: number } {
  return {
    x: layout.enemyFirstX - (column - 1) * layout.colGap,
    y: layout.topY + rowIndex(row) * layout.rowGap,
  };
}

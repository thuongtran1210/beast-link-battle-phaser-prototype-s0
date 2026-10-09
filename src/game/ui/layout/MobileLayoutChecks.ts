import { LandscapeLayout } from './LandscapeLayout';
import { mobileSetupSlot } from './MobileSetupLayout';
import { createPlayerBattleLayout, battleModelPosition, enemySlotPosition } from '../BattleFieldLayout';
import { PLAYER_SPAWN_X, ENEMY_SPAWN_X } from '../../battle/BattleConfig';

export function runMobileLayoutChecks(): void {
  const expect = (value: boolean, message: string) => {
    if (!value) throw new Error(`Mobile layout: ${message}`);
  };
  for (const [width, height] of [[568, 320], [667, 375], [740, 360], [844, 390], [1024, 600]]) {
    const referenceWidth = Math.max(1280, Math.round(720 * width / height));
    const layout = new LandscapeLayout(referenceWidth, 720, true);
    const board = layout.getPuzzleBoardPlacement(6);
    const scale = Math.min(width / referenceWidth, height / 720);
    expect(board.cellSize * scale >= 44, `tap target at ${width}×${height}`);
    expect(board.startY - 8 >= layout.hudHeight, 'board clears compact header');
    expect(board.startY + board.totalSize + 8 <= layout.height, 'board bottom stays visible');
    expect(board.startX + board.totalSize + 8 < layout.rightX, 'board does not cover rail');
    expect(layout.rightX + layout.rightWidth <= layout.width, 'rail stays on screen');
    const slots = (['Front', 'Mid', 'Back'] as const).flatMap(row => Array.from({length: 6}, (_, i) => mobileSetupSlot(row, i + 1,referenceWidth)));
    expect(slots.length === 18, 'all tactical positions remain available');
    for (const slot of slots) {
      expect(slot.x-slot.width/2>18 && slot.y+slot.height/2<500, 'Setup markers stay above reserve and inside field');
    }
    const field=createPlayerBattleLayout(referenceWidth,720,true);
    for(const row of ['Front','Mid','Back'] as const) for(let lane=1;lane<=6;lane++) {
      const marker=mobileSetupSlot(row,lane,referenceWidth);
      const spawn=battleModelPosition(field,PLAYER_SPAWN_X[row],lane);
      expect(marker.x===spawn.x&&marker.y===spawn.y,'Setup matches actual player spawn');
      const enemy=enemySlotPosition(field,row,lane);
      const enemySpawn=battleModelPosition(field,ENEMY_SPAWN_X[row],lane);
      expect(enemy.x===enemySpawn.x&&enemy.y===enemySpawn.y,'enemy preview matches actual spawn');
      expect(marker.x<field.dividerX&&enemy.x>field.dividerX,'opposing sides stay distinct');
    }
    expect(mobileSetupSlot('Back',1,referenceWidth).x<mobileSetupSlot('Front',1,referenceWidth).x,'front faces enemy rather than rotating grid');
  }
  const desktop = new LandscapeLayout(1280, 720, false);
  expect(desktop.getPuzzleBoardPlacement().cellSize === 84, 'desktop board scale preserved');
  const small = new LandscapeLayout(800, 400, true);
  const board = small.getPuzzleBoardPlacement();
  expect(board.startY + board.totalSize < 400, 'short layouts do not clamp into overflow');
}

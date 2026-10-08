import { LandscapeLayout } from './LandscapeLayout';

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
  }
  const desktop = new LandscapeLayout(1280, 720, false);
  expect(desktop.getPuzzleBoardPlacement().cellSize === 84, 'desktop board scale preserved');
  const small = new LandscapeLayout(800, 400, true);
  const board = small.getPuzzleBoardPlacement();
  expect(board.startY + board.totalSize < 400, 'short layouts do not clamp into overflow');
}

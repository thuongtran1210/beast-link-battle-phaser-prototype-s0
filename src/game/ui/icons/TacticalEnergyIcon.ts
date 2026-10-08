import type Phaser from 'phaser';

/** Four tactical glyphs; no role/weapon placeholder symbols for active Energy. */
export function drawTacticalEnergyIcon(
  g: Phaser.GameObjects.Graphics, id: string, cx: number, cy: number,
  size: number, primary: number,
): boolean {
  const s = size / 64;
  const polygon = (points: number[][], fill: number, stroke = 0xffffff) => {
    g.fillStyle(fill, 1);
    g.lineStyle(2 * s, stroke, 1);
    g.beginPath();
    points.forEach(([x, y], i) => i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s));
    g.closePath(); g.fillPath(); g.strokePath();
  };
  const plus = (color: number) => {
    g.fillStyle(color, 1);
    g.fillRoundedRect(cx - 3 * s, cy - 10 * s, 6 * s, 20 * s, s);
    g.fillRoundedRect(cx - 10 * s, cy - 3 * s, 20 * s, 6 * s, s);
  };
  if (id === 'energy-a') {
    polygon([[-15,-15],[15,-15],[13,6],[0,19],[-13,6]], primary);
    plus(0xffffff);
  } else if (id === 'energy-b') {
    g.fillStyle(primary, 1);
    g.fillCircle(cx - 8*s,cy - 6*s,10*s);
    g.fillCircle(cx + 8*s,cy - 6*s,10*s);
    polygon([[-17,-3],[0,18],[17,-3]], primary, primary);
    plus(0xffffff);
  } else if (id === 'energy-c') {
    polygon([[-15,-15],[15,-15],[13,6],[0,19],[-13,6]], primary);
    g.lineStyle(5*s,0x064e3b,1);
    g.beginPath();g.moveTo(cx+3*s,cy-15*s);g.lineTo(cx-5*s,cy-3*s);
    g.lineTo(cx+5*s,cy+3*s);g.lineTo(cx-2*s,cy+16*s);g.strokePath();
  } else if (id === 'energy-d') {
    g.lineStyle(2.5*s,primary,1);
    g.strokeCircle(cx+3*s,cy,13*s);
    g.strokeCircle(cx+3*s,cy,6*s);
    g.lineStyle(4*s,0xffffff,1);
    g.beginPath();g.moveTo(cx-19*s,cy);g.lineTo(cx+19*s,cy);g.strokePath();
    polygon([[11,-7],[21,0],[11,7]],0xffffff);
  } else return false;
  return true;
}

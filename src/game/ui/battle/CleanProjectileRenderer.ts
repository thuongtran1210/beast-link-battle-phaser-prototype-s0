import Phaser from 'phaser';

export type CleanProjectileKind = 'arrow' | 'magic' | 'bubble' | 'heart' | 'toy' | 'bomb';
/** One readable silhouette in flight and one brief impact. Presentation only. */
export class CleanProjectileRenderer {
  private active = 0;
  constructor(private readonly scene: Phaser.Scene, private readonly objects: Phaser.GameObjects.GameObject[]) {}

  play(from: {x: number; y: number}, to: {x: number; y: number}, kind: CleanProjectileKind, strong = false): void {
    if (this.active >= 18) return;
    this.active++;
    const g = this.scene.add.graphics().setPosition(from.x, from.y).setDepth(230);
    const outline = 0x17251e;
    const color = kind === 'arrow' ? 0xe9c982 : kind === 'heart' ? 0xe9afa8 : kind === 'bubble' ? 0xa7c9bd : 0xb69cdd;
    g.lineStyle(3, outline);
    if (kind === 'arrow') {
      g.lineStyle(5, outline); g.lineBetween(-24, 0, 14, 0);
      g.lineStyle(3, color); g.lineBetween(-23, 0, 13, 0);
      g.fillStyle(0xf3e8ca); g.fillTriangle(24, 0, 9, -8, 9, 8); g.strokeTriangle(24, 0, 9, -8, 9, 8);
      g.lineStyle(4, 0xb67c65); g.lineBetween(-24, 0, -32, -8); g.lineBetween(-24, 0, -32, 8);
      g.rotation = Math.atan2(to.y - from.y, to.x - from.x);
    } else if (kind === 'heart') {
      g.fillStyle(color); g.fillCircle(-8, -5, 10); g.fillCircle(8, -5, 10); g.fillTriangle(-18, -1, 18, -1, 0, 20);
    } else if (kind === 'toy') {
      g.fillStyle(0xd5b47b); g.fillRoundedRect(-17, -15, 34, 30, 5); g.strokeRoundedRect(-17, -15, 34, 30, 5);
      g.fillStyle(outline); g.fillCircle(-6, -3, 3); g.fillCircle(6, -3, 3); g.lineBetween(-7, 6, 7, 6);
    } else if (kind === 'bomb') {
      g.fillStyle(0x29322e); g.fillCircle(0, 0, 20); g.strokeCircle(0, 0, 20);
      g.lineStyle(4, 0xd5b47b); g.lineBetween(0, -20, 8, -28); g.fillStyle(0xedc16d); g.fillCircle(9, -29, 5);
    } else {
      g.fillStyle(color, kind === 'bubble' ? .22 : 1); g.fillCircle(0, 0, strong ? 20 : 15); g.strokeCircle(0, 0, strong ? 20 : 15);
      g.fillStyle(0xffffff); g.fillCircle(-5, -3, 5); g.fillCircle(6, -3, 5);
      g.fillStyle(outline); g.fillCircle(-3, -3, 2); g.fillCircle(8, -3, 2);
    }
    this.objects.push(g);
    const duration = Phaser.Math.Clamp(Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y) / 1.25, 220, 440);
    this.scene.tweens.add({ targets: g, x: to.x, y: to.y, duration, ease: 'Sine.InOut',
      onComplete: () => {
        this.active--;
        if (g.active) { this.impact(to, color); this.remove(g); }
      },
    });
  }

  private impact(at: {x: number; y: number}, color: number): void {
    const g = this.scene.add.graphics().setPosition(at.x, at.y).setDepth(231);
    g.lineStyle(4, color); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4; g.lineBetween(Math.cos(a) * 12, Math.sin(a) * 12, Math.cos(a) * 23, Math.sin(a) * 23); }
    this.objects.push(g);
    this.scene.tweens.add({targets:g, alpha:0, scaleX:1.25, scaleY:1.25, duration:220, onComplete:() => this.remove(g)});
  }
  private remove(g: Phaser.GameObjects.Graphics): void {
    const index = this.objects.indexOf(g); if (index >= 0) this.objects.splice(index, 1);
    if (g.active) g.destroy();
  }
}

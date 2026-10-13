import Phaser from 'phaser';

export class BattleFloatingTextSystem {
  private readonly unitHitTracking = new Map<string, { time: number; count: number }>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
  ) {}

  floatCombatText(
    x: number,
    y: number,
    text: string,
    color: string,
    unitKey: string,
    isCrit = false,
  ): void {
    const now = Date.now();
    let hitInfo = this.unitHitTracking.get(unitKey);
    if (!hitInfo || now - hitInfo.time > 400) {
      hitInfo = { time: now, count: 0 };
    } else {
      hitInfo.count = (hitInfo.count + 1) % 3;
      hitInfo.time = now;
    }
    this.unitHitTracking.set(unitKey, hitInfo);

    const offsetX = (hitInfo.count - 1) * 14;
    const offsetY = hitInfo.count * -8;

    // Landscape bounds safety (1280x720)
    const spawnX = Math.max(50, Math.min(960, x + offsetX));
    const spawnY = Math.max(75, Math.min(640, y - 36 + offsetY));

    const txt = this.scene.add
      .text(spawnX, spawnY, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: isCrit ? '18px' : '14px',
        color: isCrit ? '#fef08a' : color,
        fontStyle: 'bold',
        stroke: '#0f172a',
        strokeThickness: isCrit ? 4 : 3,
      })
      .setOrigin(0.5)
      .setDepth(150);

    if (isCrit) {
      txt.setScale(0.7);
      this.scene.tweens.add({
        targets: txt,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 140,
        ease: 'Back.Out',
      });
    }

    this.managedObjects.push(txt);
    this.scene.tweens.add({
      targets: txt,
      y: spawnY - (isCrit ? 36 : 26),
      alpha: 0,
      duration: isCrit ? 800 : 650,
      ease: 'Cubic.Out',
      onComplete: () => {
        const index = this.managedObjects.indexOf(txt);
        if (index >= 0) this.managedObjects.splice(index, 1);
        txt.destroy();
      },
    });
  }

  clear(): void {
    this.unitHitTracking.clear();
  }
}

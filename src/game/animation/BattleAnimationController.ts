import Phaser from 'phaser';

/**
 * Presentation-only combat animation seam.
 *
 * It consumes already-derived battle presentation events and must never mutate
 * combat/model state.
 */
export class BattleAnimationController {
  constructor(private readonly scene: Phaser.Scene) {}

  windup(target: Phaser.GameObjects.Container, isPlayer: boolean): void {
    if (!this.isRenderable(target)) return;
    const leanX = isPlayer ? 4 : -4;
    this.scene.tweens.add({
      targets: target,
      x: target.x + leanX,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 120,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  attack(target: Phaser.GameObjects.Container, isPlayer = true): void {
    if (!this.isRenderable(target)) return;
    const startX = target.x;
    const lunge = isPlayer ? 9 : -9;
    this.scene.tweens.add({
      targets: target,
      x: startX + lunge,
      scaleX: 1.04,
      scaleY: 0.98,
      duration: 75,
      yoyo: true,
      ease: 'Cubic.Out',
      onComplete: () => {
        if (target.active) target.x = startX;
      },
    });
  }

  recoil(target: Phaser.GameObjects.Container, offsetX: number): void {
    if (!this.isRenderable(target)) return;
    const startX = target.x;
    this.scene.tweens.add({
      targets: target,
      x: startX + offsetX,
      duration: 55,
      yoyo: true,
      ease: 'Quad.Out',
      onComplete: () => {
        if (target.active) target.x = startX;
      },
    });
  }

  defeat(target: Phaser.GameObjects.Container, clockwise: boolean): void {
    if (!target?.active) return;
    this.scene.tweens.killTweensOf(target);
    this.scene.tweens.add({
      targets: target,
      alpha: 0.2,
      y: target.y + 10,
      scaleX: 0.8,
      scaleY: 0.8,
      angle: clockwise ? 12 : -12,
      duration: 220,
      ease: 'Quad.In',
    });
  }

  private isRenderable(target: Phaser.GameObjects.Container | undefined): target is Phaser.GameObjects.Container {
    return Boolean(target?.active && target.alpha > 0.2);
  }
}

import Phaser from 'phaser';

/**
 * P1-V1 Transition Cue:
 * Centered, non-interactive overlay displayed between Beast Rush and Energy Rush for 1.0s.
 */
export class TransitionCueView {
  private readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number) {
    const backdrop = scene.add
      .rectangle(0, 0, 520, 200, 0x18212b, 0.95)
      .setStrokeStyle(3, 0xfbbf24);
    const title = scene.add
      .text(0, -35, 'ENERGY RUSH', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(0, 25, 'Collect Energy for Battle', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(centerX, centerY, [backdrop, title, subtitle])
      .setDepth(1000)
      .setVisible(false);
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}

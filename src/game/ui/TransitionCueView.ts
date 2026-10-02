import Phaser from 'phaser';

/**
 * P1-V1 Transition Cue:
 * Centered, non-interactive overlay displayed between Beast Rush and Energy Rush for 1.0s.
 */
export class TransitionCueView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number) {
    const backdrop = scene.add
      .rectangle(0, 0, 520, 200, 0x18212b, 0.95)
      .setStrokeStyle(3, 0xfbbf24);
    this.title = scene.add
      .text(0, -35, 'ENERGY RUSH', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#fbbf24',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.subtitle = scene.add
      .text(0, 25, 'Collect Energy for Battle', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(centerX, centerY, [backdrop, this.title, this.subtitle])
      .setDepth(1000)
      .setVisible(false);
  }

  show(title = 'ENERGY RUSH', subtitle = 'Collect Energy for Battle'): void {
    this.title.setText(title);
    this.subtitle.setText(subtitle);
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}

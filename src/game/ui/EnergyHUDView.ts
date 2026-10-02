import Phaser from 'phaser';

/**
 * P1-V1 HUD for Energy Rush:
 * Displays fixed 8.0s countdown timer and collected Energy charges.
 */
export class EnergyHUDView {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#18212b',
      lineSpacing: 9,
    });
  }

  render(remainingSeconds: number, storedEnergyLines: string): void {
    const clamped = Math.max(0, remainingSeconds);
    this.text.setText([
      'ENERGY RUSH',
      '',
      'COUNTDOWN',
      `${clamped.toFixed(1)}s`,
      '',
      'STORED ENERGY',
      storedEnergyLines,
    ].join('\n'));
  }

  setVisible(visible: boolean): void {
    this.text.setVisible(visible);
  }

  destroy(): void {
    this.text.destroy();
  }
}

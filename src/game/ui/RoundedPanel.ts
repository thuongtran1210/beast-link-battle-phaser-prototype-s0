import Phaser from 'phaser';

/** Code-drawn surface; its rectangular hit area keeps the full tile clickable. */
export class RoundedPanel extends Phaser.GameObjects.Graphics {
  private borderWidth = 0;
  private borderColor = 0;
  private borderAlpha = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly panelWidth: number,
    private readonly panelHeight: number,
    private readonly color: number,
    private readonly opacity = 1,
    private readonly radius = 12,
  ) {
    super(scene);
    this.setPosition(x, y);
    scene.add.existing(this);
    this.redraw();
  }

  setStrokeStyle(width: number, color: number, alpha = 1): this {
    this.borderWidth = width;
    this.borderColor = color;
    this.borderAlpha = alpha;
    this.redraw();
    return this;
  }

  setInteractive(config?: Phaser.Types.Input.InputConfiguration): this {
    return super.setInteractive({
      ...config,
      hitArea: new Phaser.Geom.Rectangle(
        -this.panelWidth / 2, -this.panelHeight / 2,
        this.panelWidth, this.panelHeight,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    });
  }

  private redraw(): void {
    this.clear();
    const x = -this.panelWidth / 2;
    const y = -this.panelHeight / 2;
    const r = Math.min(this.radius, this.panelWidth / 2, this.panelHeight / 2);
    this.fillStyle(this.color, this.opacity);
    this.fillRoundedRect(x, y, this.panelWidth, this.panelHeight, r);
    if (this.borderWidth > 0) {
      this.lineStyle(this.borderWidth, this.borderColor, this.borderAlpha);
      this.strokeRoundedRect(x, y, this.panelWidth, this.panelHeight, r);
    }
  }
}

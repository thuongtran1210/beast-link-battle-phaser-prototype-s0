import Phaser from 'phaser';

export interface ShowcaseControlsState {
  showcaseMode: boolean;
  paused: boolean;
  cleanFrame: boolean;
  canPause: boolean;
}

export class ShowcaseControlsView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private state: ShowcaseControlsState = {
    showcaseMode: false,
    paused: false,
    cleanFrame: false,
    canPause: false,
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onToggleShowcase: () => void,
    private readonly onTogglePause: () => void,
    private readonly onToggleCleanFrame: () => void,
  ) {}

  render(state: ShowcaseControlsState): void {
    this.state = state;
    this.destroyObjects();

    if (state.cleanFrame) return;

    const right = this.scene.scale.width - 18;
    let x = right;

    const mode = this.button(
      x,
      92,
      state.showcaseMode ? 'VALIDATION · F1' : 'SHOWCASE · F1',
      state.showcaseMode ? 0x475569 : 0xb45309,
      this.onToggleShowcase,
    );
    x -= mode.width + 8;

    if (state.showcaseMode && state.canPause) {
      const pause = this.button(
        x,
        92,
        state.paused ? 'RESUME · SPACE' : 'PAUSE · SPACE',
        state.paused ? 0x15803d : 0x1e3a5f,
        this.onTogglePause,
      );
      x -= pause.width + 8;
    }

    if (state.showcaseMode) {
      this.button(x, 92, 'CLEAN FRAME · H', 0x334155, this.onToggleCleanFrame);
    }
  }

  destroy(): void {
    this.destroyObjects();
  }

  private button(
    rightX: number,
    y: number,
    label: string,
    fill: number,
    handler: () => void,
  ): Phaser.GameObjects.Container {
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5);

    const width = text.width + 18;
    const bg = this.scene.add
      .rectangle(0, 0, width, 30, fill, 0.96)
      .setStrokeStyle(1, 0xffffff, 0.15)
      .setInteractive({ useHandCursor: true });

    const container = this.scene.add.container(rightX - width / 2, y, [bg, text]);
    bg.on('pointerdown', handler);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', handler);
    this.objects.push(container);
    return container;
  }

  private destroyObjects(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

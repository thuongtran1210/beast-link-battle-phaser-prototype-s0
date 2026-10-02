import Phaser from 'phaser';
import { GamePhase } from '../state/GamePhase';
import { HudTokens } from './layout/HudTokens';

export interface TopHudCallbacks {
  onToggleShowcase: () => void;
  onTogglePause: () => void;
  onToggleCleanFrame: () => void;
}

export class GameTopHUD {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly phasePills: Map<GamePhase, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }> = new Map();
  private logoText!: Phaser.GameObjects.Text;
  private phaseBadgeBg!: Phaser.GameObjects.Rectangle;
  private phaseBadgeText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private beastQueueText!: Phaser.GameObjects.Text;
  private energyQueueText!: Phaser.GameObjects.Text;
  private showcaseBtnText!: Phaser.GameObjects.Text;
  private showcaseBtnBg!: Phaser.GameObjects.Rectangle;
  private pauseBtnContainer?: Phaser.GameObjects.Container;
  private cleanBtnContainer?: Phaser.GameObjects.Container;

  private isCleanFrame = false;
  private visible = true;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly callbacks: TopHudCallbacks,
  ) {
    this.create();
  }

  private create(): void {
    const width = this.scene.scale.width;
    const hudHeight = 70;

    // Sleek navbar background
    const bg = this.scene.add
      .rectangle(width / 2, hudHeight / 2, width, hudHeight, HudTokens.colors.bgSurfaceDark, 0.96)
      .setStrokeStyle(1, HudTokens.colors.strokeDefault);
    this.objects.push(bg);

    // Subtle bottom glow line
    const glowLine = this.scene.add
      .rectangle(width / 2, hudHeight - 1, width, 2, HudTokens.colors.strokeHighlight, 0.6);
    this.objects.push(glowLine);

    // LEFT: Logo & Phase Badge
    this.logoText = this.scene.add.text(20, 14, 'BEAST LINK BATTLE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '17px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    });
    this.objects.push(this.logoText);

    this.phaseBadgeBg = this.scene.add
      .rectangle(64, 46, 92, 20, HudTokens.colors.bgSurface, 0.9)
      .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
    this.phaseBadgeText = this.scene.add.text(64, 46, 'BEAST RUSH', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.objects.push(this.phaseBadgeBg, this.phaseBadgeText);

    // CENTER: Phase Progression Pipeline
    const phases: Array<{ phase: GamePhase; label: string }> = [
      { phase: GamePhase.BeastRush, label: 'BEAST' },
      { phase: GamePhase.EnergyRush, label: 'ENERGY' },
      { phase: GamePhase.BattleSetup, label: 'SETUP' },
      { phase: GamePhase.Battle, label: 'BATTLE' },
      { phase: GamePhase.Result, label: 'RESULT' },
    ];

    const centerX = width / 2;
    const pillW = 68;
    const pillH = 22;
    const pillSpacing = 82;
    const totalPillSpan = (phases.length - 1) * pillSpacing;
    const startPillX = centerX - totalPillSpan / 2;

    phases.forEach((item, index) => {
      const px = startPillX + index * pillSpacing;
      const py = 35;

      // Arrow connector (except after last)
      if (index < phases.length - 1) {
        const arrow = this.scene.add.text(px + pillSpacing / 2, py, '→', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: '#475569',
        }).setOrigin(0.5);
        this.objects.push(arrow);
      }

      const pBg = this.scene.add
        .rectangle(px, py, pillW, pillH, HudTokens.colors.bgSurface, 0.8)
        .setStrokeStyle(1, HudTokens.colors.strokeDefault);

      const pText = this.scene.add.text(px, py, item.label, {
        fontFamily: HudTokens.fonts.family,
        fontSize: '10px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.phasePills.set(item.phase, { bg: pBg, text: pText });
      this.objects.push(pBg, pText);
    });

    // RIGHT: Queue Pills + Showcase Mode Controls
    this.rebuildRightControls(width);
  }

  private rebuildRightControls(width: number): void {
    // Clean up old right elements if any
    let rightEdge = width - 16;
    const yCenter = 35;

    // F1 Mode Toggle Button
    const showcaseLabel = 'F1 · SHOWCASE';
    const scText = this.scene.add.text(0, 0, showcaseLabel, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const scW = scText.width + 18;
    const scH = 28;
    this.showcaseBtnBg = this.scene.add
      .rectangle(0, 0, scW, scH, 0xb45309, 0.95)
      .setStrokeStyle(1, 0xfbbf24, 0.4)
      .setInteractive({ useHandCursor: true });
    this.showcaseBtnText = scText;

    const showcaseContainer = this.scene.add.container(rightEdge - scW / 2, yCenter, [
      this.showcaseBtnBg,
      this.showcaseBtnText,
    ]).setSize(scW, scH);

    this.showcaseBtnBg.on('pointerdown', this.callbacks.onToggleShowcase);
    scText.setInteractive({ useHandCursor: true }).on('pointerdown', this.callbacks.onToggleShowcase);
    this.objects.push(showcaseContainer);
    rightEdge -= scW + 10;

    // Stored Energy pill
    const energyBg = this.scene.add
      .rectangle(rightEdge - 42, yCenter, 84, 26, HudTokens.colors.bgSurface, 0.9)
      .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
    this.energyQueueText = this.scene.add.text(rightEdge - 42, yCenter, '⚡ 0', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.objects.push(energyBg, this.energyQueueText);
    rightEdge -= 84 + 8;

    // Beast Queue pill
    const beastBg = this.scene.add
      .rectangle(rightEdge - 42, yCenter, 84, 26, HudTokens.colors.bgSurface, 0.9)
      .setStrokeStyle(1, HudTokens.colors.strokeHighlight);
    this.beastQueueText = this.scene.add.text(rightEdge - 42, yCenter, '🐾 0', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textBlue,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.objects.push(beastBg, this.beastQueueText);
  }

  update(
    phase: GamePhase,
    beastCount: number,
    energyCount: number,
    showcaseMode: boolean,
    paused: boolean,
    canPause: boolean,
    cleanFrame: boolean,
  ): void {
    this.isCleanFrame = cleanFrame;

    if (cleanFrame) {
      this.setVisible(false);
      return;
    }
    this.setVisible(this.visible);

    // Update phase badge
    const phaseNames: Record<GamePhase, string> = {
      [GamePhase.BeastRush]: 'BEAST RUSH',
      [GamePhase.EnergyRush]: 'ENERGY RUSH',
      [GamePhase.BattleSetup]: 'BATTLE SETUP',
      [GamePhase.Battle]: 'BATTLE',
      [GamePhase.Result]: 'RESULT',
    };
    this.phaseBadgeText.setText(phaseNames[phase] ?? phase);
    this.phaseBadgeBg.setSize(this.phaseBadgeText.width + 16, 20);
    this.phaseBadgeBg.setX(20 + this.phaseBadgeBg.width / 2);
    this.phaseBadgeText.setX(this.phaseBadgeBg.x);

    // Update phase pipeline highlighting
    const phaseOrder = [
      GamePhase.BeastRush,
      GamePhase.EnergyRush,
      GamePhase.BattleSetup,
      GamePhase.Battle,
      GamePhase.Result,
    ];
    const currentIndex = phaseOrder.indexOf(phase);

    phaseOrder.forEach((p, idx) => {
      const item = this.phasePills.get(p);
      if (!item) return;

      if (idx === currentIndex) {
        // Active
        item.bg.setFillStyle(0xb45309, 0.95);
        item.bg.setStrokeStyle(1.5, 0xfbbf24);
        item.text.setColor('#ffffff');
      } else if (idx < currentIndex) {
        // Passed
        item.bg.setFillStyle(0x1e3a5f, 0.7);
        item.bg.setStrokeStyle(1, 0x3b82f6);
        item.text.setColor('#93c5fd');
      } else {
        // Upcoming
        item.bg.setFillStyle(HudTokens.colors.bgSurface, 0.6);
        item.bg.setStrokeStyle(1, HudTokens.colors.strokeDefault);
        item.text.setColor(HudTokens.colors.textMuted);
      }
    });

    // Update counts
    this.beastQueueText.setText(`🐾 ${beastCount}`);
    this.energyQueueText.setText(`⚡ ${energyCount}`);

    // Update Showcase Button
    if (showcaseMode) {
      this.showcaseBtnText.setText('F1 · SHOWCASE');
      this.showcaseBtnBg.setFillStyle(0x0284c7, 0.95);
      this.showcaseBtnBg.setStrokeStyle(1, 0x38bdf8);
    } else {
      this.showcaseBtnText.setText('F1 · VALIDATE');
      this.showcaseBtnBg.setFillStyle(0x475569, 0.95);
      this.showcaseBtnBg.setStrokeStyle(1, 0x94a3b8);
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    const shouldShow = visible && !this.isCleanFrame;
    this.objects.forEach((obj) => (obj as unknown as Phaser.GameObjects.Components.Visible).setVisible(shouldShow));
  }

  destroy(): void {
    this.objects.splice(0).forEach((obj) => obj.destroy());
    this.phasePills.clear();
  }
}

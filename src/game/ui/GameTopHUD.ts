import Phaser from 'phaser';
import { GamePhase } from '../state/GamePhase';
import { HudTokens } from './layout/HudTokens';
import { isCompactLandscape } from './layout/MobilePresentation';

export interface GameTopHudContext {
  waveLabel?: string;
  primaryTitle?: string;
  secondaryTitle?: string;
  linkShards?: number;
  hideBrand?: boolean;
}

/** Player-facing global header shared across Rush / Setup / Battle. */
export class GameTopHUD {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly phases = new Map<GamePhase, Phaser.GameObjects.Text>();
  private readonly phaseMarkers = new Map<GamePhase, Phaser.GameObjects.Rectangle>();

  private primary!: Phaser.GameObjects.Text;
  private secondary!: Phaser.GameObjects.Text;
  private beasts!: Phaser.GameObjects.Text;
  private energy!: Phaser.GameObjects.Text;
  private link!: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    const w = scene.scale.width;

    if (isCompactLandscape()) {
      const bg = scene.add.rectangle(w / 2, 22, w, 44, HudTokens.colors.bgSurfaceDark, .98);
      const style = { fontFamily: HudTokens.fonts.family, fontSize: '20px', color: HudTokens.colors.textPrimary, fontStyle: 'bold' };
      this.primary = scene.add.text(18, 11, 'BEAST LINK BATTLE', style);
      this.secondary = scene.add.text(320, 11, 'BEAST RUSH', style);
      this.beasts = scene.add.text(w - 300, 12, 'BEAST 0', {...style, fontSize: '18px'});
      this.energy = scene.add.text(w - 185, 12, 'ENERGY 0', {...style, fontSize: '18px'});
      this.link = scene.add.text(w - 18, 12, '◆0', {...style, fontSize: '18px'}).setOrigin(1, 0);
      this.objects.push(bg, this.primary, this.secondary, this.beasts, this.energy, this.link);
      return;
    }

    const bg = scene.add
      .rectangle(w / 2, 31, w, 62, HudTokens.colors.bgSurfaceDark, .98)
      .setStrokeStyle(1, HudTokens.colors.strokeDefault, .75);
    this.objects.push(bg);

    this.primary = scene.add.text(20, 10, 'BEAST LINK BATTLE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '16px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    this.secondary = scene.add.text(20, 35, 'BEAST RUSH', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '9px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    this.objects.push(this.primary, this.secondary);

    const phaseDefs: Array<[GamePhase, string]> = [
      [GamePhase.BeastRush, 'BEAST'],
      [GamePhase.EnergyRush, 'ENERGY'],
      [GamePhase.BattleSetup, 'SETUP'],
      [GamePhase.Battle, 'BATTLE'],
      [GamePhase.WaveResult, 'WAVE'],
      [GamePhase.Result, 'RESULT'],
    ];

    phaseDefs.forEach(([phase, label], index) => {
      const x = w / 2 - 180 + index * 72;
      const marker = scene.add
        .rectangle(x, 53, 48, 3, HudTokens.colors.strokeViolet, 0)
        .setOrigin(.5);
      const text = scene.add.text(x, 29, label, {
        fontFamily: HudTokens.fonts.family,
        fontSize: '9px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'bold',
      }).setOrigin(.5);
      this.phaseMarkers.set(phase, marker);
      this.phases.set(phase, text);
      this.objects.push(marker, text);
    });

    this.beasts = scene.add.text(w - 224, 25, 'BEAST 0', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textBlue,
      fontStyle: 'bold',
    });
    this.energy = scene.add.text(w - 132, 25, 'ENERGY 0', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
    });
    this.link = scene.add.text(w - 28, 25, '◆0', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: '#a78bfa',
      fontStyle: 'bold',
    }).setOrigin(1, .5);
    this.objects.push(this.beasts, this.energy, this.link);
  }

  update(
    phase: GamePhase,
    beasts: number,
    energy: number,
    context?: GameTopHudContext,
  ): void {
    const compact = isCompactLandscape();
    this.primary.setText(compact ? context?.waveLabel ?? 'BEAST LINK BATTLE' : context?.primaryTitle ?? 'BEAST LINK BATTLE');
    this.secondary.setText(compact ? phase.replace(/([A-Z])/g, ' $1').trim().toUpperCase() : context?.secondaryTitle ?? phase.replace(/([A-Z])/g, ' $1').trim().toUpperCase());
    this.beasts.setText(`BEAST ${beasts}`);
    this.energy.setText(`ENERGY ${energy}`);
    this.link.setText(`◆${context?.linkShards ?? 0}`);

    const accent = phaseAccent(phase);
    this.secondary.setColor(accent.text);

    for (const [key, text] of this.phases) {
      const active = key === phase;
      text.setColor(active ? accent.text : HudTokens.colors.textMuted);
      this.phaseMarkers.get(key)?.setFillStyle(accent.color, active ? .95 : 0);
    }
  }

  setVisible(visible: boolean): void {
    this.objects.forEach((object) =>
      (object as unknown as Phaser.GameObjects.Components.Visible).setVisible(visible),
    );
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

function phaseAccent(phase: GamePhase): { color: number; text: string } {
  switch (phase) {
    case GamePhase.BeastRush:
      return { color: HudTokens.colors.gold, text: HudTokens.colors.textGold };
    case GamePhase.EnergyRush:
      return { color: HudTokens.colors.blue, text: HudTokens.colors.textBlue };
    case GamePhase.BattleSetup:
      return { color: HudTokens.colors.strokeViolet, text: '#c9a7ff' };
    case GamePhase.Battle:
      return { color: HudTokens.colors.green, text: HudTokens.colors.textGreen };
    case GamePhase.WaveResult:
      return { color: HudTokens.colors.strokePink, text: '#ff9aca' };
    default:
      return { color: HudTokens.colors.strokeHighlight, text: HudTokens.colors.textSecondary };
  }
}

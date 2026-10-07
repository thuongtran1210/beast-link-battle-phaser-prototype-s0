import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../battle/AutonomousBattleModel';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';
import type { TacticalEnergyControlPresentation } from './TacticalEnergyPresentation';

export class ShowcaseBattleHUDView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private visible = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x = 910,
    private readonly y = 82,
    private readonly panelWidth = 340,
  ) {}

  render(
    battle: AutonomousBattleSnapshot,
    energyEntries: ReadonlyArray<EnergyQueueEntry>,
    frontlineLabel: string,
    onCast: (energyId: string) => void,
    paused: boolean,
    castStateFor: (energyId: string) => TacticalEnergyControlPresentation | undefined,
  ): void {
    this.destroyObjects();

    const w = this.panelWidth;
    let currY = this.y;
    const isRunning = battle.status === 'Running';
    const statusText = paused ? 'PAUSED' : isRunning ? 'LIVE' : battle.status.toUpperCase();

    // Compact battle context. The battlefield should remain the visual hero.
    const statusH = 70;
    const statusBg = drawCard(this.scene, this.x, currY, w, statusH, HudTokens.colors.bgSurface, .95);
    const title = this.scene.add.text(this.x + 16, currY + 12, 'AUTONOMOUS BATTLE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '13px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    const subtitle = this.scene.add.text(this.x + 16, currY + 36, 'Formation resolves automatically · cast Energy when needed', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '9px',
      color: HudTokens.colors.textMuted,
    });
    const badgeBg = this.scene.add.rectangle(
      this.x + w - 48,
      currY + 22,
      72,
      24,
      paused ? HudTokens.colors.goldDark : isRunning ? HudTokens.colors.greenDark : HudTokens.colors.bgSurfaceLight,
      .95,
    ).setStrokeStyle(1, paused ? HudTokens.colors.gold : isRunning ? HudTokens.colors.green : HudTokens.colors.strokeHighlight);
    const badge = this.scene.add.text(this.x + w - 48, currY + 22, statusText, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(.5);
    this.objects.push(statusBg, title, subtitle, badgeBg, badge);
    currY += statusH + 10;

    // One threat card replaces Tick/debug-style readouts.
    const threatH = 92;
    const threatBg = drawCard(this.scene, this.x, currY, w, threatH, HudTokens.colors.bgSurface, .94);
    const enemiesAlive = battle.enemies.filter((enemy) => enemy.currentHp > 0).length;
    const enemyRatio = battle.enemyMaxHp > 0 ? Math.max(0, battle.enemyHp / battle.enemyMaxHp) : 0;
    const threatTitle = this.scene.add.text(this.x + 16, currY + 12, 'THREAT STATUS', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textRed,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    const alive = this.scene.add.text(this.x + w - 16, currY + 12, `${enemiesAlive} / ${battle.enemies.length} ACTIVE`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    const barW = w - 32;
    const barBg = this.scene.add.rectangle(this.x + 16 + barW / 2, currY + 37, barW, 11, HudTokens.colors.bgSurfaceDark, 1)
      .setStrokeStyle(1, HudTokens.colors.strokeDefault);
    const barFill = this.scene.add.rectangle(this.x + 16, currY + 37, barW * enemyRatio, 9, HudTokens.colors.red, .92).setOrigin(0, .5);
    const hpText = this.scene.add.text(this.x + 16, currY + 51, `Enemy HP  ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textSecondary,
      fontStyle: 'bold',
    });
    const frontline = this.scene.add.text(this.x + 16, currY + 68, `Frontline · ${frontlineLabel}`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '9px',
      color: HudTokens.colors.textMuted,
      wordWrap: { width: w - 32 },
    });
    this.objects.push(threatBg, threatTitle, alive, barBg, barFill, hpText, frontline);
    currY += threatH + 10;

    // Tactical Energy is the primary player interaction during Battle.
    const activeEntries = energyEntries.filter((entry) => entry.charges > 0).slice(0, 4);
    const totalCharges = activeEntries.reduce((sum, entry) => sum + entry.charges, 0);
    const cols = 2;
    const cardGap = 10;
    const innerPad = 14;
    const tileW = (w - innerPad * 2 - cardGap) / 2;
    const tileH = 96;
    const rows = Math.max(1, Math.ceil(activeEntries.length / cols));
    const energyH = 58 + rows * tileH + Math.max(0, rows - 1) * cardGap + 32;
    const energyBg = drawCard(this.scene, this.x, currY, w, energyH, HudTokens.colors.bgSurfaceElevated, .96);
    const energyTitle = this.scene.add.text(this.x + 16, currY + 13, 'TACTICAL ENERGY', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '13px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    const chargeText = this.scene.add.text(this.x + w - 16, currY + 14, `×${totalCharges} STORED`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    const instruction = this.scene.add.text(this.x + 16, currY + 34, 'SUGGESTED highlights relevance — you still choose.', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '9px',
      color: HudTokens.colors.textMuted,
    });
    this.objects.push(energyBg, energyTitle, chargeText, instruction);

    if (!activeEntries.length) {
      const empty = this.scene.add.text(this.x + 16, currY + 68, 'No stored Tactical Energy.', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '11px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'italic',
      });
      this.objects.push(empty);
    } else {
      activeEntries.forEach((entry, index) => {
        const castState = castStateFor(entry.energyId);
        if (!castState) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        const tileX = this.x + innerPad + col * (tileW + cardGap);
        const tileY = currY + 57 + row * (tileH + cardGap);
        const cx = tileX + tileW / 2;
        const cy = tileY + tileH / 2;
        const border = castState.suggested
          ? HudTokens.colors.gold
          : castState.enabled
          ? HudTokens.colors.blue
          : HudTokens.colors.strokeDefault;
        const fill = castState.suggested
          ? 0x40381f
          : castState.enabled
          ? HudTokens.colors.bgSurface
          : HudTokens.colors.bgSurfaceDark;

        const tile = this.scene.add.rectangle(cx, cy, tileW, tileH, fill, castState.enabled ? .98 : .72)
          .setStrokeStyle(castState.suggested ? 2 : 1.25, border, .95);
        const icon = createIconImage(this.scene, entry.energyId, tileX + 24, tileY + 24, 30);
        const name = this.scene.add.text(tileX + 45, tileY + 11, `${castState.displayName} ×${entry.charges}`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '10px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
        const desc = this.scene.add.text(tileX + 12, tileY + 43, castState.shortDescription, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '8px',
          color: HudTokens.colors.textMuted,
          wordWrap: { width: tileW - 24 },
        });
        const stateColor = castState.suggested
          ? HudTokens.colors.textGold
          : castState.enabled
          ? HudTokens.colors.textBlue
          : HudTokens.colors.textMuted;
        const state = this.scene.add.text(tileX + 12, tileY + 70, castState.stateLabel, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '9px',
          color: stateColor,
          fontStyle: 'bold',
        });
        const action = this.scene.add.text(tileX + tileW - 12, tileY + 70, castState.enabled ? 'CAST' : '—', {
          fontFamily: HudTokens.fonts.family,
          fontSize: '9px',
          color: castState.enabled ? '#ffffff' : HudTokens.colors.textMuted,
          fontStyle: 'bold',
          backgroundColor: castState.enabled ? '#407cb8' : undefined,
          padding: castState.enabled ? { x: 6, y: 3 } : undefined,
        }).setOrigin(1, 0);

        if (castState.enabled) {
          tile.setInteractive({ useHandCursor: true });
          action.setInteractive({ useHandCursor: true });
          const cast = () => onCast(entry.energyId);
          tile.on('pointerup', cast);
          action.on('pointerup', cast);
        }

        this.objects.push(tile, icon, name, desc, state, action);
      });
    }

    this.setVisible(this.visible);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.objects.forEach((object) => (object as unknown as Phaser.GameObjects.Components.Visible).setVisible(visible));
  }

  destroy(): void {
    this.destroyObjects();
  }

  private destroyObjects(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

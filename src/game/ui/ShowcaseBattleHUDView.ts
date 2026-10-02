import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../battle/AutonomousBattleModel';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

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
  ): void {
    this.destroyObjects();

    const w = this.panelWidth;
    let currY = this.y;

    // CARD 1: STATUS & TICK
    const statusH = 74;
    const isPaused = paused;
    const isRunning = battle.status === 'Running';
    const statusBg = drawCard(this.scene, this.x, currY, w, statusH, HudTokens.colors.bgSurface, 0.94);

    const title = this.scene.add.text(this.x + 16, currY + 12, 'BATTLE IN PROGRESS', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '13px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const statusBadgeText = isPaused ? 'PAUSED' : battle.status.toUpperCase();
    const statusBadgeColor = isPaused ? 0xb45309 : isRunning ? 0x15803d : 0x475569;
    const badgeBg = this.scene.add
      .rectangle(this.x + 54, currY + 44, 76, 22, statusBadgeColor, 0.9)
      .setStrokeStyle(1, isPaused ? 0xfbbf24 : 0x22c55e);

    const badgeLabel = this.scene.add.text(this.x + 54, currY + 44, statusBadgeText, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const tickText = this.scene.add.text(this.x + 150, currY + 44, `TICK ${battle.elapsedTicks}`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '15px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.objects.push(statusBg, title, badgeBg, badgeLabel, tickText);
    currY += statusH + 10;

    // CARD 2: ENEMY SQUAD HP & LIVING COUNT
    const enemyH = 88;
    const enemyBg = drawCard(this.scene, this.x, currY, w, enemyH, HudTokens.colors.bgSurface, 0.94);
    const enemiesAlive = battle.enemies.filter((enemy) => enemy.currentHp > 0).length;

    const enemyTitle = this.scene.add.text(this.x + 16, currY + 12, 'ENEMY SQUAD', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textRed,
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const enemyAliveText = this.scene.add.text(this.x + w - 16, currY + 12, `Living: ${enemiesAlive}/${battle.enemies.length}`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textMuted,
    }).setOrigin(1, 0);

    const enemyRatio = battle.enemyMaxHp > 0 ? Math.max(0, battle.enemyHp / battle.enemyMaxHp) : 0;
    const barW = w - 32;
    const barH = 12;
    const barBg = this.scene.add
      .rectangle(this.x + 16 + barW / 2, currY + 38, barW, barH, 0x111827)
      .setStrokeStyle(1, 0x334155);
    const barFill = this.scene.add
      .rectangle(this.x + 16, currY + 38, barW * enemyRatio, barH, 0xdc2626)
      .setOrigin(0, 0.5);

    const hpText = this.scene.add.text(
      this.x + 16,
      currY + 56,
      `HP: ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}`,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '12px',
        color: HudTokens.colors.textPrimary,
        fontStyle: 'bold',
      },
    );

    this.objects.push(enemyBg, enemyTitle, enemyAliveText, barBg, barFill, hpText);
    currY += enemyH + 10;

    // CARD 3: FRONTLINE UNIT
    const frontH = 74;
    const frontBg = drawCard(this.scene, this.x, currY, w, frontH, HudTokens.colors.bgSurface, 0.94);
    const frontTitle = this.scene.add.text(this.x + 16, currY + 12, 'TARGET FRONTLINE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textBlue,
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const frontContent = this.scene.add.text(this.x + 16, currY + 32, frontlineLabel, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '12px',
      color: HudTokens.colors.textPrimary,
      wordWrap: { width: w - 32 },
    });
    this.objects.push(frontBg, frontTitle, frontContent);
    currY += frontH + 10;

    // CARD 4: STORED ENERGY & HEAL BUTTONS
    const activeEntries = energyEntries.filter((e) => e.charges > 0);
    const totalCharges = activeEntries.reduce((sum, entry) => sum + entry.charges, 0);
    const rowHeight = 36;
    const energyCardH = Math.max(120, 52 + Math.max(1, activeEntries.length) * (rowHeight + 4) + 26);
    const energyBg = drawCard(this.scene, this.x, currY, w, energyCardH, HudTokens.colors.bgSurfaceElevated, 0.94);

    const energyHeading = this.scene.add.text(
      this.x + 16,
      currY + 14,
      `STORED ENERGY · ${totalCharges} CHARGE${totalCharges === 1 ? '' : 'S'}`,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '12px',
        color: HudTokens.colors.textGold,
        fontStyle: 'bold',
        letterSpacing: 1,
      },
    );
    this.objects.push(energyBg, energyHeading);

    let rowY = currY + 42;

    if (!activeEntries.length) {
      const empty = this.scene.add.text(this.x + 16, rowY + 6, 'No stored Energy charges to cast.', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '12px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'italic',
      });
      this.objects.push(empty);
    } else {
      activeEntries.forEach((entry) => {
        const rowBg = this.scene.add
          .rectangle(this.x + w / 2, rowY + rowHeight / 2, w - 32, rowHeight, 0x111827, 0.9)
          .setStrokeStyle(1, 0x334155);

        const tokenIcon = createIconImage(this.scene, entry.energyId, this.x + 32, rowY + rowHeight / 2, 24);

        const label = this.scene.add.text(
          this.x + 48,
          rowY + 11,
          `${entry.energyId.replace('energy-', '').toUpperCase()}  ·  ${entry.charges} charge${entry.charges === 1 ? '' : 's'}`,
          {
            fontFamily: HudTokens.fonts.family,
            fontSize: '11px',
            color: '#f8fafc',
            fontStyle: 'bold',
          },
        );

        const healBtnBg = this.scene.add
          .rectangle(this.x + w - 58, rowY + rowHeight / 2, 70, 26, 0x0284c7, 1)
          .setStrokeStyle(1, 0x38bdf8)
          .setInteractive({ useHandCursor: true });

        const healBtnText = this.scene.add
          .text(this.x + w - 58, rowY + rowHeight / 2, 'CAST HEAL', {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        const castAction = () => onCast(entry.energyId);
        healBtnBg.on('pointerdown', castAction);
        healBtnText.on('pointerdown', castAction);

        this.objects.push(rowBg, tokenIcon, label, healBtnBg, healBtnText);
        rowY += rowHeight + 4;
      });
    }

    const hint = this.scene.add.text(
      this.x + 16,
      currY + energyCardH - 22,
      'Cast instantly heals the frontline unit.',
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '10px',
        color: HudTokens.colors.textMuted,
      },
    );
    this.objects.push(hint);

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

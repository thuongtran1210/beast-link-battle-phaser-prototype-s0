import Phaser from 'phaser';
import { HudTokens, drawCard } from '../layout/HudTokens';
import { createIconImage } from '../icons/IconFactory';
import { setupEnergyInventory } from '../BattleSetupPresentation';
import type { EnergyQueueEntry } from '../../energy/EnergyQueue';
import type { RunLinkShardPool } from '../../run/RunLinkShardPool';
import { ACTIVE_SQUAD_LIMIT } from '../ActiveSquadPresentation';

type SetupEnergyEntry = ReturnType<typeof setupEnergyInventory>[number];

export interface BattleSetupRightCTALayout {
  panelX: number;
  storedEnergyY: number;
}

export class BattleSetupRightCTARenderer {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly storedEnergy: () => ReadonlyArray<EnergyQueueEntry> | string,
    private readonly startBattle: () => void,
    private readonly shardPool?: RunLinkShardPool,
  ) {}

  render(
    layout: BattleSetupRightCTALayout,
    squad: { activeCount: number; ctaSummary: string },
  ): void {
    const x = layout.panelX;
    const y = layout.storedEnergyY;
    const w = 258;
    const h = 210;

    // Outer card
    const cardBg = drawCard(this.scene, x, y, w, h, HudTokens.colors.bgSurface, 0.95);
    this.managedObjects.push(cardBg);

    // Stored Energy section
    const rawEnergy = this.storedEnergy();
    const energyEntries = setupEnergyInventory(Array.isArray(rawEnergy) ? rawEnergy : []);
    const totalEnergy = energyEntries.reduce((sum: number, entry: SetupEnergyEntry) => sum + entry.charges, 0);
    const energyTitle = this.addText(
      x + 14,
      y + 14,
      `⚡ STORED ENERGY ×${totalEnergy}`,
      11,
      HudTokens.colors.textGold,
      'bold',
    );
    this.managedObjects.push(energyTitle);

    energyEntries.slice(0, 4).forEach((entry: SetupEnergyEntry, index: number) => {
      const px = x + 24 + Math.floor(index / 2) * 118;
      const py = y + 39 + (index % 2) * 32;
      const icon = createIconImage(this.scene, entry.energyId, px, py, 16);
      const label = this.addText(
        px + 14,
        py - 8,
        `${entry.displayName} ×${entry.charges}`,
        9,
        '#fef3c7',
        'bold',
      );
      const hint = this.addText(px + 14, py + 4, entry.shortDescription, 7, '#94a3b8');
      this.managedObjects.push(icon, label, hint);
    });

    // Global Link Shard count
    const shards = this.shardPool?.count ?? 0;
    const shardBadge = this.addText(
      x + w - 88,
      y + 14,
      `◆ LINK ×${shards}`,
      10,
      '#38bdf8',
      'bold',
      '#0c4a6e',
      { x: 5, y: 2 },
    );
    this.managedObjects.push(shardBadge);

    this.addText(x + 14, y + 94, 'Cast during Battle', 9, HudTokens.colors.textMuted);

    // START BATTLE CTA button
    const activeCount = squad.activeCount;
    const allPlaced = activeCount >= 1 && activeCount <= ACTIVE_SQUAD_LIMIT;
    const btnW = w - 28;
    const btnH = 54;
    const btnX = x + w / 2;
    const btnY = y + h - 42;

    const btnBg = this.scene.add
      .rectangle(btnX, btnY, btnW, btnH, allPlaced ? HudTokens.colors.goldDark : 0x1e293b, 1)
      .setStrokeStyle(1.5, allPlaced ? HudTokens.colors.gold : 0x334155);

    const btnLabel = this.addText(
      btnX,
      allPlaced ? btnY - 7 : btnY - 8,
      allPlaced ? 'START BATTLE ⚔' : 'START BATTLE',
      14,
      allPlaced ? '#ffffff' : '#64748b',
      'bold',
    ).setOrigin(0.5);

    const btnSub = this.addText(
      btnX,
      allPlaced ? btnY + 11 : btnY + 10,
      allPlaced ? squad.ctaSummary : 'Deploy at least 1 Beast',
      9,
      allPlaced ? '#fef08a' : '#f59e0b',
      'bold',
    ).setOrigin(0.5);

    this.managedObjects.push(btnBg, btnLabel, btnSub);

    if (allPlaced) {
      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: btnBg,
          scaleX: 1.025,
          scaleY: 1.035,
          duration: 650,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }
      btnBg.setInteractive({ useHandCursor: true });
      btnLabel.setInteractive({ useHandCursor: true });
      btnSub.setInteractive({ useHandCursor: true });

      let started = false;
      const onStart = () => {
        if (started) return;
        started = true;
        this.startBattle();
      };
      btnBg.on('pointerup', onStart);
      btnLabel.on('pointerup', onStart);
      btnSub.on('pointerup', onStart);
    }
  }

  private addText(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    style = '',
    backgroundColor?: string,
    padding?: { x: number; y: number },
  ): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: HudTokens.fonts.family,
      fontSize: `${size}px`,
      color,
      fontStyle: style,
      backgroundColor,
      padding,
      lineSpacing: 3,
    });
    this.managedObjects.push(text);
    return text;
  }
}

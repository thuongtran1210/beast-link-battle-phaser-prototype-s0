import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../battle/AutonomousBattleModel';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';
import type { TacticalEnergyControlPresentation } from './TacticalEnergyPresentation';
import { STRATEGIC_ENERGY } from '../energy/TacticalEnergyCatalog';
import { isCompactLandscape } from './layout/MobilePresentation';

export class ShowcaseBattleHUDView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private visible = false;
  private heldEnergy?: string;
  private heldAt = 0;
  private details: Phaser.GameObjects.Text[] = [];
  private readonly intendedVisibility = new Map<Phaser.GameObjects.GameObject, boolean>();
  private lastCast?: { text: string; until: number };

  showCastResult(text: string): void {
    this.lastCast = { text, until: this.scene.time.now + 2400 };
    this.heldEnergy = undefined;
  }

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

    const mobile = isCompactLandscape();
    const w = mobile ? Math.min(560, this.scene.scale.width - 48) : this.panelWidth;
    const panelX = mobile ? (this.scene.scale.width - w) / 2 : this.x;
    let currY = mobile ? 54 : this.y;
    const isRunning = battle.status === 'Running';
    const statusText = paused ? 'PAUSED' : isRunning ? 'LIVE' : battle.status.toUpperCase();

    const enemiesAlive = battle.enemies.filter(enemy => enemy.currentHp > 0).length;
    const enemyRatio = battle.enemyMaxHp > 0 ? Math.max(0, battle.enemyHp / battle.enemyMaxHp) : 0;
    const card = drawCard(this.scene, panelX, currY, w, mobile ? 48 : 116, HudTokens.colors.bgSurface, .95);
    const heading = this.scene.add.text(panelX + 16, currY + 12, `ENEMIES ${enemiesAlive}/${battle.enemies.length}`, {
      fontFamily: HudTokens.fonts.family, fontSize: '18px', fontStyle: 'bold', color: HudTokens.colors.textPrimary,
    });
    const status = this.scene.add.text(panelX + w - 16, currY + 15, statusText, {
      fontFamily: HudTokens.fonts.family, fontSize: '14px', fontStyle: 'bold', color: HudTokens.colors.textGreen,
    }).setOrigin(1, 0);
    const barW = w - 32;
    const bar = this.scene.add.rectangle(panelX + 16, currY + (mobile ? 36 : 44), barW, mobile ? 5 : 12, HudTokens.colors.bgSurfaceDark).setOrigin(0, .5);
    const fill = this.scene.add.rectangle(panelX + 16, currY + (mobile ? 36 : 44), barW * enemyRatio, mobile ? 5 : 12, HudTokens.colors.red).setOrigin(0, .5);
    const hp = this.scene.add.text(panelX + 16, currY + 53, `HP ${formatNumber(battle.enemyHp)} / ${battle.enemyMaxHp}`, {
      fontFamily: HudTokens.fonts.family, fontSize: '18px', color: HudTokens.colors.textSecondary,
    });
    this.objects.push(card, heading, status, bar, fill, hp);
    const hint = this.scene.add.text(panelX + 16, currY + 132, 'Tap to cast · hold for details', {
      fontFamily: HudTokens.fonts.family, fontSize: '15px', color: HudTokens.colors.textMuted,
      wordWrap: { width: w - 32 },
    });
    hint.setVisible(!mobile);
    hp.setVisible(!mobile);
    this.objects.push(hint);
    if (!this.heldEnergy && this.lastCast && this.lastCast.until > this.scene.time.now) {
      const recap = this.scene.add.text(mobile ? this.scene.scale.width / 2 : panelX + 16, mobile ? this.scene.scale.height - 180 : currY + 174, this.lastCast.text, {
        fontFamily: HudTokens.fonts.family, fontSize: '20px', fontStyle: 'bold',
        color: HudTokens.colors.textPrimary, backgroundColor: '#24352b', padding: { x: 14, y: 8 },
        wordWrap: { width: w - 56 },
      });
      if (mobile) recap.setOrigin(.5, 1);
      this.objects.push(recap);
    }
    // Stable four-slot cast dock centered below the battlefield.
    const centerX = mobile ? this.scene.scale.width / 2 : this.x / 2;
    const cy = this.scene.scale.height - 102;
    const spacing = 118;
    const radius = 50;
    const dock = this.scene.add.graphics();
    dock.fillStyle(HudTokens.colors.bgSurface, .92);
    dock.fillRoundedRect(centerX - 250, cy - 62, 500, 150, 28);
    dock.lineStyle(1, HudTokens.colors.strokeDefault, .8);
    dock.strokeRoundedRect(centerX - 250, cy - 62, 500, 150, 28);
    this.objects.push(dock);

    STRATEGIC_ENERGY.forEach((definition, index) => {
      const entry = energyEntries.find(item => item.energyId === definition.energyId);
      const charges = entry?.charges ?? 0;
      const castState = castStateFor(definition.energyId);
      const enabled = Boolean(castState?.enabled && charges > 0);
      const suggested = enabled && Boolean(castState?.suggested);
      const cx = centerX + (index - 1.5) * spacing;
      const border = suggested ? HudTokens.colors.strokeGold : HudTokens.colors.strokeDefault;
      const halo = this.scene.add.circle(cx, cy, radius + 5, border, suggested ? .1 : 0);
      const button = this.scene.add.circle(cx, cy, radius, HudTokens.colors.bgSurfaceElevated, enabled ? .98 : .5)
        .setStrokeStyle(suggested ? 3 : 1, border, enabled ? 1 : .5);
      const icon = createIconImage(this.scene, definition.energyId, cx, cy, 72).setAlpha(enabled ? 1 : .4);
      const badge = this.scene.add.circle(cx + 32, cy - 31, 17, HudTokens.colors.bgSurfaceDark)
        .setStrokeStyle(2, border);
      const count = this.scene.add.text(cx + 32, cy - 31, `${charges}`, {
        fontFamily: HudTokens.fonts.family, fontSize: '19px', fontStyle: 'bold',
        color: enabled ? '#ffffff' : HudTokens.colors.textMuted,
      }).setOrigin(.5);
      const name = this.scene.add.text(cx, cy + 55, definition.displayName, {
        fontFamily: HudTokens.fonts.family, fontSize: '16px', fontStyle: 'bold',
        color: enabled ? HudTokens.colors.textPrimary : HudTokens.colors.textMuted,
      }).setOrigin(.5, 0);
      const state = this.scene.add.text(cx, cy + 75, suggested ? 'SUGGESTED' : enabled ? 'READY' : 'DISABLED', {
        fontFamily: HudTokens.fonts.family, fontSize: '11px', fontStyle: 'bold',
        color: suggested ? HudTokens.colors.textGold : enabled ? HudTokens.colors.textBlue : HudTokens.colors.textMuted,
      }).setOrigin(.5, 0);
      button.setInteractive({ useHandCursor: enabled });
      const detail = this.scene.add.text(centerX, cy - 98,
        `${definition.displayName} · ${definition.shortDescription}${castState?.reasonLabel ? ' · ' + castState.reasonLabel : ''}`, {
          fontFamily: HudTokens.fonts.family, fontSize: '18px', color: '#ffffff',
          backgroundColor: '#24352b', padding: { x: 16, y: 8 }, wordWrap: { width: 600 },
        }).setOrigin(.5, 1).setVisible(this.heldEnergy === definition.energyId);
      this.details.push(detail);
      button.on('pointerdown', () => {
        this.details.forEach(item => item.setVisible(false));
        this.heldEnergy = definition.energyId;
        this.heldAt = this.scene.time.now;
        detail.setVisible(true);
        button.setScale(.94);
      });
      button.on('pointerout', () => {
        this.heldEnergy = undefined;
        detail.setVisible(false);
        button.setScale(1);
      });
      button.on('pointerup', () => {
        const tap = this.heldEnergy === definition.energyId && this.scene.time.now - this.heldAt < 350;
        this.heldEnergy = undefined;
        detail.setVisible(false);
        button.setScale(1);
        if (enabled && tap) onCast(definition.energyId);
      });
      this.objects.push(detail);
      this.objects.push(halo, button, icon, badge, count, name, state);
    });
    this.objects.forEach(object => {
      const view = object as unknown as Phaser.GameObjects.Components.Visible & Phaser.GameObjects.Components.Depth;
      this.intendedVisibility.set(object, view.visible);
      view.setDepth(500);
    });
    this.setVisible(this.visible);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) this.heldEnergy = undefined;
    this.objects.forEach((object) => (object as unknown as Phaser.GameObjects.Components.Visible).setVisible(visible && (this.intendedVisibility.get(object) ?? true)));
  }

  destroy(): void {
    this.destroyObjects();
  }

  private destroyObjects(): void {
    this.details = [];
    this.intendedVisibility.clear();
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

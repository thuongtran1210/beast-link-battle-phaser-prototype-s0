import Phaser from 'phaser';
import { HudTokens, drawCard } from '../layout/HudTokens';
import { createIconImage } from '../icons/IconFactory';
import { setupEnergyInventory } from '../BattleSetupPresentation';
import type { EnergyQueueEntry } from '../../energy/EnergyQueue';
import type { RunLinkShardPool } from '../../run/RunLinkShardPool';
import { ACTIVE_SQUAD_LIMIT } from '../ActiveSquadPresentation';
import { isCompactLandscape } from '../layout/MobilePresentation';

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
    private readonly getLimit: () => number = () => ACTIVE_SQUAD_LIMIT,
    private readonly buySlot?: () => void,
  ) {}

  render(
    layout: BattleSetupRightCTALayout,
    squad: { activeCount: number; ctaSummary: string },
  ): void {
    if (isCompactLandscape()) { this.renderMobile(layout.panelX, squad); return; }
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

    const expanded = this.getLimit() >= 5;
    const canBuy = !expanded && Boolean(this.buySlot) && (this.shardPool?.count ?? 0) >= 2;
    const upgrade = this.scene.add.rectangle(x + w / 2, y + 116, w - 28, 38, canBuy ? 0x435341 : 0x29322e)
      .setStrokeStyle(1, 0x66716a);
    const upgradeText = this.addText(x + w / 2, y + 116,
      expanded ? 'SQUAD 5 · UNLOCKED' : 'SQUAD 4 → 5 · ◆2', 13, canBuy ? '#e8d3a5' : '#a0aea6', 'bold').setOrigin(.5);
    this.managedObjects.push(upgrade, upgradeText);
    if (canBuy) upgrade.setInteractive({ useHandCursor: true }).on('pointerup', () => this.buySlot?.());

    // START BATTLE CTA button
    const activeCount = squad.activeCount;
    const allPlaced = activeCount >= 1 && activeCount <= this.getLimit();
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

  private renderMobile(x: number, squad: { activeCount: number; ctaSummary: string }): void {
    const y = 500, w = 258;
    const expanded = this.getLimit() >= 5;
    const buy = !expanded && Boolean(this.buySlot) && (this.shardPool?.count ?? 0) >= 2;
    const ready = squad.activeCount >= 1 && squad.activeCount <= this.getLimit();
    const button=(top:number,fill:number,title:string,hint:string,enabled:boolean,action?:()=>void)=>{
      const g=this.scene.add.graphics();
      g.fillStyle(0x62472f,.97);g.fillRoundedRect(x,top,w,100,16);
      g.fillStyle(fill);g.fillRoundedRect(x+4,top+4,w-8,92,12);
      this.managedObjects.push(g);
      this.addText(x+w/2,top+34,title,22,enabled?'#342b1e':'#c2cbb7','bold').setOrigin(.5);
      this.addText(x+w/2,top+68,hint,16,enabled?'#59472d':'#98a78d').setOrigin(.5);
      const hit=this.scene.add.rectangle(x+w/2,top+50,w,100,0xffffff,0);
      this.managedObjects.push(hit);
      if(enabled&&action) hit.setInteractive({useHandCursor:true}).on('pointerup',action);
    };
    button(y,buy?0xb8c79b:0x314536,expanded?'Đội hình 5 thú':'Mở vị trí thứ 5',expanded?'Đã mở trong lượt này':`◆ ${this.shardPool?.count??0}/2 · Mảnh Liên Kết`,buy,()=>this.buySlot?.());
    let started=false;
    button(y+105,ready?0xedc478:0x314536,'Xuất trận',ready?`${squad.activeCount}/${this.getLimit()} thú đã sẵn sàng`:'Đặt ít nhất 1 thú',ready,()=>{if(!started){started=true;this.startBattle();}});
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

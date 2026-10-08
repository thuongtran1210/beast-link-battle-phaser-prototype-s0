import Phaser from 'phaser';
import { HudTokens } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';
import { beastDisplayName } from './icons/UnitIconRegistry';
import type { WaveRunController } from '../run/WaveRunController';
import type { EnergyQueue } from '../energy/EnergyQueue';
import type { RunLinkShardPool } from '../run/RunLinkShardPool';
import type { RunRoster } from '../run/RunRoster';
import { P1V13A1_LEVELS } from '../battle/ValidationLevels';

export class WaveResultView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onProceed: () => void,
  ) {}

  render(
    waveRun: WaveRunController,
    energyQueue: EnergyQueue,
    shardPool: RunLinkShardPool,
    runRoster: RunRoster,
  ): void {
    this.destroy();

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const current = waveRun.currentWave;
    const nextDisplay = waveRun.currentWaveIndex + 1 < waveRun.totalWaves
      ? waveRun.currentWaveIndex + 2
      : undefined;
    const nextIndex = nextDisplay ? waveRun.currentWaveIndex + 1 : undefined;
    const nextName = nextIndex !== undefined ? P1V13A1_LEVELS[nextIndex]?.name ?? '' : '';
    const carriedCharges = energyQueue.getTotalCharges();

    const roster = runRoster.units;
    const fresh = roster.filter((unit) => unit.status === 'ready' && unit.currentHp >= unit.maxHp);
    const injured = roster.filter((unit) => unit.status === 'ready' && unit.currentHp > 0 && unit.currentHp < unit.maxHp);
    const ko = roster.filter((unit) => unit.status === 'ko' || unit.currentHp <= 0);

    const panelW = 760;
    const panelH = 390;
    const panelX = width / 2;
    const panelY = height / 2 + 12;
    const panel = this.scene.add
      .rectangle(panelX, panelY, panelW, panelH, HudTokens.colors.bgSurfaceDark, 0.98)
      .setStrokeStyle(2, HudTokens.colors.green);

    const title = this.scene.add.text(
      panelX,
      panelY - 160,
      `WAVE ${current.index + 1} / ${waveRun.totalWaves} CLEARED`,
      { fontFamily: HudTokens.fonts.family, fontSize: '26px', color: HudTokens.colors.textPrimary, fontStyle: 'bold' },
    ).setOrigin(0.5);

    const threat = this.scene.add.text(
      panelX,
      panelY - 128,
      `SURVIVED · ${current.threatLabel}`,
      { fontFamily: HudTokens.fonts.family, fontSize: '12px', color: HudTokens.colors.textGreen, fontStyle: 'bold' },
    ).setOrigin(0.5);

    const energyCarried = this.scene.add.text(
      panelX,
      panelY - 100,
      `⚡ ENERGY CARRIED ×${carriedCharges}     ◆ LINK ×${shardPool.count}`,
      { fontFamily: HudTokens.fonts.family, fontSize: '13px', color: HudTokens.colors.textGold, fontStyle: 'bold' },
    ).setOrigin(0.5);

    const groups = [
      { title: 'FRESH', units: fresh, color: HudTokens.colors.green, text: HudTokens.colors.textGreen },
      { title: 'INJURED', units: injured, color: HudTokens.colors.gold, text: HudTokens.colors.textGold },
      { title: 'KO', units: ko, color: HudTokens.colors.red, text: HudTokens.colors.textRed },
    ];

    const cardW = 216;
    const cardH = 150;
    const gap = 18;
    const totalW = cardW * 3 + gap * 2;
    const left = panelX - totalW / 2;

    groups.forEach((group, groupIndex) => {
      const x = left + groupIndex * (cardW + gap);
      const y = panelY - 66;
      const card = this.scene.add
        .rectangle(x + cardW / 2, y + cardH / 2, cardW, cardH, HudTokens.colors.bgSurface, 0.96)
        .setStrokeStyle(1.5, group.color, 0.8);
      const heading = this.scene.add.text(
        x + 14,
        y + 12,
        `${group.title}  ${group.units.length}`,
        { fontFamily: HudTokens.fonts.family, fontSize: '12px', color: group.text, fontStyle: 'bold' },
      );

      const visible = group.units.slice(0, 3);
      visible.forEach((unit, index) => {
        const rowY = y + 44 + index * 31;
        const icon = createIconImage(this.scene, unit.beastId, x + 29, rowY + 9, 26);
        const stars = '★'.repeat(unit.star);
        const label = this.scene.add.text(
          x + 49,
          rowY,
          `${beastDisplayName(unit.beastId)}  ${stars}\n${unit.status === 'ko' ? 'KO' : `${Math.round(unit.currentHp)} / ${Math.round(unit.maxHp)} HP`}`,
          {
            fontFamily: HudTokens.fonts.family,
            fontSize: '9px',
            color: group.title === 'KO' ? HudTokens.colors.textMuted : HudTokens.colors.textSecondary,
            fontStyle: 'bold',
            lineSpacing: -2,
          },
        );
        this.objects.push(icon, label);
      });

      if (group.units.length > visible.length) {
        const more = this.scene.add.text(
          x + cardW - 14,
          y + cardH - 18,
          `+${group.units.length - visible.length} more`,
          { fontFamily: HudTokens.fonts.family, fontSize: '9px', color: HudTokens.colors.textMuted, fontStyle: 'bold' },
        ).setOrigin(1, 0);
        this.objects.push(more);
      }

      this.objects.push(card, heading);
    });

    const nextText = this.scene.add.text(
      panelX,
      panelY + 112,
      nextDisplay ? `NEXT THREAT · WAVE ${nextDisplay} — ${nextName}` : 'RUN COMPLETE',
      { fontFamily: HudTokens.fonts.family, fontSize: '13px', color: HudTokens.colors.textSecondary, fontStyle: 'bold' },
    ).setOrigin(0.5);

    const button = this.scene.add
      .rectangle(panelX, panelY + 155, 230, 46, HudTokens.colors.goldDark, 1)
      .setStrokeStyle(1.5, HudTokens.colors.gold)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add.text(
      panelX,
      panelY + 155,
      nextDisplay ? 'PREPARE NEXT WAVE' : 'CONTINUE',
      { fontFamily: HudTokens.fonts.family, fontSize: '13px', color: '#ffffff', fontStyle: 'bold' },
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const proceed = () => this.onProceed();
    button.on('pointerup', proceed);
    label.on('pointerup', proceed);
    this.objects.push(panel, title, threat, energyCarried, nextText, button, label);
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

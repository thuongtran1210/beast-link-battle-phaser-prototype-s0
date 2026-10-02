import Phaser from 'phaser';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

export interface StatusQueueItem {
  id: string;
  name: string;
  count: number;
  color?: number;
}

export interface PhaseStatusData {
  phaseTitle: string;
  phaseSubtitle: string;
  timerSeconds: number;
  timerLabel: string;
  timerSubtext: string;
  statusBadge: { text: string; active: boolean };
  matchCount: number;
  queueTitle: string;
  queueItems: StatusQueueItem[];
  recentAction: string;
}

export class PhaseStatusPanel {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private visible = true;
  private stat2Val?: Phaser.GameObjects.Text;
  private timerValue?: Phaser.GameObjects.Text;
  private readonly queueRowMap = new Map<string, { bg: Phaser.GameObjects.Rectangle; count: Phaser.GameObjects.Text; x: number; y: number }>();
  private queueCenter: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x: number,
    private readonly y: number,
    private readonly panelWidth = 340,
  ) {}

  render(data: PhaseStatusData): void {
    this.destroy();

    const w = this.panelWidth;
    let currY = this.y;

    // CARD 1: Phase Header & Subtitle
    const headerH = 68;
    const headerBg = drawCard(this.scene, this.x, currY, w, headerH, HudTokens.colors.bgSurface, 0.94, HudTokens.colors.strokeDefault);
    const titleText = this.scene.add.text(this.x + 16, currY + 12, data.phaseTitle, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '18px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    });
    const subText = this.scene.add.text(this.x + 16, currY + 38, data.phaseSubtitle, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textMuted,
      wordWrap: { width: w - 32 },
    });
    this.objects.push(headerBg, titleText, subText);
    currY += headerH + 10;

    // CARD 2: DOMINANT TIMER CARD
    const timerH = 104;
    const isUrgent = data.timerSeconds < 3.0;
    const timerBorder = isUrgent ? HudTokens.colors.strokeRed : HudTokens.colors.strokeGold;
    const timerBg = drawCard(this.scene, this.x, currY, w, timerH, HudTokens.colors.bgSurfaceElevated, 0.96, timerBorder, 1.5);

    const timerLabel = this.scene.add.text(this.x + 16, currY + 12, data.timerLabel.toUpperCase(), {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: isUrgent ? HudTokens.colors.textRed : HudTokens.colors.textGold,
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const formattedTime = `${Math.max(0, data.timerSeconds).toFixed(1)}s`;
    const timerValue = this.scene.add.text(this.x + 16, currY + 30, formattedTime, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '44px',
      color: isUrgent ? '#f87171' : HudTokens.colors.textGold,
      fontStyle: 'bold',
    });

    const timerSub = this.scene.add.text(this.x + 16, currY + 82, data.timerSubtext, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textMuted,
    });
    this.timerValue = timerValue;
    this.objects.push(timerBg, timerLabel, timerValue, timerSub);
    currY += timerH + 10;

    // CARD 3: COMBO & STATS CARD
    const statsH = 76;
    const statsBg = drawCard(this.scene, this.x, currY, w, statsH, HudTokens.colors.bgSurface, 0.94);

    // Left Column: Status Badge
    const stat1Title = this.scene.add.text(this.x + 16, currY + 14, 'STATE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    });
    const badgeColor = data.statusBadge.active ? 0x15803d : 0x475569;
    const badgeBg = this.scene.add
      .rectangle(this.x + 58, currY + 44, 82, 22, badgeColor, 0.9)
      .setStrokeStyle(1, data.statusBadge.active ? 0x22c55e : 0x64748b);
    const badgeLabel = this.scene.add.text(this.x + 58, currY + 44, data.statusBadge.text, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Right Column: Matches count
    const stat2Title = this.scene.add.text(this.x + 170, currY + 14, 'TOTAL MATCHES', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    });
    const stat2Val = this.scene.add.text(this.x + 170, currY + 34, `${data.matchCount}`, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '22px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    });
    this.stat2Val = stat2Val;

    this.objects.push(statsBg, stat1Title, badgeBg, badgeLabel, stat2Title, stat2Val);
    currY += statsH + 10;

    // CARD 4: QUEUE / STORED CHARGES CARD
    const maxItems = 6;
    const itemRows = Math.min(maxItems, data.queueItems.length);
    const queueCardH = Math.max(105, 52 + itemRows * 30);
    const queueBg = drawCard(this.scene, this.x, currY, w, queueCardH, HudTokens.colors.bgSurface, 0.94);
    this.queueCenter = { x: this.x + w / 2, y: currY + 40 };

    const queueHeading = this.scene.add.text(this.x + 16, currY + 14, data.queueTitle.toUpperCase(), {
      fontFamily: HudTokens.fonts.family,
      fontSize: '12px',
      color: HudTokens.colors.textSecondary,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    this.objects.push(queueBg, queueHeading);

    if (data.queueItems.length === 0) {
      const emptyText = this.scene.add.text(this.x + 16, currY + 46, 'Nothing collected yet.', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '12px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'italic',
      });
      this.objects.push(emptyText);
    } else {
      let itemY = currY + 40;
      data.queueItems.slice(0, maxItems).forEach((item) => {
        const rowBg = this.scene.add
          .rectangle(this.x + w / 2, itemY + 12, w - 32, 26, 0x111827, 0.7)
          .setStrokeStyle(1, 0x334155, 0.7);

        const icon = createIconImage(this.scene, item.id, this.x + 30, itemY + 12, 22);

        const itemName = this.scene.add.text(this.x + 48, itemY + 5, item.name, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });

        const itemCount = this.scene.add.text(this.x + w - 24, itemY + 5, `×${item.count}`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: HudTokens.colors.textGold,
          fontStyle: 'bold',
        }).setOrigin(1, 0);

        this.queueRowMap.set(item.id, {
          bg: rowBg,
          count: itemCount,
          x: this.x + 30,
          y: itemY + 12,
        });

        this.objects.push(rowBg, icon, itemName, itemCount);
        itemY += 30;
      });
    }
    currY += queueCardH + 10;

    // CARD 5: RECENT ACTION & FEEDBACK CARD
    const actionH = 68;
    const actionBg = drawCard(this.scene, this.x, currY, w, actionH, HudTokens.colors.bgSurfaceElevated, 0.94);
    const actionTitle = this.scene.add.text(this.x + 16, currY + 12, 'RECENT ACTION', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    });
    const actionText = this.scene.add.text(this.x + 16, currY + 30, data.recentAction || 'Awaiting first match...', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '12px',
      color: HudTokens.colors.textPrimary,
      wordWrap: { width: w - 32 },
      lineSpacing: 3,
    });
    this.objects.push(actionBg, actionTitle, actionText);

    this.setVisible(this.visible);
  }

  pulseCombo(): void {
    if (!this.stat2Val || !this.scene.tweens || !this.stat2Val.active) return;
    this.scene.tweens.killTweensOf(this.stat2Val);
    this.stat2Val.setScale(1.4);
    this.scene.tweens.add({
      targets: this.stat2Val,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.Out',
    });
  }

  pulseTimer(isBonus = true): void {
    if (!this.timerValue || !this.scene.tweens || !this.timerValue.active) return;
    this.scene.tweens.killTweensOf(this.timerValue);
    this.timerValue.setScale(isBonus ? 1.25 : 1.15);
    this.scene.tweens.add({
      targets: this.timerValue,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: 'Back.Out',
    });
  }

  pulseQueueRow(id: string): void {
    const row = this.queueRowMap.get(id);
    if (!row || !this.scene.tweens || !row.count.active) return;
    this.scene.tweens.killTweensOf(row.count);
    this.scene.tweens.killTweensOf(row.bg);
    row.count.setScale(1.45);
    if (row.bg.active) {
      row.bg.setStrokeStyle(1.5, 0xfbbf24);
    }
    this.scene.tweens.add({
      targets: row.count,
      scaleX: 1,
      scaleY: 1,
      duration: 260,
      ease: 'Back.Out',
      onComplete: () => {
        if (row.bg.active && row.bg.scene) {
          row.bg.setStrokeStyle(1, 0x334155, 0.7);
        }
      },
    });
  }

  getQueueItemTarget(id: string): { x: number; y: number } {
    const row = this.queueRowMap.get(id);
    if (row) return { x: row.x, y: row.y };
    return this.queueCenter.x !== 0
      ? { x: this.queueCenter.x, y: this.queueCenter.y }
      : { x: this.x + this.panelWidth / 2, y: this.y + 260 };
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.objects.forEach((obj) => (obj as unknown as Phaser.GameObjects.Components.Visible).setVisible(visible));
  }

  destroy(): void {
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.objects);
    }
    this.queueRowMap.clear();
    this.stat2Val = undefined;
    this.timerValue = undefined;
    this.objects.splice(0).forEach((obj) => obj.destroy());
  }
}

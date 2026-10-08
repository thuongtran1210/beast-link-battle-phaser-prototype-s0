import Phaser from 'phaser';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';
import { comboRatio, comboVisualState, queueDisplayEntries, recruitedTotal } from './BeastRushHudPresentation';
import { getIconDefinition } from './icons/UnitIconRegistry';
import { isCompactLandscape } from './layout/MobilePresentation';
import { RoundedPanel } from './RoundedPanel';
import { energyRushBankSummary } from './EnergyRushPresentation';

export interface StatusQueueItem {
  id: string;
  name: string;
  count: number;
  color?: number;
  description?: string;
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
  beastRushHud?: boolean;
  comboCurrent?: number;
  comboBest?: number;
  isReady?: boolean;
  energyCarryIn?: number;
}

export class PhaseStatusPanel {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private visible = true;
  private stat2Val?: Phaser.GameObjects.Text;
  private timerValue?: Phaser.GameObjects.Text;
  private comboMeter?: Phaser.GameObjects.Rectangle;
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
    if (data.energyCarryIn !== undefined) {
      this.renderEnergyRushHud(data);
      this.setVisible(this.visible);
      return;
    }
    if (isCompactLandscape()) {
      this.renderCompactHud(data);
      this.setVisible(this.visible);
      return;
    }
    if (data.beastRushHud) {
      this.renderBeastRushHud(data);
      this.setVisible(this.visible);
      return;
    }

    const w = this.panelWidth;
    let currY = this.y;

    // CARD 1: Phase Header & Subtitle
    const headerH = 68;
    const phaseAccent = data.phaseTitle.toUpperCase().includes('ENERGY')
      ? HudTokens.colors.strokeBlue
      : HudTokens.colors.strokeViolet;
    const headerBg = drawCard(this.scene, this.x, currY, w, headerH, HudTokens.colors.bgPhase, 0.98, phaseAccent, 1.5);
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
    const isUrgent = !data.isReady && data.timerSeconds < 3.0;
    const timerBorder = isUrgent
      ? HudTokens.colors.strokeRed
      : data.isReady
      ? phaseAccent
      : HudTokens.colors.strokeGold;
    const timerBg = drawCard(this.scene, this.x, currY, w, timerH, HudTokens.colors.bgPhaseSoft, 0.98, timerBorder, 2);

    const timerLabel = this.scene.add.text(this.x + 16, currY + 12, data.timerLabel.toUpperCase(), {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: isUrgent
        ? HudTokens.colors.textRed
        : data.phaseTitle.toUpperCase().includes('ENERGY') || data.phaseTitle.toUpperCase().includes('TACTICAL')
        ? HudTokens.colors.textBlue
        : HudTokens.colors.textGold,
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const formattedTime = `${Math.max(0, data.timerSeconds).toFixed(1)}s`;
    const timerValue = this.scene.add.text(this.x + 16, currY + 28, formattedTime, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '42px',
      color: isUrgent
        ? HudTokens.colors.textRed
        : data.phaseTitle.toUpperCase().includes('ENERGY') || data.phaseTitle.toUpperCase().includes('TACTICAL')
        ? HudTokens.colors.textBlue
        : HudTokens.colors.textGold,
      fontStyle: 'bold',
    });

    const progressW = w - 32;
    const progressX = this.x + 16;
    const progressY = currY + 72;
    const progressBg = this.scene.add
      .rectangle(progressX, progressY, progressW, 9, HudTokens.colors.bgSurfaceDark, 1)
      .setOrigin(0, .5)
      .setStrokeStyle(1, HudTokens.colors.strokeDefault, .8);
    const progressFill = this.scene.add
      .rectangle(
        progressX + 1,
        progressY,
        data.isReady ? 0 : Math.max(0, (progressW - 2) * Math.min(1, data.timerSeconds / 12)),
        6,
        isUrgent ? HudTokens.colors.red : phaseAccent,
        .96,
      )
      .setOrigin(0, .5);
    const timerSub = this.scene.add.text(this.x + 16, currY + 84, data.timerSubtext, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
    });
    this.timerValue = timerValue;
    this.objects.push(timerBg, timerLabel, timerValue, progressBg, progressFill, timerSub);
    currY += timerH + 10;

    // CARD 3: COMBO & STATS CARD
    const statsH = 76;
    const statsBg = drawCard(this.scene, this.x, currY, w, statsH, HudTokens.colors.bgPhase, 0.97, HudTokens.colors.strokeDefault, 1.2);

    // Left Column: Status Badge
    const stat1Title = this.scene.add.text(this.x + 16, currY + 14, 'STATE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
    });
    const badgeColor = data.isReady ? 0x12577d : data.statusBadge.active ? 0x176347 : 0x263755;
    const badgeBg = this.scene.add
      .rectangle(this.x + 58, currY + 44, 82, 22, badgeColor, 0.9)
      .setStrokeStyle(1.5, data.isReady ? HudTokens.colors.strokeBlue : data.statusBadge.active ? HudTokens.colors.strokeGreen : HudTokens.colors.strokeDefault);
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
    const visibleItems = data.queueItems.slice(0, maxItems);
    const queueRowsH = visibleItems.reduce((height, item) => height + (item.description ? 42 : 30), 0);
    const queueCardH = Math.max(105, 52 + queueRowsH);
    const queueBg = drawCard(this.scene, this.x, currY, w, queueCardH, HudTokens.colors.bgPhase, 0.98, phaseAccent, 1.25);
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
      visibleItems.forEach((item) => {
        const rowH = item.description ? 42 : 30;
        const itemDef = getIconDefinition(item.id);
        const rowBg = this.scene.add
          .rectangle(this.x + w / 2, itemY + rowH / 2, w - 32, rowH - 4, itemDef.bgFill, 0.28)
          .setStrokeStyle(1.25, itemDef.borderColor, 0.72);

        const icon = createIconImage(this.scene, item.id, this.x + 30, itemY + rowH / 2, 24);

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
          y: itemY + rowH / 2,
        });

        this.objects.push(rowBg, icon, itemName, itemCount);
        if (item.description) {
          const itemDescription = this.scene.add.text(this.x + 48, itemY + 21, item.description, {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: HudTokens.colors.textMuted,
          });
          this.objects.push(itemDescription);
        }
        itemY += rowH;
      });
    }
    currY += queueCardH + 10;

    // CARD 5: RECENT ACTION & FEEDBACK CARD
    const actionH = 68;
    const actionBg = drawCard(this.scene, this.x, currY, w, actionH, HudTokens.colors.bgPhaseGlow, 0.88, HudTokens.colors.strokeViolet, 1.15);
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

  private renderBeastRushHud(data: PhaseStatusData): void {
    const w = this.panelWidth;
    let currY = this.y;
    const add = (...objects: Phaser.GameObjects.GameObject[]) => this.objects.push(...objects);

    // The board already owns the large BEAST RUSH title. Keep the rail contextual.
    const headerH = 58;
    const header = drawCard(
      this.scene,
      this.x,
      currY,
      w,
      headerH,
      HudTokens.colors.bgPhase,
      .98,
      HudTokens.colors.strokeViolet,
    );
    const eyebrow = this.scene.add.text(this.x + 16, currY + 11, 'RECRUIT PHASE', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '10px',
      color: HudTokens.colors.textMuted,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    const sub = this.scene.add.text(this.x + 16, currY + 29, 'MATCH PAIRS  →  BUILD YOUR SQUAD', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '12px',
      color: HudTokens.colors.textGold,
      fontStyle: 'bold',
    });
    add(header, eyebrow, sub);
    currY += headerH + 10;

    // Dominant timer card. Use player language, not implementation labels.
    const state = comboVisualState(data.timerSeconds, true);
    const urgent = state === 'low';
    const timerH = 126;
    const timerBg = drawCard(
      this.scene,
      this.x,
      currY,
      w,
      timerH,
      HudTokens.colors.bgPhaseSoft,
      .98,
      urgent ? HudTokens.colors.strokeRed : HudTokens.colors.strokeGold,
      1.5,
    );
    const timerLabel = this.scene.add.text(this.x + w / 2, currY + 14, data.isReady ? 'READY' : 'TIME LEFT', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: data.isReady ? HudTokens.colors.textBlue : urgent ? HudTokens.colors.textRed : HudTokens.colors.textGold,
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(.5, 0);
    const time = this.scene.add.text(
      this.x + w / 2,
      currY + 31,
      data.isReady ? 'MATCH TO START' : `${Math.max(0, data.timerSeconds).toFixed(1)}s`,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: data.isReady ? '25px' : '40px',
        color: data.isReady ? HudTokens.colors.textPrimary : urgent ? HudTokens.colors.textRed : HudTokens.colors.textGold,
        fontStyle: 'bold',
      },
    ).setOrigin(.5, 0);

    const meterX = this.x + 22;
    const meterY = currY + 84;
    const meterW = w - 44;
    const meterBg = this.scene.add.rectangle(
      meterX,
      meterY,
      meterW,
      12,
      HudTokens.colors.bgSurfaceDark,
      1,
    ).setOrigin(0, .5).setStrokeStyle(1, HudTokens.colors.strokeHighlight);
    const meterFill = this.scene.add.rectangle(
      meterX + 2,
      meterY,
      data.isReady ? 0 : Math.max(0, (meterW - 4) * comboRatio(data.timerSeconds, 12)),
      8,
      urgent ? HudTokens.colors.red : HudTokens.colors.gold,
      .95,
    ).setOrigin(0, .5);

    const stateLabel = this.scene.add.text(
      this.x + 22,
      currY + 101,
      data.isReady ? 'READ THE BOARD · START WHEN READY' : `COMBO ×${data.comboCurrent ?? 0}`,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '9px',
        color: data.isReady ? HudTokens.colors.textBlue : HudTokens.colors.textSecondary,
        fontStyle: 'bold',
      },
    );
    const best = this.scene.add.text(
      this.x + w - 22,
      currY + 101,
      `BEST ×${data.comboBest ?? 0}`,
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '9px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'bold',
      },
    ).setOrigin(1, 0);

    this.timerValue = time;
    this.comboMeter = meterFill;
    add(timerBg, timerLabel, time, meterBg, meterFill, stateLabel, best);
    currY += timerH + 10;

    // Compact phase outcomes.
    const countH = 62;
    const countBg = drawCard(this.scene, this.x, currY, w, countH, HudTokens.colors.bgPhase, .98, HudTokens.colors.strokeDefault, 1.2);
    const recruited = recruitedTotal(data.queueItems);
    const counter = (x: number, labelText: string, value: number) => {
      const l = this.scene.add.text(x, currY + 10, labelText, {
        fontFamily: HudTokens.fonts.family,
        fontSize: '9px',
        color: HudTokens.colors.textMuted,
        fontStyle: 'bold',
      }).setOrigin(.5, 0);
      const v = this.scene.add.text(x, currY + 25, String(value), {
        fontFamily: HudTokens.fonts.family,
        fontSize: '24px',
        color: HudTokens.colors.textPrimary,
        fontStyle: 'bold',
      }).setOrigin(.5, 0);
      add(l, v);
      return v;
    };
    this.stat2Val = counter(this.x + w * .28, 'MATCHES', data.matchCount);
    counter(this.x + w * .72, 'RECRUITED', recruited);
    add(countBg);
    currY += countH + 10;

    // The queue is a compact roster summary rather than six empty debug slots.
    const entries = queueDisplayEntries(data.queueItems).slice(0, 6);
    const queueRows = Math.max(1, Math.ceil(entries.length / 2));
    const queueH = 38 + queueRows * 42;
    const queueBg = drawCard(this.scene, this.x, currY, w, queueH, HudTokens.colors.bgPhase, .98, HudTokens.colors.strokeViolet, 1.25);
    const heading = this.scene.add.text(this.x + 16, currY + 12, 'RECRUITED BEASTS', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textSecondary,
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    add(queueBg, heading);
    this.queueCenter = { x: this.x + w / 2, y: currY + 50 };

    if (!entries.length) {
      const empty = this.scene.add.text(this.x + 16, currY + 34, 'Match a pair to recruit your first Beast.', {
        fontFamily: HudTokens.fonts.family,
        fontSize: '10px',
        color: HudTokens.colors.textMuted,
      });
      add(empty);
    } else {
      entries.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const cx = this.x + 86 + col * 164;
        const cy = currY + 45 + row * 42;
        const def = getIconDefinition(item.id);
        const bg = this.scene.add
          .rectangle(cx, cy, 146, 34, def.bgFill, .45)
          .setStrokeStyle(1.7, def.borderColor, .95);
        const icon = createIconImage(this.scene, item.id, cx - 55, cy, 24);
        const name = this.scene.add.text(cx - 34, cy - 7, item.name, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '8px',
          color: HudTokens.colors.textPrimary,
          fontStyle: 'bold',
        });
        const count = this.scene.add.text(cx + 57, cy, `×${item.count}`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '15px',
          color: HudTokens.colors.textGold,
          fontStyle: 'bold',
        }).setOrigin(.5);
        add(bg, icon, name, count);
        this.queueRowMap.set(item.id, { bg, count, x: cx - 54, y: cy });
      });
    }
    currY += queueH + 10;

    // One clear feedback line; avoids a second, conflicting combo readout.
    const eventBg = drawCard(this.scene, this.x, currY, w, 40, HudTokens.colors.bgPhaseGlow, .88, HudTokens.colors.strokeViolet, 1.15);
    const event = this.scene.add.text(
      this.x + 16,
      currY + 12,
      data.recentAction || 'Find a matching pair.',
      {
        fontFamily: HudTokens.fonts.family,
        fontSize: '11px',
        color: HudTokens.colors.textPrimary,
        fontStyle: 'bold',
      },
    );
    add(eventBg, event);
  }

  private renderEnergyRushHud(data: PhaseStatusData): void {
    const w = this.panelWidth;
    const {total, carry, gained} = energyRushBankSummary(data.queueItems.map(item => item.count), data.energyCarryIn ?? 0);
    const urgent = !data.isReady && data.timerSeconds < 3;
    const accent = urgent ? HudTokens.colors.red : HudTokens.colors.blue;
    const addText = (x: number, y: number, value: string, size: number, color: string = HudTokens.colors.textPrimary) => {
      const object = this.scene.add.text(x, y, value, {
        fontFamily: HudTokens.fonts.family, fontSize: `${size}px`, color, fontStyle: 'bold',
      });
      this.objects.push(object);
      return object;
    };
    const surface = (y: number, height: number, stroke: number = HudTokens.colors.strokeDefault) => {
      const panel = new RoundedPanel(this.scene, this.x + w / 2, y + height / 2, w, height,
        HudTokens.colors.bgPhaseSoft, .98, 14).setStrokeStyle(1.5, stroke, .85);
      this.objects.push(panel);
      return panel;
    };
    let y = this.y;
    surface(y, 132, accent);
    addText(this.x + 18, y + 12, data.isReady ? 'MATCH TO START' : 'COLLECT ENERGY', 20, HudTokens.colors.textBlue);
    this.timerValue = addText(this.x + 18, y + 38, `${Math.max(0, data.timerSeconds).toFixed(1)}s`, 46,
      urgent ? HudTokens.colors.textRed : HudTokens.colors.textPrimary);
    const meterW = w - 36;
    const meterBg = this.scene.add.rectangle(this.x + 18, y + 98, meterW, 8, HudTokens.colors.bgSurfaceDark).setOrigin(0, .5);
    this.comboMeter = this.scene.add.rectangle(this.x + 18, y + 98,
      data.isReady ? 0 : meterW * Math.max(0, Math.min(1, data.timerSeconds / 12)), 8, accent).setOrigin(0, .5);
    this.objects.push(meterBg, this.comboMeter);
    addText(this.x + 18, y + 111, data.isReady ? 'First pair starts the timer' : 'Each pair stores +1 charge', 16, HudTokens.colors.textSecondary);
    y += 144;
    surface(y, 68);
    addText(this.x + 16, y + 9, 'STORED', 16, HudTokens.colors.textMuted);
    this.stat2Val = addText(this.x + 16, y + 30, `×${total}`, 28, HudTokens.colors.textGold);
    addText(this.x + w * .46, y + 9, `CARRY ${carry}`, 18, HudTokens.colors.textSecondary);
    addText(this.x + w * .46, y + 36, `THIS RUSH +${gained}`, 18, HudTokens.colors.textGreen);
    y += 82;
    addText(this.x + 10, y, 'TACTICAL INVENTORY', 20, HudTokens.colors.textSecondary);
    y += 34;
    this.queueCenter = {x: this.x + w / 2, y: y + 34};
    data.queueItems.slice(0, 4).forEach((item, index) => {
      const rowY = y + index * 70;
      const def = getIconDefinition(item.id);
      const bg = this.scene.add.rectangle(this.x + w / 2, rowY + 32, w - 8, 64,
        item.count > 0 ? def.bgFill : HudTokens.colors.bgSurfaceDark, .95)
        .setStrokeStyle(1, def.primaryColor, item.count > 0 ? .7 : .25);
      const icon = createIconImage(this.scene, item.id, this.x + 32, rowY + 32, 46);
      const count = addText(this.x + w - 16, rowY + 16, `×${item.count}`, 29,
        item.count > 0 ? HudTokens.colors.textGold : HudTokens.colors.textMuted).setOrigin(1, 0);
      this.objects.push(bg, icon);
      this.scene.children.bringToTop(count);
      addText(this.x + 65, rowY + 8, item.name, 23);
      addText(this.x + 65, rowY + 37, item.description ?? '', 16, HudTokens.colors.textSecondary);
      this.queueRowMap.set(item.id, {bg, count, x: this.x + 32, y: rowY + 32});
    });
    y += 288;
    addText(this.x + 12, y, data.isReady || !data.recentAction ? 'Saved for Battle · carries over Waves' : data.recentAction, 16,
      data.isReady ? HudTokens.colors.textMuted : HudTokens.colors.textBlue).setWordWrapWidth(w - 24);
  }

  private renderCompactHud(data: PhaseStatusData): void {
    const w = this.panelWidth;
    const beast = Boolean(data.beastRushHud);
    const accent = beast ? HudTokens.colors.gold : HudTokens.colors.blue;
    const text = (x: number, y: number, value: string, size = 22, color: string = HudTokens.colors.textPrimary) => {
      const object = this.scene.add.text(x, y, value, {
        fontFamily: HudTokens.fonts.family, fontSize: `${size}px`, color, fontStyle: 'bold',
      });
      this.objects.push(object);
      return object;
    };
    let y = this.y;
    this.objects.push(drawCard(this.scene, this.x, y, w, 142, HudTokens.colors.bgPhaseSoft, 1, accent));
    text(this.x + 16, y + 12, data.isReady ? 'MATCH TO START' : 'TIME LEFT', 20, HudTokens.colors.textSecondary);
    this.timerValue = text(this.x + 16, y + 39, `${Math.max(0, data.timerSeconds).toFixed(1)}s`, 46,
      !data.isReady && data.timerSeconds < 3 ? HudTokens.colors.textRed : HudTokens.colors.textPrimary);
    const meterW = w - 32;
    const bg = this.scene.add.rectangle(this.x + 16, y + 99, meterW, 8, HudTokens.colors.bgSurfaceDark).setOrigin(0, .5);
    this.comboMeter = this.scene.add.rectangle(this.x + 16, y + 99,
      data.isReady ? 0 : meterW * Math.min(1, Math.max(0, data.timerSeconds / 12)), 8, accent).setOrigin(0, .5);
    this.objects.push(bg, this.comboMeter);
    text(this.x + 16, y + 112, data.isReady ? 'Choose a pair' : beast ? `COMBO ×${data.comboCurrent ?? 0}   BEST ×${data.comboBest ?? 0}` : data.statusBadge.text, 18);
    y += 152;
    this.stat2Val = text(this.x + 16, y, `MATCHES ${data.matchCount}`, 20);
    text(this.x + 16, y + 28, `${beast ? 'RECRUITED' : 'CHARGES'} ${recruitedTotal(data.queueItems)}`, 22, HudTokens.colors.textGold);
    y += 62;
    const entries = beast ? queueDisplayEntries(data.queueItems).slice(0, 6) : data.queueItems.slice(0, 6);
    const rows = beast ? Math.max(1, Math.ceil(entries.length / 2)) : Math.max(1, entries.length);
    const rowH = beast ? 90 : 54;
    this.objects.push(drawCard(this.scene, this.x, y, w, 34 + rows * rowH, HudTokens.colors.bgPhase, 1, HudTokens.colors.strokeDefault));
    text(this.x + 14, y + 8, beast ? 'YOUR BEASTS' : 'STORED ENERGY', 18, HudTokens.colors.textSecondary);
    this.queueCenter = {x: this.x + w / 2, y: y + 65};
    if (!entries.length) text(this.x + 16, y + 43, 'No Beasts yet', 20, HudTokens.colors.textMuted);
    entries.forEach((item, i) => {
      const col = beast ? i % 2 : 0;
      const row = beast ? Math.floor(i / 2) : i;
      const width = beast ? (w - 30) / 2 : w - 24;
      const x = this.x + 12 + col * (width + 6);
      const cy = y + 34 + row * rowH + rowH / 2;
      const bg = this.scene.add.rectangle(x + width / 2, cy, width, rowH - 6, HudTokens.colors.bgSurfaceElevated, .8);
      const icon = createIconImage(this.scene, item.id, x + 28, cy, beast ? 50 : 40);
      const count = text(beast ? x + 61 : x + width - 48, cy - 16, `×${item.count}`, 27, HudTokens.colors.textGold);
      const name = text(beast ? x + 8 : x + 56, beast ? cy + 24 : cy - 16, item.name, beast ? 12 : 17);
      if (beast) name.setVisible(false);
      name.setWordWrapWidth(beast ? width - 16 : width - 112);
      this.objects.push(bg, icon);
      // Bring labels above their row surface.
      this.scene.children.bringToTop(count);
      this.scene.children.bringToTop(name);
      this.queueRowMap.set(item.id, {bg, count, x: x + 28, y: cy});
    });
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
    if (this.comboMeter?.active) {
      this.scene.tweens.killTweensOf(this.comboMeter);
      this.comboMeter.setAlpha(1);
      this.scene.tweens.add({ targets: this.comboMeter, alpha: .5, yoyo: true, duration: 160 });
    }
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
    this.comboMeter = undefined;
    this.objects.splice(0).forEach((obj) => obj.destroy());
  }
}

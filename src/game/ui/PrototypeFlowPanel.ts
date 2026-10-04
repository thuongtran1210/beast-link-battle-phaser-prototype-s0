import Phaser from 'phaser';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

export interface FlowPanelAction {
  label: string;
  onAction: () => void;
}
export interface FlowPanelEnergyRow {
  energyId: string; displayName: string; shortDescription: string; charges: number; stateLabel: string; reasonLabel?: string; enabled: boolean; suggested: boolean;
  onAction: () => void;
}

/** P1-S0 navigation/validation panel updated for 16:9 landscape right panel. */
export class PrototypeFlowPanel {
  private readonly objects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Container | Phaser.GameObjects.Image> = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x = 910,
    private readonly y = 82,
    private readonly panelWidth = 340,
  ) {}

  render(
    title: string,
    lines: string[],
    actionLabel: string | null,
    onAction?: () => void,
    actions?: FlowPanelAction[],
    energyRows?: FlowPanelEnergyRow[],
  ): void {
    this.destroy();
    const w = this.panelWidth;
    const maxAvailableHeight = 610;

    const heading = this.scene.add.text(this.x + 16, this.y + 14, title, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '16px',
      color: HudTokens.colors.textPrimary,
      fontStyle: 'bold',
    });

    const body = this.scene.add.text(this.x + 16, this.y + 42, lines.join('\n'), {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: HudTokens.colors.textSecondary,
      lineSpacing: 4,
      wordWrap: { width: w - 32 },
    });

    const actionCount = (actionLabel && onAction ? 1 : 0) + (actions ? actions.length : 0);
    const energyRowCount = energyRows?.length ?? 0;
    const computedHeight = Math.min(
      maxAvailableHeight,
      Math.max(280, body.y - this.y + body.height + 24 + actionCount * 38 + energyRowCount * 36),
    );

    const panel = drawCard(this.scene, this.x, this.y, w, computedHeight, HudTokens.colors.bgSurface, 0.94);
    this.objects.push(panel, heading, body);

    let nextActionY = body.y + body.height + 12;

    if (actionLabel && onAction) {
      const actionBtnBg = this.scene.add
        .rectangle(this.x + w / 2, nextActionY + 16, w - 32, 34, HudTokens.colors.goldDark, 1)
        .setStrokeStyle(1, HudTokens.colors.gold)
        .setInteractive({ useHandCursor: true });
      const actionText = this.scene.add
        .text(this.x + w / 2, nextActionY + 16, actionLabel, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      actionBtnBg.on('pointerup', onAction);
      actionText.on('pointerup', onAction);
      this.objects.push(actionBtnBg, actionText);
      nextActionY += 40;
    }

    if (actions && actions.length > 0) {
      actions.forEach((act) => {
        const btnBg = this.scene.add
          .rectangle(this.x + w / 2, nextActionY + 14, w - 32, 30, 0x1e3a5f, 1)
          .setStrokeStyle(1, 0x3b82f6)
          .setInteractive({ useHandCursor: true });
        const btnText = this.scene.add
          .text(this.x + w / 2, nextActionY + 14, act.label, {
            fontFamily: HudTokens.fonts.family,
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        btnBg.on('pointerup', act.onAction);
        btnText.on('pointerup', act.onAction);
        this.objects.push(btnBg, btnText);
        nextActionY += 34;
      });
    }

    if (energyRows && energyRows.length > 0) {
      const rowHeight = 50;
      energyRows.forEach((row) => {
        const rowBg = this.scene.add
          .rectangle(this.x + w / 2, nextActionY + rowHeight / 2, w - 32, rowHeight, row.suggested ? 0x3f3515 : 0x111827, 0.9)
          .setStrokeStyle(1.5, row.suggested ? 0xfbbf24 : row.enabled ? 0x38bdf8 : 0x64748b);

        const tokenIcon = createIconImage(this.scene, row.energyId, this.x + 30, nextActionY + rowHeight / 2, 22);

        const label = this.scene.add.text(this.x + 46, nextActionY + 5, `${row.displayName} ×${row.charges}\n${row.stateLabel}${row.reasonLabel ? ` · ${row.reasonLabel}` : ''}`, {
          fontFamily: HudTokens.fonts.family,
          fontSize: '11px',
          color: '#f8fafc',
          fontStyle: 'bold',
        });

        const buttonBg = this.scene.add
          .rectangle(this.x + w - 54, nextActionY + rowHeight / 2, 64, 24, row.enabled ? 0x0284c7 : 0x334155, row.enabled ? 1 : .65)
          .setStrokeStyle(1, row.enabled ? 0x38bdf8 : 0x64748b);

        const buttonText = this.scene.add
          .text(this.x + w - 54, nextActionY + rowHeight / 2, row.enabled ? 'CAST' : '—', {
            fontFamily: HudTokens.fonts.family,
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        if (row.enabled) { buttonBg.setInteractive({ useHandCursor: true }); buttonText.setInteractive({ useHandCursor: true }); buttonBg.on('pointerup', row.onAction); buttonText.on('pointerup', row.onAction); }
        this.objects.push(rowBg, tokenIcon, label, buttonBg, buttonText);
        nextActionY += rowHeight + 4;
      });
    }
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  setVisible(visible: boolean): void {
    this.objects.forEach((object) => object.setVisible(visible));
  }
}

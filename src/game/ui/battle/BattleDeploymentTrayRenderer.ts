import Phaser from 'phaser';
import { HudTokens } from '../layout/HudTokens';
import { isCompactLandscape } from '../layout/MobilePresentation';
import { classifyBattleSetupRoster } from '../BattleSetupPresentation';
import { reservePage } from '../ReservePagination';
import { ACTIVE_SQUAD_LIMIT } from '../ActiveSquadPresentation';
import { beastDisplayName } from '../icons/UnitIconRegistry';
import { createIconImage, createRoleIconImage } from '../icons/IconFactory';
import { signatureForBeast } from '../../battle/BeastRoles';
import { signatureTierLabel, signatureTierTagline } from '../../run/StarProfile';
import { FeedbackEffects } from '../feedback/FeedbackEffects';
import type { BattleFormation, FormationUnit } from '../../battle/BattleFormation';
import type { RunRoster } from '../../run/RunRoster';
import type { RunLinkShardPool } from '../../run/RunLinkShardPool';
import type { BattleSetupInteractionController } from '../BattleSetupInteractionController';

export interface DeploymentTrayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BattleDeploymentTrayRenderer {
  private reservePageIndex = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly controller: BattleSetupInteractionController,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly trayBounds: DeploymentTrayBounds,
    private readonly runRoster?: RunRoster,
    private readonly shardPool?: RunLinkShardPool,
    private readonly onConsolidate?: (selectedUnitId: string) => string | undefined,
    private readonly onArrangementChanged?: () => void,
    private readonly onReRender?: () => void,
    private readonly onStartDrag?: (unitId: string, fromSlotId: string | null, pointer: Phaser.Input.Pointer) => void,
  ) {}

  render(): void {
    const { x, y, width, height } = this.trayBounds;

    // Recessed tray panel
    const trayBg = this.scene.add
      .rectangle(x + width / 2, y + height / 2, width, height, 0x0f172a, 0.96)
      .setStrokeStyle(1.5, 0x334155);
    this.managedObjects.push(trayBg);

    const groups = classifyBattleSetupRoster(this.formation.units, this.runRoster?.units ?? []);
    const unplaced = groups.reserve;
    const page = reservePage(unplaced, this.reservePageIndex, isCompactLandscape() ? 4 : 6);
    this.reservePageIndex = page.pageIndex;
    const hasUnplaced = unplaced.length > 0;

    // Tray heading
    const heading = this.addText(x + 18, y + 12, `RESERVE ${groups.reserve.length}`, 13, HudTokens.colors.textPrimary, 'bold');
    const subtext = this.addText(
      x + 130,
      y + 13,
      hasUnplaced
        ? 'TAP TO SELECT · TAP SLOT TO DEPLOY · MERGE BELOW'
        : '✓ SQUAD DEPLOYED — DRAG BACK TO RESERVE TO BENCH',
      10,
      hasUnplaced ? HudTokens.colors.textBlue : HudTokens.colors.textGreen,
      'bold',
    );
    const states = this.addText(
      x + width - 18,
      y + 12,
      `ACTIVE ${groups.deployed.length}/${ACTIVE_SQUAD_LIMIT}   ·   KO ${groups.ko.length}`,
      9,
      groups.ko.length ? HudTokens.colors.textRed : HudTokens.colors.textMuted,
      'bold',
    ).setOrigin(1, 0);
    this.managedObjects.push(heading, subtext, states);

    if (groups.ko.length) {
      const koNames = groups.ko.slice(0, 3).map((unit) => beastDisplayName(unit.beastId)).join(' · ');
      const koStrip = this.addText(
        x + 18,
        y + height - 18,
        `KO  ${koNames}${groups.ko.length > 3 ? ` +${groups.ko.length - 3}` : ''}`,
        9,
        '#fb7185',
        'bold',
      );
      this.managedObjects.push(koStrip);
    }

    if (!hasUnplaced) {
      // Empty Bench placeholder
      const emptyBench = this.scene.add
        .rectangle(x + width / 2, y + height / 2 + 16, width - 40, height - 60, 0x1e293b, 0.4)
        .setStrokeStyle(1.5, 0x334155, 0.6);
      const emptyText = this.addText(
        x + width / 2,
        y + height / 2 + 16,
        'All Beasts deployed on the battlefield.\nDrag units directly on the board to reposition or swap.\nDrop a deployed unit here to return it to the bench.',
        11,
        '#64748b',
        'bold',
      ).setOrigin(0.5);
      this.managedObjects.push(emptyBench, emptyText);
      return;
    }

    // Render horizontal row of Draggable Beast Cards
    const cardW = isCompactLandscape() ? 218 : 142;
    const cardH = 154;
    const startX = x + 18;
    const startY = y + 44;
    const gap = 16;

    page.items.forEach((unit, index) => {
      const cardX = startX + index * (cardW + gap);
      this.renderTrayCard(unit, cardX, startY, cardW, cardH, index === 0 && this.controller.isFirstDeploymentPending);
    });

    if (page.pageCount > 1) {
      const pagerY = y + 34;
      const prev = this.addText(
        x + width - 194,
        pagerY,
        '‹ PREV',
        9,
        page.pageIndex > 0 ? HudTokens.colors.textGold : HudTokens.colors.textMuted,
        'bold',
      );
      const info = this.addText(
        x + width - 112,
        pagerY,
        `PAGE ${page.pageIndex + 1} / ${page.pageCount}`,
        9,
        HudTokens.colors.textSecondary,
        'bold',
      ).setOrigin(0.5, 0);
      const next = this.addText(
        x + width - 30,
        pagerY,
        'NEXT ›',
        9,
        page.pageIndex < page.pageCount - 1 ? HudTokens.colors.textGold : HudTokens.colors.textMuted,
        'bold',
      ).setOrigin(1, 0);

      if (page.pageIndex > 0) {
        prev.setInteractive({ useHandCursor: true }).on('pointerup', () => {
          this.reservePageIndex -= 1;
          this.onReRender?.();
        });
      }
      if (page.pageIndex < page.pageCount - 1) {
        next.setInteractive({ useHandCursor: true }).on('pointerup', () => {
          this.reservePageIndex += 1;
          this.onReRender?.();
        });
      }
      this.managedObjects.push(info, prev, next);
    }
  }

  private renderTrayCard(
    unit: FormationUnit,
    x: number,
    y: number,
    w: number,
    h: number,
    shouldAnimateFirstAffordance: boolean,
  ): void {
    const isSelected = unit.unitId === this.controller.selectedId;
    const cx = x + w / 2;
    const cy = y + h / 2;

    const card = this.scene.add
      .rectangle(cx, cy, w, h, isSelected ? 0x1e3a5f : 0x1e293b, 0.95)
      .setStrokeStyle(isSelected ? 3 : 1.5, isSelected ? 0xc8b58a : 0x48514e);
    this.managedObjects.push(card);

    if (shouldAnimateFirstAffordance && this.scene.tweens) {
      this.scene.tweens.add({
        targets: card,
        y: cy - 4,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    const rosterUnit = this.runRoster?.get(unit.unitId);
    const hpRatio = rosterUnit && rosterUnit.maxHp > 0 ? Math.max(0, rosterUnit.currentHp / rosterUnit.maxHp) : 1;
    const stateLabel = rosterUnit?.status === 'ko' ? 'KO' : hpRatio < 1 ? 'INJURED' : 'FRESH';
    const stateColor = rosterUnit?.status === 'ko'
      ? HudTokens.colors.textRed
      : hpRatio < 1
      ? HudTokens.colors.textGold
      : HudTokens.colors.textGreen;

    const icon = createIconImage(this.scene, unit.beastId, cx, cy - 34, 54);
    const roleIcon = createRoleIconImage(this.scene, unit.role, cx + 47, cy - 44, 18);
    this.managedObjects.push(icon, roleIcon);

    const beastName = beastDisplayName(unit.beastId);
    const nameLabel = this.addText(cx, cy - 3, beastName, 9, HudTokens.colors.textPrimary, 'bold').setOrigin(0.5);
    const roleLabel = this.addText(
      cx,
      cy + 8,
      `${unit.role.toUpperCase()} · ${'★'.repeat(unit.star)}`,
      9,
      roleTextColor(unit.role),
      'bold',
    ).setOrigin(0.5);
    const state = this.addText(
      cx - w / 2 + 9,
      cy - h / 2 + 8,
      stateLabel,
      7,
      stateColor,
      'bold',
      '#151a31',
      { x: 5, y: 2 },
    );
    const signature = signatureForBeast(unit.beastId);
    const skillLabel = this.addText(
      cx,
      cy + 27,
      signatureTierLabel(signature, unit.star),
      8,
      HudTokens.colors.textGold,
      'bold',
    ).setOrigin(0.5);
    const skillSummary = this.addText(
      cx,
      cy + 39,
      signatureTierTagline(signature, unit.star),
      7,
      HudTokens.colors.textMuted,
      '',
    ).setOrigin(0.5);
    skillLabel.setVisible(false);
    skillSummary.setVisible(false);
    nameLabel.setFontSize(12);
    roleLabel.setFontSize(11);
    this.managedObjects.push(nameLabel, roleLabel, state, skillLabel, skillSummary);

    const barW = 104;
    const barY = cy + 18;
    const hpBg = this.scene.add
      .rectangle(cx, barY, barW, 7, HudTokens.colors.bgSurfaceDark, 1)
      .setStrokeStyle(1, HudTokens.colors.strokeDefault, 0.8);
    const hpFill = this.scene.add
      .rectangle(
        cx - barW / 2 + 1,
        barY,
        Math.max(0, (barW - 2) * hpRatio),
        5,
        rosterUnit?.status === 'ko'
          ? HudTokens.colors.red
          : hpRatio < 0.35
          ? HudTokens.colors.red
          : hpRatio < 1
          ? HudTokens.colors.gold
          : HudTokens.colors.green,
        0.95,
      )
      .setOrigin(0, 0.5);
    const hpLabel = this.addText(
      cx,
      cy + 25,
      rosterUnit ? `${Math.round(rosterUnit.currentHp)} / ${Math.round(rosterUnit.maxHp)} HP` : 'READY',
      7,
      HudTokens.colors.textMuted,
      'bold',
    ).setOrigin(0.5);
    this.managedObjects.push(hpBg, hpFill, hpLabel);

    // Interactive Drag and Click Handlers
    const hitArea = this.scene.add
      .rectangle(cx, cy - 19, w, h - 38, 0xffffff, 0.0001)
      .setInteractive({ useHandCursor: true });
    this.managedObjects.push(hitArea);

    if (rosterUnit?.status !== 'ko') {
      hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.onStartDrag?.(unit.unitId, null, pointer);
      });
    }

    hitArea.on('pointerup', () => {
      if (this.controller.state.mode === 'idle') {
        this.controller.selectUnit(unit.unitId);
        this.onReRender?.();
      }
    });

    const deployedIds = new Set(
      this.formation.units.filter((item) => item.slotId !== null).map((item) => item.unitId),
    );
    const preview = this.runRoster?.consolidationPreview(
      unit.unitId,
      deployedIds,
      this.shardPool?.count ?? 0,
    );
    const canMerge = Boolean(preview?.canConsolidate && this.onConsolidate);
    const cost = preview?.isShardAssisted ? '2 + ◆1' : '3 COPIES';
    const label = canMerge
      ? `MERGE ${'★'.repeat(preview!.targetStar!)} · ${cost}`
      : unit.star >= 3
      ? 'MAX ★★★'
      : `COPIES ${preview?.eligibleCount ?? 0}/3`;
    const mergeY = y + h - 23;
    const merge = this.scene.add
      .rectangle(cx, mergeY, w - 12, 44, canMerge ? 0x176347 : 0x151a31, 0.98)
      .setStrokeStyle(1, canMerge ? 0x8eae92 : 0x48514e);
    const mergeLabel = this.addText(
      cx,
      mergeY,
      label,
      11,
      canMerge ? '#ffffff' : '#94a3b8',
      'bold',
    ).setOrigin(0.5);
    this.managedObjects.push(merge, mergeLabel);

    if (canMerge) {
      merge.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        const upgradedId = this.onConsolidate!(unit.unitId);
        if (upgradedId) {
          this.controller.selectUnit(null);
          this.controller.selectUnit(upgradedId);
          this.onArrangementChanged?.();
          FeedbackEffects.floatText(
            this.scene,
            cx,
            mergeY - 36,
            `UNLOCKED ${'★'.repeat(preview!.targetStar!)} · ${signatureTierTagline(
              signatureForBeast(unit.beastId),
              preview!.targetStar!,
            )}`,
            '#34d399',
            '18px',
            900,
          );
        }
        this.onReRender?.();
      });
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

function roleTextColor(role: FormationUnit['role']): string {
  if (role === 'Tanker') return '#d3bf8c';
  if (role === 'Assassin') return '#c89b84';
  if (role === 'Ranger') return '#a8bda0';
  return '#b7a7c4';
}

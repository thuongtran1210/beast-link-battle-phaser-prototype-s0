import Phaser from 'phaser';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import type { EnemyArchetype, EnemyFixture } from '../battle/AutonomousBattleModel';
import { recommendedRows, signatureNameForBeast } from '../battle/BeastRoles';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage, createRoleIconImage } from './icons/IconFactory';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { FeedbackEffects } from './feedback/FeedbackEffects';
import { BattleSetupInteractionController, type DropOutcome } from './BattleSetupInteractionController';
import type { RunRoster } from '../run/RunRoster';
import { reservePage } from './ReservePagination';
import { ACTIVE_SQUAD_LIMIT, activeSquadPresentation, reserveTargetAffordance } from './ActiveSquadPresentation';
import { classifyBattleSetupRoster } from './BattleSetupPresentation';
import { setupEnergyInventory } from './BattleSetupPresentation';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';

export interface BattleSetupLayoutMetrics {
  panelX: number;
  storedEnergyY: number;
  unplacedHeadingY: number;
  listStartY: number;
  listMaxVisibleCount: number;
  startBattleY: number;
  viewportHeight: number;
}

interface SlotVisualTarget {
  slotId: string;
  row: FormationSlot['row'];
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * P1-V13A.2 Landscape Battle Setup View.
 * Restructured layout:
 * - Top: Level & threat info, presets, stored energy, validation tools
 * - Center Left: Player Formation Board (MY FORMATION)
 * - Center Right: Enemy Formation Board (ENEMY FORMATION)
 * - Bottom: Player Beast Deployment Tray (YOUR BEASTS — DRAG TO DEPLOY) & Start Battle CTA
 */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly controller: BattleSetupInteractionController;
  private readonly playerSlotVisuals: SlotVisualTarget[] = [];
  private dragGhost?: Phaser.GameObjects.Container;
  private hoverPreviewContainer?: Phaser.GameObjects.Container;
  private readonly dragAffordanceObjects: Phaser.GameObjects.GameObject[] = [];
  private pointerMoveHandler?: (pointer: Phaser.Input.Pointer) => void;
  private pointerUpHandler?: (pointer: Phaser.Input.Pointer) => void;
  private enemyTool: EnemyArchetype | 'Erase' = 'Frontliner';
  private reservePageIndex = 0;
  private trayBounds = { x: 24, y: 495, width: 956, height: 210 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly enemies: ReadonlyArray<EnemyFixture>,
    private readonly storedEnergy: () => ReadonlyArray<EnergyQueueEntry> | string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void,
    private readonly fixtureName?: string,
    private readonly onCycleFixture?: () => void,
    private readonly threatSummary?: string,
    private readonly activePresetKey?: 'A' | 'B',
    private readonly onSelectPresetA?: () => void,
    private readonly onSelectPresetB?: () => void,
    private readonly onEnemyBoardEdit?: (tool: EnemyArchetype | 'Erase', row: FormationSlot['row'], column: number) => void,
    private readonly runRoster?: RunRoster,
    private readonly onConsolidate?: (selectedUnitId: string) => string | undefined,
    private readonly shardPool?: import('../run/RunLinkShardPool').RunLinkShardPool,
  ) {
    this.controller = new BattleSetupInteractionController(this.formation, (unitId) => this.runRoster?.canDeploy(unitId) ?? true, ACTIVE_SQUAD_LIMIT);
  }

  static computeLayout(viewportHeight = 720): BattleSetupLayoutMetrics {
    const panelX = 998;
    const storedEnergyY = 495;
    const unplacedHeadingY = 495;
    const listStartY = 540;
    const startBattleY = Math.min(625, viewportHeight - 80);
    return {
      panelX,
      storedEnergyY,
      unplacedHeadingY,
      listStartY,
      listMaxVisibleCount: 6,
      startBattleY,
      viewportHeight,
    };
  }

  getUnplacedUnits(): FormationUnit[] {
    return this.controller.getUnplacedUnits();
  }

  render(): void {
    this.destroy();
    this.playerSlotVisuals.length = 0;

    const viewportW = this.scene.scale.width || 1280;
    const viewportH = this.scene.scale.height || 720;
    const layoutMetrics = BattleSetupView.computeLayout(viewportH);

    this.renderHeader();
    this.renderBattleField();
    this.renderDeploymentTray();
    this.renderRightCTA(layoutMetrics);
    this.setupGlobalPointerListeners();
  }

  destroy(): void {
    if (this.pointerMoveHandler) {
      this.scene.input.off('pointermove', this.pointerMoveHandler);
      this.pointerMoveHandler = undefined;
    }
    if (this.pointerUpHandler) {
      this.scene.input.off('pointerup', this.pointerUpHandler);
      this.pointerUpHandler = undefined;
    }
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = undefined;
    }
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.objects);
    }
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  private renderHeader(): void {
    // Player-facing Wave/Threat belongs exclusively to GameTopHUD. Keep harness controls below it.
    if (!this.onEnemyBoardEdit) return;
    // Wave is primary; phase/navigation is intentionally secondary.
    this.text(26, 78, 'TEST HARNESS', 9, '#64748b', 'bold');

    // 2. Level title / Threat info
    const levelLabel = this.text(
      460,
      78,
      this.onCycleFixture ? '[E] CYCLE FIXTURE' : 'BATTLE SETUP',
      12,
      HudTokens.colors.textGold,
      'bold',
    );
    if (this.onCycleFixture) {
      levelLabel.setInteractive({ useHandCursor: true });
      levelLabel.on('pointerup', () => this.onCycleFixture!());
    }

    if (this.threatSummary) {
      this.text(460, 92, '[DEBUG CONTROLS]', 8, '#64748b', 'bold');
    }

    // 3. Formation Presets Quick Select
    if (this.onSelectPresetA && this.onSelectPresetB) {
      this.text(780, 78, 'PRESET:', 9, HudTokens.colors.textMuted, 'bold');
      const presetALabel = this.text(
        834,
        78,
        `[A] Response A`,
        10,
        this.activePresetKey === 'A' ? '#22c55e' : '#94a3b8',
        'bold',
        this.activePresetKey === 'A' ? '#14532d' : '#1e293b',
        { x: 6, y: 3 },
      );
      presetALabel.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onSelectPresetA!());

      const presetBLabel = this.text(
        940,
        78,
        `[B] Response B`,
        10,
        this.activePresetKey === 'B' ? '#22c55e' : '#94a3b8',
        'bold',
        this.activePresetKey === 'B' ? '#14532d' : '#1e293b',
        { x: 6, y: 3 },
      );
      presetBLabel.setInteractive({ useHandCursor: true }).on('pointerup', () => this.onSelectPresetB!());
    }

    // 4. Enemy validation tools
    {
      this.text(780, 92, 'ENEMY TOOLS:', 8, HudTokens.colors.textMuted, 'bold');
      (['Frontliner', 'Diver', 'Ranged', 'Erase'] as const).forEach((tool, index) => {
        const short = tool === 'Frontliner' ? 'FRONT' : tool === 'Ranged' ? 'RANGE' : tool.toUpperCase();
        const active = this.enemyTool === tool;
        const label = this.text(
          856 + index * 48,
          92,
          short,
          8,
          active ? '#fbbf24' : '#94a3b8',
          active ? 'bold' : '',
          active ? '#78350f' : '#1e293b',
          { x: 5, y: 2 },
        );
        label.setInteractive({ useHandCursor: true }).on('pointerup', () => {
          this.enemyTool = tool;
          this.render();
        });
      });
    }
  }

  private renderBattleField(): void {
    const arenaX = 24;
    const arenaY = 72;
    const arenaW = 1230;
    const arenaH = 412;

    // Arena boundary card
    const arenaBg = this.scene.add
      .rectangle(arenaX + arenaW / 2, arenaY + arenaH / 2, arenaW, arenaH, 0x0b1120, 0.7)
      .setStrokeStyle(1.5, 0x1e293b);
    this.objects.push(arenaBg);

    const dividerX = 640;
    const topLaneY = 142;
    const laneGap = 56;
    const slotW = 68;
    const slotH = 50;
    const depthGap = 92;

    // Center divider
    const divider = this.scene.add.rectangle(dividerX, arenaY + arenaH / 2 + 10, 2, arenaH - 50, 0x334155, 0.8);
    this.objects.push(divider);

    // Frontline Direction indicator
    const zoneBadge = this.scene.add.rectangle(dividerX, topLaneY - 38, 220, 24, 0x1e293b, 0.9).setStrokeStyle(1, 0x475569);
    const zoneText = this.text(dividerX, topLaneY - 38, 'MY SIDE  →  BATTLE  ←  ENEMY SIDE', 9, '#94a3b8', 'bold').setOrigin(0.5);
    this.objects.push(zoneBadge, zoneText);

    // Board headers. Squad capacity is separate from the 3 × 6 position grid.
    const squad = this.squadPresentation();
    const playerHeading = this.text(dividerX - 170, topLaneY - 58, '◀ MY FORMATION', 12, '#38bdf8', 'bold').setOrigin(0.5);
    const enemyHeadingText = this.onEnemyBoardEdit ? 'ENEMY FORMATION [Validation Edit] ▶' : 'ENEMY FORMATION ▶';
    const enemyHeading = this.text(dividerX + 180, topLaneY - 38, enemyHeadingText, 12, '#f87171', 'bold').setOrigin(0.5);
    const squadTitle = this.text(dividerX - 280, topLaneY - 42, `ACTIVE ${squad.countLabel}${squad.isFull ? ' · FULL' : ''} · GRID 18`, 9, squad.isFull ? '#fbbf24' : '#7dd3fc', 'bold');
    const gridLabel = this.text(dividerX - 170, topLaneY - 38, '18 TACTICAL POSITIONS', 8, '#94a3b8', 'bold').setOrigin(0.5);
    this.objects.push(playerHeading, enemyHeading, squadTitle, gridLabel);

    // Row labels
    const playerFrontX = dividerX - 80;
    const playerMidX = playerFrontX - depthGap;
    const playerBackX = playerMidX - depthGap;

    const enemyFrontX = dividerX + 80;
    const enemyMidX = enemyFrontX + depthGap;
    const enemyBackX = enemyMidX + depthGap;

    this.text(playerBackX, topLaneY - 18, 'BACK', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(playerMidX, topLaneY - 18, 'MID', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(playerFrontX, topLaneY - 18, 'FRONT', 10, '#38bdf8', 'bold').setOrigin(0.5);

    this.text(enemyFrontX, topLaneY - 18, 'FRONT', 10, '#ef4444', 'bold').setOrigin(0.5);
    this.text(enemyMidX, topLaneY - 18, 'MID', 10, '#64748b', 'bold').setOrigin(0.5);
    this.text(enemyBackX, topLaneY - 18, 'BACK', 10, '#64748b', 'bold').setOrigin(0.5);

    // 6 Lanes L1..L6
    for (let column = 1; column <= 6; column += 1) {
      const laneY = topLaneY + (column - 1) * laneGap;
      this.text(arenaX + 16, laneY, `L${column}`, 10, '#64748b', 'bold').setOrigin(0, 0.5);

      // Player slots: Back, Mid, Front
      const playerRows: Array<{ row: FormationSlot['row']; x: number }> = [
        { row: 'Back', x: playerBackX },
        { row: 'Mid', x: playerMidX },
        { row: 'Front', x: playerFrontX },
      ];

      playerRows.forEach(({ row, x }) => {
        const slotId = `${row.toLowerCase()}-${column}`;
        this.playerSlotVisuals.push({
          slotId,
          row,
          column,
          x,
          y: laneY,
          width: slotW,
          height: slotH,
        });

        this.renderPlayerSlot(slotId, row, column, x, laneY, slotW, slotH);
      });

      // Enemy slots: Front, Mid, Back
      const enemyRows: Array<{ row: FormationSlot['row']; x: number }> = [
        { row: 'Front', x: enemyFrontX },
        { row: 'Mid', x: enemyMidX },
        { row: 'Back', x: enemyBackX },
      ];

      enemyRows.forEach(({ row, x }) => {
        const slot = this.scene.add
          .rectangle(x, laneY, slotW, slotH, 0x1e293b, 0.6)
          .setStrokeStyle(1.5, 0xef4444, 0.35);
        this.objects.push(slot);

        if (this.onEnemyBoardEdit) {
          slot.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.onEnemyBoardEdit!(this.enemyTool, row, column);
          });
        }
      });
    }

    // Render enemy units
    this.enemies.forEach((enemy) => {
      const rowX = enemy.row === 'Front' ? enemyFrontX : enemy.row === 'Mid' ? enemyMidX : enemyBackX;
      const posY = topLaneY + (enemy.column - 1) * laneGap;
      const archetype = enemy.archetype ?? 'Frontliner';
      const strokeColor = archetype === 'Diver' ? 0xa855f7 : archetype === 'Ranged' ? 0x06b6d4 : 0xf87171;
      const archetypeTag = archetype === 'Frontliner' ? 'FRONT' : archetype === 'Diver' ? 'DIVER' : 'RANGED';

      const body = this.scene.add
        .rectangle(rowX, posY, slotW - 8, slotH - 8, 0x450a0a, 0.95)
        .setStrokeStyle(1.5, strokeColor);

      const label = this.text(
        rowX,
        posY - 2,
        `[${archetypeTag}]\n${enemy.maxHp} HP\n⚔${enemy.damage}`,
        8,
        '#ffffff',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(body, label);
    });

    // First-time instructional arrow cue (disappears after first placement)
    if (this.controller.isFirstDeploymentPending) {
      const cueY = 468;
      const cue = this.text(
        dividerX - 170,
        cueY,
        '▲ DRAG YOUR BEASTS INTO FORMATION ▲',
        11,
        '#38bdf8',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(cue);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: cue,
          y: cueY - 6,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }
    }
  }

  private renderPlayerSlot(
    slotId: string,
    row: FormationSlot['row'],
    column: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const formationSlot = this.formation.getSlot(slotId);
    const occupantUnit = formationSlot?.unitId ? this.formation.getUnit(formationSlot.unitId) : undefined;
    const isSelected = occupantUnit && occupantUnit.unitId === this.controller.selectedId;

    if (occupantUnit) {
      // Occupied Player Slot
      const body = this.scene.add
        .rectangle(x, y, width - 6, height - 6, 0x1e293b, 0.96)
        .setStrokeStyle(isSelected ? 3 : 1.5, isSelected ? 0xfbbf24 : roleStrokeColor(occupantUnit.role));
      this.objects.push(body);

      const icon = createIconImage(this.scene, occupantUnit.beastId, x - 15, y - 4, 32);
      this.objects.push(icon);

      const roleBadge = createRoleIconImage(this.scene, occupantUnit.role, x + 16, y - 10, 16);
      this.objects.push(roleBadge);

      const stars = '★'.repeat(occupantUnit.star);
      const starLabel = this.text(x + 16, y + 6, stars, 9, HudTokens.colors.textGold, 'bold').setOrigin(0.5);
      this.objects.push(starLabel);

      const sigLabel = this.text(
        x,
        y + 16,
        signatureNameForBeast(occupantUnit.beastId),
        7,
        HudTokens.colors.textMuted,
        'bold',
      ).setOrigin(0.5);
      this.objects.push(sigLabel);

      if (isSelected && this.scene.tweens) {
        this.scene.tweens.add({
          targets: body,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }

      // Drag and Click Interaction for deployed unit
      const hitArea = this.scene.add
        .rectangle(x, y, width, height, 0xffffff, 0.0001)
        .setInteractive({ useHandCursor: true });
      this.objects.push(hitArea);

      hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startDrag(occupantUnit.unitId, slotId, pointer);
      });

      hitArea.on('pointerup', () => {
        // If not dragged, treat as click selection/swap
        if (this.controller.state.mode === 'idle') {
          const outcome = this.controller.clickSlot(slotId);
          this.handleOutcome(outcome, x, y);
        }
      });
      return;
    }

    // Empty Player Slot: a tactical position, not an additional squad slot.
    const squad = this.squadPresentation();
    const blockedByFullSquad = reserveTargetAffordance(squad.activeCount, false, this.controller.state.mode === 'draggingFromTray') === 'blocked';
    const emptySlot = this.scene.add
      .rectangle(x, y, width, height, 0x1e293b, blockedByFullSquad ? 0.3 : 0.5)
      .setStrokeStyle(1.5, blockedByFullSquad ? 0x475569 : 0x3b82f6, blockedByFullSquad ? 0.35 : 0.4);
    const footprint = this.text(x, y, blockedByFullSquad ? 'LOCK' : '+', blockedByFullSquad ? 7 : 12, blockedByFullSquad ? '#64748b' : '#3b82f6', 'bold').setOrigin(0.5).setAlpha(blockedByFullSquad ? 0.7 : 0.6);
    this.objects.push(emptySlot, footprint);

    // Subtle first-time pulse on frontline empty slot
    if (this.controller.isFirstDeploymentPending && row === 'Front' && column === 3 && this.scene.tweens) {
      this.scene.tweens.add({
        targets: [emptySlot, footprint],
        alpha: 0.9,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    const hitArea = this.scene.add
      .rectangle(x, y, width, height, 0xffffff, 0.0001)
      .setInteractive({ useHandCursor: true });
    this.objects.push(hitArea);

    hitArea.on('pointerup', () => {
      if (this.controller.state.mode === 'idle') {
        const outcome = this.controller.clickSlot(slotId);
        this.handleOutcome(outcome, x, y);
      }
    });
  }

  private renderDeploymentTray(): void {
    const { x, y, width, height } = this.trayBounds;

    // Recessed tray panel
    const trayBg = this.scene.add
      .rectangle(x + width / 2, y + height / 2, width, height, 0x0f172a, 0.96)
      .setStrokeStyle(1.5, 0x334155);
    this.objects.push(trayBg);

    const groups = classifyBattleSetupRoster(this.formation.units, this.runRoster?.units ?? []);
    const unplaced = groups.reserve;
    const page = reservePage(unplaced, this.reservePageIndex);
    this.reservePageIndex = page.pageIndex;
    const hasUnplaced = unplaced.length > 0;

    // Tray Heading
    const heading = this.text(x + 18, y + 14, `RESERVE ${groups.reserve.length}`, 13, '#ffffff', 'bold');
    const subtext = this.text(
      x + 130,
      y + 15,
      hasUnplaced
        ? 'DRAG TO DEPLOY — Pick up a Beast card to place onto your formation grid'
        : '✓ ALL BEASTS DEPLOYED — (Drag from board back here to bench)',
      11,
      hasUnplaced ? '#38bdf8' : '#22c55e',
      'bold',
    );
    this.objects.push(heading, subtext);
    const states = this.text(x + width - 210, y + 15, `DEPLOYED ${groups.deployed.length} · KO ${groups.ko.length}`, 10, groups.ko.length ? '#fb7185' : '#94a3b8', 'bold');
    this.objects.push(states);
    if (groups.ko.length) {
      const koNames = groups.ko.slice(0, 3).map(unit => beastDisplayName(unit.beastId)).join(' · ');
      const koStrip = this.text(x + 18, y + height - 18, `KO  ${koNames}${groups.ko.length > 3 ? ` +${groups.ko.length - 3}` : ''}`, 9, '#fb7185', 'bold');
      this.objects.push(koStrip);
    }

    if (!hasUnplaced) {
      // Empty Bench placeholder
      const emptyBench = this.scene.add
        .rectangle(x + width / 2, y + height / 2 + 16, width - 40, height - 60, 0x1e293b, 0.4)
        .setStrokeStyle(1.5, 0x334155, 0.6);
      const emptyText = this.text(
        x + width / 2,
        y + height / 2 + 16,
        'All Beasts deployed on the battlefield.\nDrag units directly on the board to reposition or swap.\nDrop a deployed unit here to return it to the bench.',
        11,
        '#64748b',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(emptyBench, emptyText);
      return;
    }

    // Render horizontal row of Draggable Beast Cards
    const cardW = 142;
    const cardH = 146;
    const startX = x + 18;
    const startY = y + 44;
    const gap = 16;

    page.items.forEach((unit, index) => {
      const cardX = startX + index * (cardW + gap);
      this.renderTrayCard(unit, cardX, startY, cardW, cardH, index === 0 && this.controller.isFirstDeploymentPending);
    });
    if (page.pageCount > 1) {
      const info = this.text(x + width - 160, y + 15, `${page.start + 1}-${page.end} / ${unplaced.length}`, 10, '#cbd5e1', 'bold');
      const prev = this.text(x + width - 220, y + 15, '< PREV', 10, page.pageIndex > 0 ? '#fbbf24' : '#475569', 'bold');
      const next = this.text(x + width - 78, y + 15, 'NEXT >', 10, page.pageIndex < page.pageCount - 1 ? '#fbbf24' : '#475569', 'bold');
      if (page.pageIndex > 0) prev.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.reservePageIndex -= 1; this.render(); });
      if (page.pageIndex < page.pageCount - 1) next.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.reservePageIndex += 1; this.render(); });
      this.objects.push(info, prev, next);
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
      .setStrokeStyle(isSelected ? 3 : 1.5, isSelected ? 0xfbbf24 : roleStrokeColor(unit.role));
    this.objects.push(card);

    // First placement subtle animated bob
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

    // Beast Icon
    const icon = createIconImage(this.scene, unit.beastId, cx - 36, cy - 36, 40);
    this.objects.push(icon);

    // Role Icon & role name
    const roleIcon = createRoleIconImage(this.scene, unit.role, cx + 44, cy - 42, 22);
    this.objects.push(roleIcon);

    const beastName = beastDisplayName(unit.beastId);
    const nameLabel = this.text(cx, cy - 8, beastName, 11, '#ffffff', 'bold').setOrigin(0.5);
    this.objects.push(nameLabel);

    const roleLabel = this.text(
      cx,
      cy + 8,
      `${unit.role.toUpperCase()} · ${'★'.repeat(unit.star)}`,
      10,
      roleTextColor(unit.role),
      'bold',
    ).setOrigin(0.5);
    this.objects.push(roleLabel);

    const sigName = signatureNameForBeast(unit.beastId);
    const sigLabel = this.text(cx, cy + 28, sigName, 9, '#94a3b8').setOrigin(0.5);
    this.objects.push(sigLabel);

    const rosterUnit = this.runRoster?.get(unit.unitId);
    const hpLabel = this.text(cx, cy + 46, rosterUnit?.status === 'ko' ? 'KO' : rosterUnit ? `${rosterUnit.currentHp} / ${rosterUnit.maxHp} HP` : `Rec: ${recommendedRows(unit.role)}`, 8, rosterUnit?.status === 'ko' ? '#ef4444' : '#94a3b8', 'bold').setOrigin(0.5);
    this.objects.push(hpLabel);

    // Interactive Drag and Click Handlers
    const hitArea = this.scene.add
      .rectangle(cx, cy, w, h, 0xffffff, 0.0001)
      .setInteractive({ useHandCursor: true });
    this.objects.push(hitArea);

    if (rosterUnit?.status !== 'ko') hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.startDrag(unit.unitId, null, pointer));

    hitArea.on('pointerup', () => {
      if (this.controller.state.mode === 'idle') {
        this.controller.selectUnit(unit.unitId);
        this.render();
      }
    });
  }

  private renderRightCTA(layout: BattleSetupLayoutMetrics): void {
    const x = layout.panelX;
    const y = layout.storedEnergyY;
    const w = 258;
    const h = 210;

    // Outer card
    const cardBg = drawCard(this.scene, x, y, w, h, HudTokens.colors.bgSurface, 0.95);
    this.objects.push(cardBg);

    // Stored Energy section
    const rawEnergy = this.storedEnergy(); const energyEntries = setupEnergyInventory(Array.isArray(rawEnergy) ? rawEnergy : []); const totalEnergy = energyEntries.reduce((sum, entry) => sum + entry.charges, 0);
    const energyTitle = this.text(x + 14, y + 14, `⚡ STORED ENERGY ×${totalEnergy}`, 11, HudTokens.colors.textGold, 'bold'); this.objects.push(energyTitle);
    energyEntries.slice(0, 6).forEach((entry, index) => { const px = x + 24 + Math.floor(index / 3) * 106; const py = y + 39 + (index % 3) * 21; const icon = createIconImage(this.scene, entry.energyId, px, py, 16); const label = this.text(px + 14, py - 6, `${entry.shortLabel} ×${entry.charges}`, 9, '#fef3c7', 'bold'); this.objects.push(icon, label); });

    // Global Link Shard count
    const shards = this.shardPool?.count ?? 0;
    const shardBadge = this.text(x + w - 88, y + 14, `◆ LINK ×${shards}`, 10, '#38bdf8', 'bold', '#0c4a6e', { x: 5, y: 2 });
    this.objects.push(shardBadge);

    this.text(x + 14, y + 94, 'Cast during Battle', 9, HudTokens.colors.textMuted);

    // START BATTLE CTA button
    const squad = this.squadPresentation();
    const activeCount = squad.activeCount;
    const allPlaced = activeCount >= 1 && activeCount <= ACTIVE_SQUAD_LIMIT;
    const btnW = w - 28;
    const btnH = 54;
    const btnX = x + w / 2;
    const btnY = y + h - 42;

    const btnBg = this.scene.add
      .rectangle(btnX, btnY, btnW, btnH, allPlaced ? HudTokens.colors.goldDark : 0x1e293b, 1)
      .setStrokeStyle(1.5, allPlaced ? HudTokens.colors.gold : 0x334155);

    const btnLabel = this.text(
      btnX,
      allPlaced ? btnY - 7 : btnY - 8,
      allPlaced ? 'START BATTLE ⚔' : 'START BATTLE',
      14,
      allPlaced ? '#ffffff' : '#64748b',
      'bold',
    ).setOrigin(0.5);

    const btnSub = this.text(
      btnX,
      allPlaced ? btnY + 11 : btnY + 10,
      allPlaced ? squad.ctaSummary : 'Deploy at least 1 Beast',
      9,
      allPlaced ? '#fef08a' : '#f59e0b',
      'bold',
    ).setOrigin(0.5);

    this.objects.push(btnBg, btnLabel, btnSub);

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

  private startDrag(unitId: string, fromSlotId: string | null, pointer: Phaser.Input.Pointer): void {
    const started = fromSlotId
      ? this.controller.startDragFromBoard(unitId, fromSlotId)
      : this.controller.startDragFromTray(unitId);

    if (!started) return;

    const unit = this.formation.getUnit(unitId);
    if (!unit) return;

    // Create Drag Ghost
    this.createDragGhost(unit, pointer.x, pointer.y);
    this.showDragCapacityAffordances();
  }

  private createDragGhost(unit: FormationUnit, startX: number, startY: number): void {
    if (this.dragGhost) {
      this.dragGhost.destroy();
    }

    const container = this.scene.add.container(startX, startY);
    container.setDepth(200);

    const bg = this.scene.add
      .rectangle(0, 0, 80, 72, 0x0f172a, 0.95)
      .setStrokeStyle(2, 0x38bdf8, 1);

    const icon = createIconImage(this.scene, unit.beastId, -16, -6, 36);
    const roleIcon = createRoleIconImage(this.scene, unit.role, 20, -18, 18);
    const stars = this.text(20, 2, '★'.repeat(unit.star), 10, HudTokens.colors.textGold, 'bold').setOrigin(0.5);
    const name = this.text(0, 20, beastDisplayName(unit.beastId), 8, '#ffffff', 'bold').setOrigin(0.5);

    container.add([bg, icon, roleIcon, stars, name]);
    container.setScale(1.1);

    this.dragGhost = container;
  }

  private setupGlobalPointerListeners(): void {
    this.pointerMoveHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.controller.state.mode === 'idle' || !this.dragGhost) return;

      this.dragGhost.setPosition(pointer.x, pointer.y);

      // Check slot collision
      const hoveredSlot = this.playerSlotVisuals.find((slot) => {
        return (
          pointer.x >= slot.x - slot.width / 2 &&
          pointer.x <= slot.x + slot.width / 2 &&
          pointer.y >= slot.y - slot.height / 2 &&
          pointer.y <= slot.y + slot.height / 2
        );
      });

      const isOverBench =
        pointer.x >= this.trayBounds.x &&
        pointer.x <= this.trayBounds.x + this.trayBounds.width &&
        pointer.y >= this.trayBounds.y &&
        pointer.y <= this.trayBounds.y + this.trayBounds.height;

      this.controller.updateHover(hoveredSlot ? hoveredSlot.slotId : null, isOverBench);
      this.updateHoverPreview(hoveredSlot);
    };

    this.pointerUpHandler = () => {
      if (this.controller.state.mode === 'idle') return;

      const targetSlot = this.controller.state.hoverSlotId;
      const isOverBench = this.controller.state.hoverBench;
      const outcome = this.controller.commitDrop(targetSlot, isOverBench);

      this.cleanupDragVisuals();

      const slotTarget = targetSlot ? this.playerSlotVisuals.find((s) => s.slotId === targetSlot) : undefined;
      this.handleOutcome(outcome, slotTarget?.x, slotTarget?.y);
    };

    this.scene.input.on('pointermove', this.pointerMoveHandler);
    this.scene.input.on('pointerup', this.pointerUpHandler);
  }

  private updateHoverPreview(target?: SlotVisualTarget): void {
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }

    if (!target) return;

    const unitId = this.controller.state.draggedUnitId;
    if (!unitId) return;
    const unit = this.formation.getUnit(unitId);
    if (!unit) return;

    const slot = this.formation.getSlot(target.slotId);
    const isOccupied = Boolean(slot?.unitId && slot.unitId !== unitId);
    const squad = this.squadPresentation();
    const affordance = reserveTargetAffordance(squad.activeCount, isOccupied, this.controller.state.mode === 'draggingFromTray');

    const container = this.scene.add.container(target.x, target.y);
    container.setDepth(150);

    const previewBg = this.scene.add
      .rectangle(0, 0, target.width - 6, target.height - 6, affordance === 'swap' ? 0xd97706 : affordance === 'blocked' ? 0x334155 : 0x0284c7, affordance === 'blocked' ? 0.35 : 0.45)
      .setStrokeStyle(2, affordance === 'swap' ? 0xfbbf24 : affordance === 'blocked' ? 0x64748b : 0x38bdf8, 0.9);

    if (affordance === 'swap') {
      const swapText = this.text(0, 0, '⇄ SWAP', 11, '#fef08a', 'bold').setOrigin(0.5);
      container.add([previewBg, swapText]);
    } else if (affordance === 'blocked') {
      const blockedText = this.text(0, 0, 'SQUAD FULL', 8, '#94a3b8', 'bold').setOrigin(0.5);
      container.add([previewBg, blockedText]);
    } else {
      const previewIcon = createIconImage(this.scene, unit.beastId, 0, 0, 32).setAlpha(0.65);
      container.add([previewBg, previewIcon]);
    }

    this.hoverPreviewContainer = container;
  }

  private highlightValidTargetCells(highlight: boolean): void {
    this.playerSlotVisuals.forEach((slotTarget) => {
      const slot = this.formation.getSlot(slotTarget.slotId);
      if (slot && slot.unitId === null) {
        // Soft border illumination
      }
    });
  }

  private cleanupDragVisuals(): void {
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = undefined;
    }
    if (this.hoverPreviewContainer) {
      this.hoverPreviewContainer.destroy();
      this.hoverPreviewContainer = undefined;
    }
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    this.highlightValidTargetCells(false);
  }

  private handleOutcome(outcome: DropOutcome, x?: number, y?: number): void {
    switch (outcome.type) {
      case 'placed':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0x38bdf8, 32);
          FeedbackEffects.floatText(this.scene, x, y - 20, 'SNAP DEPLOY', '#22c55e', '11px', 450);
        }
        this.render();
        break;

      case 'moved':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0x38bdf8, 30);
          FeedbackEffects.floatText(this.scene, x, y - 20, 'MOVED', '#38bdf8', '11px', 450);
        }
        this.render();
        break;

      case 'swapped':
      case 'benchSwap':
        this.onArrangementChanged();
        if (x !== undefined && y !== undefined) {
          FeedbackEffects.pulseRing(this.scene, x, y, 0xfbbf24, 34);
          FeedbackEffects.floatText(this.scene, x, y - 20, '⇄ SWAPPED', '#fbbf24', '11px', 450);
        }
        this.render();
        break;

      case 'returnedToBench':
        this.onArrangementChanged();
        FeedbackEffects.floatText(this.scene, this.trayBounds.x + 200, this.trayBounds.y + 40, 'RETURNED TO BENCH', '#94a3b8', '11px', 450);
        this.render();
        break;

      case 'rejected':
        FeedbackEffects.floatText(
          this.scene,
          x ?? 360,
          (y ?? 170) - 20,
          outcome.reason === 'Active Squad full' ? 'SQUAD FULL — 4 / 4' : outcome.reason.toUpperCase(),
          '#fbbf24',
          '11px',
          750,
        );
        this.render();
        break;

      case 'selected':
      case 'deselected':
        this.render();
        break;

      case 'cancelled':
      default:
        this.render();
        break;
    }
  }

  private text(
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
    this.objects.push(text);
    return text;
  }

  private renderConsolidationInspector(x: number, y: number, width: number): void {
    const selectedId = this.controller.selectedId;
    const selected = selectedId ? this.formation.getUnit(selectedId) : undefined;
    const rosterUnit = selected ? this.runRoster?.get(selected.unitId) : undefined;
    if (!selected || !rosterUnit || selected.slotId !== null) {
      this.text(x, y, 'SELECT A RESERVE BEAST\nTO VIEW STAR CONSOLIDATION', 8, '#64748b', 'bold');
      return;
    }

    const deployedIds = new Set(this.formation.units.filter((unit) => unit.slotId !== null).map((unit) => unit.unitId));
    const availableShards = this.shardPool?.count ?? 0;
    const preview = this.runRoster?.consolidationPreview(selected.unitId, deployedIds, availableShards);
    const targetStars = preview?.targetStar ? '★'.repeat(preview.targetStar) : 'MAX STAR';
    const copies = preview ? `${preview.eligibleCount} / 3` : '0 / 3';
    const shardTag = preview?.isShardAssisted ? '  ·  ◆ LINK ×1' : '';
    this.text(x, y, `${beastDisplayName(selected.beastId)}  ${'★'.repeat(selected.star)}\nHP ${rosterUnit.currentHp} / ${rosterUnit.maxHp}  ·  SAME COPY ${copies}${shardTag}`, 8, '#cbd5e1', 'bold');

    if (!preview || preview.targetStar === null) {
      this.text(x, y + 34, 'MAX STAR', 8, '#fbbf24', 'bold');
      return;
    }

    const canDo = preview.canConsolidate;
    let buttonLabel = `NEED ${Math.max(0, 3 - preview.eligibleCount)} MORE ★`;
    let tradeoffText = 'Requires 3 ready Reserve copies';

    if (canDo) {
      buttonLabel = `CONSOLIDATE → ${targetStars}`;
      tradeoffText = preview.isShardAssisted ? '2 COPIES + ◆1' : '3 COPIES';
    } else if (preview.eligibleCount === 2) {
      buttonLabel = 'NEED 1 MORE ★ OR ◆1';
      tradeoffText = '2 copies ready · 0 Link Shard';
    } else {
      buttonLabel = `NEED ${3 - preview.eligibleCount} MORE ★`;
      tradeoffText = 'Minimum 2 copies required';
    }

    const button = this.text(
      x,
      y + 34,
      buttonLabel,
      8,
      canDo ? '#fef08a' : '#64748b',
      'bold',
      canDo ? '#78350f' : '#1e293b',
      { x: 6, y: 3 },
    );
    const tradeoff = this.text(x, y + 52, tradeoffText, 7, '#94a3b8', 'bold');
    this.objects.push(button, tradeoff);
    if (canDo && this.onConsolidate) {
      button.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        const upgradedId = this.onConsolidate!(selected.unitId);
        if (upgradedId) {
          this.controller.selectUnit(null);
          this.controller.selectUnit(upgradedId);
          FeedbackEffects.floatText(this.scene, x + width / 2, y + 35, `CONSOLIDATED → ${targetStars}`, '#fbbf24', '10px', 700);
          this.onArrangementChanged();
        }
        this.render();
      });
    }
  }

  private squadPresentation() {
    const units = this.formation.units;
    const isLiving = (unit: FormationUnit) => this.runRoster?.canDeploy(unit.unitId) ?? true;
    return activeSquadPresentation(
      units.filter((unit) => unit.slotId !== null && isLiving(unit)).length,
      units.filter((unit) => unit.slotId === null && isLiving(unit)).length,
      units.filter((unit) => unit.slotId === null && !isLiving(unit)).length,
    );
  }

  /** Temporary drag affordances avoid rebuilding the view (which would cancel the drag). */
  private showDragCapacityAffordances(): void {
    this.dragAffordanceObjects.splice(0).forEach((object) => object.destroy());
    if (this.controller.state.mode !== 'draggingFromTray') return;

    const squad = this.squadPresentation();
    this.playerSlotVisuals.forEach((target) => {
      const slot = this.formation.getSlot(target.slotId);
      const affordance = reserveTargetAffordance(squad.activeCount, Boolean(slot?.unitId), true);
      if (affordance === 'place') {
        const glow = this.scene.add.rectangle(target.x, target.y, target.width - 4, target.height - 4, 0x0284c7, 0.12).setStrokeStyle(1.5, 0x38bdf8, 0.7);
        glow.setDepth(120);
        this.dragAffordanceObjects.push(glow);
      } else if (affordance === 'blocked') {
        const dim = this.scene.add.rectangle(target.x, target.y, target.width - 4, target.height - 4, 0x0f172a, 0.45).setStrokeStyle(1.5, 0x475569, 0.8);
        const lock = this.text(target.x, target.y, 'LOCK', 7, '#94a3b8', 'bold').setOrigin(0.5);
        dim.setDepth(120); lock.setDepth(121);
        this.dragAffordanceObjects.push(dim, lock);
      } else {
        const swap = this.text(target.x, target.y - target.height / 2 + 7, '⇄ SWAP', 7, '#fef08a', 'bold', '#78350f', { x: 3, y: 1 }).setOrigin(0.5);
        swap.setDepth(121);
        this.dragAffordanceObjects.push(swap);
      }
    });
  }
}

function roleStrokeColor(role: FormationUnit['role']): number {
  if (role === 'Tanker') return 0xfacc15;
  if (role === 'Assassin') return 0xf97316;
  if (role === 'Ranger') return 0x22c55e;
  return 0xa855f7;
}

function roleTextColor(role: FormationUnit['role']): string {
  if (role === 'Tanker') return '#facc15';
  if (role === 'Assassin') return '#f97316';
  if (role === 'Ranger') return '#22c55e';
  return '#a855f7';
}

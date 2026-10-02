import Phaser from 'phaser';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import type { EnemyFixture } from '../battle/AutonomousBattleModel';
import { recommendedRows } from '../battle/BeastRoles';
import { createBattleFieldLayout, enemySlotPosition, playerSlotPosition } from './BattleFieldLayout';
import { HudTokens, drawCard } from './layout/HudTokens';
import { createIconImage } from './icons/IconFactory';

export interface BattleSetupLayoutMetrics {
  panelX: number;
  storedEnergyY: number;
  unplacedHeadingY: number;
  listStartY: number;
  listMaxVisibleCount: number;
  startBattleY: number;
  viewportHeight: number;
}

/**
 * Landscape Battle Setup preview:
 * Mirrored player placement vs enemy preview on left ~70%,
 * structured right panel (~30%) with pinned Start Battle CTA.
 */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private selectedUnitId: string | null = null;
  private unplacedPage = 0;
  private readonly maxCardsPerPage = 4;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly enemies: ReadonlyArray<EnemyFixture>,
    private readonly storedEnergy: () => string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void,
  ) {}

  static computeLayout(viewportHeight = 720): BattleSetupLayoutMetrics {
    const panelX = 910;
    const storedEnergyY = 86;
    const unplacedHeadingY = 196;
    const listStartY = 236;
    const startBattleY = Math.min(640, viewportHeight - 80);
    return {
      panelX,
      storedEnergyY,
      unplacedHeadingY,
      listStartY,
      listMaxVisibleCount: 4,
      startBattleY,
      viewportHeight,
    };
  }

  getUnplacedUnits(): FormationUnit[] {
    return this.formation.units.filter((unit) => unit.slotId === null);
  }

  render(): void {
    this.destroy();

    const viewportH = this.scene.scale.height || 720;
    const layoutMetrics = BattleSetupView.computeLayout(viewportH);

    // Battlefield Header
    this.text(26, 88, 'BATTLE SETUP', 18, HudTokens.colors.textPrimary, 'bold');
    this.text(
      26,
      112,
      'Deploy your Beasts to match up against the enemy squad. Tap a unit then tap a slot.',
      11,
      HudTokens.colors.textMuted,
    );

    this.renderBattleField();
    this.renderRightPanel(layoutMetrics);
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  private renderBattleField(): void {
    const layout = createBattleFieldLayout(20, 80);

    // Subtle arena boundary rectangle
    const arenaW = layout.dividerX + 380 - layout.baseX;
    const arenaH = layout.dividerHeight + 20;
    const arenaBg = this.scene.add
      .rectangle(layout.baseX + arenaW / 2 + 10, layout.dividerY, arenaW, arenaH, 0x111827, 0.5)
      .setStrokeStyle(1, 0x1e293b);
    this.objects.push(arenaBg);

    // Section Labels
    this.text(layout.playerFrontX - 160, layout.topLaneY - 48, '◀ PLAYER FORMATION', 11, HudTokens.colors.textBlue, 'bold');
    this.text(layout.enemyFrontX + 24, layout.topLaneY - 48, 'ENEMY FORMATION ▶', 11, HudTokens.colors.textRed, 'bold');

    // Central Divider
    const divider = this.scene.add.rectangle(
      layout.dividerX,
      layout.dividerY,
      2,
      layout.dividerHeight,
      0x475569,
      0.9,
    );
    this.objects.push(divider);

    const rows: Array<FormationSlot['row']> = ['Front', 'Mid', 'Back'];
    rows.forEach((row) => {
      const playerDepth = playerSlotPosition(layout, row, 1);
      const enemyDepth = enemySlotPosition(layout, row, 1);
      this.text(playerDepth.x, layout.topLaneY - 26, row.toUpperCase(), 10, '#64748b', 'bold').setOrigin(0.5);
      this.text(enemyDepth.x, layout.topLaneY - 26, row.toUpperCase(), 10, '#991b1b', 'bold').setOrigin(0.5);

      for (let column = 1; column <= 6; column += 1) {
        const playerPos = playerSlotPosition(layout, row, column);
        const enemyPos = enemySlotPosition(layout, row, column);

        // Player Slot
        const playerSlot = this.scene.add
          .rectangle(playerPos.x, playerPos.y, layout.slotWidth, layout.slotHeight, 0x1e293b, 0.6)
          .setStrokeStyle(1.5, 0x3b82f6, 0.5);
        this.objects.push(playerSlot);

        // Enemy Slot
        const enemySlot = this.scene.add
          .rectangle(enemyPos.x, enemyPos.y, layout.slotWidth, layout.slotHeight, 0x1e293b, 0.6)
          .setStrokeStyle(1.5, 0xef4444, 0.4);
        this.objects.push(enemySlot);

        const formationSlot = this.formation.slots.find((slot) => slot.row === row && slot.column === column);
        if (formationSlot) this.renderPlayerSlot(formationSlot, playerPos.x, playerPos.y, layout);
      }
    });

    // Lane labels L1..L6
    for (let column = 1; column <= 6; column += 1) {
      const laneY = playerSlotPosition(layout, 'Front', column).y;
      this.text(layout.baseX + 10, laneY, `L${column}`, 10, '#64748b', 'bold').setOrigin(0, 0.5);
    }

    // Enemy units preview
    this.enemies.forEach((enemy) => {
      const pos = enemySlotPosition(layout, enemy.row, enemy.column);
      const body = this.scene.add
        .rectangle(pos.x, pos.y, 48, 44, 0x7f1d1d, 0.95)
        .setStrokeStyle(1.5, 0xf87171);

      const label = this.text(
        pos.x,
        pos.y - 2,
        `${enemy.enemyId.replace('enemy-', '').toUpperCase()}\n${enemy.maxHp} HP\n⚔${enemy.damage}`,
        9,
        '#ffffff',
        'bold',
      ).setOrigin(0.5);
      this.objects.push(body, label);
    });
  }

  private renderPlayerSlot(slot: FormationSlot, x: number, y: number, layout: ReturnType<typeof createBattleFieldLayout>): void {
    const unit = slot.unitId
      ? this.formation.units.find((candidate) => candidate.unitId === slot.unitId)
      : undefined;

    if (unit) {
      const isSelected = unit.unitId === this.selectedUnitId;
      const body = this.scene.add
        .rectangle(x, y, 54, 48, 0x1e293b, 0.95)
        .setStrokeStyle(isSelected ? 3 : 1.5, isSelected ? 0xfbbf24 : roleFill(unit.role));

      const icon = createIconImage(this.scene, unit.beastId, x, y - 5, 34);

      const stars = '★'.repeat(unit.star);
      const starBadge = this.text(
        x,
        y + 16,
        stars,
        10,
        HudTokens.colors.textGold,
        'bold',
      ).setOrigin(0.5);

      const selectSlot = () => {
        this.selectedUnitId = unit.unitId;
        this.render();
      };
      body.setInteractive({ useHandCursor: true }).on('pointerup', selectSlot);
      icon.setInteractive({ useHandCursor: true }).on('pointerup', selectSlot);
      starBadge.setInteractive({ useHandCursor: true }).on('pointerup', selectSlot);
      this.objects.push(body, icon, starBadge);
      return;
    }

    // Empty slot ready for placement
    const hit = this.scene.add
      .rectangle(x, y, layout.slotWidth, layout.slotHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => this.placeSelected(slot.slotId));
    this.objects.push(hit);
  }

  private renderRightPanel(layout: BattleSetupLayoutMetrics): void {
    const panelX = layout.panelX;
    const panelW = 340;

    // CARD 1: STORED ENERGY
    const energyCardH = 92;
    const energyBg = drawCard(this.scene, panelX, layout.storedEnergyY, panelW, energyCardH, HudTokens.colors.bgSurface, 0.94);
    const energyTitle = this.text(panelX + 16, layout.storedEnergyY + 12, 'STORED ENERGY', 11, HudTokens.colors.textGold, 'bold');
    const energyContent = this.text(panelX + 16, layout.storedEnergyY + 34, this.storedEnergy(), 11, HudTokens.colors.textPrimary);
    this.objects.push(energyBg, energyTitle, energyContent);

    // CARD 2: UNPLACED UNITS LIST
    const unplacedUnits = this.getUnplacedUnits();
    const totalUnplaced = unplacedUnits.length;
    const maxPages = Math.max(1, Math.ceil(totalUnplaced / this.maxCardsPerPage));
    if (this.unplacedPage >= maxPages) this.unplacedPage = Math.max(0, maxPages - 1);

    const unplacedCardH = 320;
    const unplacedCardY = layout.unplacedHeadingY;
    const unplacedBg = drawCard(this.scene, panelX, unplacedCardY, panelW, unplacedCardH, HudTokens.colors.bgSurface, 0.94);
    const unplacedHeading = this.text(
      panelX + 16,
      unplacedCardY + 14,
      totalUnplaced > 0 ? `UNPLACED UNITS (${totalUnplaced})` : 'UNPLACED UNITS',
      12,
      HudTokens.colors.textSecondary,
      'bold',
    );
    this.objects.push(unplacedBg, unplacedHeading);

    let currentY = unplacedCardY + 44;
    if (totalUnplaced === 0) {
      const placedStatus = this.text(
        panelX + 16,
        currentY + 10,
        this.formation.units.length
          ? '✓ All units deployed!\nReady for Battle.'
          : 'No converted units available.',
        12,
        this.formation.units.length ? HudTokens.colors.textGreen : HudTokens.colors.textMuted,
        this.formation.units.length ? 'bold' : '',
      );
      this.objects.push(placedStatus);
    } else {
      const startIndex = this.unplacedPage * this.maxCardsPerPage;
      const pageUnits = unplacedUnits.slice(startIndex, startIndex + this.maxCardsPerPage);
      pageUnits.forEach((unit) => {
        currentY += this.renderUnitCard(unit, panelX + 14, currentY, panelW - 28) + 6;
      });

      // Pagination controls
      if (maxPages > 1) {
        const pageControlsY = unplacedCardY + unplacedCardH - 36;
        this.text(panelX + panelW / 2, pageControlsY + 8, `${this.unplacedPage + 1} / ${maxPages}`, 11, HudTokens.colors.textMuted).setOrigin(0.5);

        if (this.unplacedPage > 0) {
          const prev = this.text(panelX + 16, pageControlsY, '◀ PREV', 11, '#ffffff', 'bold', '#334155', { x: 8, y: 4 });
          prev.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage -= 1;
            this.render();
          });
        }
        if (this.unplacedPage < maxPages - 1) {
          const next = this.text(panelX + panelW - 74, pageControlsY, 'NEXT ▶', 11, '#ffffff', 'bold', '#334155', { x: 8, y: 4 });
          next.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage += 1;
            this.render();
          });
        }
      }
    }

    // FIXED PINNED BOTTOM CTA: START BATTLE
    const allPlaced = this.formation.allPlaced;
    const btnY = layout.startBattleY;
    const btnH = 46;

    if (!allPlaced && this.formation.units.length) {
      const warning = this.text(
        panelX + panelW / 2,
        btnY - 14,
        `Deploy remaining ${totalUnplaced} unit(s) to start`,
        11,
        HudTokens.colors.textGold,
        'bold',
      ).setOrigin(0.5);
      this.objects.push(warning);
    }

    const btnBg = this.scene.add
      .rectangle(
        panelX + panelW / 2,
        btnY + btnH / 2,
        panelW,
        btnH,
        allPlaced ? HudTokens.colors.goldDark : 0x334155,
        1,
      )
      .setStrokeStyle(1.5, allPlaced ? HudTokens.colors.gold : 0x475569);

    const btnLabel = this.text(
      panelX + panelW / 2,
      btnY + btnH / 2,
      allPlaced ? 'START BATTLE ⚔' : 'PLACE ALL UNITS TO START',
      13,
      allPlaced ? '#ffffff' : HudTokens.colors.textMuted,
      'bold',
    ).setOrigin(0.5);

    if (allPlaced) {
      btnBg.setInteractive({ useHandCursor: true });
      btnLabel.setInteractive({ useHandCursor: true });
      let started = false;
      const onStart = () => {
        if (started) return;
        started = true;
        this.startBattle();
      };
      btnBg.on('pointerup', onStart);
      btnLabel.on('pointerup', onStart);
    }
    this.objects.push(btnBg, btnLabel);
  }

  private renderUnitCard(unit: FormationUnit, x: number, y: number, cardWidth: number): number {
    const selected = unit.unitId === this.selectedUnitId;
    const cardHeight = 44;

    const card = this.scene.add
      .rectangle(
        x + cardWidth / 2,
        y + cardHeight / 2,
        cardWidth,
        cardHeight,
        selected ? 0x1e3a5f : 0x111827,
        0.9,
      )
      .setStrokeStyle(selected ? 2 : 1, selected ? 0x38bdf8 : 0x334155);
    this.objects.push(card);

    const icon = createIconImage(this.scene, unit.beastId, x + 22, y + cardHeight / 2, 32);
    this.objects.push(icon);

    const letter = displayBeast(unit.beastId);
    const label = `Beast ${letter} · ${unit.role} · ${'★'.repeat(unit.star)}`;
    const sub = `Rec: ${recommendedRows(unit.role)} row`;
    const text = this.text(x + 44, y + 6, label, 11, HudTokens.colors.textPrimary, selected ? 'bold' : '');
    const subText = this.text(x + 44, y + 24, sub, 10, HudTokens.colors.textMuted);

    const selectHandler = () => {
      this.selectedUnitId = unit.unitId;
      this.render();
    };
    card.setInteractive({ useHandCursor: true }).on('pointerup', selectHandler);
    text.setInteractive({ useHandCursor: true }).on('pointerup', selectHandler);
    return cardHeight;
  }

  private placeSelected(slotId: string): void {
    const unit = this.selectedUnitId
      ? this.formation.units.find((candidate) => candidate.unitId === this.selectedUnitId)
      : undefined;
    const wasPlaced = unit?.slotId !== null && unit?.slotId !== slotId;

    if (this.selectedUnitId && this.formation.place(this.selectedUnitId, slotId)) {
      if (wasPlaced) this.onArrangementChanged();
      this.selectedUnitId = null;
      this.render();
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
}

function displayBeast(beastId: string): string {
  return (beastId.split('-').at(-1) ?? beastId).toUpperCase();
}

function roleFill(role: FormationUnit['role']): number {
  if (role === 'Tanker') return 0xfacc15;
  if (role === 'Assassin') return 0xf97316;
  if (role === 'Ranger') return 0x22c55e;
  return 0xa78bfa;
}

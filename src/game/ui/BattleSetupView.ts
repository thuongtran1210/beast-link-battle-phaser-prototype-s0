import Phaser from 'phaser';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import { recommendedRows } from '../battle/BeastRoles';

export interface BattleSetupLayoutMetrics {
  panelX: number;
  storedEnergyY: number;
  unplacedHeadingY: number;
  listStartY: number;
  listMaxVisibleCount: number;
  startBattleY: number;
  viewportHeight: number;
}

/** P1-S2 presentation for the Experimental 3×6 formation fixture. */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private selectedUnitId: string | null = null;
  private unplacedPage = 0;
  private readonly maxCardsPerPage = 5;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly storedEnergy: () => string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void
  ) {}

  /** Pure layout metrics calculation for verification and deterministic testing. */
  static computeLayout(viewportHeight = 760): BattleSetupLayoutMetrics {
    const panelX = 660;
    const storedEnergyY = 148;
    const unplacedHeadingY = 250;
    const listStartY = 278;
    const startBattleY = Math.min(680, viewportHeight - 80);
    return {
      panelX,
      storedEnergyY,
      unplacedHeadingY,
      listStartY,
      listMaxVisibleCount: 5,
      startBattleY,
      viewportHeight,
    };
  }

  /** Returns only units that have not yet been placed in a slot. */
  getUnplacedUnits(): FormationUnit[] {
    return this.formation.units.filter((unit) => unit.slotId === null);
  }

  render(): void {
    this.destroy();
    this.text(30, 104, 'BATTLE SETUP', 21, '#18212b', 'bold');
    this.text(30, 136, 'Select a unit, then select an empty slot. The 3×6 grid is Experimental / prototype-only.', 13, '#66737f');
    this.renderGrid();

    const layout = BattleSetupView.computeLayout(this.scene.scale.height || 760);
    const panelX = layout.panelX;

    // 1. STORED ENERGY (bounded top section)
    this.text(panelX, layout.storedEnergyY, 'STORED ENERGY', 15, '#18212b', 'bold');
    this.text(panelX, layout.storedEnergyY + 22, this.storedEnergy(), 13, '#44525f');

    // 2. UNPLACED UNITS (only units with slotId === null)
    const unplacedUnits = this.getUnplacedUnits();
    const totalUnplaced = unplacedUnits.length;
    const maxPages = Math.max(1, Math.ceil(totalUnplaced / this.maxCardsPerPage));
    if (this.unplacedPage >= maxPages) {
      this.unplacedPage = Math.max(0, maxPages - 1);
    }

    const unplacedTitle = totalUnplaced > 0
      ? `UNPLACED UNITS (${totalUnplaced})`
      : 'UNPLACED UNITS';
    this.text(panelX, layout.unplacedHeadingY, unplacedTitle, 15, '#18212b', 'bold');

    let currentY = layout.listStartY;

    if (totalUnplaced === 0) {
      if (!this.formation.units.length) {
        this.text(panelX, currentY, 'No converted units available.', 13, '#66737f');
      } else {
        this.text(panelX, currentY, 'All converted units are placed in grid.', 13, '#15803d', 'bold');
      }
    } else {
      const startIndex = this.unplacedPage * this.maxCardsPerPage;
      const pageUnits = unplacedUnits.slice(startIndex, startIndex + this.maxCardsPerPage);

      pageUnits.forEach((unit) => {
        const cardHeight = this.renderUnitCard(unit, panelX, currentY);
        currentY += cardHeight + 6;
      });

      // Pagination controls if more units than one page
      if (maxPages > 1) {
        const pageLabel = `Page ${this.unplacedPage + 1}/${maxPages}`;
        this.text(panelX + 76, currentY + 4, pageLabel, 12, '#44525f');

        if (this.unplacedPage > 0) {
          const prevBtn = this.text(panelX, currentY, '◀ PREV', 12, '#ffffff', 'bold', '#475569', { x: 8, y: 4 });
          prevBtn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage -= 1;
            this.render();
          });
        }

        if (this.unplacedPage < maxPages - 1) {
          const nextBtn = this.text(panelX + 180, currentY, 'NEXT ▶', 12, '#ffffff', 'bold', '#475569', { x: 8, y: 4 });
          nextBtn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage += 1;
            this.render();
          });
        }
      }
    }

    // 3. FIXED BOTTOM ACTION AREA (START BATTLE)
    // Docked at fixed layout.startBattleY regardless of unplaced card count
    const allPlaced = this.formation.allPlaced;
    const actionY = layout.startBattleY;

    if (!this.formation.units.length) {
      this.text(panelX, actionY - 22, 'No units: Start Battle disabled.', 12, '#b91c1c');
    } else if (!allPlaced) {
      this.text(panelX, actionY - 20, `${totalUnplaced} unplaced unit(s) remaining`, 12, '#9a3412');
    }

    const start = this.text(
      panelX,
      actionY,
      allPlaced ? 'START BATTLE' : 'START BATTLE — PLACE ALL UNITS',
      15,
      allPlaced ? '#ffffff' : '#66737f',
      'bold',
      allPlaced ? '#b45309' : '#d1d5db',
      { x: 14, y: 10 }
    );
    if (allPlaced) {
      let started = false;
      start.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        if (started) return;
        started = true;
        this.startBattle();
      });
    }
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  private renderUnitCard(unit: FormationUnit, x: number, y: number): number {
    const selected = unit.unitId === this.selectedUnitId;
    const cardWidth = 260;
    const cardHeight = 46;

    const card = this.scene.add
      .rectangle(x + cardWidth / 2, y + cardHeight / 2, cardWidth, cardHeight, selected ? 0xdbeafe : 0xffffff)
      .setStrokeStyle(2, selected ? 0x2563eb : 0x8c8273);
    this.objects.push(card);

    const label = `${displayBeast(unit.beastId)} · ${unit.role} · ${unit.star}★\nRecommended: ${recommendedRows(unit.role)}`;
    const text = this.text(x + 10, y + 5, label, 12, '#18212b', selected ? 'bold' : '');

    const selectHandler = () => {
      this.selectedUnitId = unit.unitId;
      this.render();
    };

    card.setInteractive({ useHandCursor: true }).on('pointerup', selectHandler);
    text.setInteractive({ useHandCursor: true }).on('pointerup', selectHandler);

    return cardHeight;
  }

  private renderGrid(): void {
    this.text(30, 188, 'FORMATION GRID', 15, '#18212b', 'bold');
    const rows: Array<FormationSlot['row']> = ['Front', 'Mid', 'Back'];
    rows.forEach((row, rowIndex) => {
      const y = 220 + rowIndex * 94;
      this.text(30, y + 29, row.toUpperCase(), 13, '#44525f', 'bold');
      this.formation.slots
        .filter((slot) => slot.row === row)
        .forEach((slot) => this.slot(slot, 120 + (slot.column - 1) * 88, y));
    });
  }

  private slot(slot: FormationSlot, x: number, y: number): void {
    const unit = slot.unitId ? this.formation.units.find((candidate) => candidate.unitId === slot.unitId) : undefined;
    const fill = unit ? 0xfef3c7 : 0xf8fafc;
    const box = this.scene.add.rectangle(x + 35, y + 31, 70, 62, fill).setStrokeStyle(2, 0x8c8273);
    const label = unit ? `${displayBeast(unit.beastId)}\n${unit.role}\n${unit.star}★` : `${slot.row[0]}${slot.column}\nempty`;
    const text = this.text(x + 35, y + 31, label, 12, unit ? '#18212b' : '#94a3b8', unit ? 'bold' : '').setOrigin(0.5);
    box.setInteractive({ useHandCursor: true }).on('pointerup', () => this.placeSelected(slot.slotId));
    text.setInteractive({ useHandCursor: true }).on('pointerup', () => this.placeSelected(slot.slotId));
    this.objects.push(box);
  }

  private placeSelected(slotId: string): void {
    const unit = this.selectedUnitId ? this.formation.units.find((candidate) => candidate.unitId === this.selectedUnitId) : undefined;
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
    padding?: { x: number; y: number }
  ): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif',
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

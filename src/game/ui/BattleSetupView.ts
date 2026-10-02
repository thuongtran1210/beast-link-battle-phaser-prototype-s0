import Phaser from 'phaser';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import { recommendedRows } from '../battle/BeastRoles';

/** P1-S2 presentation for the Experimental 3×6 formation fixture. */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private selectedUnitId: string | null = null;
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly storedEnergy: () => string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void
  ) {}

  render(): void {
    this.destroy();
    this.text(30, 104, 'BATTLE SETUP', 21, '#18212b', 'bold');
    this.text(30, 136, 'Select a unit, then select an empty slot. The 3×6 grid is Experimental / prototype-only.', 13, '#66737f');
    this.renderGrid();

    // 1. Keep STORED ENERGY in its own vertical section.
    const panelX = 660;
    let currentY = 148;
    this.text(panelX, currentY, 'STORED ENERGY', 15, '#18212b', 'bold');
    currentY += 24;

    const energyText = this.text(panelX, currentY, this.storedEnergy(), 14, '#44525f');
    currentY += energyText.height + 24;

    // 2. Place UNPLACED UNITS completely below Stored Energy.
    this.text(panelX, currentY, 'UNPLACED UNITS', 15, '#18212b', 'bold');
    currentY += 24;

    if (!this.formation.units.length) {
      this.text(panelX, currentY, 'No converted units available.', 13, '#66737f');
      currentY += 28;
    } else {
      // 3. Render all unit cards without overlapping text.
      this.formation.units.forEach((unit) => {
        const cardHeight = this.renderUnitCard(unit, panelX, currentY);
        currentY += cardHeight + 8;
      });
    }

    currentY += 12;

    // 4. Place START BATTLE below the full unit list.
    const allPlaced = this.formation.allPlaced;
    if (!this.formation.units.length) {
      this.text(panelX, currentY, 'No converted units: Start Battle stays disabled.', 13, '#b91c1c');
      currentY += 24;
    }

    const start = this.text(
      panelX,
      currentY,
      allPlaced ? 'START BATTLE' : 'START BATTLE — PLACE ALL UNITS',
      15,
      allPlaced ? '#ffffff' : '#66737f',
      'bold',
      allPlaced ? '#b45309' : '#d1d5db',
      { x: 14, y: 10 }
    );
    if (allPlaced) {
      start.setInteractive({ useHandCursor: true }).on('pointerup', this.startBattle);
    }
  }

  destroy(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }

  private renderUnitCard(unit: FormationUnit, x: number, y: number): number {
    const selected = unit.unitId === this.selectedUnitId;
    const placed = unit.slotId !== null;
    const cardWidth = 260;
    const cardHeight = 48;

    const card = this.scene.add
      .rectangle(x + cardWidth / 2, y + cardHeight / 2, cardWidth, cardHeight, selected ? 0xdbeafe : 0xffffff)
      .setStrokeStyle(placed ? 1 : 2, selected ? 0x2563eb : 0x8c8273);
    this.objects.push(card);

    const label = `${displayBeast(unit.beastId)} · ${unit.role} · ${unit.star}★\n${placed ? `Placed: ${unit.slotId}` : `Recommended: ${recommendedRows(unit.role)}`}`;
    const text = this.text(x + 10, y + 6, label, 12, placed ? '#66737f' : '#18212b', selected ? 'bold' : '');

    card.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      this.selectedUnitId = unit.unitId;
      this.render();
    });
    text.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      this.selectedUnitId = unit.unitId;
      this.render();
    });

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

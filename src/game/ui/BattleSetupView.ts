import Phaser from 'phaser';
import { type BattleFormation, type FormationSlot, type FormationUnit } from '../battle/BattleFormation';
import type { EnemyFixture } from '../battle/AutonomousBattleModel';
import { recommendedRows } from '../battle/BeastRoles';
import { createBattleFieldLayout, enemySlotPosition, playerSlotPosition } from './BattleFieldLayout';

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
 * P1-V6 integrated Battle Setup preview:
 * player placement and enemy preview share the same battlefield used by Battle.
 */
export class BattleSetupView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private selectedUnitId: string | null = null;
  private unplacedPage = 0;
  private readonly maxCardsPerPage = 5;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly formation: BattleFormation,
    private readonly enemies: ReadonlyArray<EnemyFixture>,
    private readonly storedEnergy: () => string,
    private readonly startBattle: () => void,
    private readonly onArrangementChanged: () => void
  ) {}

  static computeLayout(viewportHeight = 760): BattleSetupLayoutMetrics {
    const panelX = 620;
    const storedEnergyY = 132;
    const unplacedHeadingY = 236;
    const listStartY = 264;
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

  getUnplacedUnits(): FormationUnit[] {
    return this.formation.units.filter((unit) => unit.slotId === null);
  }

  render(): void {
    this.destroy();

    this.text(30, 104, 'BATTLE SETUP · PREVIEW', 21, '#18212b', 'bold');
    this.text(
      30,
      134,
      'Arrange your Beasts while previewing the opposing enemy formation.',
      13,
      '#66737f'
    );

    this.renderBattleField();

    const layout = BattleSetupView.computeLayout(this.scene.scale.height || 760);
    const panelX = layout.panelX;

    this.text(panelX, layout.storedEnergyY, 'STORED ENERGY', 15, '#18212b', 'bold');
    this.text(panelX, layout.storedEnergyY + 22, this.storedEnergy(), 13, '#44525f');

    const unplacedUnits = this.getUnplacedUnits();
    const totalUnplaced = unplacedUnits.length;
    const maxPages = Math.max(1, Math.ceil(totalUnplaced / this.maxCardsPerPage));
    if (this.unplacedPage >= maxPages) this.unplacedPage = Math.max(0, maxPages - 1);

    this.text(
      panelX,
      layout.unplacedHeadingY,
      totalUnplaced > 0 ? `UNPLACED UNITS (${totalUnplaced})` : 'UNPLACED UNITS',
      15,
      '#18212b',
      'bold'
    );

    let currentY = layout.listStartY;
    if (totalUnplaced === 0) {
      this.text(
        panelX,
        currentY,
        this.formation.units.length ? 'All units placed. Review matchup, then start.' : 'No converted units available.',
        13,
        this.formation.units.length ? '#15803d' : '#66737f',
        this.formation.units.length ? 'bold' : ''
      );
    } else {
      const startIndex = this.unplacedPage * this.maxCardsPerPage;
      const pageUnits = unplacedUnits.slice(startIndex, startIndex + this.maxCardsPerPage);
      pageUnits.forEach((unit) => {
        currentY += this.renderUnitCard(unit, panelX, currentY) + 6;
      });

      if (maxPages > 1) {
        this.text(panelX + 76, currentY + 4, `Page ${this.unplacedPage + 1}/${maxPages}`, 12, '#44525f');
        if (this.unplacedPage > 0) {
          const prev = this.text(panelX, currentY, '◀ PREV', 12, '#ffffff', 'bold', '#475569', { x: 8, y: 4 });
          prev.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage -= 1;
            this.render();
          });
        }
        if (this.unplacedPage < maxPages - 1) {
          const next = this.text(panelX + 180, currentY, 'NEXT ▶', 12, '#ffffff', 'bold', '#475569', { x: 8, y: 4 });
          next.setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.unplacedPage += 1;
            this.render();
          });
        }
      }
    }

    const allPlaced = this.formation.allPlaced;
    if (!allPlaced && this.formation.units.length) {
      this.text(panelX, layout.startBattleY - 20, `${totalUnplaced} unplaced unit(s) remaining`, 12, '#9a3412');
    }

    const start = this.text(
      panelX,
      layout.startBattleY,
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

  private renderBattleField(): void {
    const layout = createBattleFieldLayout(18, 105);

    this.text(layout.baseX + 12, layout.baseY + 72, 'BATTLE FIELD · SETUP PREVIEW', 14, '#475569', 'bold');
    this.text(layout.playerFrontX - 150, layout.baseY + 102, 'PLAYER FORMATION →', 12, '#2563eb', 'bold');
    this.text(layout.enemyFrontX + 28, layout.baseY + 102, '← ENEMY FORMATION', 12, '#b91c1c', 'bold');

    const divider = this.scene.add.rectangle(
      layout.dividerX,
      layout.dividerY,
      3,
      layout.dividerHeight,
      0x94a3b8,
      0.9
    );
    this.objects.push(divider);

    const rows: Array<FormationSlot['row']> = ['Front', 'Mid', 'Back'];
    rows.forEach((row) => {
      const playerDepth = playerSlotPosition(layout, row, 1);
      const enemyDepth = enemySlotPosition(layout, row, 1);
      this.text(playerDepth.x - 24, layout.topLaneY - 42, row.toUpperCase(), 9, '#64748b', 'bold');
      this.text(enemyDepth.x - 24, layout.topLaneY - 42, row.toUpperCase(), 9, '#991b1b', 'bold');

      for (let column = 1; column <= 6; column += 1) {
        const playerPos = playerSlotPosition(layout, row, column);
        const enemyPos = enemySlotPosition(layout, row, column);

        const playerSlot = this.scene.add.rectangle(
          playerPos.x,
          playerPos.y,
          layout.slotWidth,
          layout.slotHeight,
          0xeff6ff,
          0.42
        ).setStrokeStyle(2, 0x93c5fd);
        this.objects.push(playerSlot);

        const enemySlot = this.scene.add.rectangle(
          enemyPos.x,
          enemyPos.y,
          layout.slotWidth,
          layout.slotHeight,
          0xfef2f2,
          0.42
        ).setStrokeStyle(2, 0xfca5a5);
        this.objects.push(enemySlot);

        const formationSlot = this.formation.slots.find((slot) => slot.row === row && slot.column === column);
        if (formationSlot) this.renderPlayerSlot(formationSlot, playerPos.x, playerPos.y);
      }
    });

    for (let column = 1; column <= 6; column += 1) {
      const laneY = playerSlotPosition(layout, 'Front', column).y;
      this.text(layout.baseX + 8, laneY - 7, `L${column}`, 9, '#94a3b8', 'bold');
    }

    this.enemies.forEach((enemy) => {
      const pos = enemySlotPosition(layout, enemy.row, enemy.column);
      const body = this.scene.add.rectangle(pos.x, pos.y, 38, 48, 0x7f1d1d).setStrokeStyle(2, 0x450a0a);
      const label = this.text(
        pos.x,
        pos.y,
        `${enemy.enemyId.replace('enemy-', '').toUpperCase()}\n${enemy.maxHp} HP\nDMG ${enemy.damage}`,
        9,
        '#ffffff',
        'bold'
      ).setOrigin(0.5);
      this.objects.push(body);
    });
  }

  private renderPlayerSlot(slot: FormationSlot, x: number, y: number): void {
    const unit = slot.unitId
      ? this.formation.units.find((candidate) => candidate.unitId === slot.unitId)
      : undefined;

    if (unit) {
      const fill = roleFill(unit.role);
      const body = this.scene.add.rectangle(x, y, 38, 48, fill).setStrokeStyle(2, 0x475569);
      const label = this.text(
        x,
        y,
        `${displayBeast(unit.beastId)}\n${unit.role}\n${unit.star}★`,
        9,
        '#0f172a',
        'bold'
      ).setOrigin(0.5);
      body.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        this.selectedUnitId = unit.unitId;
        this.render();
      });
      label.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        this.selectedUnitId = unit.unitId;
        this.render();
      });
      this.objects.push(body);
      return;
    }

    const hit = this.scene.add.rectangle(x, y, 38, 48, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => this.placeSelected(slot.slotId));
    this.objects.push(hit);
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
      align: 'center',
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

import Phaser from 'phaser';
import type { BattleFieldLayout } from '../BattleFieldLayout';
import { playerSlotPosition, enemySlotPosition } from '../BattleFieldLayout';
import type { BattleRow } from '../../battle/AutonomousBattleModel';
import { isCompactLandscape } from '../layout/MobilePresentation';

export class BattleArenaGridRenderer {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layout: BattleFieldLayout,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly gridObjects: Phaser.GameObjects.GameObject[],
  ) {}

  createChibiArena(): void {
    const x = 18;
    const y = isCompactLandscape() ? 142 : this.layout.baseY + 6;
    const width = isCompactLandscape()
      ? this.scene.scale.width - 36
      : this.scene.scale.width - Math.min(360, Math.max(300, Math.round(this.scene.scale.width * 0.28))) - 54;
    const height = this.scene.scale.height - y - 190;
    const g = this.scene.add.graphics().setDepth(-10);
    const edge = 0x182b27;

    g.fillStyle(0x243a31);
    g.fillRoundedRect(x, y, width, height, 36);
    g.lineStyle(5, edge);
    g.strokeRoundedRect(x, y, width, height, 36);
    g.fillStyle(0x3e5742);
    g.fillRoundedRect(x + 12, y + 12, width - 24, height - 24, 30);
    g.fillStyle(0x68654e);
    g.fillRoundedRect(x + 60, y + 50, width - 120, height - 84, 64);
    g.lineStyle(4, 0x46533b, 0.8);
    g.strokeRoundedRect(x + 60, y + 50, width - 120, height - 84, 64);
    g.fillStyle(0x73705a, 0.55);
    g.fillEllipse(x + width / 2, y + height / 2 + 10, width - 170, height - 115);

    const bush = (cx: number, cy: number, radius: number) => {
      g.fillStyle(edge);
      g.fillCircle(cx - radius * 0.6, cy, radius + 3);
      g.fillCircle(cx + radius * 0.6, cy, radius + 3);
      g.fillCircle(cx, cy - radius * 0.5, radius + 3);
      g.fillStyle(0x426a46);
      g.fillCircle(cx - radius * 0.6, cy - 2, radius);
      g.fillCircle(cx + radius * 0.6, cy - 2, radius);
      g.fillCircle(cx, cy - radius * 0.5 - 2, radius);
      g.fillStyle(0x5d7e50);
      g.fillEllipse(cx - 5, cy - radius * 0.65, radius * 1.2, radius * 0.55);
    };

    bush(x + 39, y + 27, 19);
    bush(x + width - 40, y + 26, 22);
    bush(x + 31, y + height - 28, 17);
    bush(x + width - 32, y + height - 30, 18);

    [0.22, 0.48, 0.76].forEach((ratio, index) => {
      const cx = x + width * ratio;
      const cy = y + 26;
      g.fillStyle(edge);
      g.fillEllipse(cx, cy + 4, 33, 18);
      g.fillStyle(index === 1 ? 0x89917b : 0x768173);
      g.fillEllipse(cx, cy, 28, 16);
      g.fillStyle(0xa4ad91);
      g.fillEllipse(cx - 4, cy - 3, 12, 5);
    });

    g.lineStyle(3, 0x78915b, 0.65);
    [0.14, 0.34, 0.63, 0.86].forEach((ratio) => {
      const cx = x + width * ratio;
      const cy = y + height - 17;
      g.lineBetween(cx, cy, cx - 6, cy - 9);
      g.lineBetween(cx, cy, cx + 2, cy - 12);
      g.lineBetween(cx, cy, cx + 8, cy - 7);
    });

    this.managedObjects.push(g);
  }

  createBattleGrid(showcaseMode: boolean): void {
    const layout = this.layout;
    if (showcaseMode) this.createChibiArena();

    if (!showcaseMode) {
      this.pushGridText(
        layout.baseX + 12,
        layout.baseY + 72,
        'BATTLE FIELD · PLAYER vs ENEMY',
        14,
        '#475569',
        'bold',
      );
      this.pushGridText(
        layout.playerFrontX - 145,
        layout.baseY + 105,
        'PLAYER  BACK  →  MID  →  FRONT',
        10,
        '#2563eb',
        'bold',
      );
      this.pushGridText(
        layout.enemyFrontX + 12,
        layout.baseY + 105,
        'FRONT  ←  MID  ←  BACK  ENEMY',
        10,
        '#b91c1c',
        'bold',
      );
    }

    const divider = this.scene.add.rectangle(
      layout.dividerX,
      layout.dividerY,
      3,
      layout.dividerHeight,
      0x94a3b8,
      0.9,
    );
    this.managedObjects.push(divider);
    this.gridObjects.push(divider);

    const rows: BattleRow[] = ['Front', 'Mid', 'Back'];
    rows.forEach((row) => {
      const playerTop = playerSlotPosition(layout, row, 1);
      const enemyTop = enemySlotPosition(layout, row, 1);

      if (!showcaseMode) {
        this.pushGridText(
          playerTop.x - 22,
          layout.topLaneY - 34,
          row.toUpperCase(),
          9,
          '#64748b',
          'bold',
        );
        this.pushGridText(
          enemyTop.x - 22,
          layout.topLaneY - 34,
          row.toUpperCase(),
          9,
          '#991b1b',
          'bold',
        );
      }

      for (let column = 1; column <= 6; column += 1) {
        const playerPos = playerSlotPosition(layout, row, column);
        const enemyPos = enemySlotPosition(layout, row, column);

        const playerSlot = this.scene.add.rectangle(
          playerPos.x,
          playerPos.y,
          layout.slotWidth,
          layout.slotHeight,
          showcaseMode ? 0x243653 : 0xeff6ff,
          showcaseMode ? 0.18 : 0.42,
        ).setStrokeStyle(showcaseMode ? 1 : 2, 0x93c5fd, showcaseMode ? 0.25 : 1);

        const enemySlot = this.scene.add.rectangle(
          enemyPos.x,
          enemyPos.y,
          layout.slotWidth,
          layout.slotHeight,
          showcaseMode ? 0x412735 : 0xfef2f2,
          showcaseMode ? 0.16 : 0.42,
        ).setStrokeStyle(showcaseMode ? 1 : 2, 0xfca5a5, showcaseMode ? 0.22 : 1);

        this.managedObjects.push(playerSlot, enemySlot);
        this.gridObjects.push(playerSlot, enemySlot);
      }
    });

    for (let column = 1; column <= 6; column += 1) {
      const lane = playerSlotPosition(layout, 'Front', column);
      if (!showcaseMode) {
        this.pushGridText(
          layout.baseX + 6,
          lane.y - 7,
          `L${column}`,
          9,
          '#94a3b8',
          'bold',
        );
      }
    }
  }

  scheduleGridFade(showcaseMode: boolean): void {
    this.scene.time.delayedCall(showcaseMode ? 220 : 650, () => {
      const liveGridObjects = this.gridObjects.filter((object) => object.active);
      if (!liveGridObjects.length) return;
      this.scene.tweens.add({
        targets: liveGridObjects,
        alpha: showcaseMode ? 0.04 : 0.08,
        duration: showcaseMode ? 220 : 350,
        ease: 'Sine.Out',
      });
    });
  }

  private pushGridText(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    fontStyle = '',
  ): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      color,
      fontStyle,
    });
    this.managedObjects.push(text);
    this.gridObjects.push(text);
    return text;
  }
}

import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../battle/AutonomousBattleModel';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';

export class ShowcaseBattleHUDView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private visible = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x = 620,
    private readonly y = 118,
  ) {}

  render(
    battle: AutonomousBattleSnapshot,
    energyEntries: ReadonlyArray<EnergyQueueEntry>,
    frontlineLabel: string,
    onCast: (energyId: string) => void,
    paused: boolean,
  ): void {
    this.destroyObjects();

    const panelWidth = 310;
    const rowHeight = 30;
    const energyCount = Math.max(1, energyEntries.length);
    const panelHeight = Math.min(540, 220 + energyCount * rowHeight);

    const panel = this.scene.add
      .rectangle(
        this.x + panelWidth / 2,
        this.y + panelHeight / 2,
        panelWidth,
        panelHeight,
        0x111827,
        0.94,
      )
      .setStrokeStyle(2, 0xfbbf24);

    const title = this.scene.add.text(this.x + 16, this.y + 14, 'BATTLE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f8fafc',
      fontStyle: 'bold',
    });

    const status = this.scene.add.text(
      this.x + 16,
      this.y + 48,
      paused
        ? `PAUSED · Tick ${battle.elapsedTicks}`
        : `${battle.status.toUpperCase()} · Tick ${battle.elapsedTicks}`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: paused ? '#fbbf24' : '#cbd5e1',
        fontStyle: 'bold',
      },
    );

    const enemiesAlive = battle.enemies.filter((enemy) => enemy.currentHp > 0).length;
    const enemy = this.scene.add.text(
      this.x + 16,
      this.y + 78,
      `ENEMY  ${enemiesAlive}/${battle.enemies.length}   HP ${formatNumber(battle.enemyHp)}/${formatNumber(battle.enemyMaxHp)}`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#fca5a5',
        fontStyle: 'bold',
      },
    );

    const frontline = this.scene.add.text(this.x + 16, this.y + 106, frontlineLabel, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#bfdbfe',
      wordWrap: { width: 278 },
    });

    const totalCharges = energyEntries.reduce((sum, entry) => sum + entry.charges, 0);
    const energyHeading = this.scene.add.text(
      this.x + 16,
      this.y + 150,
      `STORED ENERGY · ${totalCharges}`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#fbbf24',
        fontStyle: 'bold',
      },
    );

    this.objects.push(panel, title, status, enemy, frontline, energyHeading);

    let rowY = this.y + 182;

    if (!energyEntries.length) {
      const empty = this.scene.add.text(this.x + 16, rowY + 6, 'No stored Energy', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#94a3b8',
      });
      this.objects.push(empty);
    } else {
      energyEntries.forEach((entry) => {
        const rowBg = this.scene.add
          .rectangle(this.x + 155, rowY + 14, 278, 28, 0x1f2937, 1)
          .setStrokeStyle(1, 0x334155);

        const label = this.scene.add.text(
          this.x + 16,
          rowY + 5,
          `${entry.energyId.toUpperCase()} · ${entry.charges}`,
          {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#e5e7eb',
            fontStyle: 'bold',
          },
        );

        const heal = this.scene.add
          .text(this.x + 224, rowY + 3, 'HEAL', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#0284c7',
            padding: { x: 10, y: 5 },
          })
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => onCast(entry.energyId));

        this.objects.push(rowBg, label, heal);
        rowY += rowHeight;
      });
    }

    const hint = this.scene.add.text(
      this.x + 16,
      this.y + panelHeight - 30,
      'Frontline Heal · finite charges',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#64748b',
      },
    );
    this.objects.push(hint);
    this.setVisible(this.visible);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.objects.forEach((object) => object.setVisible(visible));
  }

  destroy(): void {
    this.destroyObjects();
  }

  private destroyObjects(): void {
    this.objects.splice(0).forEach((object) => object.destroy());
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

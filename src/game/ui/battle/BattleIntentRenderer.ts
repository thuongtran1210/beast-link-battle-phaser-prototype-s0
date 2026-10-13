import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../../battle/AutonomousBattleModel';
import type { UnitVisual, EnemyVisual } from './BattleUnitVisualManager';

/**
 * BattleIntentRenderer
 * Visualizes combat intents and targeting connections between units and enemies.
 * - Tap to inspect target intent line.
 * - Flashes attack telegraph beams during windups / signature moves.
 */
export class BattleIntentRenderer {
  private selectedUnitId: string | null = null;
  private readonly intentGraphics: Phaser.GameObjects.Graphics;
  private autoClearTimer?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly objects: Phaser.GameObjects.GameObject[],
    private readonly units: Map<string, UnitVisual>,
    private readonly enemies: Map<string, EnemyVisual>,
  ) {
    this.intentGraphics = scene.add.graphics().setDepth(140);
  }

  selectUnit(unitId: string | null): void {
    this.selectedUnitId = unitId;
    this.autoClearTimer?.remove(false);
    if (unitId) {
      // Auto-clear selection after 4 seconds of inactivity
      this.autoClearTimer = this.scene.time.delayedCall(4000, () => {
        this.selectedUnitId = null;
        this.clear();
      });
    }
  }

  getSelectedUnitId(): string | null {
    return this.selectedUnitId;
  }

  /**
   * Flash an intent line between attacker and target when windup starts.
   */
  flashTelegraph(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color = 0xf59e0b,
    duration = 320,
  ): void {
    const fx = this.scene.add.graphics().setDepth(145);
    this.objects.push(fx);

    // Draw telegraph line
    fx.lineStyle(2.5, color, 0.85);
    fx.lineBetween(fromX, fromY, toX, toY);

    // Draw small target ring at impact point
    fx.strokeCircle(toX, toY, 14);

    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      duration,
      ease: 'Cubic.Out',
      onComplete: () => {
        const index = this.objects.indexOf(fx);
        if (index >= 0) this.objects.splice(index, 1);
        fx.destroy();
      },
    });
  }

  /**
   * Render continuous intent line for the currently selected unit.
   */
  update(snapshot: AutonomousBattleSnapshot): void {
    this.intentGraphics.clear();

    // 1. Render subtle guardian cover tethers from living Tankers to backline allies
    const livingTankers = snapshot.units.filter((u) => u.currentHp > 0 && u.role === 'Tanker');
    const backlineAllies = snapshot.units.filter((u) => u.currentHp > 0 && (u.role === 'Ranger' || u.role === 'Mage'));

    if (livingTankers.length > 0 && backlineAllies.length > 0) {
      this.intentGraphics.lineStyle(1.5, 0xfacc15, 0.22);
      livingTankers.forEach((tanker) => {
        const tankerVisual = this.units.get(tanker.unitId);
        if (!tankerVisual) return;
        backlineAllies.forEach((ally) => {
          const allyVisual = this.units.get(ally.unitId);
          if (!allyVisual) return;
          this.intentGraphics.lineBetween(
            tankerVisual.container.x,
            tankerVisual.container.y - 12,
            allyVisual.container.x,
            allyVisual.container.y - 12,
          );
        });
      });
    }

    // 2. Render continuous intent line for the currently selected unit.
    if (!this.selectedUnitId) return;

    const unit = snapshot.units.find((u) => u.unitId === this.selectedUnitId);
    if (!unit || unit.currentHp <= 0 || !unit.targetEnemyId) {
      this.selectedUnitId = null;
      return;
    }

    const unitVisual = this.units.get(unit.unitId);
    const targetVisual = this.enemies.get(unit.targetEnemyId);
    if (!unitVisual || !targetVisual) return;

    const uX = unitVisual.container.x;
    const uY = unitVisual.container.y - 20;
    const tX = targetVisual.container.x;
    const tY = targetVisual.container.y - 25;

    // Stylish curved arc intent line
    const midX = (uX + tX) / 2;
    const midY = Math.min(uY, tY) - 24;

    this.intentGraphics.lineStyle(3, 0x38bdf8, 0.9);
    this.intentGraphics.beginPath();
    this.intentGraphics.moveTo(uX, uY);
    // Draw quad curve
    for (let t = 0; t <= 1; t += 0.05) {
      const x = (1 - t) * (1 - t) * uX + 2 * (1 - t) * t * midX + t * t * tX;
      const y = (1 - t) * (1 - t) * uY + 2 * (1 - t) * t * midY + t * t * tY;
      this.intentGraphics.lineTo(x, y);
    }
    this.intentGraphics.strokePath();

    // Target reticle
    this.intentGraphics.lineStyle(2, 0x38bdf8, 0.95);
    this.intentGraphics.strokeCircle(tX, tY, 18);
    this.intentGraphics.fillStyle(0x38bdf8, 0.3);
    this.intentGraphics.fillCircle(tX, tY, 8);
  }

  clear(): void {
    this.intentGraphics.clear();
    this.autoClearTimer?.remove(false);
  }

  destroy(): void {
    this.clear();
    this.intentGraphics.destroy();
  }
}

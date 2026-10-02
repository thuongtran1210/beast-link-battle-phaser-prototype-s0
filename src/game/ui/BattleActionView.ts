import Phaser from 'phaser';
import type {
  AutonomousBattleSnapshot,
  CombatUnit,
  EnemyCombatUnit,
  BattleRow,
} from '../battle/AutonomousBattleModel';
import type {
  BattleHealPresentation,
  BattleTickPresentation,
} from '../battle/BattlePresentation';
import {
  battleModelPosition,
  createBattleFieldLayout,
  enemySlotPosition,
  playerSlotPosition,
  type BattleFieldLayout,
} from './BattleFieldLayout';

import { createIconImage } from './icons/IconFactory';

interface UnitVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface EnemyVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class BattleActionView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly gridObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly units = new Map<string, UnitVisual>();
  private readonly enemies = new Map<string, EnemyVisual>();
  private readonly layout: BattleFieldLayout;

  constructor(
    private readonly scene: Phaser.Scene,
    baseX = 18,
    baseY = 105,
  ) {
    this.layout = createBattleFieldLayout(baseX, baseY);
  }

  render(snapshot: AutonomousBattleSnapshot): void {
    if (this.objects.length === 0) {
      this.createBattleGrid();
      this.scheduleGridFade();
    }

    snapshot.units.forEach((unit) => this.syncUnit(unit));
    snapshot.enemies.forEach((enemy) => this.syncEnemy(enemy));
  }

  playTick(event: BattleTickPresentation): void {
    event.attackers.forEach((attacker, index) => {
      const visual = this.units.get(attacker.unitId);
      if (!visual || visual.container.alpha <= 0.1) return;

      const delay = index * 70;
      const primaryTarget = attacker.targetEnemyIds[0]
        ? this.enemies.get(attacker.targetEnemyIds[0])
        : undefined;

      if (attacker.kind === 'Dive' && primaryTarget) {
        const originX = visual.container.x;
        const originY = visual.container.y;
        this.scene.tweens.add({
          targets: visual.container,
          x: primaryTarget.container.x - 18,
          y: primaryTarget.container.y,
          duration: 150,
          yoyo: true,
          hold: 50,
          ease: 'Quad.InOut',
          delay,
          onYoyo: () => this.flash(primaryTarget.body, 0xf97316),
          onComplete: () => visual.container.setPosition(originX, originY),
        });
      } else if (attacker.kind === 'GuardStrike' && primaryTarget) {
        this.scene.tweens.add({
          targets: visual.container,
          x: visual.container.x + 14,
          duration: 100,
          yoyo: true,
          ease: 'Quad.Out',
          delay,
        });
      } else if ((attacker.kind === 'Snipe' || attacker.role === 'Ranger') && primaryTarget) {
        this.scene.time.delayedCall(delay, () => this.projectileToTarget(
          visual.container,
          primaryTarget.container,
          0x38bdf8,
        ));
      } else if (attacker.kind === 'ArcaneBurst' && primaryTarget) {
        this.scene.time.delayedCall(delay, () => {
          attacker.targetEnemyIds.forEach((enemyId, hitIndex) => {
            const target = this.enemies.get(enemyId);
            if (!target) return;
            this.scene.time.delayedCall(hitIndex * 45, () => {
              this.projectileToTarget(visual.container, target.container, 0xa78bfa);
              this.scene.time.delayedCall(160, () => this.flash(target.body, 0xa855f7));
            });
          });
        });
      } else if (primaryTarget) {
        this.scene.time.delayedCall(delay, () => this.projectileToTarget(
          visual.container,
          primaryTarget.container,
          0x38bdf8,
        ));
      }
    });

    event.enemyDamages.forEach((damageEvent, index) => {
      if (damageEvent.damage <= 0) return;
      this.scene.time.delayedCall(140 + index * 40, () => {
        const visual = this.enemies.get(damageEvent.enemyId);
        if (!visual) return;

        this.flash(visual.body, 0xef4444);
        this.floatText(
          visual.container.x,
          visual.container.y - 34,
          `-${formatNumber(damageEvent.damage)}`,
          '#b91c1c',
        );
      });
    });

    if (event.enemyTargetId) {
      this.scene.time.delayedCall(260, () => {
        const visual = this.units.get(event.enemyTargetId!);
        if (!visual) return;

        this.flash(visual.body, 0xef4444);
        if (event.targetDamage > 0) {
          this.floatText(
            visual.container.x,
            visual.container.y - 34,
            `-${formatNumber(event.targetDamage)}`,
            '#b91c1c',
          );
        }
      });
    }

    event.defeatedUnitIds.forEach((unitId) => {
      this.scene.time.delayedCall(360, () => {
        const visual = this.units.get(unitId);
        if (!visual) return;
        this.scene.tweens.add({
          targets: visual.container,
          alpha: 0.25,
          angle: 8,
          duration: 220,
        });
      });
    });

    event.defeatedEnemyIds.forEach((enemyId) => {
      this.scene.time.delayedCall(360, () => {
        const visual = this.enemies.get(enemyId);
        if (!visual) return;
        this.scene.tweens.add({
          targets: visual.container,
          alpha: 0.25,
          angle: -8,
          duration: 220,
        });
      });
    });
  }

  playHeal(event: BattleHealPresentation): void {
    if (!event.unitId || event.amount <= 0) return;

    const visual = this.units.get(event.unitId);
    if (!visual) return;

    this.floatText(
      visual.container.x,
      visual.container.y - 34,
      `+${formatNumber(event.amount)} HP`,
      '#15803d',
    );

    this.scene.tweens.add({
      targets: visual.body,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 120,
      yoyo: true,
      ease: 'Sine.Out',
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf([...this.objects]);
    this.objects.splice(0).forEach((object) => object.destroy());
    this.gridObjects.splice(0);
    this.units.clear();
    this.enemies.clear();
  }

  private createBattleGrid(): void {
    const layout = this.layout;

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

    const divider = this.scene.add.rectangle(
      layout.dividerX,
      layout.dividerY,
      3,
      layout.dividerHeight,
      0x94a3b8,
      0.9,
    );
    this.objects.push(divider);
    this.gridObjects.push(divider);

    const rows: BattleRow[] = ['Front', 'Mid', 'Back'];
    rows.forEach((row) => {
      const playerTop = playerSlotPosition(layout, row, 1);
      const enemyTop = enemySlotPosition(layout, row, 1);

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

      for (let column = 1; column <= 6; column += 1) {
        const playerPos = playerSlotPosition(layout, row, column);
        const enemyPos = enemySlotPosition(layout, row, column);

        const playerSlot = this.scene.add.rectangle(
          playerPos.x,
          playerPos.y,
          layout.slotWidth,
          layout.slotHeight,
          0xeff6ff,
          0.42,
        ).setStrokeStyle(2, 0x93c5fd);

        const enemySlot = this.scene.add.rectangle(
          enemyPos.x,
          enemyPos.y,
          layout.slotWidth,
          layout.slotHeight,
          0xfef2f2,
          0.42,
        ).setStrokeStyle(2, 0xfca5a5);

        this.objects.push(playerSlot, enemySlot);
        this.gridObjects.push(playerSlot, enemySlot);
      }
    });

    for (let column = 1; column <= 6; column += 1) {
      const lane = playerSlotPosition(layout, 'Front', column);
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

  private syncUnit(unit: CombatUnit): void {
    let visual = this.units.get(unit.unitId);
    if (!visual) {
      visual = this.createUnit(unit);
      this.units.set(unit.unitId, visual);
    }

    const ratio = unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 0;
    visual.hpFill.width = 46 * clamp01(ratio);
    visual.label.setText(
      `${'★'.repeat(unit.star)} ${formatNumber(unit.currentHp)}`,
    );

    const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
    if (unit.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
      this.moveVisual(visual.container, position.x, position.y);
    }
  }

  private syncEnemy(enemy: EnemyCombatUnit): void {
    let visual = this.enemies.get(enemy.enemyId);
    if (!visual) {
      visual = this.createEnemy(enemy);
      this.enemies.set(enemy.enemyId, visual);
    }

    const ratio = enemy.maxHp > 0 ? enemy.currentHp / enemy.maxHp : 0;
    visual.hpFill.width = 46 * clamp01(ratio);
    visual.label.setText(
      `${enemy.enemyId.replace('enemy-', '').toUpperCase()}\n${formatNumber(enemy.currentHp)} HP\nDMG ${enemy.damage}`,
    );

    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    if (enemy.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
      this.moveVisual(visual.container, position.x, position.y);
    }
  }

  private createUnit(unit: CombatUnit): UnitVisual {
    const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
    const body = this.scene.add
      .rectangle(0, 0, 52, 46, 0x1e293b, 0.95)
      .setStrokeStyle(2, roleFill(unit.role));

    const icon = createIconImage(this.scene, unit.beastId, 0, -6, 32);

    const label = this.scene.add.text(0, 13, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#fbbf24',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hpBg = this.scene.add.rectangle(0, 26, 46, 5, 0x111827).setOrigin(0.5);
    const hpFill = this.scene.add.rectangle(-23, 26, 46, 5, 0x16a34a).setOrigin(0, 0.5);
    const container = this.scene.add.container(
      position.x,
      position.y,
      [body, icon, label, hpBg, hpFill],
    );

    this.objects.push(container);
    return { container, body, icon, hpFill, label };
  }

  private createEnemy(enemy: EnemyCombatUnit): EnemyVisual {
    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    const body = this.scene.add
      .rectangle(0, 0, 48, 42, 0x7f1d1d)
      .setStrokeStyle(2, 0x450a0a);

    const label = this.scene.add.text(0, -1, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hpBg = this.scene.add.rectangle(0, 27, 46, 6, 0x1f2937).setOrigin(0.5);
    const hpFill = this.scene.add.rectangle(-23, 27, 46, 6, 0xdc2626).setOrigin(0, 0.5);

    const container = this.scene.add.container(
      position.x,
      position.y,
      [body, label, hpBg, hpFill],
    );

    this.objects.push(container);
    return { container, body, hpFill, label };
  }

  private scheduleGridFade(): void {
    this.scene.time.delayedCall(650, () => {
      const liveGridObjects = this.gridObjects.filter((object) => object.active);
      if (!liveGridObjects.length) return;
      this.scene.tweens.add({
        targets: liveGridObjects,
        alpha: 0.08,
        duration: 350,
        ease: 'Sine.Out',
      });
    });
  }

  private moveVisual(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
  ): void {
    if (Math.abs(container.x - x) < 0.5 && Math.abs(container.y - y) < 0.5) return;
    this.scene.tweens.killTweensOf(container);
    this.scene.tweens.add({
      targets: container,
      x,
      y,
      duration: 280,
      ease: 'Sine.InOut',
    });
  }

  private projectileToTarget(
    source: Phaser.GameObjects.Container,
    target: Phaser.GameObjects.Container,
    color: number,
  ): void {
    const projectile = this.scene.add.circle(source.x + 16, source.y, 5, color);
    this.objects.push(projectile);

    this.scene.tweens.add({
      targets: projectile,
      x: target.x - 16,
      y: target.y,
      duration: 180,
      ease: 'Quad.In',
      onComplete: () => {
        const index = this.objects.indexOf(projectile);
        if (index >= 0) this.objects.splice(index, 1);
        projectile.destroy();
      },
    });
  }

  private flash(target: Phaser.GameObjects.Rectangle, color: number): void {
    const original = target.fillColor;
    target.setFillStyle(color);
    this.scene.time.delayedCall(100, () => {
      if (target.active) target.setFillStyle(original);
    });
  }

  private floatText(x: number, y: number, value: string, color: string): void {
    const text = this.scene.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.objects.push(text);
    this.scene.tweens.add({
      targets: text,
      y: y - 24,
      alpha: 0,
      duration: 480,
      onComplete: () => {
        const index = this.objects.indexOf(text);
        if (index >= 0) this.objects.splice(index, 1);
        text.destroy();
      },
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
    const text = this.pushText(x, y, value, size, color, fontStyle);
    this.gridObjects.push(text);
    return text;
  }

  private pushText(
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
    this.objects.push(text);
    return text;
  }
}

function roleFill(role: CombatUnit['role']): number {
  if (role === 'Tanker') return 0xfacc15;
  if (role === 'Assassin') return 0xf97316;
  if (role === 'Ranger') return 0x22c55e;
  return 0xa78bfa;
}

function shortBeast(beastId: string): string {
  return (beastId.split('-').at(-1) ?? beastId).toUpperCase();
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

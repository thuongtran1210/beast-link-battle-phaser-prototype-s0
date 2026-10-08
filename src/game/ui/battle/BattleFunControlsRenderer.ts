import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../../battle/AutonomousBattleModel';
import { battleModelPosition, type BattleFieldLayout } from '../BattleFieldLayout';
import type { UnitVisual, EnemyVisual } from './BattleUnitVisualManager';

export class BattleFunControlsRenderer {
  private funMarkers: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layout: BattleFieldLayout,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly units: Map<string, UnitVisual>,
    private readonly enemies: Map<string, EnemyVisual>,
  ) {}

  renderFunControls(snapshot: AutonomousBattleSnapshot): void {
    this.funMarkers.splice(0).forEach((object) => {
      const index = this.managedObjects.indexOf(object);
      if (index >= 0) this.managedObjects.splice(index, 1);
      object.destroy();
    });

    snapshot.units
      .filter((unit) => unit.currentHp > 0 && (unit.guardUntil ?? 0) > (snapshot.elapsedTime ?? 0) && (unit.temporaryShieldHp ?? 0) > 0)
      .forEach((unit) => {
        const visual = this.units.get(unit.unitId);
        if (!visual) return;
        const shield = this.scene.add.graphics().setDepth(179);
        const x = visual.container.x;
        const y = visual.container.y - 22;
        shield.lineStyle(4, 0xa7bdc6);
        shield.strokeRoundedRect(x - 42, y - 50, 84, 102, 24);
        this.funMarkers.push(shield);
        this.managedObjects.push(shield);
      });

    snapshot.units
      .filter(
        (unit) =>
          (unit.signatureId === 'WoollyRescue' || unit.signatureId === 'ToyWorkshop') &&
          (unit.supportFxUntil ?? 0) > (snapshot.elapsedTime ?? 0),
      )
      .forEach((unit) =>
        (unit.supportTargetIds ?? []).forEach((id) => {
          const ally = this.units.get(id);
          if (!ally) return;
          const x = ally.container.x;
          const y = ally.container.y - 50;
          const g = this.scene.add.graphics().setDepth(180);
          g.fillStyle(unit.signatureId === 'ToyWorkshop' ? 0xc8b58a : 0xeeb6ac);
          g.fillCircle(x - 9, y - 4, 12);
          g.fillCircle(x + 9, y - 4, 12);
          g.fillTriangle(x - 20, y, x + 20, y, x, y + 23);
          if (unit.star === 3) {
            g.lineStyle(4, 0xf2e9d5, 0.9);
            g.strokeRoundedRect(x - 34, y - 22, 68, 63, 23);
          }
          const label = this.scene.add
            .text(
              x,
              y - 36,
              unit.signatureId === 'ToyWorkshop'
                ? 'TOY SHIELD'
                : unit.star === 3
                ? 'WOOL HUG · HEAL + SHIELD'
                : 'WOOLKEEPER · HEAL',
              {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#fff7e6',
                backgroundColor: '#24352a',
                padding: { x: 7, y: 4 },
              },
            )
            .setOrigin(0.5)
            .setDepth(181);
          this.funMarkers.push(g, label);
          this.managedObjects.push(g, label);
        }),
      );

    snapshot.enemies.forEach((enemy) => {
      const visual = this.enemies.get(enemy.enemyId);
      if (!visual) return;
      const active = enemy.currentHp > 0 && (enemy.funControlUntil ?? 0) > (snapshot.elapsedTime ?? 0);
      visual.characterView.root.setVisible(!(active && enemy.funControlKind === 'Duck'));
      if (enemy.bombAt !== undefined && enemy.bombAt > (snapshot.elapsedTime ?? 0)) {
        const x = visual.container.x + 38;
        const y = visual.container.y - 30;
        const bomb = this.scene.add.circle(x, y, 19, 0x202725).setStrokeStyle(3, 0xc8b58a).setDepth(180);
        const count = this.scene.add
          .text(x, y, `${Math.max(0, enemy.bombAt - (snapshot.elapsedTime ?? 0)).toFixed(1)}`, {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#f6db9f',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(181);
        this.funMarkers.push(bomb, count);
        this.managedObjects.push(bomb, count);
      }
      if (!active) return;
      const g = this.scene.add.graphics().setDepth(180);
      const duck = enemy.funControlKind === 'Duck';
      const point =
        duck || enemy.funControlKind === 'Bubble' || enemy.funControlKind === 'Disrupt'
          ? { x: visual.container.x, y: visual.container.y - 22 }
          : battleModelPosition(this.layout, enemy.carrotX ?? enemy.positionX, enemy.carrotLane ?? enemy.positionLane);
      const x = point.x;
      const y = point.y;
      g.lineStyle(4, 0x10151b);
      if (enemy.funControlKind === 'Disrupt') {
        g.lineStyle(5, 0xc8b58a);
        g.lineBetween(x - 16, y - 16, x + 16, y + 16);
        g.lineBetween(x + 16, y - 16, x - 16, y + 16);
      } else if (enemy.funControlKind === 'Bubble') {
        g.lineStyle(4, 0xa7c9bd);
        g.strokeCircle(x, y, 42);
      } else if (duck) {
        g.fillStyle(0xffffff);
        g.fillEllipse(x, y + 8, 54, 42);
        g.strokeEllipse(x, y + 8, 54, 42);
        g.fillCircle(x + 12, y - 13, 22);
        g.strokeCircle(x + 12, y - 13, 22);
        g.fillStyle(0xffbf24);
        g.fillEllipse(x + 35, y - 8, 26, 13);
        g.strokeEllipse(x + 35, y - 8, 26, 13);
        g.fillStyle(0x10151b);
        g.fillCircle(x + 17, y - 17, 3);
      } else {
        g.fillStyle(0xf68b32);
        g.fillTriangle(x - 23, y - 38, x + 23, y - 38, x, y + 32);
        g.strokeTriangle(x - 23, y - 38, x + 23, y - 38, x, y + 32);
        g.lineStyle(7, 0x67b94a);
        g.lineBetween(x, y - 37, x - 15, y - 58);
        g.lineBetween(x, y - 37, x + 14, y - 57);
        g.fillStyle(0x10151b);
        g.fillRoundedRect(x - 19, y - 25, 38, 13, 3);
        g.lineStyle(3, 0xffffff);
        g.lineBetween(x - 6, y + 1, x + 6, y + 1);
      }
      const text = this.scene.add
        .text(
          x,
          y - 76,
          enemy.funControlKind === 'Disrupt'
            ? 'INTERRUPTED · 1s'
            : enemy.funControlKind === 'Bubble'
            ? 'BUBBLE · ACTION BLOCKED'
            : duck
            ? 'QUACK! · SKILL BLOCKED'
            : 'LOOK HERE! · DECOY',
          {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#101c30',
            padding: { x: 7, y: 4 },
          },
        )
        .setOrigin(0.5)
        .setDepth(181);
      this.funMarkers.push(g, text);
      this.managedObjects.push(g, text);
    });
  }

  clear(): void {
    this.funMarkers.splice(0).forEach((object) => {
      const index = this.managedObjects.indexOf(object);
      if (index >= 0) this.managedObjects.splice(index, 1);
      object.destroy();
    });
  }
}

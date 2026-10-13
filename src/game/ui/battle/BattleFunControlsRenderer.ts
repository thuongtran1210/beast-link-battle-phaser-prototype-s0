import Phaser from 'phaser';
import type { AutonomousBattleSnapshot } from '../../battle/AutonomousBattleModel';
import { battleModelPosition, type BattleFieldLayout } from '../BattleFieldLayout';
import type { UnitVisual, EnemyVisual } from './BattleUnitVisualManager';

export class BattleFunControlsRenderer {
  private funMarkers: Phaser.GameObjects.GameObject[] = [];
  private readonly bombs = new Map<string, {at: number; x: number; y: number}>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layout: BattleFieldLayout,
    private readonly managedObjects: Phaser.GameObjects.GameObject[],
    private readonly units: Map<string, UnitVisual>,
    private readonly enemies: Map<string, EnemyVisual>,
  ) {}

  renderFunControls(snapshot: AutonomousBattleSnapshot): void {
    const now = snapshot.elapsedTime ?? 0;
    for (const [id, bomb] of this.bombs) {
      if (now >= bomb.at) {
        const smoke = this.scene.add.graphics().setPosition(bomb.x, bomb.y).setDepth(232);
        smoke.fillStyle(0xeee1c6, .9); smoke.fillCircle(-19, 0, 24); smoke.fillCircle(19, 0, 24); smoke.fillCircle(0, -18, 29);
        smoke.lineStyle(3, 0x38463a); smoke.strokeCircle(-19, 0, 24); smoke.strokeCircle(19, 0, 24);
        this.managedObjects.push(smoke);
        this.scene.tweens.add({targets:smoke, alpha:0, scaleX:1.3, scaleY:1.3, duration:350, onComplete:() => {
          const index = this.managedObjects.indexOf(smoke); if (index >= 0) this.managedObjects.splice(index, 1); smoke.destroy();
        }});
        this.bombs.delete(id);
      }
    }
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
          if (unit.signatureId === 'ToyWorkshop') {
            g.fillRoundedRect(x + 32, y + 20, 34, 40, 6);
            g.lineStyle(3, 0x17251e); g.strokeRoundedRect(x + 32, y + 20, 34, 40, 6);
            g.fillStyle(0x17251e); g.fillCircle(x + 42, y + 32, 3); g.fillCircle(x + 55, y + 32, 3);
            g.fillStyle(0xa7bdc6); g.fillRoundedRect(x + 46, y + 43, 28, 30, 5);
          } else {
            g.fillCircle(x - 9, y - 4, 12); g.fillCircle(x + 9, y - 4, 12);
            g.fillTriangle(x - 20, y, x + 20, y, x, y + 23);
          }
          if (unit.star === 3) {
            g.lineStyle(4, 0xf2e9d5, 0.9);
            g.strokeRoundedRect(x - 34, y - 22, 68, 63, 23);
          }
          const label = this.scene.add
            .text(
              x,
              y - 36,
              unit.signatureId === 'ToyWorkshop'
                ? 'TOY GUARD'
                : unit.star === 3
                ? 'WOOL HUG!'
                : '♥ HEAL',
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
        this.bombs.set(enemy.enemyId, {at:enemy.bombAt,x,y});
        const remaining = enemy.bombAt - now;
        const bomb = this.scene.add.circle(x, y, 24, remaining < .4 ? 0xb67c65 : 0x202725).setStrokeStyle(3, 0xc8b58a).setDepth(230);
        const count = this.scene.add
          .text(x, y, `${Math.max(1, Math.ceil(remaining / .4))}`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#f6db9f',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
            .setDepth(231);
        this.funMarkers.push(bomb, count);
        this.managedObjects.push(bomb, count);
      }
      if (!active) return;
      const g = this.scene.add.graphics().setDepth(220);
      const duck = enemy.funControlKind === 'Duck';
      const special = enemy.funControlStar === 3 && (duck || enemy.funControlKind === 'Carrot');
      const point =
        duck || enemy.funControlKind === 'Bubble' || enemy.funControlKind === 'Disrupt'
          ? { x: visual.container.x, y: visual.container.y - 22 }
          : battleModelPosition(this.layout, enemy.carrotX ?? enemy.positionX, enemy.carrotLane ?? enemy.positionLane);
      const x = point.x;
      const y = point.y + (duck ? Math.sin(now * 16) * 4 : 0);
      if(special){g.translateCanvas(x,y);g.scaleCanvas(1.15,1.15);g.translateCanvas(-x,-y);}
      g.lineStyle(4, 0x10151b);
      if (enemy.funControlKind === 'Disrupt') {
        g.lineStyle(5, 0xc8b58a);
        g.lineBetween(x - 16, y - 16, x + 16, y + 16);
        g.lineBetween(x + 16, y - 16, x - 16, y + 16);
        // Orbiting chibi dizzy stars
        const starAngle = now * 8;
        for (let s = 0; s < 3; s++) {
          const a = starAngle + (s * Math.PI * 2) / 3;
          const sx = x + Math.cos(a) * 22;
          const sy = y - 32 + Math.sin(a) * 8;
          g.fillStyle(0xfde047, 0.95);
          g.fillCircle(sx, sy, 4);
          g.lineStyle(1.5, 0x854d0e);
          g.strokeCircle(sx, sy, 4);
        }
      } else if (enemy.funControlKind === 'Bubble') {
        g.fillStyle(0xa7c9bd, .1); g.fillCircle(x, y - 16, 60);
        g.lineStyle(3, 0xa7c9bd); g.strokeCircle(x, y - 16, 60);
        g.fillStyle(0xffffff, .8); g.fillEllipse(x - 29, y - 46, 11, 22);
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
        if(special){
          g.fillStyle(0xe7c668);g.fillPoints([
            {x:x-1,y:y-35},{x:x-3,y:y-49},{x:x+7,y:y-42},
            {x:x+13,y:y-53},{x:x+20,y:y-42},{x:x+29,y:y-49},{x:x+27,y:y-35},
          ],true);
        }
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
        if(special){g.fillStyle(0xffe6a0);g.fillCircle(x+27,y-45,3);g.fillCircle(x-28,y-5,3);}
      }
      const text = this.scene.add
        .text(
          x,
          y - 76,
          enemy.funControlKind === 'Disrupt'
            ? 'INTERRUPTED'
            : enemy.funControlKind === 'Bubble'
            ? 'POP?'
            : duck
            ? (special?'VỊT VƯƠNG!':'QUACK!')
            : (special?'ĐẠI TIỆC!':'YUM!'),
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
    this.bombs.clear();
    this.funMarkers.splice(0).forEach((object) => {
      const index = this.managedObjects.indexOf(object);
      if (index >= 0) this.managedObjects.splice(index, 1);
      object.destroy();
    });
  }
}

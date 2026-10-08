import Phaser from 'phaser';
import type {
  AutonomousBattleSnapshot,
  CombatUnit,
  EnemyCombatUnit,
} from '../battle/AutonomousBattleModel';
import type {
  BattleHealPresentation,
  BattleTickPresentation,
  SignatureFxPresentation,
} from '../battle/BattlePresentation';
import {
  battleModelPosition,
  createBattleFieldLayout,
  type BattleFieldLayout,
} from './BattleFieldLayout';
import { FeedbackEffects } from './feedback/FeedbackEffects';
import { isCompactLandscape } from './layout/MobilePresentation';
import { BattleArenaGridRenderer } from './battle/BattleArenaGridRenderer';
import { BattleFloatingTextSystem } from './battle/BattleFloatingTextSystem';
import { BattleSignatureVfxRenderer } from './battle/BattleSignatureVfxRenderer';
import {
  BattleUnitVisualManager,
  type UnitVisual,
  type EnemyVisual,
} from './battle/BattleUnitVisualManager';

export class BattleActionView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly gridObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly units = new Map<string, UnitVisual>();
  private readonly enemies = new Map<string, EnemyVisual>();
  private readonly unitPresentationOffsets = new Map<string, { x: number; y: number }>();
  private readonly enemyPresentationOffsets = new Map<string, { x: number; y: number }>();
  private readonly layout: BattleFieldLayout;
  private readonly gridRenderer: BattleArenaGridRenderer;
  private readonly floatingTextSystem: BattleFloatingTextSystem;
  private readonly signatureVfxRenderer: BattleSignatureVfxRenderer;
  private readonly unitVisualManager: BattleUnitVisualManager;
  private showcaseMode = false;
  private funMarkers: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    baseX = 18,
    baseY = 105,
  ) {
    this.layout = createBattleFieldLayout(baseX, baseY);
    // Presentation coordinates only: reserve the lower skill dock and use wider screens.
    const fieldWidth = isCompactLandscape() ? scene.scale.width - 36 : scene.scale.width - Math.min(360, Math.max(300, Math.round(scene.scale.width * .28))) - 54;
    this.layout.dividerX = baseX + fieldWidth / 2;
    this.layout.playerFrontX = this.layout.dividerX - 80;
    this.layout.enemyFrontX = this.layout.dividerX + 80;
    this.layout.depthGap = Math.min(110, Math.max(84, (fieldWidth - 180) / 7));
    this.layout.topLaneY = isCompactLandscape() ? 226 : baseY + 108;
    this.layout.laneGap = Math.min(58, Math.max(40, (scene.scale.height - 290 - this.layout.topLaneY) / 5));

    this.gridRenderer = new BattleArenaGridRenderer(this.scene, this.layout, this.objects, this.gridObjects);
    this.floatingTextSystem = new BattleFloatingTextSystem(this.scene, this.objects);
    this.signatureVfxRenderer = new BattleSignatureVfxRenderer(this.scene, this.objects, this.units, this.enemies);
    this.unitVisualManager = new BattleUnitVisualManager(
      this.scene,
      this.layout,
      this.objects,
      this.units,
      this.enemies,
      this.unitPresentationOffsets,
      this.enemyPresentationOffsets,
    );
  }

  setShowcaseMode(enabled: boolean): void {
    this.showcaseMode = enabled;
  }

  render(snapshot: AutonomousBattleSnapshot): void {
    if (this.objects.length === 0) {
      this.createBattleGrid();
      this.scheduleGridFade();
    }

    this.unitVisualManager.updatePresentationOffsets(snapshot, this.showcaseMode);
    snapshot.units.forEach((unit) => this.syncUnit(unit));
    snapshot.enemies.forEach((enemy) => this.syncEnemy(enemy));
    this.renderFunControls(snapshot);
  }

  private renderFunControls(snapshot: AutonomousBattleSnapshot): void {
    this.funMarkers.splice(0).forEach(object => {
      const index = this.objects.indexOf(object); if (index >= 0) this.objects.splice(index, 1);
      object.destroy();
    });
    snapshot.units.filter(unit => unit.currentHp > 0 && (unit.guardUntil ?? 0) > (snapshot.elapsedTime ?? 0) && (unit.temporaryShieldHp ?? 0) > 0).forEach(unit => {
      const visual = this.units.get(unit.unitId); if (!visual) return;
      const shield = this.scene.add.graphics().setDepth(179);
      const x = visual.container.x; const y = visual.container.y - 22;
      shield.lineStyle(4, 0xa7bdc6); shield.strokeRoundedRect(x - 42, y - 50, 84, 102, 24);
      this.funMarkers.push(shield); this.objects.push(shield);
    });
    snapshot.units.filter(unit => (unit.signatureId === 'WoollyRescue' || unit.signatureId === 'ToyWorkshop') && (unit.supportFxUntil ?? 0) > (snapshot.elapsedTime ?? 0))
      .forEach(unit => (unit.supportTargetIds ?? []).forEach(id => {
        const ally = this.units.get(id); if (!ally) return;
        const x = ally.container.x; const y = ally.container.y - 50;
        const g = this.scene.add.graphics().setDepth(180);
        g.fillStyle(unit.signatureId === 'ToyWorkshop' ? 0xc8b58a : 0xeeb6ac);
        g.fillCircle(x - 9, y - 4, 12); g.fillCircle(x + 9, y - 4, 12);
        g.fillTriangle(x - 20, y, x + 20, y, x, y + 23);
        if (unit.star === 3) {
          g.lineStyle(4, 0xf2e9d5, .9); g.strokeRoundedRect(x - 34, y - 22, 68, 63, 23);
        }
        const label = this.scene.add.text(x, y - 36, unit.signatureId === 'ToyWorkshop' ? 'TOY SHIELD' : unit.star === 3 ? 'WOOL HUG · HEAL + SHIELD' : 'WOOLKEEPER · HEAL', {
          fontFamily: 'Arial', fontSize: '14px', color: '#fff7e6', backgroundColor: '#24352a', padding: { x: 7, y: 4 },
        }).setOrigin(.5).setDepth(181);
        this.funMarkers.push(g, label); this.objects.push(g, label);
      }));
    snapshot.enemies.forEach(enemy => {
      const visual = this.enemies.get(enemy.enemyId);
      if (!visual) return;
      const active = enemy.currentHp > 0 && (enemy.funControlUntil ?? 0) > (snapshot.elapsedTime ?? 0);
      visual.characterView.root.setVisible(!(active && enemy.funControlKind === 'Duck'));
      if (enemy.bombAt !== undefined && enemy.bombAt > (snapshot.elapsedTime ?? 0)) {
        const x = visual.container.x + 38; const y = visual.container.y - 30;
        const bomb = this.scene.add.circle(x, y, 19, 0x202725).setStrokeStyle(3, 0xc8b58a).setDepth(180);
        const count = this.scene.add.text(x, y, `${Math.max(0, enemy.bombAt - (snapshot.elapsedTime ?? 0)).toFixed(1)}`, {
          fontFamily: 'Arial', fontSize: '15px', color: '#f6db9f', fontStyle: 'bold',
        }).setOrigin(.5).setDepth(181);
        this.funMarkers.push(bomb, count); this.objects.push(bomb, count);
      }
      if (!active) return;
      const g = this.scene.add.graphics().setDepth(180);
      const duck = enemy.funControlKind === 'Duck';
      const point = duck || enemy.funControlKind === 'Bubble' || enemy.funControlKind === 'Disrupt' ? { x: visual.container.x, y: visual.container.y - 22 }
        : battleModelPosition(this.layout, enemy.carrotX ?? enemy.positionX, enemy.carrotLane ?? enemy.positionLane);
      const x = point.x; const y = point.y;
      g.lineStyle(4, 0x10151b);
      if (enemy.funControlKind === 'Disrupt') {
        g.lineStyle(5, 0xc8b58a); g.lineBetween(x - 16, y - 16, x + 16, y + 16); g.lineBetween(x + 16, y - 16, x - 16, y + 16);
      } else if (enemy.funControlKind === 'Bubble') {
        g.lineStyle(4, 0xa7c9bd); g.strokeCircle(x, y, 42);
      } else if (duck) {
        g.fillStyle(0xffffff); g.fillEllipse(x, y + 8, 54, 42); g.strokeEllipse(x, y + 8, 54, 42);
        g.fillCircle(x + 12, y - 13, 22); g.strokeCircle(x + 12, y - 13, 22);
        g.fillStyle(0xffbf24); g.fillEllipse(x + 35, y - 8, 26, 13); g.strokeEllipse(x + 35, y - 8, 26, 13);
        g.fillStyle(0x10151b); g.fillCircle(x + 17, y - 17, 3);
      } else {
        g.fillStyle(0xf68b32); g.fillTriangle(x - 23, y - 38, x + 23, y - 38, x, y + 32);
        g.strokeTriangle(x - 23, y - 38, x + 23, y - 38, x, y + 32);
        g.lineStyle(7, 0x67b94a); g.lineBetween(x, y - 37, x - 15, y - 58); g.lineBetween(x, y - 37, x + 14, y - 57);
        g.fillStyle(0x10151b); g.fillRoundedRect(x - 19, y - 25, 38, 13, 3);
        g.lineStyle(3, 0xffffff); g.lineBetween(x - 6, y + 1, x + 6, y + 1);
      }
      const text = this.scene.add.text(x, y - 76, enemy.funControlKind === 'Disrupt' ? 'INTERRUPTED · 1s' : enemy.funControlKind === 'Bubble' ? 'BUBBLE · ACTION BLOCKED' : duck ? 'QUACK! · SKILL BLOCKED' : 'LOOK HERE! · DECOY', {
        fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', backgroundColor: '#101c30', padding: { x: 7, y: 4 },
      }).setOrigin(.5).setDepth(181);
      this.funMarkers.push(g, text); this.objects.push(g, text);
    });
  }
  playTick(event: BattleTickPresentation): void {
    // 1. Attack windup anticipation
    if (event.attackWindups && event.attackWindups.length > 0) {
      event.attackWindups.forEach((windup) => {
        const visual = windup.isPlayer
          ? this.units.get(windup.unitId)
          : this.enemies.get(windup.unitId);
        if (!visual || visual.container.alpha <= 0.2) return;

        if (windup.isPlayer) {
          this.units.get(windup.unitId)?.characterView.playAttack(260);
        } else {
          this.enemies.get(windup.unitId)?.characterView.playAttack();
        }

        const leanX = windup.isPlayer ? 4 : -4;
        this.scene.tweens.add({
          targets: visual.container,
          x: visual.container.x + leanX,
          scaleX: 1.07,
          scaleY: 1.07,
          duration: 120,
          yoyo: true,
          ease: 'Quad.Out',
        });
      });
    }

    // 2. Player attacks resolved against enemies
    event.enemyDamages.forEach((damageEvent) => {
      if (damageEvent.damage <= 0) return;
      const visual = this.enemies.get(damageEvent.enemyId);
      if (!visual) return;

      // Authored enemy cutout hit response; fallback body flash remains
      // available when an asset is missing.
      visual.characterView.playHit();
      this.flash(visual.body, 0xffffff, 70, () => {
        this.flash(visual.body, 0xef4444, 50);
      });

      // Impact ring burst
      FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xf97316, 20);

      // Visual recoil on target (never alters model coordinates)
      this.recoilVisual(visual.container, 4);

      // Floating combat text
      this.floatCombatText(
        visual.container.x,
        visual.container.y,
        `-${formatNumber(damageEvent.damage)}`,
        '#f87171',
        damageEvent.enemyId,
      );
    });

    // 3. Enemy attacks resolved against player units
    if (event.unitDamages && event.unitDamages.length > 0) {
      event.unitDamages.forEach((unitDamage) => {
        if (unitDamage.damage <= 0) return;
        const visual = this.units.get(unitDamage.unitId);
        if (!visual) return;

        // Hit flash / pose. Fallback body keeps the original flash while authored art
        // receives a presentation-only hit pose/tint.
        visual.characterView.playHit(180);
        this.flash(visual.body, 0xffffff, 70, () => {
          this.flash(visual.body, 0xef4444, 50);
        });

        // Impact ring burst
        FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xef4444, 20);

        // Visual recoil on target
        this.recoilVisual(visual.container, -4);

        // Floating combat text
        this.floatCombatText(
          visual.container.x,
          visual.container.y,
          `-${formatNumber(unitDamage.damage)}`,
          '#ef4444',
          unitDamage.unitId,
        );
      });
    } else if (event.enemyTargetId && event.targetDamage > 0) {
      // Fallback for single targetDamage
      const visual = this.units.get(event.enemyTargetId);
      if (visual) {
        visual.characterView.playHit(180);
        this.flash(visual.body, 0xffffff, 70, () => {
          this.flash(visual.body, 0xef4444, 50);
        });
        FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xef4444, 20);
        this.recoilVisual(visual.container, -4);
        this.floatCombatText(
          visual.container.x,
          visual.container.y,
          `-${formatNumber(event.targetDamage)}`,
          '#ef4444',
          event.enemyTargetId,
        );
      }
    }

    // Signature punctuation is layered on top of normal damage so identity stays readable.
    event.signatureFx.forEach((fx) => this.playSignatureFx(fx));

    // 4. Defeated player units punctuation
    event.defeatedUnitIds.forEach((unitId) => {
      const visual = this.units.get(unitId);
      if (!visual) return;
      visual.hpBarContainer.setAlpha(0);
      visual.characterView.setAlive(false);
      this.scene.tweens.killTweensOf(visual.container);
      this.flash(visual.body, 0xffffff, 80);
      this.scene.tweens.add({
        targets: visual.container,
        alpha: 0.2,
        y: visual.container.y + 10,
        scaleX: 0.8,
        scaleY: 0.8,
        angle: 12,
        duration: 220,
        ease: 'Quad.In',
      });
    });

    // 5. Defeated enemy units punctuation
    event.defeatedEnemyIds.forEach((enemyId) => {
      const visual = this.enemies.get(enemyId);
      if (!visual) return;
      visual.hpBarContainer.setAlpha(0);
      visual.characterView.playKo();
      this.scene.tweens.killTweensOf(visual.container);
      this.flash(visual.body, 0xffffff, 80);
      this.scene.tweens.add({
        targets: visual.container,
        alpha: 0.2,
        y: visual.container.y + 10,
        scaleX: 0.8,
        scaleY: 0.8,
        angle: -12,
        duration: 220,
        ease: 'Quad.In',
      });
    });
  }

  private playSignatureFx(event: SignatureFxPresentation): void {
    this.signatureVfxRenderer.playSignatureFx(event);
  }

  playHeal(event: BattleHealPresentation): void {
    if (!event.unitId || event.amount <= 0) return;

    const visual = this.units.get(event.unitId);
    if (!visual || visual.container.alpha <= 0.2) return;

    // Green pulse ring
    FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0x22c55e, 38);

    // Floating combat text showing actual healed amount
    this.floatCombatText(
      visual.container.x,
      visual.container.y,
      `+${formatNumber(event.amount)}`,
      '#22c55e',
      `heal-${event.unitId}`,
    );

    // Restorative upward sparkle particles
    for (let i = 0; i < 3; i++) {
      const pX = visual.container.x + (i - 1) * 12;
      const pY = visual.container.y + 6;
      const particle = this.scene.add.circle(pX, pY, 3, 0x4ade80, 0.9).setDepth(140);
      this.objects.push(particle);
      this.scene.tweens.add({
        targets: particle,
        y: pY - 24,
        alpha: 0,
        duration: 360 + i * 40,
        ease: 'Cubic.Out',
        onComplete: () => {
          const idx = this.objects.indexOf(particle);
          if (idx >= 0) this.objects.splice(idx, 1);
          particle.destroy();
        },
      });
    }

    // Body brief scale highlight
    this.scene.tweens.add({
      targets: visual.body,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 120,
      yoyo: true,
      ease: 'Sine.Out',
    });
  }

  playTacticalCast(energyId: string, targetId: string | undefined, amount: number, heal: boolean, origin: { x: number; y: number }): void {
    if (!targetId) return;
    const visual = heal ? this.units.get(targetId) : this.enemies.get(targetId);
    if (!visual) return;
    const names: Record<string, string> = { 'energy-a': 'MEND', 'energy-b': 'RESCUE', 'energy-c': 'BREAK', 'energy-d': 'PIERCE', 'energy-e': 'GUARD', 'energy-f': 'DISRUPT' };
    const color = heal ? 0x4ade80 : energyId === 'energy-c' ? 0x34d399 : 0xfbbf24;
    const target = { x: visual.container.x, y: visual.container.y - 35 };
    const trail = this.scene.add.graphics().setDepth(250);
    trail.lineStyle(4, color, .7);
    trail.lineBetween(origin.x, origin.y, target.x, target.y);
    const projectile = this.scene.add.circle(origin.x, origin.y, 9, color).setDepth(251);
    const label = this.scene.add.text(target.x, target.y - 72,
      energyId === 'energy-e' ? 'GUARD\nSHIELD · 3s' : energyId === 'energy-f' ? 'DISRUPT\nINTERRUPTED · 1s' : `${names[energyId]}\n${heal ? 'HEAL' : 'DAMAGE'} ${heal ? '+' : '−'}${formatNumber(amount)} HP`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', align: 'center',
        color: heal ? '#86efac' : '#fde68a', backgroundColor: '#101c30', padding: { x: 12, y: 8 },
      }).setOrigin(.5).setDepth(252);
    this.objects.push(trail, projectile, label);
    const dispose = (object: Phaser.GameObjects.GameObject) => {
      const index = this.objects.indexOf(object);
      if (index >= 0) this.objects.splice(index, 1);
      object.destroy();
    };
    this.scene.tweens.add({ targets: projectile, x: target.x, y: target.y, duration: 260,
      onComplete: () => {
        FeedbackEffects.pulseRing(this.scene, target.x, target.y, color, 65);
        dispose(projectile);
      },
    });
    this.scene.tweens.add({ targets: trail, alpha: 0, delay: 260, duration: 400, onComplete: () => dispose(trail) });
    this.scene.tweens.add({ targets: label, y: label.y - 18, alpha: 0, delay: 1300, duration: 400, onComplete: () => dispose(label) });
  }
  playEnergyDamage(enemyId: string | undefined, amount: number): void {
    if (!enemyId || amount <= 0) return;
    const visual = this.enemies.get(enemyId);
    if (!visual) return;
    visual.characterView.playHit();
    this.flash(visual.body, 0xfbbf24, 120);
    FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xfbbf24, 38);
    this.floatCombatText(visual.container.x, visual.container.y, `-${formatNumber(amount)}`, '#fbbf24', `energy-${enemyId}`);
  }

  destroy(): void {
    this.units.forEach((visual) => visual.characterView.dispose());
    this.scene.tweens.killTweensOf([...this.objects]);
    this.objects.splice(0).forEach((object) => object.destroy());
    this.gridObjects.splice(0);
    this.units.clear();
    this.enemies.clear();
    this.floatingTextSystem.clear();
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
  }

  private createBattleGrid(): void {
    this.gridRenderer.createBattleGrid(this.showcaseMode);
  }

  private scheduleGridFade(): void {
    this.gridRenderer.scheduleGridFade(this.showcaseMode);
  }

  private syncUnit(unit: CombatUnit): void {
    this.unitVisualManager.syncUnit(unit, this.showcaseMode);
  }

  private syncEnemy(enemy: EnemyCombatUnit): void {
    this.unitVisualManager.syncEnemy(enemy, this.showcaseMode);
  }

  private recoilVisual(container: Phaser.GameObjects.Container, offsetX: number): void {
    if (!container || !container.active || container.alpha <= 0.2) return;
    const startX = container.x;
    this.scene.tweens.add({
      targets: container,
      x: startX + offsetX,
      duration: 55,
      yoyo: true,
      ease: 'Quad.Out',
      onComplete: () => {
        if (container.active) container.x = startX;
      },
    });
  }

  private flash(
    target: Phaser.GameObjects.Rectangle,
    color: number,
    duration = 100,
    onComplete?: () => void,
  ): void {
    const original = target.fillColor;
    target.setFillStyle(color);
    this.scene.time.delayedCall(duration, () => {
      if (target.active) {
        target.setFillStyle(original);
        onComplete?.();
      }
    });
  }

  private floatCombatText(
    x: number,
    y: number,
    text: string,
    color: string,
    unitKey: string,
  ): void {
    this.floatingTextSystem.floatCombatText(x, y, text, color, unitKey);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

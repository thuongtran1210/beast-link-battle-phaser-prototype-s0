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
  createPlayerBattleLayout,
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
import { BattleFunControlsRenderer } from './battle/BattleFunControlsRenderer';
import { CleanProjectileRenderer } from './battle/CleanProjectileRenderer';

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
  private readonly funControlsRenderer: BattleFunControlsRenderer;
  private showcaseMode = false;
  private readonly projectiles: CleanProjectileRenderer;

  constructor(
    private readonly scene: Phaser.Scene,
    baseX = 18,
    baseY = 105,
  ) {
    this.layout = createPlayerBattleLayout(scene.scale.width,scene.scale.height,isCompactLandscape(),baseX,baseY);
    this.projectiles = new CleanProjectileRenderer(scene, this.objects);
    // Presentation coordinates only: reserve the lower skill dock and use wider screens.

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
    this.funControlsRenderer = new BattleFunControlsRenderer(
      this.scene,
      this.layout,
      this.objects,
      this.units,
      this.enemies,
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
    this.funControlsRenderer.renderFunControls(snapshot);
  }
  playTick(event: BattleTickPresentation): void {
    const projectileTargets = new Set(event.attackers.filter(attacker => attacker.role === 'Ranger' || attacker.role === 'Mage').flatMap(attacker => attacker.targetEnemyIds));
    event.attackers.filter(attacker => attacker.role === 'Ranger' || attacker.role === 'Mage').forEach(attacker => {
      const source = this.units.get(attacker.unitId);
      if (!source) return;
      const signature = event.signatureFx.find(fx => fx.unitId === attacker.unitId);
      if (signature && ['WoollyRescue', 'ToyWorkshop', 'BubbleTrap', 'TickingBomb'].includes(signature.signatureId)) return;
      source.characterView.playAttack(300);
      const origin = source.characterView.getEffectPoint(source.container.x, source.container.y);
      [...new Set(attacker.targetEnemyIds)].slice(0, 3).forEach(id => {
        const target = this.enemies.get(id); if (!target) return;
        this.projectiles.play(origin, {x:target.container.x, y:target.container.y - 38}, attacker.role === 'Ranger' ? 'arrow' : 'magic', Boolean(signature));
      });
    });
    event.signatureFx.forEach(fx => {
      const kind = fx.signatureId === 'WoollyRescue' ? 'heart' : fx.signatureId === 'ToyWorkshop' ? 'toy' : fx.signatureId === 'BubbleTrap' ? 'bubble' : fx.signatureId === 'TickingBomb' ? 'bomb' : undefined;
      const source = this.units.get(fx.unitId); if (!kind || !source) return;
      fx.targetIds.slice(0, 3).forEach(id => {
        const target = kind === 'heart' || kind === 'toy' ? this.units.get(id) : this.enemies.get(id);
        if (target) this.projectiles.play(source.characterView.getEffectPoint(source.container.x, source.container.y), {x:target.container.x,y:target.container.y-35}, kind, fx.star === 3);
      });
    });
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
      if (!projectileTargets.has(damageEvent.enemyId)) FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xf97316, 20);

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
    const color = heal ? 0x4ade80 : energyId === 'energy-c' ? 0x34d399 : 0xfbbf24;
    const target = { x: visual.container.x, y: visual.container.y - 35 };
    const trail = this.scene.add.graphics().setDepth(250);
    trail.lineStyle(4, color, .7);
    trail.lineBetween(origin.x, origin.y, target.x, target.y);
    const projectile = this.scene.add.circle(origin.x, origin.y, 9, color).setDepth(251);
    const mobile = isCompactLandscape();
    const label = this.scene.add.text(target.x, mobile ? Math.max(188, target.y - 55) : target.y - 72,
      energyId === 'energy-e' ? 'SHIELD · 3s' : energyId === 'energy-f' ? 'INTERRUPT · 1s' : `${heal ? '+' : '−'}${formatNumber(amount)} HP`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', align: 'center',
        color: heal ? '#b2cbb0' : '#dfc997', backgroundColor: '#24352b', padding: { x: 8, y: 4 },
      }).setOrigin(.5).setDepth(252);
    this.objects.push(trail, projectile, label);
    const dispose = (object: Phaser.GameObjects.GameObject) => {
      const index = this.objects.indexOf(object);
      if (index >= 0) this.objects.splice(index, 1);
      object.destroy();
    };
    this.scene.tweens.add({ targets: projectile, x: target.x, y: target.y, duration: 260,
      onComplete: () => {
        FeedbackEffects.pulseRing(this.scene, target.x, target.y, color, mobile ? 32 : 65);
        dispose(projectile);
      },
    });
    this.scene.tweens.add({ targets: trail, alpha: 0, delay: 260, duration: 400, onComplete: () => dispose(trail) });
    this.scene.tweens.add({ targets: label, y: label.y - 12, alpha: 0, delay: 700, duration: 300, onComplete: () => dispose(label) });
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
    this.funControlsRenderer.clear();
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

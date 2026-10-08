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
  SignatureFxPresentation,
} from '../battle/BattlePresentation';
import {
  battleModelPosition,
  createBattleFieldLayout,
  enemySlotPosition,
  playerSlotPosition,
  type BattleFieldLayout,
} from './BattleFieldLayout';

import { createIconImage } from './icons/IconFactory';
import { beastDisplayName, getIconDefinition } from './icons/UnitIconRegistry';
import { signatureTierLabel } from '../run/StarProfile';
import { BattleCharacterView } from './art/BattleCharacterView';
import { EnemyCharacterView } from './art/EnemyCharacterView';
import { FeedbackEffects } from './feedback/FeedbackEffects';
import { isCompactLandscape } from './layout/MobilePresentation';

interface UnitVisual {
  container: Phaser.GameObjects.Container;
  characterView: BattleCharacterView;
  body: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  signatureRing: Phaser.GameObjects.Arc;
  hpBarContainer: Phaser.GameObjects.Container;
  hpBorder: Phaser.GameObjects.Rectangle;
  ghostFill: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  currentHpRatio: number;
}

interface EnemyVisual {
  container: Phaser.GameObjects.Container;
  characterView: EnemyCharacterView;
  body: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  hpBarContainer: Phaser.GameObjects.Container;
  hpBorder: Phaser.GameObjects.Rectangle;
  ghostFill: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  currentHpRatio: number;
}

export class BattleActionView {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly gridObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly units = new Map<string, UnitVisual>();
  private readonly enemies = new Map<string, EnemyVisual>();
  private readonly unitHitTracking = new Map<string, { time: number; count: number }>();
  private readonly unitPresentationOffsets = new Map<string, { x: number; y: number }>();
  private readonly enemyPresentationOffsets = new Map<string, { x: number; y: number }>();
  private readonly layout: BattleFieldLayout;
  private showcaseMode = false;
  private funMarkers: Phaser.GameObjects.GameObject[] = [];
  private activeSignatureLabel?: Phaser.GameObjects.Text;

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
  }

  setShowcaseMode(enabled: boolean): void {
    this.showcaseMode = enabled;
  }

  render(snapshot: AutonomousBattleSnapshot): void {
    if (this.objects.length === 0) {
      this.createBattleGrid();
      this.scheduleGridFade();
    }

    this.updatePresentationOffsets(snapshot);
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
    const source = this.units.get(event.unitId);
    if (!source || !source.container.active) return;

    if (event.star === 3 && (event.signatureId === 'ArcaneBloom' || event.signatureId === 'FocusShot')) return;
    if (event.signatureId === 'WoollyRescue' || event.signatureId === 'ToyWorkshop' || event.signatureId === 'BubbleTrap') return;
    if (event.signatureId === 'TickingBomb') {
      event.targetIds.forEach(id => { const enemy = this.enemies.get(id); if (enemy) FeedbackEffects.pulseRing(this.scene, enemy.container.x, enemy.container.y - 20, 0xc8b58a, 55); });
      return;
    }
    source.characterView.playSignature(event.signatureId === 'ArcaneBloom' ? 1100 : 820);
    const sourcePoint = source.characterView.getEffectPoint(source.container.x, source.container.y);

    const targets = event.targetIds
      .map((id) => this.enemies.get(id))
      .filter((visual): visual is EnemyVisual => Boolean(visual));

    const addLabel = (label: string, color: string, holdMs = 520) => {
      if (isCompactLandscape() && this.activeSignatureLabel) {
        this.scene.tweens.killTweensOf(this.activeSignatureLabel);
        const index = this.objects.indexOf(this.activeSignatureLabel);
        if (index >= 0) this.objects.splice(index, 1);
        this.activeSignatureLabel.destroy();
        this.activeSignatureLabel = undefined;
      }
      const text = this.scene.add.text(isCompactLandscape() ? this.scene.scale.width / 2 : sourcePoint.x, isCompactLandscape() ? 160 : sourcePoint.y - 46, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: event.star === 3 ? '20px' : '14px',
        color,
        fontStyle: 'bold',
        backgroundColor: '#151a31',
        padding: { x: 8, y: 4 },
        stroke: '#11152b',
        strokeThickness: 2,
      }).setOrigin(.5).setDepth(175);
      this.objects.push(text);
      if (isCompactLandscape()) this.activeSignatureLabel = text;
      this.scene.tweens.add({
        targets: text,
        y: text.y - 10,
        alpha: 0,
        delay: holdMs,
        duration: 430,
        ease: 'Cubic.Out',
        onComplete: () => {
          const index = this.objects.indexOf(text);
          if (index >= 0) this.objects.splice(index, 1);
          text.destroy();
        },
      });
    };

    const drawTrails = (color: number, width = 4) => {
      if (!targets.length) return;
      const graphics = this.scene.add.graphics().setDepth(165);
      graphics.lineStyle(width, color, .9);
      targets.forEach((target) => {
        graphics.beginPath();
        graphics.moveTo(sourcePoint.x + 12, sourcePoint.y);
        graphics.lineTo(target.container.x - 12, target.container.y);
        graphics.strokePath();
      });
      this.objects.push(graphics);
      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 520,
        ease: 'Quad.Out',
        onComplete: () => {
          const index = this.objects.indexOf(graphics);
          if (index >= 0) this.objects.splice(index, 1);
          graphics.destroy();
        },
      });
    };

    switch (event.signatureId) {
      case 'GuardianBrace':
        event.targetIds.forEach(id => {
          const ally = this.units.get(id);
          if (!ally) return;
          const link = this.scene.add.graphics().setDepth(166);
          link.lineStyle(5, 0x72bff5, .85);
          link.lineBetween(sourcePoint.x, sourcePoint.y, ally.container.x, ally.container.y - 24);
          FeedbackEffects.pulseRing(this.scene, ally.container.x, ally.container.y - 24, 0x72bff5, 60);
          this.objects.push(link);
          this.scene.tweens.add({ targets: link, alpha: 0, duration: 1100, onComplete: () => {
            const index = this.objects.indexOf(link); if (index >= 0) this.objects.splice(index, 1);
            link.destroy();
          } });
        });
        if (event.targetIds.length) addLabel('★★★ SHARED SHIELD', '#bce4ff', 1100);
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0x72bff5, 46);
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0xf6d675, 35);
        if (!event.targetIds.length) addLabel(signatureTierLabel(event.signatureId, event.star), '#bce4ff', event.star === 3 ? 1100 : 520);
        break;
      case 'AmbushStrike':
        drawTrails(0xfb7185, 6);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xfb7185, 28));
        addLabel(event.star === 3 && targets.length > 1 ? '★★★ AMBUSH · CHAIN STRIKE' : signatureTierLabel(event.signatureId, event.star), '#ff91a1', event.star === 3 ? 1100 : 520);
        break;
      case 'FocusShot':
        drawTrails(0x8be2bd, 5);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x8be2bd, 25));
        addLabel(signatureTierLabel(event.signatureId, event.star), '#b9f1d8');
        break;
      case 'ArcaneBloom': {
        // Caster aura: clearly communicates "Mage cast" before the target explosions.
        const aura = this.scene.add.circle(
          source.container.x,
          source.container.y - 4,
          28,
          0x7e22ce,
          0.28,
        ).setStrokeStyle(3, 0xe9d5ff, 0.95).setDepth(160);
        const core = this.scene.add.circle(
          source.container.x,
          source.container.y - 4,
          8,
          0xf0abfc,
          0.9,
        ).setDepth(166);
        this.objects.push(aura, core);

        this.scene.tweens.add({
          targets: aura,
          scaleX: 1.65,
          scaleY: 1.65,
          alpha: 0.06,
          duration: 820,
          ease: 'Sine.Out',
          onComplete: () => {
            const index = this.objects.indexOf(aura);
            if (index >= 0) this.objects.splice(index, 1);
            aura.destroy();
          },
        });
        this.scene.tweens.add({
          targets: core,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          delay: 220,
          duration: 620,
          ease: 'Cubic.Out',
          onComplete: () => {
            const index = this.objects.indexOf(core);
            if (index >= 0) this.objects.splice(index, 1);
            core.destroy();
          },
        });

        // Arcane links make multi-target Mage identity readable even in a still frame.
        const bloomLinks = this.scene.add.graphics().setDepth(164);
        bloomLinks.lineStyle(5, 0xc084fc, 0.78);
        targets.forEach((target) => {
          bloomLinks.beginPath();
          bloomLinks.moveTo(sourcePoint.x + 12, sourcePoint.y - 4);
          bloomLinks.lineTo(target.container.x - 10, target.container.y);
          bloomLinks.strokePath();
        });
        this.objects.push(bloomLinks);
        this.scene.tweens.add({
          targets: bloomLinks,
          alpha: 0,
          delay: 300,
          duration: 620,
          ease: 'Quad.Out',
          onComplete: () => {
            const index = this.objects.indexOf(bloomLinks);
            if (index >= 0) this.objects.splice(index, 1);
            bloomLinks.destroy();
          },
        });

        targets.forEach((target, index) => {
          const disc = this.scene.add.circle(
            target.container.x,
            target.container.y,
            22 + index * 3,
            0x9333ea,
            0.36,
          ).setStrokeStyle(2, 0xf0abfc, 0.8).setDepth(158);
          this.objects.push(disc);
          this.scene.tweens.add({
            targets: disc,
            scaleX: 2.35,
            scaleY: 2.35,
            alpha: 0,
            delay: 180,
            duration: 760,
            ease: 'Cubic.Out',
            onComplete: () => {
              const objectIndex = this.objects.indexOf(disc);
              if (objectIndex >= 0) this.objects.splice(objectIndex, 1);
              disc.destroy();
            },
          });
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xc084fc, 39 + index * 5);
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xf0abfc, 25 + index * 3);
        });

        addLabel(event.star === 3 ? '★★★ BLOOM → ECHO' : signatureTierLabel(event.signatureId, event.star), '#f3e8ff', 1300);

        if (event.star === 3 && targets.length > 0) {
          const echo = targets[targets.length - 1];
          this.scene.time.delayedCall(280, () => {
            if (!echo.container.active) return;
            const echoDisc = this.scene.add.circle(
              echo.container.x,
              echo.container.y,
              16,
              0xf6d675,
              0.35,
            ).setStrokeStyle(2, 0xfff1a8, 0.95).setDepth(170);
            this.objects.push(echoDisc);
            this.scene.tweens.add({
              targets: echoDisc,
              scaleX: 2,
              scaleY: 2,
              alpha: 0,
              duration: 620,
              ease: 'Cubic.Out',
              onComplete: () => {
                const index = this.objects.indexOf(echoDisc);
                if (index >= 0) this.objects.splice(index, 1);
                echoDisc.destroy();
              },
            });
            FeedbackEffects.pulseRing(this.scene, echo.container.x, echo.container.y, 0xf6d675, 31);
            const echoText = this.scene.add.text(echo.container.x, echo.container.y - 42, 'ECHO', {
              fontFamily: 'Arial, sans-serif',
              fontSize: '11px',
              color: '#fff1a8',
              backgroundColor: '#3a2d12',
              padding: { x: 6, y: 3 },
              fontStyle: 'bold',
              stroke: '#11152b',
              strokeThickness: 2,
            }).setOrigin(.5).setDepth(176);
            this.objects.push(echoText);
            this.scene.tweens.add({
              targets: echoText,
              y: echoText.y - 10,
              alpha: 0,
              delay: 500,
              duration: 420,
              ease: 'Cubic.Out',
              onComplete: () => {
                const index = this.objects.indexOf(echoText);
                if (index >= 0) this.objects.splice(index, 1);
                echoText.destroy();
              },
            });
          });
        }
        break;
      }
      case 'IronRam':
        drawTrails(0x38bdf8, 7);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x38bdf8, 34));
        this.scene.tweens.add({
          targets: source.container,
          x: source.container.x + 8,
          duration: 70,
          yoyo: true,
          ease: 'Quad.Out',
        });
        addLabel(signatureTierLabel(event.signatureId, event.star), '#bcecff');
        break;
      case 'TwinVolley':
        drawTrails(0xf472b6, 4);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xf472b6, 22));
        addLabel(signatureTierLabel(event.signatureId, event.star), '#fbcfe8');
        break;
    }
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
    this.unitHitTracking.clear();
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
  }

  private createChibiArena(): void {
    const x = 18;
    const y = isCompactLandscape() ? 142 : this.layout.baseY + 6;
    const width = isCompactLandscape() ? this.scene.scale.width - 36 : this.scene.scale.width - Math.min(360, Math.max(300, Math.round(this.scene.scale.width * .28))) - 54;
    const height = this.scene.scale.height - y - 190;
    const g = this.scene.add.graphics().setDepth(-10);
    const edge = 0x182b27;
    // Broad flat shapes echo the cutouts; details stay along the boundary.
    g.fillStyle(0x243a31);
    g.fillRoundedRect(x, y, width, height, 36);
    g.lineStyle(5, edge);
    g.strokeRoundedRect(x, y, width, height, 36);
    g.fillStyle(0x3e5742);
    g.fillRoundedRect(x + 12, y + 12, width - 24, height - 24, 30);
    g.fillStyle(0x68654e);
    g.fillRoundedRect(x + 60, y + 50, width - 120, height - 84, 64);
    g.lineStyle(4, 0x46533b, .8);
    g.strokeRoundedRect(x + 60, y + 50, width - 120, height - 84, 64);
    g.fillStyle(0x73705a, .55);
    g.fillEllipse(x + width / 2, y + height / 2 + 10, width - 170, height - 115);
    const bush = (cx: number, cy: number, radius: number) => {
      g.fillStyle(edge);
      g.fillCircle(cx - radius * .6, cy, radius + 3);
      g.fillCircle(cx + radius * .6, cy, radius + 3);
      g.fillCircle(cx, cy - radius * .5, radius + 3);
      g.fillStyle(0x426a46);
      g.fillCircle(cx - radius * .6, cy - 2, radius);
      g.fillCircle(cx + radius * .6, cy - 2, radius);
      g.fillCircle(cx, cy - radius * .5 - 2, radius);
      g.fillStyle(0x5d7e50);
      g.fillEllipse(cx - 5, cy - radius * .65, radius * 1.2, radius * .55);
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
    // Few sparse grass tufts; no markings that imply playable slots.
    g.lineStyle(3, 0x78915b, .65);
    [0.14, 0.34, 0.63, 0.86].forEach(ratio => {
      const cx = x + width * ratio;
      const cy = y + height - 17;
      g.lineBetween(cx, cy, cx - 6, cy - 9);
      g.lineBetween(cx, cy, cx + 2, cy - 12);
      g.lineBetween(cx, cy, cx + 8, cy - 7);
    });
    this.objects.push(g);
  }
  private createBattleGrid(): void {
    const layout = this.layout;
    if (this.showcaseMode) this.createChibiArena();

    if (!this.showcaseMode) {
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
    this.objects.push(divider);
    this.gridObjects.push(divider);

    const rows: BattleRow[] = ['Front', 'Mid', 'Back'];
    rows.forEach((row) => {
      const playerTop = playerSlotPosition(layout, row, 1);
      const enemyTop = enemySlotPosition(layout, row, 1);

      if (!this.showcaseMode) {
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
          this.showcaseMode ? 0x243653 : 0xeff6ff,
          this.showcaseMode ? 0.18 : 0.42,
        ).setStrokeStyle(this.showcaseMode ? 1 : 2, 0x93c5fd, this.showcaseMode ? 0.25 : 1);

        const enemySlot = this.scene.add.rectangle(
          enemyPos.x,
          enemyPos.y,
          layout.slotWidth,
          layout.slotHeight,
          this.showcaseMode ? 0x412735 : 0xfef2f2,
          this.showcaseMode ? 0.16 : 0.42,
        ).setStrokeStyle(this.showcaseMode ? 1 : 2, 0xfca5a5, this.showcaseMode ? 0.22 : 1);

        this.objects.push(playerSlot, enemySlot);
        this.gridObjects.push(playerSlot, enemySlot);
      }
    });

    for (let column = 1; column <= 6; column += 1) {
      const lane = playerSlotPosition(layout, 'Front', column);
      if (!this.showcaseMode) {
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

  private syncUnit(unit: CombatUnit): void {
    let visual = this.units.get(unit.unitId);
    if (!visual) {
      visual = this.createUnit(unit);
      this.units.set(unit.unitId, visual);
    }

    const ratio = unit.maxHp > 0 ? clamp01(unit.currentHp / unit.maxHp) : 0;
    this.updateHpBar(visual, ratio, unit.currentHp <= 0);

    if (this.showcaseMode) {
      visual.label.setText(`${beastDisplayName(unit.beastId)}\n${'★'.repeat(unit.star)}`);
    } else {
      const stateBadge = unit.movementPolicyState && unit.currentHp > 0
        ? `\n${unit.movementPolicyState.toUpperCase()}`
        : '';
      visual.label.setText(
        `${'★'.repeat(unit.star)} ${formatNumber(unit.currentHp)}${stateBadge}`,
      );
    }
    visual.characterView.setFacing('right');
    visual.label.setVisible(!visual.characterView.isAuthored || !this.showcaseMode);
    visual.hpBarContainer.y = visual.characterView.hpAnchorY;
    visual.signatureRing.y = visual.characterView.effectAnchorY;

    const readyColor =
      (unit.temporaryShieldHp ?? 0) > 0 ? 0x72bff5
      : unit.ambushReady ? 0xfb7185
      : unit.focusReady ? 0x8be2bd
      : undefined;
    if (readyColor !== undefined && unit.currentHp > 0) {
      visual.signatureRing.setStrokeStyle(2, readyColor, 0.9).setVisible(true);
    } else {
      visual.signatureRing.setVisible(false);
    }

    const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
    const offset = this.unitPresentationOffsets.get(unit.unitId) ?? { x: 0, y: 0 };
    if (unit.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
      this.moveVisual(visual.container, position.x + offset.x, position.y + offset.y);
    }
  }

  private syncEnemy(enemy: EnemyCombatUnit): void {
    let visual = this.enemies.get(enemy.enemyId);
    if (!visual) {
      visual = this.createEnemy(enemy);
      this.enemies.set(enemy.enemyId, visual);
    }

    const ratio = enemy.maxHp > 0 ? clamp01(enemy.currentHp / enemy.maxHp) : 0;
    this.updateHpBar(visual, ratio, enemy.currentHp <= 0);

    const archetypeBadge = enemy.archetype
      ? enemy.archetype === 'Frontliner'
        ? 'FRONT'
        : enemy.archetype.toUpperCase()
      : 'FRONT';

    if (this.showcaseMode) {
      visual.label.setText(`[${archetypeBadge}]`);
    } else {
      const stateBadge = enemy.engagedTargetId
        ? '\n[ENGAGED]'
        : enemy.movementPolicyState && enemy.movementPolicyState !== 'Idle'
        ? `\n[${enemy.movementPolicyState.toUpperCase()}]`
        : '';
      visual.label.setText(
        `[${archetypeBadge}]\n${formatNumber(enemy.currentHp)} HP\nDMG ${enemy.damage}${stateBadge}`,
      );
    }

    visual.label.setVisible(!visual.characterView.isAuthored || !this.showcaseMode);
    visual.hpBarContainer.y = visual.characterView.hpAnchorY;

    let strokeColor = 0x450a0a;
    if (enemy.engagedTargetId) {
      strokeColor = 0xf59e0b;
    } else if (enemy.archetype === 'Diver') {
      strokeColor = 0xa855f7;
    } else if (enemy.archetype === 'Ranged') {
      strokeColor = 0x06b6d4;
    }
    visual.body.setStrokeStyle(2, strokeColor);

    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    const offset = this.enemyPresentationOffsets.get(enemy.enemyId) ?? { x: 0, y: 0 };
    if (enemy.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
      this.moveVisual(visual.container, position.x + offset.x, position.y + offset.y);
    }
  }

  private updatePresentationOffsets(snapshot: AutonomousBattleSnapshot): void {
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
    if (!this.showcaseMode) return;

    const assign = (
      entries: Array<{ id: string; x: number; y: number }>,
      output: Map<string, { x: number; y: number }>,
      sideOffsetX: number,
    ) => {
      const sorted = [...entries].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
      const placed: Array<{ x: number; y: number; rank: number }> = [];
      // V2-M4: cutouts are larger than the old card tokens, so presentation-only
      // declumping needs a wider vertical fan to keep silhouettes readable.
      const yOffsets = [0, -36, 36, -62, 62];
      const xOffsets = [0, -14, 14, -24, 24];

      sorted.forEach((entry) => {
        const nearby = placed.filter(
          (other) => Math.abs(other.x - entry.x) < 64 && Math.abs(other.y - entry.y) < 54,
        );
        const rank = Math.min(nearby.length, yOffsets.length - 1);
        output.set(entry.id, {
          x: sideOffsetX + xOffsets[rank],
          y: yOffsets[rank],
        });
        placed.push({ x: entry.x, y: entry.y, rank });
      });
    };

    assign(
      snapshot.units
        .filter((unit) => unit.currentHp > 0)
        .map((unit) => {
          const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
          return { id: unit.unitId, x: position.x, y: position.y };
        }),
      this.unitPresentationOffsets,
      18,
    );

    assign(
      snapshot.enemies
        .filter((enemy) => enemy.currentHp > 0)
        .map((enemy) => {
          const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
          return { id: enemy.enemyId, x: position.x, y: position.y };
        }),
      this.enemyPresentationOffsets,
      -18,
    );
  }

  private updateHpBar(
    visual: UnitVisual | EnemyVisual,
    ratio: number,
    isDead: boolean,
  ): void {
    if (isDead) {
      visual.hpFill.width = 0;
      visual.ghostFill.width = 0;
      visual.hpBarContainer.setAlpha(0);
      visual.currentHpRatio = 0;
      return;
    }

    visual.hpBarContainer.setAlpha(1);
    const targetWidth = 46 * ratio;

    if (ratio < visual.currentHpRatio) {
      // Damage: HP fill drops immediately; ghost fill catches up with delay
      visual.hpFill.width = targetWidth;
      this.scene.tweens.killTweensOf(visual.ghostFill);
      this.scene.tweens.add({
        targets: visual.ghostFill,
        width: targetWidth,
        duration: 300,
        ease: 'Quad.Out',
        delay: 70,
      });
    } else if (ratio > visual.currentHpRatio) {
      // Heal: both update immediately
      visual.hpFill.width = targetWidth;
      visual.ghostFill.width = targetWidth;
    }
    visual.currentHpRatio = ratio;
  }

  private createUnit(unit: CombatUnit): UnitVisual {
    const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
    const beastDef = getIconDefinition(unit.beastId);

    const characterView = new BattleCharacterView(
      this.scene,
      unit.beastId,
      this.showcaseMode,
      roleFill(unit.role),
    );
    characterView.setFacing('right');

    // Existing fallback objects remain available to hit flashes and validation
    // presentation. Authored mode hides them inside BattleCharacterView.
    const body = characterView.fallbackBody;
    const icon = characterView.fallbackIcon;

    const signatureRing = this.scene.add
      .circle(0, characterView.effectAnchorY, this.showcaseMode ? 34 : 23, 0x000000, 0)
      .setStrokeStyle(2, beastDef.accentColor, 0.85)
      .setVisible(false);

    const label = this.scene.add.text(0, 14, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: this.showcaseMode ? '#fff8ef' : '#fbbf24',
      align: 'center',
      fontStyle: 'bold',
      lineSpacing: -2,
    }).setOrigin(0.5);

    const hpBarContainer = this.scene.add.container(0, characterView.hpAnchorY);
    const hpBorder = this.scene.add.rectangle(0, 0, 48, 6, 0x090d16, 0.95).setStrokeStyle(1, 0x334155);
    const ghostFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xfca5a5, 0.9).setOrigin(0, 0.5);
    const hpFill = this.scene.add.rectangle(-23, 0, 46, 4, 0x22c55e, 1.0).setOrigin(0, 0.5);
    hpBarContainer.add([hpBorder, ghostFill, hpFill]);

    const container = this.scene.add.container(
      position.x,
      position.y,
      [characterView.root, signatureRing, label, hpBarContainer],
    );

    this.objects.push(container);
    return {
      container,
      characterView,
      body,
      icon,
      label,
      signatureRing,
      hpBarContainer,
      hpBorder,
      ghostFill,
      hpFill,
      currentHpRatio: unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 1,
    };
  }

  private createEnemy(enemy: EnemyCombatUnit): EnemyVisual {
    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    const archetype = enemy.archetype ?? 'Frontliner';
    const characterView = new EnemyCharacterView(this.scene, archetype, this.showcaseMode);

    // Keep fallback handles for debug stroke/flash logic. EnemyCharacterView
    // hides them automatically when the V2 cutout is available.
    const body = characterView.fallbackBody;
    const icon = characterView.fallbackIcon;

    const label = this.scene.add.text(0, 16, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '7px',
      color: '#fff4f2',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hpBarContainer = this.scene.add.container(0, characterView.hpAnchorY);
    const hpBorder = this.scene.add.rectangle(0, 0, 48, 6, 0x090d16, 0.95).setStrokeStyle(1, 0x334155);
    const ghostFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xfca5a5, 0.9).setOrigin(0, 0.5);
    const hpFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xef4444, 1.0).setOrigin(0, 0.5);
    hpBarContainer.add([hpBorder, ghostFill, hpFill]);

    const container = this.scene.add.container(
      position.x,
      position.y,
      [characterView.root, label, hpBarContainer],
    );

    this.objects.push(container);
    return {
      container,
      characterView,
      body,
      icon,
      label,
      hpBarContainer,
      hpBorder,
      ghostFill,
      hpFill,
      currentHpRatio: enemy.maxHp > 0 ? enemy.currentHp / enemy.maxHp : 1,
    };
  }

  private scheduleGridFade(): void {
    this.scene.time.delayedCall(this.showcaseMode ? 220 : 650, () => {
      const liveGridObjects = this.gridObjects.filter((object) => object.active);
      if (!liveGridObjects.length) return;
      this.scene.tweens.add({
        targets: liveGridObjects,
        alpha: this.showcaseMode ? 0.04 : 0.08,
        duration: this.showcaseMode ? 220 : 350,
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
      duration: 100,
      ease: 'Linear',
    });
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
    const now = Date.now();
    let hitInfo = this.unitHitTracking.get(unitKey);
    if (!hitInfo || now - hitInfo.time > 400) {
      hitInfo = { time: now, count: 0 };
    } else {
      hitInfo.count = (hitInfo.count + 1) % 3;
      hitInfo.time = now;
    }
    this.unitHitTracking.set(unitKey, hitInfo);

    const offsetX = (hitInfo.count - 1) * 14;
    const offsetY = hitInfo.count * -8;

    // Landscape bounds safety (1280x720)
    const spawnX = Math.max(50, Math.min(960, x + offsetX));
    const spawnY = Math.max(75, Math.min(640, y - 36 + offsetY));

    const txt = this.scene.add
      .text(spawnX, spawnY, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color,
        fontStyle: 'bold',
        stroke: '#0f172a',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(150);

    this.objects.push(txt);
    this.scene.tweens.add({
      targets: txt,
      y: spawnY - 26,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.Out',
      onComplete: () => {
        const index = this.objects.indexOf(txt);
        if (index >= 0) this.objects.splice(index, 1);
        txt.destroy();
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

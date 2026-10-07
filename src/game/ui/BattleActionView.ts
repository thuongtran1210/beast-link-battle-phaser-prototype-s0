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
import { createEnemyArchetypeIcon } from './icons/EnemyIconFactory';
import { FeedbackEffects } from './feedback/FeedbackEffects';

interface UnitVisual {
  container: Phaser.GameObjects.Container;
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

  constructor(
    private readonly scene: Phaser.Scene,
    baseX = 18,
    baseY = 105,
  ) {
    this.layout = createBattleFieldLayout(baseX, baseY);
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
  }

  playTick(event: BattleTickPresentation): void {
    // 1. Attack windup anticipation
    if (event.attackWindups && event.attackWindups.length > 0) {
      event.attackWindups.forEach((windup) => {
        const visual = windup.isPlayer
          ? this.units.get(windup.unitId)
          : this.enemies.get(windup.unitId);
        if (!visual || visual.container.alpha <= 0.2) return;

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

      // Hit flash
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

        // Hit flash
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

    const targets = event.targetIds
      .map((id) => this.enemies.get(id))
      .filter((visual): visual is EnemyVisual => Boolean(visual));

    const addLabel = (label: string, color: string, holdMs = 520) => {
      const text = this.scene.add.text(source.container.x, source.container.y - 52, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color,
        fontStyle: 'bold',
        backgroundColor: '#151a31',
        padding: { x: 8, y: 4 },
        stroke: '#11152b',
        strokeThickness: 2,
      }).setOrigin(.5).setDepth(175);
      this.objects.push(text);
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
        graphics.moveTo(source.container.x + 12, source.container.y);
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
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0x72bff5, 46);
        FeedbackEffects.pulseRing(this.scene, source.container.x, source.container.y, 0xf6d675, 35);
        addLabel(signatureTierLabel(event.signatureId, event.star), '#bce4ff');
        break;
      case 'AmbushStrike':
        drawTrails(0xfb7185, 6);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xfb7185, 28));
        addLabel(signatureTierLabel(event.signatureId, event.star), '#ff91a1');
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
          bloomLinks.moveTo(source.container.x + 12, source.container.y - 4);
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

        addLabel(signatureTierLabel(event.signatureId, event.star), '#f3e8ff', 900);

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

  playEnergyDamage(enemyId: string | undefined, amount: number): void {
    if (!enemyId || amount <= 0) return;
    const visual = this.enemies.get(enemyId);
    if (!visual) return;
    this.flash(visual.body, 0xfbbf24, 120);
    FeedbackEffects.pulseRing(this.scene, visual.container.x, visual.container.y, 0xfbbf24, 38);
    this.floatCombatText(visual.container.x, visual.container.y, `-${formatNumber(amount)}`, '#fbbf24', `energy-${enemyId}`);
  }

  destroy(): void {
    this.scene.tweens.killTweensOf([...this.objects]);
    this.objects.splice(0).forEach((object) => object.destroy());
    this.gridObjects.splice(0);
    this.units.clear();
    this.enemies.clear();
    this.unitHitTracking.clear();
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
  }

  private createBattleGrid(): void {
    const layout = this.layout;

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
      const yOffsets = [0, -22, 22, -40, 40];
      const xOffsets = [0, -7, 7, -12, 12];

      sorted.forEach((entry) => {
        const nearby = placed.filter(
          (other) => Math.abs(other.x - entry.x) < 44 && Math.abs(other.y - entry.y) < 36,
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
      -14,
    );

    assign(
      snapshot.enemies
        .filter((enemy) => enemy.currentHp > 0)
        .map((enemy) => {
          const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
          return { id: enemy.enemyId, x: position.x, y: position.y };
        }),
      this.enemyPresentationOffsets,
      14,
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
    const body = this.scene.add
      .rectangle(0, 0, this.showcaseMode ? 66 : 54, this.showcaseMode ? 60 : 48, beastDef.bgFill, this.showcaseMode ? 0.38 : 0.95)
      .setStrokeStyle(this.showcaseMode ? 2.5 : 2, this.showcaseMode ? beastDef.borderColor : roleFill(unit.role));

    const signatureRing = this.scene.add
      .circle(0, -6, this.showcaseMode ? 34 : 23, 0x000000, 0)
      .setStrokeStyle(2, beastDef.accentColor, 0.85)
      .setVisible(false);

    const icon = createIconImage(this.scene, unit.beastId, 0, -7, this.showcaseMode ? 54 : 36);

    const label = this.scene.add.text(0, 14, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: this.showcaseMode ? '8px' : '8px',
      color: this.showcaseMode ? '#fff8ef' : '#fbbf24',
      align: 'center',
      fontStyle: 'bold',
      lineSpacing: -2,
    }).setOrigin(0.5);

    // HP Bar above unit (y = -29)
    const hpBarContainer = this.scene.add.container(0, -29);
    const hpBorder = this.scene.add.rectangle(0, 0, 48, 6, 0x090d16, 0.95).setStrokeStyle(1, 0x334155);
    const ghostFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xfca5a5, 0.9).setOrigin(0, 0.5);
    const hpFill = this.scene.add.rectangle(-23, 0, 46, 4, 0x22c55e, 1.0).setOrigin(0, 0.5);
    hpBarContainer.add([hpBorder, ghostFill, hpFill]);

    const container = this.scene.add.container(
      position.x,
      position.y,
      [body, signatureRing, icon, label, hpBarContainer],
    );

    this.objects.push(container);
    return {
      container,
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
    const body = this.scene.add
      .rectangle(0, 0, this.showcaseMode ? 62 : 52, this.showcaseMode ? 58 : 46, 0x2b2030, this.showcaseMode ? 0.34 : 0.98)
      .setStrokeStyle(2, 0x6b3b48);

    const icon = createEnemyArchetypeIcon(this.scene, archetype, 0, -6, this.showcaseMode ? 49 : 31);

    const label = this.scene.add.text(0, 16, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '7px',
      color: '#fff4f2',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // HP Bar above enemy (y = -27)
    const hpBarContainer = this.scene.add.container(0, -27);
    const hpBorder = this.scene.add.rectangle(0, 0, 48, 6, 0x090d16, 0.95).setStrokeStyle(1, 0x334155);
    const ghostFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xfca5a5, 0.9).setOrigin(0, 0.5);
    const hpFill = this.scene.add.rectangle(-23, 0, 46, 4, 0xef4444, 1.0).setOrigin(0, 0.5);
    hpBarContainer.add([hpBorder, ghostFill, hpFill]);

    const container = this.scene.add.container(
      position.x,
      position.y,
      [body, icon, label, hpBarContainer],
    );

    this.objects.push(container);
    return {
      container,
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

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
import { createEnemyArchetypeIcon } from './icons/EnemyIconFactory';
import { FeedbackEffects } from './feedback/FeedbackEffects';

interface UnitVisual {
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

    const addLabel = (label: string, color: string) => {
      const text = this.scene.add.text(source.container.x, source.container.y - 48, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color,
        fontStyle: 'bold',
        stroke: '#11152b',
        strokeThickness: 3,
      }).setOrigin(.5).setDepth(175);
      this.objects.push(text);
      this.scene.tweens.add({
        targets: text,
        y: text.y - 16,
        alpha: 0,
        duration: 520,
        ease: 'Cubic.Out',
        onComplete: () => {
          const index = this.objects.indexOf(text);
          if (index >= 0) this.objects.splice(index, 1);
          text.destroy();
        },
      });
    };

    const drawTrails = (color: number, width = 3) => {
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
        duration: 260,
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
        addLabel('GUARDIAN BRACE', '#bce4ff');
        break;
      case 'AmbushStrike':
        drawTrails(0xfb7185, 4);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xfb7185, 28));
        addLabel('AMBUSH!', '#ff91a1');
        break;
      case 'FocusShot':
        drawTrails(0x8be2bd, 3);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x8be2bd, 25));
        addLabel('FOCUS SHOT', '#b9f1d8');
        break;
      case 'ArcaneBloom':
        targets.forEach((target, index) => {
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xc084fc, 30 + index * 4);
          FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x7c3aed, 19 + index * 3);
        });
        addLabel('ARCANE BLOOM', '#e9d5ff');
        break;
      case 'IronRam':
        drawTrails(0x38bdf8, 5);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0x38bdf8, 34));
        this.scene.tweens.add({
          targets: source.container,
          x: source.container.x + 8,
          duration: 70,
          yoyo: true,
          ease: 'Quad.Out',
        });
        addLabel('IRON RAM', '#bcecff');
        break;
      case 'TwinVolley':
        drawTrails(0xf472b6, 2);
        targets.forEach((target) => FeedbackEffects.pulseRing(this.scene, target.container.x, target.container.y, 0xf472b6, 22));
        addLabel('TWIN VOLLEY', '#fbcfe8');
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
      visual.label.setText(`${'★'.repeat(unit.star)} ${unit.role.toUpperCase()}`);
    } else {
      const stateBadge = unit.movementPolicyState && unit.currentHp > 0
        ? `\n${unit.movementPolicyState.toUpperCase()}`
        : '';
      visual.label.setText(
        `${'★'.repeat(unit.star)} ${formatNumber(unit.currentHp)}${stateBadge}`,
      );
    }

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
    if (enemy.currentHp > 0) {
      visual.container.setAlpha(1).setAngle(0);
      this.moveVisual(visual.container, position.x, position.y);
    }
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
    const body = this.scene.add
      .rectangle(0, 0, 52, 46, 0x1e293b, this.showcaseMode ? 0.48 : 0.95)
      .setStrokeStyle(2, roleFill(unit.role));

    const icon = createIconImage(this.scene, unit.beastId, 0, -4, this.showcaseMode ? 42 : 36);

    const label = this.scene.add.text(0, 15, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: '#fbbf24',
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
      currentHpRatio: unit.maxHp > 0 ? unit.currentHp / unit.maxHp : 1,
    };
  }

  private createEnemy(enemy: EnemyCombatUnit): EnemyVisual {
    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    const archetype = enemy.archetype ?? 'Frontliner';
    const body = this.scene.add
      .rectangle(0, 0, 52, 46, 0x2b2030, this.showcaseMode ? 0.5 : 0.98)
      .setStrokeStyle(2, 0x6b3b48);

    const icon = createEnemyArchetypeIcon(this.scene, archetype, 0, -5, this.showcaseMode ? 39 : 31);

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

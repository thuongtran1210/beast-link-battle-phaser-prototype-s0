import Phaser from 'phaser';
import type {
  AutonomousBattleSnapshot,
  CombatUnit,
  EnemyCombatUnit,
} from '../../battle/AutonomousBattleModel';
import { BattleCharacterView } from '../art/BattleCharacterView';
import { EnemyCharacterView } from '../art/EnemyCharacterView';
import { beastDisplayName, getIconDefinition } from '../icons/UnitIconRegistry';
import { battleModelPosition, type BattleFieldLayout } from '../BattleFieldLayout';

export interface UnitVisual {
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

export interface EnemyVisual {
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

export function roleFill(role: CombatUnit['role']): number {
  if (role === 'Tanker') return 0xfacc15;
  if (role === 'Assassin') return 0xf97316;
  if (role === 'Ranger') return 0x22c55e;
  return 0xa78bfa;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export class BattleUnitVisualManager {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layout: BattleFieldLayout,
    private readonly objects: Phaser.GameObjects.GameObject[],
    private readonly units: Map<string, UnitVisual>,
    private readonly enemies: Map<string, EnemyVisual>,
    private readonly unitPresentationOffsets: Map<string, { x: number; y: number }>,
    private readonly enemyPresentationOffsets: Map<string, { x: number; y: number }>,
  ) {}

  updatePresentationOffsets(snapshot: AutonomousBattleSnapshot, showcaseMode: boolean): void {
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
    if (!showcaseMode) return;

    const assign = (
      entries: Array<{ id: string; x: number; y: number }>,
      output: Map<string, { x: number; y: number }>,
      sideOffsetX: number,
    ) => {
      const sorted = [...entries].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
      const placed: Array<{ x: number; y: number; rank: number }> = [];
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

  syncUnit(unit: CombatUnit, showcaseMode: boolean): void {
    let visual = this.units.get(unit.unitId);
    if (!visual) {
      visual = this.createUnit(unit, showcaseMode);
      this.units.set(unit.unitId, visual);
    }

    const ratio = unit.maxHp > 0 ? clamp01(unit.currentHp / unit.maxHp) : 0;
    this.updateHpBar(visual, ratio, unit.currentHp <= 0);

    if (showcaseMode) {
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
    visual.label.setVisible(!visual.characterView.isAuthored || !showcaseMode);
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

  syncEnemy(enemy: EnemyCombatUnit, showcaseMode: boolean): void {
    let visual = this.enemies.get(enemy.enemyId);
    if (!visual) {
      visual = this.createEnemy(enemy, showcaseMode);
      this.enemies.set(enemy.enemyId, visual);
    }

    const ratio = enemy.maxHp > 0 ? clamp01(enemy.currentHp / enemy.maxHp) : 0;
    this.updateHpBar(visual, ratio, enemy.currentHp <= 0);

    const archetypeBadge = enemy.archetype
      ? enemy.archetype === 'Frontliner'
        ? 'FRONT'
        : enemy.archetype.toUpperCase()
      : 'FRONT';

    if (showcaseMode) {
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

    visual.label.setVisible(!visual.characterView.isAuthored || !showcaseMode);
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

  updateHpBar(
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
      visual.hpFill.width = targetWidth;
      visual.ghostFill.width = targetWidth;
    }
    visual.currentHpRatio = ratio;
  }

  createUnit(unit: CombatUnit, showcaseMode: boolean): UnitVisual {
    const position = battleModelPosition(this.layout, unit.positionX, unit.positionLane);
    const beastDef = getIconDefinition(unit.beastId);

    const characterView = new BattleCharacterView(
      this.scene,
      unit.beastId,
      showcaseMode,
      roleFill(unit.role),
    );
    characterView.setFacing('right');

    const body = characterView.fallbackBody;
    const icon = characterView.fallbackIcon;

    const signatureRing = this.scene.add
      .circle(0, characterView.effectAnchorY, showcaseMode ? 34 : 23, 0x000000, 0)
      .setStrokeStyle(2, beastDef.accentColor, 0.85)
      .setVisible(false);

    const label = this.scene.add.text(0, 14, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: showcaseMode ? '#fff8ef' : '#fbbf24',
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

  createEnemy(enemy: EnemyCombatUnit, showcaseMode: boolean): EnemyVisual {
    const position = battleModelPosition(this.layout, enemy.positionX, enemy.positionLane);
    const archetype = enemy.archetype ?? 'Frontliner';
    const characterView = new EnemyCharacterView(this.scene, archetype, showcaseMode);

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

  moveVisual(container: Phaser.GameObjects.Container, x: number, y: number): void {
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
}

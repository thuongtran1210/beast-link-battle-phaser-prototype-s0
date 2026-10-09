import Phaser from 'phaser';
import { packBattleBodies, type PresentationBody } from './BattlePresentationPacking';
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

  private facingSnapshot?: AutonomousBattleSnapshot;

  updatePresentationOffsets(snapshot: AutonomousBattleSnapshot, showcaseMode: boolean): void {
    this.unitPresentationOffsets.clear();
    this.enemyPresentationOffsets.clear();
    this.facingSnapshot = snapshot;
    if (!showcaseMode || snapshot.elapsedTicks === 0) return;

    const entries: PresentationBody[] = [
      ...snapshot.units.filter(u=>u.currentHp>0).map(u=>({id:`player:${u.unitId}`,side:'player' as const,...battleModelPosition(this.layout,u.positionX,u.positionLane)})),
      ...snapshot.enemies.filter(u=>u.currentHp>0).map(u=>({id:`enemy:${u.enemyId}`,side:'enemy' as const,...battleModelPosition(this.layout,u.positionX,u.positionLane)})),
    ];
    const packed=packBattleBodies(entries, {
      left:this.layout.baseX+60, right:this.layout.dividerX*2-this.layout.baseX-60,
      top:this.layout.topLaneY-20, bottom:this.layout.topLaneY+5*this.layout.laneGap,
    });
    for(const entry of entries) {
      const position=packed.get(entry.id)!;
      const output=entry.side==='player' ? this.unitPresentationOffsets : this.enemyPresentationOffsets;
      output.set(entry.id.slice(entry.id.indexOf(':')+1),{x:position.x-entry.x,y:position.y-entry.y});
    }
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
    const target=this.facingSnapshot?.enemies.find(e=>e.enemyId===unit.targetEnemyId && e.currentHp>0);
    const sourcePosition=battleModelPosition(this.layout,unit.positionX,unit.positionLane);
    const sourceX=sourcePosition.x+(this.unitPresentationOffsets.get(unit.unitId)?.x??0);
    const targetX=target ? battleModelPosition(this.layout,target.positionX,target.positionLane).x+(this.enemyPresentationOffsets.get(target.enemyId)?.x??0) : undefined;
    if(unit.currentHp>0) visual.characterView.setFacing(targetX===undefined || targetX>=sourceX ? 'right':'left');
    visual.label.setVisible(!visual.characterView.isAuthored || !showcaseMode);
    visual.hpBarContainer.setPosition(visual.container.x, visual.container.y + visual.characterView.hpAnchorY);
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
      visual.characterView.setMoving(Math.abs(visual.container.x-position.x-offset.x)>1||Math.abs(visual.container.y-position.y-offset.y)>1);
      this.moveVisual(visual.container, position.x + offset.x, position.y + offset.y);
    }
  }

  syncEnemy(enemy: EnemyCombatUnit, showcaseMode: boolean): void {
    let visual = this.enemies.get(enemy.enemyId);
    if (!visual) {
      visual = this.createEnemy(enemy, showcaseMode);
      this.enemies.set(enemy.enemyId, visual);
    }

    const target=this.facingSnapshot?.units.find(u=>u.unitId===(enemy.engagedTargetId??enemy.targetUnitId) && u.currentHp>0);
    const sourceX=battleModelPosition(this.layout,enemy.positionX,enemy.positionLane).x+(this.enemyPresentationOffsets.get(enemy.enemyId)?.x??0);
    const targetX=target ? battleModelPosition(this.layout,target.positionX,target.positionLane).x+(this.unitPresentationOffsets.get(target.unitId)?.x??0) : undefined;
    if(enemy.currentHp>0) visual.characterView.setFacing(targetX===undefined || targetX<sourceX ? 'left':'right');

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
    visual.hpBarContainer.setPosition(visual.container.x, visual.container.y + visual.characterView.hpAnchorY);

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
      [characterView.root, signatureRing, label],
    );

    hpBarContainer.setPosition(position.x, position.y+characterView.hpAnchorY).setDepth(210);
    container.setDepth(100+position.y/10);
    this.objects.push(container, hpBarContainer);
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
      [characterView.root, label],
    );

    hpBarContainer.setPosition(position.x, position.y+characterView.hpAnchorY).setDepth(210);
    container.setDepth(100+position.y/10);
    this.objects.push(container, hpBarContainer);
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
    const visual=[...this.units.values(),...this.enemies.values()].find(v=>v.container===container);
    const align=()=>{
      container.setDepth(100+container.y/10);
      if(visual) visual.hpBarContainer.setPosition(container.x,container.y+visual.characterView.hpAnchorY);
    };
    align();
    if (Math.abs(container.x - x) < 0.5 && Math.abs(container.y - y) < 0.5) return;
    this.scene.tweens.killTweensOf(container);
    this.scene.tweens.add({
      targets: container,
      x,
      y,
      duration: 100,
      ease: 'Linear',
      onUpdate: align,
      onComplete: align,
    });
  }
}

import Phaser from 'phaser';
import { createIconImage } from '../icons/IconFactory';
import { getIconDefinition } from '../icons/UnitIconRegistry';
import {
  battleCharacterDefinition,
  type BattleFacing,
  type BattlePose,
} from './BattleCharacterManifest';
import {
  hasAuthoredBattleCharacterArt,
  resolveBattleCharacterTexture,
} from './BattleCharacterLoader';

/**
 * Presentation-only Beast visual.
 *
 * It owns either an authored full-body sprite or the existing procedural
 * portrait fallback. It never reads or mutates combat rules.
 */
export class BattleCharacterView {
  readonly root: Phaser.GameObjects.Container;
  readonly fallbackBody: Phaser.GameObjects.Rectangle;
  readonly fallbackIcon: Phaser.GameObjects.Image;

  private authoredImage?: Phaser.GameObjects.Image;
  private poseReset?: Phaser.Time.TimerEvent;
  private currentPose: BattlePose = 'idle';
  private alive = true;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly beastId: string,
    private readonly showcaseMode: boolean,
    fallbackStrokeColor?: number,
  ) {
    const definition = battleCharacterDefinition(beastId);
    const iconDef = getIconDefinition(beastId);

    this.fallbackBody = scene.add
      .rectangle(
        0,
        0,
        showcaseMode ? 66 : 54,
        showcaseMode ? 60 : 48,
        iconDef.bgFill,
        showcaseMode ? 0.38 : 0.95,
      )
      .setStrokeStyle(
        showcaseMode ? 2.5 : 2,
        showcaseMode ? iconDef.borderColor : fallbackStrokeColor ?? iconDef.borderColor,
      );

    this.fallbackIcon = createIconImage(
      scene,
      beastId,
      0,
      -7,
      showcaseMode ? 54 : 36,
    );

    this.root = scene.add.container(0, 0, [this.fallbackBody, this.fallbackIcon]);

    const idleTexture = resolveBattleCharacterTexture(scene, beastId, 'idle');
    if (idleTexture && definition) {
      this.authoredImage = scene.add
        .image(0, definition.groundOffsetY, idleTexture)
        .setOrigin(0.5, 1)
        .setDisplaySize(
          definition.displayHeight,
          definition.displayHeight,
        );
      this.root.add(this.authoredImage);
      this.showAuthored(true);
    } else {
      this.showAuthored(false);
    }
  }

  get isAuthored(): boolean {
    return Boolean(this.authoredImage && hasAuthoredBattleCharacterArt(this.scene, this.beastId));
  }

  get effectAnchorY(): number {
    return this.isAuthored
      ? battleCharacterDefinition(this.beastId)?.effectAnchorY ?? -20
      : -6;
  }

  get hpAnchorY(): number {
    return this.isAuthored
      ? battleCharacterDefinition(this.beastId)?.hpAnchorY ?? -46
      : -29;
  }

  setFacing(direction: BattleFacing): void {
    const magnitude = Math.max(0.001, Math.abs(this.root.scaleX));
    this.root.setScale(direction === 'right' ? magnitude : -magnitude, this.root.scaleY);
  }

  setPose(pose: BattlePose): void {
    if (!this.alive && pose !== 'ko') return;
    this.currentPose = pose;

    const texture = resolveBattleCharacterTexture(this.scene, this.beastId, pose);
    if (!texture) {
      this.showAuthored(false);
      return;
    }

    const definition = battleCharacterDefinition(this.beastId);
    if (!definition) return;

    if (!this.authoredImage) {
      this.authoredImage = this.scene.add
        .image(0, definition.groundOffsetY, texture)
        .setOrigin(0.5, 1)
        .setDisplaySize(definition.displayHeight, definition.displayHeight);
      this.root.add(this.authoredImage);
    } else {
      this.authoredImage
        .setTexture(texture)
        .setPosition(0, definition.groundOffsetY)
        .setDisplaySize(definition.displayHeight, definition.displayHeight);
    }

    this.showAuthored(true);
  }

  playAttack(duration = 260): void {
    this.playTemporaryPose('attack', duration);
  }

  playSignature(duration = 900): void {
    this.playTemporaryPose('signature', duration);
  }

  playHit(duration = 180): void {
    if (!this.alive) return;
    this.setPose('hit');

    const target = this.authoredImage ?? this.fallbackIcon;
    target.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (target.active) target.clearTint();
    });

    this.scheduleIdle(duration);
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
    this.poseReset?.remove(false);
    this.poseReset = undefined;
    this.setPose(alive ? 'idle' : 'ko');
  }

  getEffectPoint(worldX: number, worldY: number): { x: number; y: number } {
    return { x: worldX, y: worldY + this.effectAnchorY };
  }

  dispose(): void {
    this.poseReset?.remove(false);
    this.poseReset = undefined;
  }

  private playTemporaryPose(pose: BattlePose, duration: number): void {
    if (!this.alive) return;
    this.setPose(pose);
    this.scheduleIdle(duration);
  }

  private scheduleIdle(duration: number): void {
    this.poseReset?.remove(false);
    this.poseReset = this.scene.time.delayedCall(duration, () => {
      this.poseReset = undefined;
      if (this.alive && this.root.active) this.setPose('idle');
    });
  }

  private showAuthored(show: boolean): void {
    const canShow = show && Boolean(this.authoredImage);
    this.authoredImage?.setVisible(canShow);
    this.fallbackBody.setVisible(!canShow);
    this.fallbackIcon.setVisible(!canShow);

    // If a non-idle authored pose is absent, resolveBattleCharacterTexture
    // falls back to authored idle. Fallback portrait is used only when no
    // authored idle texture exists.
    if (!canShow && this.currentPose === 'ko') {
      this.fallbackBody.setAlpha(0.6);
      this.fallbackIcon.setAlpha(0.6);
    } else {
      this.fallbackBody.setAlpha(1);
      this.fallbackIcon.setAlpha(1);
    }
  }
}

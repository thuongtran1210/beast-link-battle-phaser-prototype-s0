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
  resolveBattleCharacterBaseTexture,
  resolveBattleCharacterOptionalTexture,
  resolveBattleCharacterTexture,
} from './BattleCharacterLoader';
import { battleMotionProfile } from './BattleMotionProfiles';

/**
 * Presentation-only Beast visual.
 *
 * V2 rule:
 * - one base cutout carries identity;
 * - transforms carry Attack / Hit / KO motion;
 * - optional Signature / KO art may override only where useful;
 * - gameplay logic never depends on art.
 */
export class BattleCharacterView {
  readonly root: Phaser.GameObjects.Container;
  readonly fallbackBody: Phaser.GameObjects.Rectangle;
  readonly fallbackIcon: Phaser.GameObjects.Image;

  private authoredImage?: Phaser.GameObjects.Image;
  private idleTween?: Phaser.Tweens.Tween;
  private poseReset?: Phaser.Time.TimerEvent;
  private currentPose: BattlePose = 'idle';
  private alive = true;
  private facing: BattleFacing = 'right';

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

    const baseTexture = resolveBattleCharacterBaseTexture(scene, beastId);
    if (baseTexture && definition) {
      this.authoredImage = scene.add
        .image(0, definition.groundOffsetY, baseTexture)
        .setOrigin(0.5, 1)
        .setDisplaySize(definition.displayHeight, definition.displayHeight);
      this.root.add(this.authoredImage);
      this.showAuthored(true);
    } else {
      this.showAuthored(false);
    }

    this.startIdleMotion();
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
    this.facing = direction;
    const magnitude = Math.max(0.001, Math.abs(this.root.scaleX));
    this.root.setScale(direction === 'right' ? magnitude : -magnitude, this.root.scaleY);
  }

  /**
   * Compatibility-only explicit pose swap.
   * V2 Attack / Hit animation should use transform motion instead.
   */
  setPose(pose: BattlePose): void {
    if (!this.alive && pose !== 'ko') return;
    this.currentPose = pose;

    const texture = resolveBattleCharacterTexture(this.scene, this.beastId, pose);
    if (!texture) {
      this.showAuthored(false);
      return;
    }

    this.setAuthoredTexture(texture);
  }

  playAttack(duration?: number): void {
    if (!this.alive) return;
    const profile = this.profile();
    this.resetToBaseTexture();
    this.stopMotion(true);

    const sign = this.facingSign();
    this.scene.tweens.add({
      targets: this.root,
      x: sign * profile.attackX,
      angle: sign * profile.attackAngle,
      scaleX: sign * profile.attackScaleX,
      scaleY: profile.attackScaleY,
      duration: Math.max(70, (duration ?? profile.attackDuration) / 2),
      ease: 'Quad.Out',
      yoyo: true,
      onComplete: () => this.startIdleMotion(),
    });
  }

  playSignature(duration?: number): void {
    if (!this.alive) return;
    const profile = this.profile();
    const signatureTexture = resolveBattleCharacterOptionalTexture(
      this.scene,
      this.beastId,
      'signature',
    );
    if (signatureTexture) this.setAuthoredTexture(signatureTexture);
    else this.resetToBaseTexture();

    this.stopMotion(true);
    const sign = this.facingSign();
    this.scene.tweens.add({
      targets: this.root,
      y: -profile.signatureLift,
      scaleX: sign * profile.signatureScale,
      scaleY: profile.signatureScale,
      duration: Math.max(120, (duration ?? profile.signatureDuration) / 2),
      ease: 'Sine.Out',
      yoyo: true,
      onComplete: () => {
        this.resetToBaseTexture();
        this.startIdleMotion();
      },
    });
  }

  playHit(duration?: number): void {
    if (!this.alive) return;
    const profile = this.profile();
    this.resetToBaseTexture();
    this.stopMotion(true);

    const target = this.authoredImage ?? this.fallbackIcon;
    target.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (target.active) target.clearTint();
    });

    const sign = this.facingSign();
    this.scene.tweens.add({
      targets: this.root,
      x: -sign * profile.hitX,
      angle: -sign * profile.hitAngle,
      scaleX: sign * profile.hitScale,
      scaleY: profile.hitScale,
      duration: Math.max(60, (duration ?? profile.hitDuration) / 2),
      ease: 'Quad.Out',
      yoyo: true,
      onComplete: () => this.startIdleMotion(),
    });
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
    this.poseReset?.remove(false);
    this.poseReset = undefined;

    if (alive) {
      this.resetToBaseTexture();
      this.resetTransform();
      this.startIdleMotion();
      return;
    }

    const profile = this.profile();
    const koTexture = resolveBattleCharacterOptionalTexture(this.scene, this.beastId, 'ko');
    if (koTexture) this.setAuthoredTexture(koTexture);
    else this.resetToBaseTexture();

    this.stopMotion(true);
    const sign = this.facingSign();
    this.scene.tweens.add({
      targets: this.root,
      angle: sign * profile.koAngle,
      y: profile.koDropY,
      scaleX: sign,
      scaleY: profile.koScaleY,
      duration: profile.koDuration,
      ease: 'Cubic.Out',
    });
  }

  getEffectPoint(worldX: number, worldY: number): { x: number; y: number } {
    return { x: worldX, y: worldY + this.effectAnchorY };
  }

  dispose(): void {
    this.poseReset?.remove(false);
    this.poseReset = undefined;
    this.stopMotion(false);
  }

  private profile() {
    const definition = battleCharacterDefinition(this.beastId);
    return battleMotionProfile(definition?.motionProfile ?? 'TANK');
  }

  private facingSign(): 1 | -1 {
    return this.facing === 'right' ? 1 : -1;
  }

  private startIdleMotion(): void {
    if (!this.alive || !this.root.active) return;
    this.idleTween?.stop();
    this.idleTween = undefined;

    const profile = this.profile();
    const sign = this.facingSign();
    this.resetTransform();

    this.idleTween = this.scene.tweens.add({
      targets: this.root,
      y: -profile.idleBob,
      scaleX: sign * (1 + profile.idleScale * 0.5),
      scaleY: 1 + profile.idleScale,
      duration: profile.idleDuration,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private stopMotion(reset: boolean): void {
    this.idleTween?.stop();
    this.idleTween = undefined;
    this.scene.tweens.killTweensOf(this.root);
    if (reset) this.resetTransform();
  }

  private resetTransform(): void {
    const sign = this.facingSign();
    this.root.setPosition(0, 0).setAngle(0).setScale(sign, 1);
  }

  private resetToBaseTexture(): void {
    this.currentPose = 'idle';
    const texture = resolveBattleCharacterBaseTexture(this.scene, this.beastId);
    if (!texture) {
      this.showAuthored(false);
      return;
    }
    this.setAuthoredTexture(texture);
  }

  private setAuthoredTexture(texture: string): void {
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

  private showAuthored(show: boolean): void {
    const canShow = show && Boolean(this.authoredImage);
    this.authoredImage?.setVisible(canShow);
    this.fallbackBody.setVisible(!canShow);
    this.fallbackIcon.setVisible(!canShow);

    if (!canShow && !this.alive) {
      this.fallbackBody.setAlpha(0.6);
      this.fallbackIcon.setAlpha(0.6);
    } else {
      this.fallbackBody.setAlpha(1);
      this.fallbackIcon.setAlpha(1);
    }
  }
}

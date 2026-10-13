import type Phaser from 'phaser';

export interface SquashStretchOptions {
  duration?: number;
  squashFactor?: number;
  ease?: string;
  onComplete?: () => void;
}

export interface HitWobbleOptions {
  facing?: 'left' | 'right';
  distance?: number;
  angle?: number;
  duration?: number;
  tintTarget?: Phaser.GameObjects.Components.Tint;
  onComplete?: () => void;
}

export interface KoTumbleOptions {
  facing?: 'left' | 'right';
  dropY?: number;
  angle?: number;
  duration?: number;
  onComplete?: () => void;
}

export interface HopBounceOptions {
  height?: number;
  duration?: number;
  onComplete?: () => void;
}

/**
 * CartoonJuiceAnimator
 * Reusable slapstick cartoon physics and tween motions for Cute Tactical Chibi units.
 * Independent of character type (works seamlessly on cutout images or sprite containers).
 */
export class CartoonJuiceAnimator {
  /**
   * Squash & stretch elastic recoil when hitting or getting hit.
   */
  static squashAndStretch(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container | Phaser.GameObjects.GameObject,
    options: SquashStretchOptions = {},
  ): Phaser.Tweens.Tween | undefined {
    if (!('scaleX' in target) || !('scaleY' in target) || !target.active) return undefined;

    // Cache the true rest scale so repeated hits never compound and flatten the character
    let origScaleX = 1;
    let origScaleY = 1;
    if ('getData' in target) {
      origScaleX = target.getData('origScaleX') ?? (Math.abs(target.scaleX) > 0.5 ? Math.sign(target.scaleX) : 1);
      origScaleY = target.getData('origScaleY') ?? (Math.abs(target.scaleY) > 0.5 ? 1 : 1);
      if (target.getData('origScaleX') === undefined) {
        target.setData('origScaleX', origScaleX);
        target.setData('origScaleY', origScaleY);
      }
    }

    // Always kill running tweens and reset back to rest scale before starting a new one
    scene.tweens.killTweensOf(target);
    if ('setScale' in target) {
      target.setScale(origScaleX, origScaleY);
    }

    // Gentle squash factor: clamped to at most ±0.08 to preserve chibi proportions
    const rawFactor = options.squashFactor ?? 0.05;
    const factor = Math.max(-0.08, Math.min(0.08, rawFactor));
    const duration = options.duration ?? 130;

    return scene.tweens.add({
      targets: target,
      scaleX: origScaleX * (1 + factor),
      scaleY: origScaleY * (1 - factor),
      duration: duration / 2,
      yoyo: true,
      ease: options.ease ?? 'Quad.Out',
      onComplete: () => {
        if (target.active && 'setScale' in target) {
          target.setScale(origScaleX, origScaleY);
        }
        options.onComplete?.();
      },
    });
  }

  /**
   * Slapstick hit wobble with directional recoil and white flash.
   */
  static hitWobble(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container | Phaser.GameObjects.GameObject,
    options: HitWobbleOptions = {},
  ): Phaser.Tweens.Tween | undefined {
    if (!('x' in target) || !('angle' in target) || !target.active) return undefined;

    const facing = options.facing ?? 'left';
    const sign = facing === 'right' ? 1 : -1;
    const dist = options.distance ?? 8;
    const angle = options.angle ?? 8;
    const duration = options.duration ?? 180;
    const startX = (target as any).x;

    // Optional white flash
    if (options.tintTarget && 'setTint' in options.tintTarget) {
      options.tintTarget.setTint(0xffffff);
      scene.time.delayedCall(60, () => {
        if ('clearTint' in options.tintTarget!) {
          options.tintTarget.clearTint();
        }
      });
    }

    scene.tweens.killTweensOf(target);

    return scene.tweens.add({
      targets: target,
      x: startX - sign * dist,
      angle: -sign * angle,
      duration: duration / 2,
      yoyo: true,
      ease: 'Back.Out',
      onComplete: () => {
        if (target.active) {
          if ('x' in target) (target as any).x = startX;
          if ('setAngle' in target) target.setAngle(0);
        }
        options.onComplete?.();
      },
    });
  }

  /**
   * Slapstick KO tumble: unit falls backward with legs up.
   */
  static koTumble(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container | Phaser.GameObjects.GameObject,
    options: KoTumbleOptions = {},
  ): Phaser.Tweens.Tween | undefined {
    if (!('angle' in target) || !('y' in target) || !target.active) return undefined;

    const facing = options.facing ?? 'right';
    const absAngle = Math.abs(options.angle ?? 75);
    const targetAngle = facing === 'right' ? -absAngle : absAngle;
    const dropY = options.dropY ?? 10;
    const duration = options.duration ?? 380;
    const startY = (target as any).y;

    scene.tweens.killTweensOf(target);

    return scene.tweens.add({
      targets: target,
      angle: targetAngle,
      y: startY + dropY,
      duration,
      ease: 'Bounce.Out',
      onComplete: () => {
        options.onComplete?.();
      },
    });
  }

  /**
   * Playful hop bounce (used for cheerful reactions, carrot luring, or celebrating).
   */
  static hopBounce(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container | Phaser.GameObjects.GameObject,
    options: HopBounceOptions = {},
  ): Phaser.Tweens.Tween | undefined {
    if (!('y' in target) || !target.active) return undefined;

    const height = options.height ?? 16;
    const duration = options.duration ?? 220;

    return scene.tweens.add({
      targets: target,
      y: `-=${height}`,
      duration: duration / 2,
      yoyo: true,
      ease: 'Quad.Out',
      onComplete: () => {
        options.onComplete?.();
      },
    });
  }
}

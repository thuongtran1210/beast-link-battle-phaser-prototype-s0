import type Phaser from 'phaser';
import { createIconImage } from '../icons/IconFactory';
import { HudTokens } from '../layout/HudTokens';

/**
 * Lightweight visual feedback utilities for prototype interaction readability.
 */
export class FeedbackEffects {
  /**
   * Spawns an animated token flying from a source coordinate to a destination HUD panel.
   */
  static flyToken(
    scene: Phaser.Scene,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    contentId: string,
    onComplete?: () => void,
  ): void {
    const container = scene.add.container(fromX, fromY).setDepth(200);

    // Subtle glow backdrop
    const glow = scene.add.circle(0, 0, 18, 0xfbbf24, 0.4);
    const icon = createIconImage(scene, contentId, 0, 0, 26);
    const plusTag = scene.add.text(14, -10, '+1', {
      fontFamily: HudTokens.fonts.family,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#0f172a',
      padding: { x: 3, y: 1 },
    });

    container.add([glow, icon, plusTag]);
    container.setScale(1.25);

    // Arc path or smooth quad bezier
    const midX = (fromX + toX) / 2;
    const midY = Math.min(fromY, toY) - 30;

    scene.tweens.add({
      targets: container,
      x: toX,
      y: toY,
      scaleX: 0.7,
      scaleY: 0.7,
      duration: 380,
      ease: 'Quad.InOut',
      onComplete: () => {
        // Small arrival pulse
        FeedbackEffects.pulseRing(scene, toX, toY, 0x38bdf8, 24);
        container.destroy();
        onComplete?.();
      },
    });
  }

  /**
   * Spawns floating upward text (e.g. +0.3s, +40 HP, -DMG).
   */
  static floatText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string = HudTokens.colors.textGold,
    fontSize = '15px',
    duration = 600,
  ): void {
    const txt = scene.add
      .text(x, y, text, {
        fontFamily: HudTokens.fonts.family,
        fontSize,
        color,
        fontStyle: 'bold',
        stroke: '#0f172a',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(250);

    scene.tweens.add({
      targets: txt,
      y: y - 32,
      alpha: 0,
      duration,
      ease: 'Cubic.Out',
      onComplete: () => txt.destroy(),
    });
  }

  /**
   * Expanding pulse ring (e.g. on match, slot snap, heal arrival).
   */
  static pulseRing(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color = 0xfbbf24,
    targetRadius = 36,
  ): void {
    const ring = scene.add.circle(x, y, 6, color, 0).setStrokeStyle(2.5, color, 0.95).setDepth(150);

    scene.tweens.add({
      targets: ring,
      radius: targetRadius,
      alpha: 0,
      duration: 260,
      ease: 'Sine.Out',
      onComplete: () => ring.destroy(),
    });
  }

  /**
   * Lightweight toast notification across board (e.g. Reshuffle auto-recovery).
   */
  static showToast(
    scene: Phaser.Scene,
    x: number,
    y: number,
    message: string,
    color: string = HudTokens.colors.textGold,
    duration = 1100,
  ): void {
    const txt = scene.add.text(0, 0, message, {
      fontFamily: HudTokens.fonts.family,
      fontSize: '13px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const padX = 28;
    const padY = 10;
    const bg = scene.add
      .rectangle(0, 0, txt.width + padX, txt.height + padY, 0x0f172a, 0.95)
      .setStrokeStyle(1.5, 0xf59e0b);

    const container = scene.add.container(x, y, [bg, txt]).setDepth(500).setScale(0.8).setAlpha(0);

    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 180,
      ease: 'Back.Out',
      onComplete: () => {
        scene.time.delayedCall(duration, () => {
          scene.tweens.add({
            targets: container,
            alpha: 0,
            y: y - 18,
            duration: 220,
            ease: 'Sine.In',
            onComplete: () => container.destroy(),
          });
        });
      },
    });
  }

  /**
   * Shakes a game object horizontally (e.g. for invalid match or hit).
   */
  static shake(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject,
    intensity = 5,
    duration = 160,
  ): void {
    const initialX = (target as any).x;
    scene.tweens.add({
      targets: target,
      x: initialX + intensity,
      duration: duration / 4,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        (target as any).x = initialX;
      },
    });
  }
}

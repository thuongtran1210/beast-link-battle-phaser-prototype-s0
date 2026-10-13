import Phaser from 'phaser';

export type EmotionBadgeKind = 'BONK' | 'CLANG' | 'COZY' | 'POOF' | 'DIZZY' | 'OUCH';

export interface ComicBadgeStyle {
  text: string;
  bgColor: number;
  textColor: string;
  strokeColor: number;
  scale?: number;
}

const BADGE_STYLES: Record<EmotionBadgeKind, ComicBadgeStyle> = {
  BONK: {
    text: '💥 BONK!',
    bgColor: 0xf59e0b,
    textColor: '#ffffff',
    strokeColor: 0x78350f,
    scale: 1.2,
  },
  CLANG: {
    text: '🛡️ CLANG!',
    bgColor: 0x0284c7,
    textColor: '#ffffff',
    strokeColor: 0x075985,
    scale: 1.1,
  },
  COZY: {
    text: '♥ COZY!',
    bgColor: 0xec4899,
    textColor: '#ffffff',
    strokeColor: 0x831843,
    scale: 1.15,
  },
  POOF: {
    text: '💨 POOF!',
    bgColor: 0x64748b,
    textColor: '#ffffff',
    strokeColor: 0x1e293b,
    scale: 1.1,
  },
  DIZZY: {
    text: '💫 DIZZY!',
    bgColor: 0x8b5cf6,
    textColor: '#ffffff',
    strokeColor: 0x4c1d95,
    scale: 1.15,
  },
  OUCH: {
    text: '💢 OUCH!',
    bgColor: 0xef4444,
    textColor: '#ffffff',
    strokeColor: 0x7f1d1d,
    scale: 1.1,
  },
};

/**
 * StatusEmotionOverlay
 * Renders playful cartoon emotion badges, dizzy stars, and slapstick reactions.
 */
export class StatusEmotionOverlay {
  /**
   * Spawn a bouncy comic speech badge above a unit's position.
   */
  static spawnComicBadge(
    scene: Phaser.Scene,
    managedObjects: Phaser.GameObjects.GameObject[],
    x: number,
    y: number,
    kind: EmotionBadgeKind,
    customText?: string,
  ): void {
    const style = BADGE_STYLES[kind];
    const textContent = customText ?? style.text;
    const badgeY = y - 48;

    const container = scene.add.container(x, badgeY).setDepth(240);
    managedObjects.push(container);

    // Comic pill bubble
    const paddingX = 14;
    const paddingY = 6;
    const label = scene.add.text(0, 0, textContent, {
      fontFamily: 'Impact, "Arial Black", sans-serif',
      fontSize: '13px',
      color: style.textColor,
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const bubbleWidth = Math.max(54, label.width + paddingX);
    const bubbleHeight = Math.max(24, label.height + paddingY);

    const bg = scene.add.graphics();
    bg.fillStyle(style.bgColor, 0.95);
    bg.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);
    bg.lineStyle(2.5, style.strokeColor, 1.0);
    bg.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);

    container.add([bg, label]);
    container.setScale(0.4);

    // Comic punch pop animation: elastic burst, float up, fade out
    scene.tweens.add({
      targets: container,
      scaleX: style.scale ?? 1.15,
      scaleY: style.scale ?? 1.15,
      duration: 160,
      ease: 'Back.Out',
      onComplete: () => {
        scene.tweens.add({
          targets: container,
          y: badgeY - 24,
          alpha: 0,
          scaleX: (style.scale ?? 1.15) * 0.9,
          scaleY: (style.scale ?? 1.15) * 0.9,
          delay: 450,
          duration: 250,
          ease: 'Cubic.In',
          onComplete: () => {
            const idx = managedObjects.indexOf(container);
            if (idx >= 0) managedObjects.splice(idx, 1);
            container.destroy();
          },
        });
      },
    });
  }

  /**
   * Spawn orbiting dizzy stars above a stunned or disrupted character.
   */
  static spawnDizzyStars(
    scene: Phaser.Scene,
    managedObjects: Phaser.GameObjects.GameObject[],
    x: number,
    y: number,
    durationMs = 1200,
  ): void {
    const starContainer = scene.add.container(x, y - 36).setDepth(235);
    managedObjects.push(starContainer);

    const starCount = 3;
    const stars: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < starCount; i++) {
      const star = scene.add.text(0, 0, '⭐', {
        fontSize: '14px',
      }).setOrigin(0.5);
      stars.push(star);
      starContainer.add(star);
    }

    let elapsed = 0;
    const radiusX = 22;
    const radiusY = 9;

    const timer = scene.time.addEvent({
      delay: 20,
      repeat: Math.floor(durationMs / 20),
      callback: () => {
        elapsed += 0.12;
        stars.forEach((star, index) => {
          const angle = elapsed + (index * (Math.PI * 2)) / starCount;
          star.setPosition(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY);
          star.setScale(0.75 + Math.sin(angle) * 0.25);
        });
      },
    });

    // Fade out and cleanup
    scene.time.delayedCall(durationMs - 200, () => {
      scene.tweens.add({
        targets: starContainer,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 200,
        onComplete: () => {
          timer.remove(false);
          const idx = managedObjects.indexOf(starContainer);
          if (idx >= 0) managedObjects.splice(idx, 1);
          starContainer.destroy();
        },
      });
    });
  }
}

import Phaser from 'phaser';
import { createEnemyArchetypeIcon } from '../icons/EnemyIconFactory';
import { enemyCharacterDefinition } from './EnemyCharacterManifest';
import { resolveEnemyCharacterTexture } from './EnemyCharacterLoader';

export class EnemyCharacterView {
  readonly root: Phaser.GameObjects.Container;
  readonly fallbackBody: Phaser.GameObjects.Rectangle;
  readonly fallbackIcon: Phaser.GameObjects.Image;

  private image?: Phaser.GameObjects.Image;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly archetype: string,
    showcaseMode: boolean,
  ) {
    const definition = enemyCharacterDefinition(archetype);

    this.fallbackBody = scene.add
      .rectangle(
        0,
        0,
        showcaseMode ? 62 : 52,
        showcaseMode ? 58 : 46,
        0x2b2030,
        showcaseMode ? 0.34 : 0.98,
      )
      .setStrokeStyle(2, 0x6b3b48);

    this.fallbackIcon = createEnemyArchetypeIcon(
      scene,
      definition.archetype,
      0,
      -6,
      showcaseMode ? 49 : 31,
    );

    this.root = scene.add.container(0, 0, [this.fallbackBody, this.fallbackIcon]);

    const texture = resolveEnemyCharacterTexture(scene, definition.archetype);
    if (texture) {
      this.image = scene.add
        .image(0, definition.groundOffsetY, texture)
        .setOrigin(0.5, 1)
        .setDisplaySize(definition.displayHeight, definition.displayHeight)
        .setFlipX(true);
      this.root.add(this.image);
      this.showAuthored(true);
    } else {
      this.showAuthored(false);
    }
  }

  get isAuthored(): boolean {
    return Boolean(this.image);
  }

  get hpAnchorY(): number {
    return this.isAuthored ? enemyCharacterDefinition(this.archetype).hpAnchorY : -27;
  }

  playAttack(): void {
    if (!this.root.active) return;
    this.scene.tweens.killTweensOf(this.root);
    this.scene.tweens.add({
      targets: this.root,
      x: -8,
      scaleX: 1.06,
      scaleY: 0.96,
      duration: 90,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  playHit(): void {
    if (!this.root.active) return;
    const target = this.image ?? this.fallbackIcon;
    target.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (target.active) target.clearTint();
    });
    this.scene.tweens.add({
      targets: this.root,
      x: 6,
      angle: 4,
      duration: 70,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  playKo(): void {
    this.scene.tweens.killTweensOf(this.root);
    this.scene.tweens.add({
      targets: this.root,
      angle: -78,
      y: 10,
      scaleY: 0.86,
      duration: 340,
      ease: 'Cubic.Out',
    });
  }

  private showAuthored(show: boolean): void {
    this.image?.setVisible(show);
    this.fallbackBody.setVisible(!show);
    this.fallbackIcon.setVisible(!show);
  }
}

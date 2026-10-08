import Phaser from 'phaser';
import { ENEMY_CHARACTER_ART, enemyCharacterDefinition } from './EnemyCharacterManifest';

export function enemyCharacterTextureKey(archetype: string): string {
  return `battle-enemy-${archetype.toLowerCase()}-v2-base`;
}

export function enemyCharacterIconTextureKey(archetype: string): string {
  return `battle-enemy-${archetype.toLowerCase()}-icon`;
}

export function preloadEnemyCharacterArt(scene: Phaser.Scene): void {
  Object.values(ENEMY_CHARACTER_ART).forEach((definition) => {
    const key = enemyCharacterTextureKey(definition.archetype);
    if (!scene.textures.exists(key)) scene.load.image(key, definition.base);
    const iconKey = enemyCharacterIconTextureKey(definition.archetype);
    if (definition.icon && !scene.textures.exists(iconKey)) {
      scene.load.image(iconKey, definition.icon);
    }
  });
}

export function resolveEnemyCharacterTexture(
  scene: Phaser.Scene,
  archetype?: string,
): string | undefined {
  const definition = enemyCharacterDefinition(archetype);
  const key = enemyCharacterTextureKey(definition.archetype);
  return scene.textures.exists(key) ? key : undefined;
}

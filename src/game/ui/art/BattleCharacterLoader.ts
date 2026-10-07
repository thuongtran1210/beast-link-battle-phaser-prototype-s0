import Phaser from 'phaser';
import {
  BATTLE_CHARACTER_ART,
  battleCharacterDefinition,
  type BattlePose,
} from './BattleCharacterManifest';

export function battleCharacterTextureKey(beastId: string, pose: BattlePose): string {
  return `battle-${beastId.toLowerCase()}-${pose}`;
}

/**
 * Called from Scene.preload().
 *
 * Only explicit manifest pose paths are queued. Empty M1 manifests therefore
 * perform zero network requests and preserve the existing asset-free runtime.
 */
export function preloadBattleCharacterArt(scene: Phaser.Scene): void {
  Object.values(BATTLE_CHARACTER_ART).forEach((definition) => {
    (Object.entries(definition.poses) as Array<[BattlePose, string | undefined]>).forEach(
      ([pose, path]) => {
        if (!path) return;
        const key = battleCharacterTextureKey(definition.beastId, pose);
        if (scene.textures.exists(key)) return;
        scene.load.image(key, path);
      },
    );
  });
}

export function resolveBattleCharacterTexture(
  scene: Phaser.Scene,
  beastId: string,
  pose: BattlePose,
): string | undefined {
  const definition = battleCharacterDefinition(beastId);
  if (!definition) return undefined;

  const requested = battleCharacterTextureKey(definition.beastId, pose);
  if (definition.poses[pose] && scene.textures.exists(requested)) return requested;

  const idle = battleCharacterTextureKey(definition.beastId, 'idle');
  if (definition.poses.idle && scene.textures.exists(idle)) return idle;

  return undefined;
}

export function hasAuthoredBattleCharacterArt(scene: Phaser.Scene, beastId: string): boolean {
  return Boolean(resolveBattleCharacterTexture(scene, beastId, 'idle'));
}

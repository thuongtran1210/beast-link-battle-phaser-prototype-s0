import Phaser from 'phaser';
import {
  BATTLE_CHARACTER_ART,
  battleCharacterDefinition,
  type BattlePose,
} from './BattleCharacterManifest';

export type BattleCharacterV2Asset = 'base' | 'icon' | 'signature' | 'ko';

export function battleCharacterTextureKey(beastId: string, pose: BattlePose): string {
  return `battle-${beastId.toLowerCase()}-${pose}`;
}

export function battleCharacterV2TextureKey(
  beastId: string,
  asset: BattleCharacterV2Asset,
): string {
  return `battle-${beastId.toLowerCase()}-v2-${asset}`;
}

function queueImage(scene: Phaser.Scene, key: string, path?: string): void {
  if (!path || scene.textures.exists(key)) return;

  // Browser image decoding is used for PNG/SVG alike. It preserved authored
  // alpha more reliably than Phaser's SVG raster loader in live QA.
  scene.load.image(key, path);
}

/**
 * Called from Scene.preload().
 *
 * V2 prioritizes one base cutout plus optional Signature / KO art.
 * V1 pose paths remain loadable only as migration compatibility.
 */
export function preloadBattleCharacterArt(scene: Phaser.Scene): void {
  Object.values(BATTLE_CHARACTER_ART).forEach((definition) => {
    queueImage(
      scene,
      battleCharacterV2TextureKey(definition.beastId, 'base'),
      definition.base,
    );
    queueImage(
      scene,
      battleCharacterV2TextureKey(definition.beastId, 'icon'),
      definition.icon,
    );
    queueImage(
      scene,
      battleCharacterV2TextureKey(definition.beastId, 'signature'),
      definition.signature,
    );
    queueImage(
      scene,
      battleCharacterV2TextureKey(definition.beastId, 'ko'),
      definition.ko,
    );

    (Object.entries(definition.poses) as Array<[BattlePose, string | undefined]>).forEach(
      ([pose, path]) => {
        if (!path) return;

        // Avoid re-queuing the same V2 source under an extra compatibility key
        // when the runtime no longer needs that pose explicitly.
        if (
          (pose === 'idle' && path === definition.base) ||
          (pose === 'signature' && path === definition.signature) ||
          (pose === 'ko' && path === definition.ko)
        ) return;

        queueImage(scene, battleCharacterTextureKey(definition.beastId, pose), path);
      },
    );
  });
}

export function resolveBattleCharacterBaseTexture(
  scene: Phaser.Scene,
  beastId: string,
): string | undefined {
  const definition = battleCharacterDefinition(beastId);
  if (!definition) return undefined;

  const baseKey = battleCharacterV2TextureKey(definition.beastId, 'base');
  if (definition.base && scene.textures.exists(baseKey)) return baseKey;

  // Migration fallback: V1 idle pose can still act as base art.
  const idle = battleCharacterTextureKey(definition.beastId, 'idle');
  if (definition.poses.idle && scene.textures.exists(idle)) return idle;

  return undefined;
}

export function resolveBattleCharacterOptionalTexture(
  scene: Phaser.Scene,
  beastId: string,
  asset: 'signature' | 'ko',
): string | undefined {
  const definition = battleCharacterDefinition(beastId);
  if (!definition) return undefined;

  const path = definition[asset];
  const v2Key = battleCharacterV2TextureKey(definition.beastId, asset);
  if (path && scene.textures.exists(v2Key)) return v2Key;

  // Migration fallback to old pose-specific art.
  const oldKey = battleCharacterTextureKey(definition.beastId, asset);
  if (definition.poses[asset] && scene.textures.exists(oldKey)) return oldKey;

  return undefined;
}

/** V1 compatibility helper. New Attack/Hit animation should not require this. */
export function resolveBattleCharacterTexture(
  scene: Phaser.Scene,
  beastId: string,
  pose: BattlePose,
): string | undefined {
  if (pose === 'idle') return resolveBattleCharacterBaseTexture(scene, beastId);
  if (pose === 'signature' || pose === 'ko') {
    return resolveBattleCharacterOptionalTexture(scene, beastId, pose)
      ?? resolveBattleCharacterBaseTexture(scene, beastId);
  }

  const definition = battleCharacterDefinition(beastId);
  if (!definition) return undefined;

  const requested = battleCharacterTextureKey(definition.beastId, pose);
  if (definition.poses[pose] && scene.textures.exists(requested)) return requested;

  return resolveBattleCharacterBaseTexture(scene, beastId);
}

export function hasAuthoredBattleCharacterArt(scene: Phaser.Scene, beastId: string): boolean {
  return Boolean(resolveBattleCharacterBaseTexture(scene, beastId));
}

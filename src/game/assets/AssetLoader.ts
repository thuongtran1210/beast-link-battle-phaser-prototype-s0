import type Phaser from 'phaser';
import {
  getBeastRuntimeAsset,
  isGameReadyImage,
  runtimeBeastAssets,
  type RuntimeImageAsset,
} from './AssetRegistry';

/**
 * Queue only GAME_READY runtime art. DRAFT/REVIEW/STYLE_APPROVED candidates never
 * enter the player-facing runtime accidentally.
 */
export function preloadGameReadyAssets(scene: Phaser.Scene): void {
  runtimeBeastAssets().forEach((asset) => {
    queueImage(scene, asset, asset.icon);
    queueImage(scene, asset, asset.portrait);
    queueImage(scene, asset, asset.battle);
  });
}

/**
 * Resolve a production icon only when it passed the GAME_READY gate and the
 * texture is actually loaded. Callers keep their procedural fallback otherwise.
 */
export function resolveRuntimeIconTextureKey(
  scene: Phaser.Scene,
  beastId: string,
): string | undefined {
  const asset = getBeastRuntimeAsset(beastId);
  if (!isGameReadyImage(asset, asset?.icon)) return undefined;
  return scene.textures.exists(asset.icon.textureKey) ? asset.icon.textureKey : undefined;
}

export function resolveRuntimeBattleTextureKey(
  scene: Phaser.Scene,
  beastId: string,
): string | undefined {
  const asset = getBeastRuntimeAsset(beastId);
  if (!isGameReadyImage(asset, asset?.battle)) return undefined;
  return scene.textures.exists(asset.battle.textureKey) ? asset.battle.textureKey : undefined;
}

function queueImage(
  scene: Phaser.Scene,
  asset: ReturnType<typeof getBeastRuntimeAsset>,
  image: RuntimeImageAsset | undefined,
): void {
  if (!isGameReadyImage(asset, image)) return;
  if (scene.textures.exists(image.textureKey)) return;
  scene.load.image(image.textureKey, image.url);
}

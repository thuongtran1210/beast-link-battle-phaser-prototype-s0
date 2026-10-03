import {
  getBeastRuntimeAsset,
  isGameReadyImage,
} from './AssetRegistry';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Asset pipeline check failed: ${message}`);
}

export function runAssetPipelineChecks(): void {
  const snowguard = getBeastRuntimeAsset('beast-a');

  assert(Boolean(snowguard), 'Snowguard registry entry exists');
  assert(snowguard?.displayName === 'SNOWGUARD', 'beast-a resolves to Snowguard');
  assert(snowguard?.status === 'DRAFT', 'Snowguard remains DRAFT before owner style approval');
  assert(!isGameReadyImage(snowguard, snowguard?.icon), 'DRAFT Snowguard icon cannot enter runtime');
  assert(!isGameReadyImage(snowguard, snowguard?.battle), 'DRAFT Snowguard battle art cannot enter runtime');
  assert(snowguard?.animationProfile.attack === 'tanker-attack', 'Snowguard uses Tanker attack profile');
}

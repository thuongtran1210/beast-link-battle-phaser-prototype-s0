export type AssetApprovalStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'STYLE_APPROVED'
  | 'ASSET_READY'
  | 'GAME_READY';

export interface RuntimeImageAsset {
  textureKey: string;
  url?: string;
}

export interface BattleAnimationProfile {
  idle: string;
  move: string;
  windup: string;
  attack: string;
  hit: string;
  ko: string;
}

export interface BeastRuntimeAsset {
  id: string;
  displayName: string;
  status: AssetApprovalStatus;
  icon?: RuntimeImageAsset;
  portrait?: RuntimeImageAsset;
  battle?: RuntimeImageAsset;
  animationProfile: BattleAnimationProfile;
}

const DEFAULT_ANIMATION_PROFILE: BattleAnimationProfile = {
  idle: 'common-idle',
  move: 'common-move',
  windup: 'common-windup',
  attack: 'common-attack',
  hit: 'common-hit',
  ko: 'common-ko',
};

/**
 * Runtime asset registry.
 *
 * Important: this registry mirrors approval state; it does not promote art.
 * Snowguard intentionally remains DRAFT until owner STYLE APPROVAL is recorded
 * in the art source of truth.
 */
export const BEAST_RUNTIME_ASSETS: Readonly<Record<string, BeastRuntimeAsset>> = {
  'beast-a': {
    id: 'beast-a',
    displayName: 'SNOWGUARD',
    status: 'DRAFT',
    animationProfile: {
      ...DEFAULT_ANIMATION_PROFILE,
      idle: 'tanker-idle',
      move: 'tanker-move',
      windup: 'tanker-windup',
      attack: 'tanker-attack',
    },
  },
};

export function getBeastRuntimeAsset(id: string): BeastRuntimeAsset | undefined {
  return BEAST_RUNTIME_ASSETS[id.toLowerCase()];
}

export function isGameReadyImage(
  asset: BeastRuntimeAsset | undefined,
  image: RuntimeImageAsset | undefined,
): image is RuntimeImageAsset & { url: string } {
  return Boolean(asset?.status === 'GAME_READY' && image?.textureKey && image?.url);
}

export function runtimeBeastAssets(): ReadonlyArray<BeastRuntimeAsset> {
  return Object.values(BEAST_RUNTIME_ASSETS);
}

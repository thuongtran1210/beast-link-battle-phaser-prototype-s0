import type { BeastId } from '../icons/UnitIconRegistry';
import type { BattleMotionProfileId } from './BattleMotionProfiles';

export type BattlePose = 'idle' | 'move' | 'attack' | 'signature' | 'hit' | 'ko';
export type BattleFacing = 'left' | 'right';

export interface BattleCharacterArtDefinition {
  beastId: BeastId;
  slug: string;
  /** Runtime full-body target height in pixels at 1280×720 reference resolution. */
  displayHeight: number;
  /** Local Y offset from the model/container origin to the character feet. */
  groundOffsetY: number;
  /** Local Y offset used by Signature / projectile source effects. */
  effectAnchorY: number;
  /** Local Y position for the compact HP bar. */
  hpAnchorY: number;
  /** V2 primary cutout art. */
  base?: string;
  /** V2 icon / portrait source for roster surfaces. */
  icon?: string;
  /** Optional V2 Signature-specific cutout. */
  signature?: string;
  /** Optional V2 defeated cutout. */
  ko?: string;
  motionProfile: BattleMotionProfileId;
  /** V1 compatibility only. Do not require new attack/hit pose art. */
  poses: Partial<Record<BattlePose, string>>;
}

/**
 * V2 uses one primary cutout + transform motion. V1 pose maps remain only for
 * backward compatibility while authored base art is migrated Beast-by-Beast.
 */
export const BATTLE_CHARACTER_ART: Readonly<Record<BeastId, BattleCharacterArtDefinition>> = {
  'beast-a': {
    beastId: 'beast-a',
    slug: 'snowguard',
    displayHeight: 104,
    groundOffsetY: 34,
    effectAnchorY: -30,
    hpAnchorY: -60,
    base: '/assets/beasts/snowguard/base_v2.svg',
    icon: '/assets/beasts/snowguard/icon_v2.svg',
    motionProfile: 'TANK',
    poses: {},
  },
  'beast-b': {
    beastId: 'beast-b',
    slug: 'shadowclaw',
    displayHeight: 98,
    groundOffsetY: 34,
    effectAnchorY: -29,
    hpAnchorY: -58,
    base: '/assets/beasts/shadowclaw/base_v2.svg',
    icon: '/assets/beasts/shadowclaw/icon_v2.svg',
    motionProfile: 'ASSASSIN',
    poses: {},
  },
  'beast-c': {
    beastId: 'beast-c',
    slug: 'windstrider',
    displayHeight: 100,
    groundOffsetY: 34,
    effectAnchorY: -29,
    hpAnchorY: -58,
    base: '/assets/beasts/windstrider/base_v2.svg',
    icon: '/assets/beasts/windstrider/icon_v2.svg',
    motionProfile: 'RANGER_FOCUS',
    poses: {},
  },
  'beast-d': {
    beastId: 'beast-d',
    slug: 'starcaller',
    displayHeight: 102,
    groundOffsetY: 34,
    effectAnchorY: -31,
    hpAnchorY: -60,
    base: '/assets/beasts/starcaller/base_v2.svg',
    icon: '/assets/beasts/starcaller/icon_v2.svg',
    motionProfile: 'MAGE',
    poses: {},
  },
  'beast-e': {
    beastId: 'beast-e',
    slug: 'ironclad',
    displayHeight: 108,
    groundOffsetY: 34,
    effectAnchorY: -30,
    hpAnchorY: -62,
    base: '/assets/beasts/ironclad/base_v2.svg',
    icon: '/assets/beasts/ironclad/icon_v2.svg',
    motionProfile: 'BRUISER',
    poses: {},
  },
  'beast-f': {
    beastId: 'beast-f',
    slug: 'swiftwing',
    displayHeight: 98,
    groundOffsetY: 34,
    effectAnchorY: -29,
    hpAnchorY: -58,
    base: '/assets/beasts/swiftwing/base_v2.svg',
    icon: '/assets/beasts/swiftwing/icon_v2.svg',
    motionProfile: 'RANGER_FAST',
    poses: {},
  },
};

export function battleCharacterDefinition(beastId: string): BattleCharacterArtDefinition | undefined {
  return BATTLE_CHARACTER_ART[beastId.toLowerCase() as BeastId];
}

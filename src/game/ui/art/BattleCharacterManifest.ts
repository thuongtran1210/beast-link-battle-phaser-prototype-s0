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
    displayHeight: 128,
    groundOffsetY: 38,
    effectAnchorY: -34,
    hpAnchorY: -89,
    base: '/assets/beasts/snowguard/base_owner_v01.png',
    icon: '/assets/characters/duck-guardian/icon_v02.png',
    motionProfile: 'TANK',
    poses: {},
  },
  'beast-b': {
    beastId: 'beast-b',
    slug: 'shadowclaw',
    displayHeight: 124,
    groundOffsetY: 37,
    effectAnchorY: -33,
    hpAnchorY: -86,
    base: '/assets/beasts/shadowclaw/base_owner_v01.png',
    icon: '/assets/characters/raccoon-swordsman/icon_v02.png',
    motionProfile: 'ASSASSIN',
    poses: {},
  },
  'beast-c': {
    beastId: 'beast-c',
    slug: 'windstrider',
    displayHeight: 136,
    groundOffsetY: 37,
    effectAnchorY: -33,
    hpAnchorY: -98,
    base: '/assets/beasts/windstrider/base_owner_v01.png',
    icon: '/assets/characters/rabbit-archer/icon_v02.png',
    motionProfile: 'RANGER_FOCUS',
    poses: {},
  },
  'beast-d': {
    beastId: 'beast-d',
    slug: 'starcaller',
    displayHeight: 128,
    groundOffsetY: 38,
    effectAnchorY: -35,
    hpAnchorY: -90,
    base: '/assets/characters/badger-mage/base_v01.png',
    icon: '/assets/characters/badger-mage/icon_v02.png',
    motionProfile: 'MAGE',
    poses: {},
  },
  'beast-e': {
    beastId: 'beast-e',
    slug: 'ironclad',
    displayHeight: 136,
    groundOffsetY: 39,
    effectAnchorY: -35,
    hpAnchorY: -96,
    base: '/assets/beasts/ironclad/base_owner_v01.png',
    icon: '/assets/characters/bear-hammer/icon_v02.png',
    motionProfile: 'BRUISER',
    poses: {},
  },
  'beast-f': {
    beastId: 'beast-f',
    slug: 'swiftwing',
    displayHeight: 128,
    groundOffsetY: 37,
    effectAnchorY: -33,
    hpAnchorY: -90,
    base: '/assets/beasts/swiftwing/base_owner_v01.png',
    icon: '/assets/characters/fox-archer/icon_v02.png',
    motionProfile: 'RANGER_FAST',
    poses: {},
  },
};

export function battleCharacterDefinition(beastId: string): BattleCharacterArtDefinition | undefined {
  return BATTLE_CHARACTER_ART[beastId.toLowerCase() as BeastId];
}

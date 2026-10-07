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
    effectAnchorY: -28,
    hpAnchorY: -56,
    base: '/assets/beasts/snowguard/battle_idle.svg',
    signature: '/assets/beasts/snowguard/battle_signature.svg',
    ko: '/assets/beasts/snowguard/battle_ko.svg',
    motionProfile: 'TANK',
    poses: {
      idle: '/assets/beasts/snowguard/battle_idle.svg',
      attack: '/assets/beasts/snowguard/battle_attack.svg',
      signature: '/assets/beasts/snowguard/battle_signature.svg',
      hit: '/assets/beasts/snowguard/battle_hit.svg',
      ko: '/assets/beasts/snowguard/battle_ko.svg',
    },
  },
  'beast-b': {
    beastId: 'beast-b',
    slug: 'shadowclaw',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    motionProfile: 'ASSASSIN',
    poses: {},
  },
  'beast-c': {
    beastId: 'beast-c',
    slug: 'windstrider',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    motionProfile: 'RANGER_FOCUS',
    poses: {},
  },
  'beast-d': {
    beastId: 'beast-d',
    slug: 'starcaller',
    displayHeight: 108,
    groundOffsetY: 34,
    effectAnchorY: -32,
    hpAnchorY: -58,
    base: '/assets/beasts/starcaller/battle_idle.svg',
    signature: '/assets/beasts/starcaller/battle_signature.svg',
    ko: '/assets/beasts/starcaller/battle_ko.svg',
    motionProfile: 'MAGE',
    poses: {
      idle: '/assets/beasts/starcaller/battle_idle.svg',
      attack: '/assets/beasts/starcaller/battle_attack.svg',
      signature: '/assets/beasts/starcaller/battle_signature.svg',
      hit: '/assets/beasts/starcaller/battle_hit.svg',
      ko: '/assets/beasts/starcaller/battle_ko.svg',
    },
  },
  'beast-e': {
    beastId: 'beast-e',
    slug: 'ironclad',
    displayHeight: 94,
    groundOffsetY: 29,
    effectAnchorY: -20,
    hpAnchorY: -50,
    motionProfile: 'BRUISER',
    poses: {},
  },
  'beast-f': {
    beastId: 'beast-f',
    slug: 'swiftwing',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    motionProfile: 'RANGER_FAST',
    poses: {},
  },
};

export function battleCharacterDefinition(beastId: string): BattleCharacterArtDefinition | undefined {
  return BATTLE_CHARACTER_ART[beastId.toLowerCase() as BeastId];
}

import type { BeastId } from '../icons/UnitIconRegistry';

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
  poses: Partial<Record<BattlePose, string>>;
}

/**
 * M2 registers Starcaller authored poses first.
 *
 * All other Beasts intentionally keep empty pose maps and therefore preserve
 * the procedural portrait fallback until their rollout milestone.
 */
export const BATTLE_CHARACTER_ART: Readonly<Record<BeastId, BattleCharacterArtDefinition>> = {
  'beast-a': {
    beastId: 'beast-a',
    slug: 'snowguard',
    displayHeight: 92,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -48,
    poses: {},
  },
  'beast-b': {
    beastId: 'beast-b',
    slug: 'shadowclaw',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    poses: {},
  },
  'beast-c': {
    beastId: 'beast-c',
    slug: 'windstrider',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    poses: {},
  },
  'beast-d': {
    beastId: 'beast-d',
    slug: 'starcaller',
    displayHeight: 108,
    groundOffsetY: 34,
    effectAnchorY: -32,
    hpAnchorY: -58,
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
    poses: {},
  },
  'beast-f': {
    beastId: 'beast-f',
    slug: 'swiftwing',
    displayHeight: 88,
    groundOffsetY: 28,
    effectAnchorY: -20,
    hpAnchorY: -46,
    poses: {},
  },
};

export function battleCharacterDefinition(beastId: string): BattleCharacterArtDefinition | undefined {
  return BATTLE_CHARACTER_ART[beastId.toLowerCase() as BeastId];
}

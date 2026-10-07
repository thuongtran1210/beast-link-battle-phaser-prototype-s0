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
 * M1 infrastructure intentionally ships with no authored paths.
 *
 * M2 adds Starcaller paths first. Keeping poses empty here guarantees that M1
 * never requests missing art and the current procedural portrait remains the
 * deterministic fallback.
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
    displayHeight: 94,
    groundOffsetY: 30,
    effectAnchorY: -24,
    hpAnchorY: -50,
    poses: {},
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

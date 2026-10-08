export type EnemyArtArchetype = 'Frontliner' | 'Diver' | 'Ranged';

export interface EnemyCharacterArtDefinition {
  archetype: EnemyArtArchetype;
  base: string;
  displayHeight: number;
  groundOffsetY: number;
  hpAnchorY: number;
}

export const ENEMY_CHARACTER_ART: Readonly<Record<EnemyArtArchetype, EnemyCharacterArtDefinition>> = {
  Frontliner: {
    archetype: 'Frontliner',
    base: '/assets/enemies/frontliner/base_v2.svg',
    displayHeight: 102,
    groundOffsetY: 34,
    hpAnchorY: -58,
  },
  Diver: {
    archetype: 'Diver',
    base: '/assets/enemies/diver/base_v2.svg',
    displayHeight: 94,
    groundOffsetY: 34,
    hpAnchorY: -55,
  },
  Ranged: {
    archetype: 'Ranged',
    base: '/assets/enemies/ranged/base_v2.svg',
    displayHeight: 94,
    groundOffsetY: 34,
    hpAnchorY: -55,
  },
};

export function enemyCharacterDefinition(archetype?: string): EnemyCharacterArtDefinition {
  if (archetype === 'Diver') return ENEMY_CHARACTER_ART.Diver;
  if (archetype === 'Ranged') return ENEMY_CHARACTER_ART.Ranged;
  return ENEMY_CHARACTER_ART.Frontliner;
}

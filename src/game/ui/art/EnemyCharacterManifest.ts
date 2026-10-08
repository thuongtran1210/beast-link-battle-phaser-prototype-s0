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
    displayHeight: 116,
    groundOffsetY: 38,
    hpAnchorY: -68,
  },
  Diver: {
    archetype: 'Diver',
    base: '/assets/enemies/diver/base_v2.svg',
    displayHeight: 108,
    groundOffsetY: 37,
    hpAnchorY: -64,
  },
  Ranged: {
    archetype: 'Ranged',
    base: '/assets/enemies/ranged/base_v2.svg',
    displayHeight: 108,
    groundOffsetY: 37,
    hpAnchorY: -64,
  },
};

export function enemyCharacterDefinition(archetype?: string): EnemyCharacterArtDefinition {
  if (archetype === 'Diver') return ENEMY_CHARACTER_ART.Diver;
  if (archetype === 'Ranged') return ENEMY_CHARACTER_ART.Ranged;
  return ENEMY_CHARACTER_ART.Frontliner;
}

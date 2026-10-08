export type EnemyArtArchetype = 'Frontliner' | 'Diver' | 'Ranged';

export interface EnemyCharacterArtDefinition {
  archetype: EnemyArtArchetype;
  base: string;
  icon?: string;
  displayHeight: number;
  groundOffsetY: number;
  hpAnchorY: number;
}

export const ENEMY_CHARACTER_ART: Readonly<Record<EnemyArtArchetype, EnemyCharacterArtDefinition>> = {
  Frontliner: {
    archetype: 'Frontliner',
    base: '/assets/characters/penguin-knight/base_v01.png',
    icon: '/assets/characters/penguin-knight/icon_v02.png',
    displayHeight: 136,
    groundOffsetY: 38,
    hpAnchorY: -98,
  },
  Diver: {
    archetype: 'Diver',
    base: '/assets/characters/crow-assassin/base_v01.png',
    icon: '/assets/characters/crow-assassin/icon_v02.png',
    displayHeight: 128,
    groundOffsetY: 37,
    hpAnchorY: -90,
  },
  Ranged: {
    archetype: 'Ranged',
    base: '/assets/characters/deer-archer/base_v01.png',
    icon: '/assets/characters/deer-archer/icon_v02.png',
    displayHeight: 136,
    groundOffsetY: 37,
    hpAnchorY: -99,
  },
};

export function enemyCharacterDefinition(archetype?: string): EnemyCharacterArtDefinition {
  if (archetype === 'Diver') return ENEMY_CHARACTER_ART.Diver;
  if (archetype === 'Ranged') return ENEMY_CHARACTER_ART.Ranged;
  return ENEMY_CHARACTER_ART.Frontliner;
}

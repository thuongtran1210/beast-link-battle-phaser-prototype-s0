export type BeastId = 'beast-a' | 'beast-b' | 'beast-c' | 'beast-d' | 'beast-e' | 'beast-f';
export type EnergyId = 'energy-a' | 'energy-b' | 'energy-c' | 'energy-d' | 'energy-e' | 'energy-f';
export type UnitRole = 'Tanker' | 'Assassin' | 'Ranger' | 'Mage';

export interface IconDefinition {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  role: UnitRole;
  isEnergy: boolean;
  symbol: 'shield' | 'daggers' | 'bow' | 'orb' | 'bastion' | 'winged-arrow';
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  bgFill: number;
  borderColor: number;
}

export const BEAST_ICON_DEFINITIONS: Record<string, IconDefinition> = {
  'beast-a': {
    id: 'beast-a',
    letter: 'A',
    name: 'Aegis Shield',
    role: 'Tanker',
    isEnergy: false,
    symbol: 'shield',
    primaryColor: 0xfacc15, // Golden Tanker
    secondaryColor: 0xd97706,
    accentColor: 0xfef08a,
    bgFill: 0x1f2937,
    borderColor: 0xfbbf24,
  },
  'beast-b': {
    id: 'beast-b',
    letter: 'B',
    name: 'Twin Daggers',
    role: 'Assassin',
    isEnergy: false,
    symbol: 'daggers',
    primaryColor: 0xf97316, // Orange Assassin
    secondaryColor: 0xc2410c,
    accentColor: 0xffedd5,
    bgFill: 0x271926,
    borderColor: 0xfb923c,
  },
  'beast-c': {
    id: 'beast-c',
    letter: 'C',
    name: 'Verdant Bow',
    role: 'Ranger',
    isEnergy: false,
    symbol: 'bow',
    primaryColor: 0x22c55e, // Green Ranger
    secondaryColor: 0x15803d,
    accentColor: 0xbbf7d0,
    bgFill: 0x13271f,
    borderColor: 0x4ade80,
  },
  'beast-d': {
    id: 'beast-d',
    letter: 'D',
    name: 'Arcane Orb',
    role: 'Mage',
    isEnergy: false,
    symbol: 'orb',
    primaryColor: 0xa855f7, // Purple Mage
    secondaryColor: 0x7e22ce,
    accentColor: 0xf3e8ff,
    bgFill: 0x241438,
    borderColor: 0xc084fc,
  },
  'beast-e': {
    id: 'beast-e',
    letter: 'E',
    name: 'Iron Bastion',
    role: 'Tanker',
    isEnergy: false,
    symbol: 'bastion',
    primaryColor: 0x38bdf8, // Cyan Tanker
    secondaryColor: 0x0284c7,
    accentColor: 0xe0f2fe,
    bgFill: 0x13263a,
    borderColor: 0x7dd3fc,
  },
  'beast-f': {
    id: 'beast-f',
    letter: 'F',
    name: 'Swift Feather',
    role: 'Ranger',
    isEnergy: false,
    symbol: 'winged-arrow',
    primaryColor: 0xec4899, // Pink/Rose Ranger
    secondaryColor: 0xbe185d,
    accentColor: 0xfce7f3,
    bgFill: 0x2e1428,
    borderColor: 0xf472b6,
  },
};

export const ENERGY_ICON_DEFINITIONS: Record<string, IconDefinition> = {
  'energy-a': {
    id: 'energy-a',
    letter: 'A',
    name: 'Shield Token',
    role: 'Tanker',
    isEnergy: true,
    symbol: 'shield',
    primaryColor: 0x38bdf8,
    secondaryColor: 0x0284c7,
    accentColor: 0xffffff,
    bgFill: 0x0f2744,
    borderColor: 0x38bdf8,
  },
  'energy-b': {
    id: 'energy-b',
    letter: 'B',
    name: 'Blade Token',
    role: 'Assassin',
    isEnergy: true,
    symbol: 'daggers',
    primaryColor: 0x818cf8,
    secondaryColor: 0x4f46e5,
    accentColor: 0xffffff,
    bgFill: 0x1e1b4b,
    borderColor: 0x818cf8,
  },
  'energy-c': {
    id: 'energy-c',
    letter: 'C',
    name: 'Leaf Token',
    role: 'Ranger',
    isEnergy: true,
    symbol: 'bow',
    primaryColor: 0x34d399,
    secondaryColor: 0x059669,
    accentColor: 0xffffff,
    bgFill: 0x064e3b,
    borderColor: 0x34d399,
  },
  'energy-d': {
    id: 'energy-d',
    letter: 'D',
    name: 'Arcane Spark',
    role: 'Mage',
    isEnergy: true,
    symbol: 'orb',
    primaryColor: 0xfbbf24,
    secondaryColor: 0xd97706,
    accentColor: 0xffffff,
    bgFill: 0x451a03,
    borderColor: 0xfbbf24,
  },
  'energy-e': {
    id: 'energy-e',
    letter: 'E',
    name: 'Guard Emblem',
    role: 'Tanker',
    isEnergy: true,
    symbol: 'bastion',
    primaryColor: 0xf472b6,
    secondaryColor: 0xdb2777,
    accentColor: 0xffffff,
    bgFill: 0x500724,
    borderColor: 0xf472b6,
  },
  'energy-f': {
    id: 'energy-f',
    letter: 'F',
    name: 'Gale Shot',
    role: 'Ranger',
    isEnergy: true,
    symbol: 'winged-arrow',
    primaryColor: 0xa78bfa,
    secondaryColor: 0x7c3aed,
    accentColor: 0xffffff,
    bgFill: 0x2e1065,
    borderColor: 0xa78bfa,
  },
};

export function getIconDefinition(id: string): IconDefinition {
  const normalized = id.toLowerCase();
  if (normalized.startsWith('energy-')) {
    return ENERGY_ICON_DEFINITIONS[normalized] ?? {
      id,
      letter: 'A',
      name: 'Energy Token',
      role: 'Tanker',
      isEnergy: true,
      symbol: 'shield',
      primaryColor: 0x38bdf8,
      secondaryColor: 0x0284c7,
      accentColor: 0xffffff,
      bgFill: 0x0f2744,
      borderColor: 0x38bdf8,
    };
  }

  // Check for beast ID or single letter (A, B, C...)
  if (BEAST_ICON_DEFINITIONS[normalized]) {
    return BEAST_ICON_DEFINITIONS[normalized];
  }

  const letter = normalized.replace('beast-', '').slice(0, 1);
  const beastKey = `beast-${letter}`;
  if (BEAST_ICON_DEFINITIONS[beastKey]) {
    return BEAST_ICON_DEFINITIONS[beastKey];
  }

  return BEAST_ICON_DEFINITIONS['beast-a'];
}

export const BEAST_NAMES: Record<string, string> = {
  'beast-a': 'SNOWGUARD',
  'beast-b': 'SHADOWCLAW',
  'beast-c': 'WINDSTRIDER',
  'beast-d': 'STARCALLER',
  'beast-e': 'IRONCLAD',
  'beast-f': 'SWIFTWING',
};

export function beastDisplayName(beastId: string): string {
  const normalized = beastId.toLowerCase();
  if (BEAST_NAMES[normalized]) return BEAST_NAMES[normalized];
  const def = getIconDefinition(beastId);
  return def.name.toUpperCase();
}

export type TacticalEnergyKind = 'Mend' | 'Rescue' | 'Break' | 'Pierce' | 'Guard' | 'Disrupt';

export interface TacticalEnergyDefinition {
  energyId: string;
  kind: TacticalEnergyKind;
  displayName: string;
  shortDescription: string;
}

/** The only player-generated tactical Energy identities in V14G. */
export const V14G_TACTICAL_ENERGY: ReadonlyArray<TacticalEnergyDefinition> = [
  { energyId: 'energy-a', kind: 'Mend', displayName: 'MEND', shortDescription: 'Heal frontline' },
  { energyId: 'energy-b', kind: 'Rescue', displayName: 'RESCUE', shortDescription: 'Heal backline' },
  { energyId: 'energy-c', kind: 'Break', displayName: 'BREAK', shortDescription: 'Damage Frontliner' },
  { energyId: 'energy-d', kind: 'Pierce', displayName: 'PIERCE', shortDescription: 'Damage Ranged' },
];

export const V14G_ENERGY_RUSH_POOL = V14G_TACTICAL_ENERGY.map((entry) => entry.energyId);

export const STRATEGIC_ENERGY: ReadonlyArray<TacticalEnergyDefinition> = [
  V14G_TACTICAL_ENERGY[0],
  { energyId: 'energy-e', kind: 'Guard', displayName: 'GUARD', shortDescription: 'Shield frontline · 3s' },
  V14G_TACTICAL_ENERGY[2],
  { energyId: 'energy-f', kind: 'Disrupt', displayName: 'DISRUPT', shortDescription: 'Interrupt enemy · 1s' },
];
export const STRATEGIC_ENERGY_POOL = STRATEGIC_ENERGY.map(entry => entry.energyId);
export function tacticalEnergyDefinition(energyId: string): TacticalEnergyDefinition | undefined {
  return [...V14G_TACTICAL_ENERGY, ...STRATEGIC_ENERGY].find((entry) => entry.energyId === energyId);
}

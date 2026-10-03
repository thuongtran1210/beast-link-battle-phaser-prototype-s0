export type TacticalEnergyKind = 'Mend' | 'Rescue' | 'Break' | 'Pierce';

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

export function tacticalEnergyDefinition(energyId: string): TacticalEnergyDefinition | undefined {
  return V14G_TACTICAL_ENERGY.find((entry) => entry.energyId === energyId);
}

import { tacticalEnergyDefinition, V14G_TACTICAL_ENERGY } from '../energy/TacticalEnergyCatalog';

export interface EnergyRushTilePresentation {
  energyId: string;
  displayName: string;
  showInternalLetter: boolean;
}

export interface EnergyRushInventoryEntry {
  energyId: string;
  displayName: string;
  shortDescription: string;
  charges: number;
}

/** Player-facing identity for known V14G Energy Rush tiles. */
export function energyRushTilePresentation(energyId: string): EnergyRushTilePresentation | undefined {
  const definition = tacticalEnergyDefinition(energyId);
  return definition
    ? { energyId: definition.energyId, displayName: definition.displayName, showInternalLetter: false }
    : undefined;
}

/** Stable, complete tactical inventory; chargeLookup is the authoritative run-scoped source. */
export function energyRushInventory(chargeLookup: (energyId: string) => number): EnergyRushInventoryEntry[] {
  return V14G_TACTICAL_ENERGY.map((definition) => ({
    energyId: definition.energyId,
    displayName: definition.displayName,
    shortDescription: definition.shortDescription,
    charges: chargeLookup(definition.energyId),
  }));
}

export function energyRushMatchLabel(energyId: string): string {
  const presentation = energyRushTilePresentation(energyId);
  return presentation ? `+1 ${presentation.displayName}` : '+1 Charge';
}

/** Bank totals distinguish carry-in from charges collected during this Rush. */
export function energyRushBankSummary(counts: ReadonlyArray<number>, carryIn: number): {total: number; carry: number; gained: number} {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return {total, carry: carryIn, gained: Math.max(0, total - carryIn)};
}

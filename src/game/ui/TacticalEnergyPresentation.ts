import type { TacticalEnergyEligibility } from '../battle/AutonomousBattleModel';
import { tacticalEnergyDefinition } from '../energy/TacticalEnergyCatalog';

export interface TacticalEnergyControlPresentation { energyId: string; displayName: string; shortDescription: string; charges: number; stateLabel: 'DISABLED' | 'READY' | 'SUGGESTED'; reasonLabel?: string; enabled: boolean; suggested: boolean; }
const reasonLabels: Record<string, string> = { 'battle-not-running': 'BATTLE ENDED', 'no-charge': 'NO CHARGE', 'no-target': 'NO VALID TARGET', 'target-full-hp': 'FRONTLINE FULL', 'no-frontliner': 'NO FRONTLINER', 'no-ranged': 'NO RANGED', 'unsupported-energy': 'UNAVAILABLE' };
export function tacticalEnergyControl(eligibility: TacticalEnergyEligibility, charges: number, paused: boolean): TacticalEnergyControlPresentation | undefined {
  const definition = tacticalEnergyDefinition(eligibility.energyId); if (!definition) return undefined;
  if (paused) return { energyId: definition.energyId, displayName: definition.displayName, shortDescription: definition.shortDescription, charges, stateLabel: 'DISABLED', reasonLabel: 'PAUSED', enabled: false, suggested: false };
  const suggested = eligibility.availability === 'suggested'; const enabled = eligibility.availability !== 'disabled';
  return { energyId: definition.energyId, displayName: definition.displayName, shortDescription: definition.shortDescription, charges, stateLabel: suggested ? 'SUGGESTED' : enabled ? 'READY' : 'DISABLED', reasonLabel: suggested ? eligibility.suggestedReason : enabled ? undefined : reasonLabels[eligibility.reason], enabled, suggested };
}

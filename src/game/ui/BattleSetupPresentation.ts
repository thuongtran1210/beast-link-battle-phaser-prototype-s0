import type { FormationUnit } from '../battle/BattleFormation';
import type { RunUnitInstance } from '../run/RunRoster';
import type { EnergyQueueEntry } from '../energy/EnergyQueue';
import { P1V14B_ACTIVE_SQUAD_LIMIT } from '../run/RunRoster';
import { tacticalEnergyDefinition } from '../energy/TacticalEnergyCatalog';

export interface SetupRosterGroups { deployed: FormationUnit[]; reserve: FormationUnit[]; ko: FormationUnit[]; }
/** Pure visual grouping; RunRoster and BattleFormation remain authoritative. */
export function classifyBattleSetupRoster(formationUnits: ReadonlyArray<FormationUnit>, roster: ReadonlyArray<RunUnitInstance>): SetupRosterGroups {
  const byId = new Map(roster.map(unit => [unit.instanceId, unit]));
  const groups: SetupRosterGroups = { deployed: [], reserve: [], ko: [] };
  for (const unit of formationUnits) {
    const body = byId.get(unit.unitId);
    if (body?.status === 'ko') groups.ko.push(unit);
    else if (unit.slotId !== null) groups.deployed.push(unit);
    else groups.reserve.push(unit);
  }
  return groups;
}

export type CastControlState = { enabled: boolean; label: string };
export function castControlState(reason: string, paused: boolean): CastControlState {
  if (paused) return { enabled: false, label: 'PAUSED' };
  if (reason === 'ok') return { enabled: true, label: 'CAST' };
  return { enabled: false, label: ({ 'target-full-hp': 'FULL', 'no-charge': 'NO CHARGE', 'no-target': 'NO FRONTLINE', 'battle-not-running': 'ENDED' } as Record<string, string>)[reason] ?? 'UNAVAILABLE' };
}
export function setupEnergyInventory(entries: ReadonlyArray<EnergyQueueEntry>): Array<EnergyQueueEntry & { shortLabel: string; displayName: string; shortDescription: string }> { return entries.filter(entry => entry.charges > 0).map(entry => { const definition = tacticalEnergyDefinition(entry.energyId); return { ...entry, shortLabel: entry.energyId.replace('energy-', '').toUpperCase(), displayName: definition?.displayName ?? entry.energyId, shortDescription: definition?.shortDescription ?? 'Stored Energy' }; }); }

/** Display-only formation summary. The squad cap and board capacity intentionally remain separate. */
export function formationBoardSummary(activeCount: number, gridPositions = 18): string {
  const active = Math.max(0, Math.min(activeCount, P1V14B_ACTIVE_SQUAD_LIMIT));
  return `ACTIVE ${active} / ${P1V14B_ACTIVE_SQUAD_LIMIT} · GRID ${gridPositions}`;
}

/** Idle empty cells are tactical positions; placement feedback appears only during a drag. */
export function emptyFormationSlotLabel(isDragging: boolean, isBlocked: boolean): string | undefined {
  if (!isDragging) return undefined;
  return isBlocked ? 'SQUAD FULL' : 'PLACE';
}

export function enemyBoardCardLabel(archetype: 'Frontliner' | 'Diver' | 'Ranged', maxHp: number, damage: number): string {
  const name = archetype === 'Frontliner' ? 'FRONT' : archetype === 'Diver' ? 'DIVER' : 'RANGED';
  return `${name}\n${maxHp} HP\n⚔${damage}`;
}

import type { FormationUnit } from '../battle/BattleFormation';
import type { RunUnitInstance } from '../run/RunRoster';

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

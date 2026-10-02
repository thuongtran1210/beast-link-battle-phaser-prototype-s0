import type { DeployedUnit } from '../queue/StarConverter';
import { roleForBeast, type BeastRole } from './BeastRoles';

export interface FormationUnit { unitId: string; beastId: string; role: BeastRole; star: 1 | 2 | 3; slotId: string | null; }
export interface FormationSlot { slotId: string; row: 'Front' | 'Mid' | 'Back'; column: number; unitId: string | null; }

/** Pure P1-S2 arrangement state. The 3×6 layout is an Experimental validation fixture. */
export class BattleFormation {
  private readonly unitsById = new Map<string, FormationUnit>();
  private readonly slotsById = new Map<string, FormationSlot>();

  constructor(units: ReadonlyArray<DeployedUnit>) {
    units.forEach((unit, index) => this.unitsById.set(`unit-${index + 1}`, { unitId: `unit-${index + 1}`, beastId: unit.contentId, role: roleForBeast(unit.contentId), star: unit.star, slotId: null }));
    (['Front', 'Mid', 'Back'] as const).forEach((row) => {
      for (let column = 1; column <= 6; column += 1) this.slotsById.set(`${row.toLowerCase()}-${column}`, { slotId: `${row.toLowerCase()}-${column}`, row, column, unitId: null });
    });
  }

  get units(): FormationUnit[] { return [...this.unitsById.values()].map((unit) => ({ ...unit })); }
  get slots(): FormationSlot[] { return [...this.slotsById.values()].map((slot) => ({ ...slot })); }
  get allPlaced(): boolean { return this.units.length > 0 && this.units.every((unit) => unit.slotId !== null); }
  place(unitId: string, slotId: string): boolean {
    const unit = this.unitsById.get(unitId); const destination = this.slotsById.get(slotId);
    if (!unit || !destination || (destination.unitId !== null && destination.unitId !== unitId)) return false;
    if (unit.slotId === slotId) return true;
    if (unit.slotId) { const previous = this.slotsById.get(unit.slotId); if (previous) previous.unitId = null; }
    destination.unitId = unitId; unit.slotId = slotId;
    return true;
  }
  reset(): void { this.unitsById.forEach((unit) => { unit.slotId = null; }); this.slotsById.forEach((slot) => { slot.unitId = null; }); }
}

export interface EnergyQueueEntry { energyId: string; charges: number; }

/** ENERGY-001 / ENERGY-002 pre-Battle content-specific stored Energy. */
export class EnergyQueue {
  private readonly chargesById = new Map<string, number>();
  addCharge(energyId: string, amount = 1): void {
    if (!Number.isInteger(amount) || amount <= 0) return;
    this.chargesById.set(energyId, this.getCharges(energyId) + amount);
  }
  getCharges(energyId: string): number { return this.chargesById.get(energyId) ?? 0; }
  getAll(): EnergyQueueEntry[] { return [...this.chargesById.entries()].map(([energyId, charges]) => ({ energyId, charges })); }
  getTotalCharges(): number { return [...this.chargesById.values()].reduce((total, charges) => total + charges, 0); }
  consumeCharge(energyId: string, amount = 1): boolean {
    if (!Number.isInteger(amount) || amount <= 0) return false;
    const current = this.getCharges(energyId);
    if (current < amount) return false;
    const next = current - amount;
    if (next === 0) this.chargesById.delete(energyId); else this.chargesById.set(energyId, next);
    return true;
  }
  consume(energyId: string, amount = 1): boolean { return this.consumeCharge(energyId, amount); }
  reset(): void { this.chargesById.clear(); }
}

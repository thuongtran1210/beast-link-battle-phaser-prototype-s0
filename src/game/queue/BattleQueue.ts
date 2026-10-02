export interface BattleQueueEntry {
  contentId: string;
  count: number;
}

/** QUEUE-001: stores Beast-match output only; it does not spawn or convert units. */
export class BattleQueue {
  private readonly counts = new Map<string, number>();

  addBeastMatch(contentId: string): void {
    this.counts.set(contentId, (this.counts.get(contentId) ?? 0) + 1);
  }

  entries(): BattleQueueEntry[] {
    return [...this.counts.entries()].map(([contentId, count]) => ({ contentId, count }));
  }
  count(contentId: string): number { return this.counts.get(contentId) ?? 0; }
  consume(contentId: string, amount: number): boolean {
    const current = this.count(contentId);
    if (!Number.isInteger(amount) || amount <= 0 || current < amount) return false;
    const next = current - amount;
    if (next === 0) this.counts.delete(contentId); else this.counts.set(contentId, next);
    return true;
  }
  clear(): void { this.counts.clear(); }
}

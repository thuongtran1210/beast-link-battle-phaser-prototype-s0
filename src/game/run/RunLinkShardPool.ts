export const LINK_SHARD_MAX = 3;

/**
 * P1-V14C.2: Evaluates Link Shard reward from Beast Rush best streak.
 * - bestStreak 0–3 => 0 shards
 * - bestStreak 4–6 => 1 shard
 * - bestStreak 7+  => 2 shards
 */
export function evaluateLinkShardReward(bestStreak: number): number {
  if (bestStreak >= 7) return 2;
  if (bestStreak >= 4) return 1;
  return 0;
}

/**
 * P1-V14C.2: Focused Run-owned resource pool for Link Shards.
 * - Persists across Waves in the same Run.
 * - Resets on Restart / new Run.
 * - Clamped at LINK_SHARD_MAX = 3.
 */
export class RunLinkShardPool {
  private shardCount = 0;

  constructor(private readonly maxCap = LINK_SHARD_MAX) {}

  get count(): number {
    return this.shardCount;
  }

  award(amount: number): number {
    if (amount <= 0) return 0;
    const previous = this.shardCount;
    this.shardCount = Math.min(this.maxCap, this.shardCount + amount);
    return this.shardCount - previous;
  }

  canSpend(amount = 1): boolean {
    return amount > 0 && this.shardCount >= amount;
  }

  spend(amount = 1): boolean {
    if (!this.canSpend(amount)) return false;
    this.shardCount -= amount;
    return true;
  }

  reset(): void {
    this.shardCount = 0;
  }
}

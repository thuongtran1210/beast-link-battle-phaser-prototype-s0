export type ComboVisualState = 'ready' | 'active' | 'low' | 'expired';

export interface QueueCountEntry {
  id: string;
  count: number;
}

export function comboRatio(seconds: number, capSeconds: number): number {
  if (capSeconds <= 0) return 0;
  return Math.max(0, Math.min(1, seconds / capSeconds));
}

export function comboVisualState(seconds: number, active: boolean): ComboVisualState {
  if (seconds <= 0) return active ? 'ready' : 'expired';
  return seconds < 3 ? 'low' : 'active';
}

export function recruitedTotal(entries: ReadonlyArray<QueueCountEntry>): number {
  return entries.reduce((total, entry) => total + entry.count, 0);
}

/** Preserves BattleQueue order; UI must not re-sort stacks as their counts change. */
export function queueDisplayEntries<T extends QueueCountEntry>(entries: ReadonlyArray<T>): T[] {
  return entries.filter((entry) => entry.count > 0);
}

export type BeastRushEvent =
  | { kind: 'match'; beastName: string; comboStreak: number }
  | { kind: 'invalid' }
  | { kind: 'reshuffle' }
  | { kind: 'idle' };

export function compactEventLabel(event: BeastRushEvent): string {
  switch (event.kind) {
    case 'match': return `+1 ${event.beastName}   COMBO ×${event.comboStreak}`;
    case 'invalid': return 'NO LINK';
    case 'reshuffle': return 'RESHUFFLED';
    default: return '';
  }
}

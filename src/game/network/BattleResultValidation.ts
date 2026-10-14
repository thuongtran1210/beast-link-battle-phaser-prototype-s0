import type { MatchEndMessage } from '../../network/protocol/NetworkMessages';

/** A combat victory must be backed by the defeated team's authoritative HP. */
export function validBattleResult(message: MatchEndMessage): boolean {
  const snapshot = message.snapshot;
  if (!snapshot || !['TeamA', 'TeamB'].includes(message.winnerTeamId)) return false;
  if (snapshot.status !== (message.winnerTeamId === 'TeamA' ? 'Win' : 'Lose')) return false;
  if (message.endReason === 'surrender' || message.endReason === 'disconnect') return true;
  const defeated = message.winnerTeamId === 'TeamA' ? snapshot.enemies : snapshot.units;
  return snapshot.units.length > 0 && snapshot.enemies.length > 0 && defeated.every(unit => Number.isFinite(unit.currentHp) && unit.currentHp <= 0);
}

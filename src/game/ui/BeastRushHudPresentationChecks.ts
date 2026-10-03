import { comboRatio, comboVisualState, compactEventLabel, queueDisplayEntries, recruitedTotal } from './BeastRushHudPresentation';

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Beast Rush HUD check failed: ${message}`);
}

export function runBeastRushHudPresentationChecks(): void {
  expect(comboRatio(0, 12) === 0, 'zero combo has an empty meter');
  expect(comboRatio(16, 12) === 1, 'combo meter clamps at cap');
  expect(Math.abs(comboRatio(8.4, 12) - .7) < 0.000001, 'current combo derives correct meter ratio');
  expect(comboVisualState(0, true) === 'ready', 'fresh active combo is ready');
  expect(comboVisualState(2.9, true) === 'low', 'low combo is urgent');
  expect(comboVisualState(0, false) === 'expired', 'inactive empty combo is expired');
  const entries = [{ id: 'beast-a', count: 3 }, { id: 'beast-c', count: 1 }];
  expect(recruitedTotal(entries) === 4, 'recruited is the sum of BattleQueue counts');
  expect(queueDisplayEntries([]).length === 0, 'empty queue has no prose entry');
  expect(queueDisplayEntries(entries)[0].id === 'beast-a', 'queue preserves stable ordering');
  expect(queueDisplayEntries(entries)[0].count === 3, 'three copies remain count 3, not STAR');
  expect(compactEventLabel({ kind: 'match', beastName: 'SNOWGUARD', comboBonus: .3 }) === '+1 SNOWGUARD   +0.3s', 'match event is compact');
  expect(compactEventLabel({ kind: 'invalid' }) === 'NO LINK', 'invalid event is compact');
  expect(compactEventLabel({ kind: 'reshuffle' }) === 'RESHUFFLED', 'reshuffle event is compact');
}

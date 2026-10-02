import { BoardModel } from './BoardModel';
import { OnetMatcher } from './OnetMatcher';

/** Deterministic S1 logic checks from the P0 Technical Scaffold. */
export function runOnetMatcherChecks(): void {
  const matcher = new OnetMatcher();
  const match = (cells: Array<string | null>, size: number, first: [number, number], second: [number, number]) => matcher.findMatch(new BoardModel(size, cells), { row: first[0], col: first[1] }, { row: second[0], col: second[1] });
  const empty = (size: number) => Array<string | null>(size * size).fill(null);
  const straight = empty(3); straight[0] = 'A'; straight[2] = 'A';
  expect(match(straight, 3, [0, 0], [0, 2]).valid && match(straight, 3, [0, 0], [0, 2]).turnCount === 0, 'straight path');
  const l = empty(3); l[0] = 'A'; l[4] = 'A';
  expect(match(l, 3, [0, 0], [1, 1]).valid && match(l, 3, [0, 0], [1, 1]).turnCount === 1, 'L path');
  const z = empty(3); z[3] = 'A'; z[5] = 'A'; z[4] = 'B';
  expect(match(z, 3, [1, 0], [1, 2]).valid && match(z, 3, [1, 0], [1, 2]).turnCount === 2, 'Z path');
  const outer = empty(3); outer[0] = 'A'; outer[2] = 'A'; outer[1] = 'B'; outer[3] = 'B'; outer[5] = 'B';
  const outerResult = match(outer, 3, [0, 0], [0, 2]);
  expect(outerResult.valid && outerResult.turnCount === 2 && outerResult.pathPoints.some((point) => point.row === -1), 'outer-border U path');
  // The surrounding occupied cells rule out every route within the two-turn limit.
  const tooManyTurns = ['B', 'B', 'B', 'B', 'B', 'B', 'A', 'B', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
  expect(!match(tooManyTurns, 5, [1, 1], [1, 3]).valid, 'path requiring more than two turns');
  const blocked = ['B', 'B', 'B', 'A', 'B', 'A', 'B', 'B', 'B'];
  expect(!match(blocked, 3, [1, 0], [1, 2]).valid, 'blocked route');
  const different = empty(2); different[0] = 'A'; different[1] = 'B';
  expect(!match(different, 2, [0, 0], [0, 1]).valid, 'different content');
}

function expect(condition: boolean, label: string): void {
  if (!condition) throw new Error(`OnetMatcher check failed: ${label}`);
}

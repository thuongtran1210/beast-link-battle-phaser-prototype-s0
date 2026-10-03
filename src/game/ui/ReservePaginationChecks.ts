import { reservePage } from './ReservePagination';
const expect = (v: boolean, m: string) => { if (!v) throw new Error(`Reserve pagination check failed: ${m}`); };
export function runReservePaginationChecks(): void {
  const six = ['a','b','c','d','e','f']; const seven = [...six, 'g']; const thirteen = Array.from({ length: 13 }, (_, i) => `unit-${i + 1}`);
  expect(reservePage(six, 0).items.length === 6 && reservePage(six, 0).pageCount === 1, 'six reserve units fit first page');
  const first = reservePage(seven, 0); const second = reservePage(seven, 1); expect(first.items.join('') === 'abcdef' && second.items.join('') === 'g' && second.pageCount === 2, 'seven units remain reachable across two pages');
  expect(reservePage(thirteen, 2).items.length === 1 && reservePage(thirteen, 2).items[0] === 'unit-13', 'thirteen units remain reachable across three pages');
  expect(reservePage(seven, 9).pageIndex === 1 && reservePage([], 3).pageIndex === 0, 'page index clamps after state changes');
}

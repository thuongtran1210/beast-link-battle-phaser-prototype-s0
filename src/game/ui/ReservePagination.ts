export const MAX_VISIBLE_RESERVE_CARDS = 6;
export interface ReservePage<T> { items: T[]; pageIndex: number; pageCount: number; start: number; end: number; }
export function reservePage<T>(items: ReadonlyArray<T>, requestedPage: number, pageSize = MAX_VISIBLE_RESERVE_CARDS): ReservePage<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const pageIndex = Math.max(0, Math.min(requestedPage, pageCount - 1));
  const start = pageIndex * pageSize; const end = Math.min(items.length, start + pageSize);
  return { items: items.slice(start, end), pageIndex, pageCount, start, end };
}

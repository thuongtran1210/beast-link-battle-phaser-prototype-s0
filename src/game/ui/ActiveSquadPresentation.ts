/** The V14B experimental squad commitment limit. The formation grid remains 3 × 6. */
export const ACTIVE_SQUAD_LIMIT = 4;

export type ReserveTargetAffordance = 'place' | 'swap' | 'blocked';

export interface ActiveSquadPresentation {
  activeCount: number;
  reserveCount: number;
  koCount: number;
  limit: number;
  isFull: boolean;
  meter: boolean[];
  countLabel: string;
  ctaSummary: string;
}

/** Derives squad-capacity UI only; tactical grid cells never affect this state. */
export function activeSquadPresentation(activeCount: number, reserveCount: number, koCount: number, limit = ACTIVE_SQUAD_LIMIT): ActiveSquadPresentation {
  const visibleActiveCount = Math.max(0, Math.min(activeCount, limit));
  const visibleReserveCount = Math.max(0, reserveCount);
  const visibleKoCount = Math.max(0, koCount);
  return {
    activeCount: visibleActiveCount,
    reserveCount: visibleReserveCount,
    koCount: visibleKoCount,
    limit,
    isFull: visibleActiveCount >= limit,
    meter: Array.from({ length: limit }, (_, index) => index < visibleActiveCount),
    countLabel: `${visibleActiveCount} / ${limit}`,
    ctaSummary: `ACTIVE ${visibleActiveCount} / ${limit} · RESERVE ${visibleReserveCount}${visibleKoCount > 0 ? ` · KO ${visibleKoCount}` : ''}`,
  };
}

/** Occupied cells stay swap targets even when Reserve cannot add a fifth Beast. */
export function reserveTargetAffordance(activeCount: number, isOccupied: boolean, draggingFromReserve: boolean, limit = ACTIVE_SQUAD_LIMIT): ReserveTargetAffordance {
  if (isOccupied) return 'swap';
  return draggingFromReserve && activeCount >= limit ? 'blocked' : 'place';
}

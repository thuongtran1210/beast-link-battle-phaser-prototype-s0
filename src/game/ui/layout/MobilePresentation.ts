/** Presentation only. Query flag enables desktop QA at phone viewport sizes. */
export function isCompactLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mobile') === '1'
    || window.matchMedia('(orientation: landscape) and (max-height: 600px) and (max-width: 1200px)').matches
    || window.matchMedia('(pointer: coarse) and (max-width: 1400px)').matches;
}

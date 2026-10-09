/** Player presentation defaults to mobile landscape. Use ?mobile=0 for desktop QA. */
export function isCompactLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mobile') !== '0';
}

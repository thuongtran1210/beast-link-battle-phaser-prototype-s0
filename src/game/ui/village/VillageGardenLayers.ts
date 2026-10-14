import type { GardenCycleSnapshot } from '../../run/VillageGardenCycle';

/** Code-native prototype layers until owner supplies separate soil/crop sprites. */
export function gardenPrototypeLayers(snapshot: GardenCycleSnapshot,hideBasket=false): string {
  const plants = snapshot.stage === 'mature' || snapshot.stage === 'harvesting';
  const growing = snapshot.stage === 'growing';
  const crop = [105,225,345,105,225,345].slice(0,snapshot.quantity||5).map((x,index) => {
    const y = index < 3 ? 170 : 275;
    if (plants) return `<g transform="translate(${x},${y})"><path d="M-13 0 Q0 24 13 0" fill="#ef963e" stroke="#604632" stroke-width="3"/><path d="M0 0 Q-22-30-16-34 Q0-22 0 0 M0 0 Q22-30 16-34 Q0-22 0 0" fill="#69a547" stroke="#4e7836" stroke-width="3"/></g>`;
    return growing ? `<path d="M${x} ${y}v-14q-16-14-17-3q3 12 17 3q16-14 17-3q-3 12-17 3" fill="#8cbd5c" stroke="#557d39" stroke-width="3"/>` : '';
  }).join('');
  const basket = snapshot.stage === 'waiting-pickup' && !hideBasket ? '<g transform="translate(390,260)"><path d="M-40 0h80l-10 50h-60z" fill="#bc8147" stroke="#64482e" stroke-width="4"/><path d="M-25 5l10-20 12 28 M0 5l10-20 12 28" fill="#ed963e" stroke="#62853d" stroke-width="5"/></g>' : '';
  return `<svg viewBox="0 0 512 360" aria-hidden="true"><rect x="34" y="88" width="430" height="244" rx="25" fill="#bd9861" stroke="#795338" stroke-width="9"/><rect x="55" y="115" width="340" height="88" rx="18" fill="#986a42"/><rect x="55" y="220" width="340" height="88" rx="18" fill="#986a42"/>${crop}${basket}</svg>`;
}

import type { VillageActivityKind, VillageResidentId } from '../../run/VillageCatalog';
import type { VillageWorkerSnapshot } from '../../run/VillageActivity';

export type VillageClipId = 'idle' | 'walk' | 'enter' | 'work' | 'finish' | 'inspect' | 'pickup' | 'loaded-walk' | 'greet' | 'boat-row';
export interface VillageActivityPresentation {
  readonly workLabel: string;
  readonly clips: { readonly enter: VillageClipId; readonly work: VillageClipId; readonly finish: VillageClipId };
  /** Source ownership is declared here; authored sheet ownership overrides it. */
  readonly tool: 'watering-can' | 'fishing-rod' | 'hammer' | null;
  readonly prototypeToolClass?: string;
}
export const VILLAGE_ACTIVITY_PRESENTATION: Record<VillageActivityKind, VillageActivityPresentation> = {
  garden: { workLabel: 'Đang trồng rau', clips: { enter: 'enter', work: 'work', finish: 'finish' }, tool: 'watering-can', prototypeToolClass: 'village-water-tool' },
  fishing: { workLabel: 'Đang câu cá', clips: { enter: 'enter', work: 'work', finish: 'finish' }, tool: 'fishing-rod', prototypeToolClass: 'village-rod' },
  anvil: { workLabel: 'Đang làm đồ chơi', clips: { enter: 'enter', work: 'work', finish: 'finish' }, tool: 'hammer' },
  carrot: { workLabel: 'Đang ăn cà rốt', clips: { enter: 'enter', work: 'work', finish: 'finish' }, tool: null },
  bath: { workLabel: 'Đang nghỉ trong bồn', clips: { enter: 'enter', work: 'work', finish: 'finish' }, tool: null },
};
/** These are existing activities, not unlocks or the later six-profession upgrade. */
export const VILLAGE_RESIDENT_ACTIVITIES: Readonly<Partial<Record<VillageResidentId, VillageActivityKind>>> = {
  'beast-b': 'fishing', 'beast-c': 'garden', 'beast-e': 'anvil',
};
export const VILLAGE_PROTOTYPE_TOOLS: Readonly<Partial<Record<VillageActivityKind, string>>> = {
  garden: '<span class="village-water-tool" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M10 18 Q-2 18 4 35" fill="none" stroke="#3b4235" stroke-width="5"/><path d="M12 15 H40 V44 H12 Z M40 25 L64 16 L68 23 L40 36" fill="#81bca3" stroke="#3b4235" stroke-width="3"/><path d="M64 30 L70 43 M70 28 L77 40" stroke="#73bed0" stroke-width="3"/></svg></span>',
  fishing: '<span class="village-rod" aria-hidden="true"></span>',
};

export function villageActivityLabel(worker: VillageWorkerSnapshot): string {
  if (worker.block) return worker.block.message;
  if (worker.phase === 'work') {
    if(worker.gardenStage){const labels={empty:'Luống trống',sowing:'Đang gieo hạt',growing:'Cây đang lớn · Chăm sóc',mature:'Cà rốt trưởng thành',harvesting:'Đang thu hoạch', 'waiting-pickup':'Giỏ cà rốt chờ lấy'};return `${labels[worker.gardenStage]} · ${Math.ceil(worker.remaining)}s`;}
    if (worker.remaining <= 1e-6) return 'Đã làm xong · Chờ giao vào kho';
    const label = VILLAGE_ACTIVITY_PRESENTATION[worker.kind].workLabel;
    return worker.jobId === undefined ? label : `${label} · ${Math.ceil(worker.remaining)}s`;
  }
  return worker.phase === 'walk' ? 'Đang tới nơi làm việc' : worker.phase === 'return' ? 'Đang về nghỉ' : 'Đang nghỉ';
}

export function villageWorkerClip(worker: VillageWorkerSnapshot): VillageClipId {
  if (worker.block || (worker.phase === 'work' && worker.remaining <= 1e-6)) return 'idle';
  if(worker.phase==='work'&&worker.gardenStage&&worker.gardenStage!=='growing')return 'idle';
  return worker.phase === 'walk' || worker.phase === 'return' ? 'walk' : worker.phase === 'work' ? 'work' : 'idle';
}

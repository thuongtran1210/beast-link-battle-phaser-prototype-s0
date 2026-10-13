import { DECK_UNITS } from './RunDeck';
import { parseVillageEconomy, spendBuildingWood, awardRunWood, type VillageEconomy } from './VillageEconomy';
import { VILLAGE_ITEM_IDS, VILLAGE_STATIONS, VILLAGE_STORIES, type VillageStationId } from './VillageCatalog';
import { migrateVillageAnchor, validVillagePlacement, type VillagePoint } from './VillageLayout';
export const CAMP_DECOR = [
  {id:'bath', name:'Duck tub', cost:10, favorite:'beast-a', meme:'Khiên nghỉ phép. Vịt đi spa.'},
  {id:'carrot', name:'Giant carrot', cost:15, favorite:'beast-c', meme:'Đồ dụ địch. Tôi chỉ kiểm tra chất lượng thôi.'},
  {id:'anvil', name:'Toy forge', cost:20, favorite:'beast-e', meme:'Gõ một cái cho tỉnh ngủ. Cả trại tỉnh luôn.'},
] as const;
export interface CampState {
  version:3; wood:number; economy:VillageEconomy; residents:string[]; crafted:string[];
  /** Compatibility for the current three-slot Camp UI. */
  slots:(string|null)[]; diary:string[];
  placements:Partial<Record<VillageStationId,VillagePoint>>; seenStoryIds:string[];
  trackedGoal?: 'forge';
  rewardedRuns: string[];
}
export const CAMP_SAVE_KEY='beast-link-camp-v3';
export const PREVIOUS_CAMP_SAVE_KEY='beast-link-camp-v2';
export const LEGACY_CAMP_SAVE_KEY='beast-link-camp-v1';
export function parseCamp(value:unknown): CampState {
  const raw = value && typeof value === 'object' ? value as Partial<CampState> : {};
  const strings = (v:unknown) => Array.isArray(v) ? [...new Set(v.filter((s):s is string => typeof s === 'string'))] : [];
  const validDecor = (id:string) => (VILLAGE_ITEM_IDS as readonly string[]).includes(id);
  const crafted = strings(raw.crafted).filter(validDecor);
  const used=new Set<string>();
  const slots=Array.from({length:3},(_,i)=>{
    const id=Array.isArray(raw.slots)?raw.slots[i]:null;
    if(typeof id!=='string'||!CAMP_DECOR.some(d=>d.id===id)||!crafted.includes(id)||used.has(id)) return null;
    used.add(id);return id;
  });
  const placements:CampState['placements']={};
  if(raw.placements && typeof raw.placements==='object') {
    for(const station of VILLAGE_STATIONS) {
      const stored=raw.placements[station.id];
      const point=stored?migrateVillageAnchor(station.id,stored):undefined;
      if(point && crafted.includes(station.itemId) && validVillagePlacement(station.id,point)) placements[station.id]={x:point.x,y:point.y};
    }
  }
  const wood=typeof raw.wood === 'number' && Number.isFinite(raw.wood)?Math.max(0,Math.floor(raw.wood)):25;
  return {version:3,wood,economy:parseVillageEconomy(raw.economy,wood,raw.version!==3),
    trackedGoal:raw.trackedGoal==='forge'?'forge':undefined,
    rewardedRuns:strings(raw.rewardedRuns).filter(id=>id.length<=100).slice(-100),
    residents:strings(raw.residents).filter(id => (DECK_UNITS as readonly string[]).includes(id)), crafted,
    slots:slots.map(id=>VILLAGE_STATIONS.some(s=>s.itemId===id && placements[s.id])?null:id), placements, seenStoryIds:strings(raw.seenStoryIds).filter(id=>VILLAGE_STORIES.some(story=>story.id===id)),
    diary:Array.isArray(raw.diary)?raw.diary.filter((s):s is string=>typeof s==='string').slice(-30):[]};
}
export interface CampStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function loadCamp(storage?:CampStorage):CampState {
  try {
    const source=storage??localStorage;
    for(const key of [CAMP_SAVE_KEY,PREVIOUS_CAMP_SAVE_KEY,LEGACY_CAMP_SAVE_KEY]) {
      const serialized=source.getItem(key);
      if(!serialized) continue;
      try {
        const raw=JSON.parse(serialized);
        if(!raw || typeof raw!=='object' || Array.isArray(raw)) continue;
        if(key===CAMP_SAVE_KEY && raw.version!==3) continue;
        if(key===PREVIOUS_CAMP_SAVE_KEY && raw.version!==2) continue;
        return parseCamp(raw);
      } catch { /* Recover using the preserved v1 copy. */ }
    }
  } catch { /* Device storage is optional. */ }
  return parseCamp(null);
}
export function saveCamp(state:CampState,storage?:CampStorage):boolean {
  try { (storage??localStorage).setItem(CAMP_SAVE_KEY,JSON.stringify(parseCamp(state)));return true; }
  catch { return false; /* Preserve older saves when storage fails. */ }
}
export function campInventory(state:CampState):string[] {
  const placed=new Set([...state.slots.filter((id):id is string=>id!==null),
    ...VILLAGE_STATIONS.filter(s=>state.placements[s.id]).map(s=>s.itemId)]);
  return state.crafted.filter(id=>!placed.has(id));
}
export function recordVillageStory(state:CampState,id:string):boolean {
  const story=VILLAGE_STORIES.find(s=>s.id===id);
  if(!story || !state.residents.includes(story.beastId) || state.seenStoryIds.includes(id)) return false;
  state.seenStoryIds.push(id);state.diary.push(story.text);state.diary=state.diary.slice(-30);return true;
}
export function craftCampDecor(state:CampState,id:string,slot:number):boolean {
  const decor = CAMP_DECOR.find(d => d.id === id);
  if (!decor || !Number.isInteger(slot) || slot < 0 || slot > 2) return false;
  if (!state.crafted.includes(id)) { if (state.wood < decor.cost) return false; spendBuildingWood(state,decor.cost,decor.name); state.crafted.push(id); }
  for(const station of VILLAGE_STATIONS) if(station.itemId===id) delete state.placements[station.id];
  state.slots = state.slots.map(item => item === id ? null : item); state.slots[slot] = id; return true;
}
export function discoverCampBeasts(ids:readonly string[]):void {
  const state = loadCamp();
  ids.filter(id => (DECK_UNITS as readonly string[]).includes(id)).forEach(id => {
    if (!state.residents.includes(id)) {state.residents.push(id); state.diary.push(`${id} vừa gia nhập trại. Lương trả bằng cà rốt được không?`);}
  }); saveCamp(state);
}
export function rewardCampWin(runId:string,storage?:CampStorage): {saved:boolean;woodGranted:number;before:CampState;after:CampState} {
  const before=loadCamp(storage),after=parseCamp(before);
  if(after.rewardedRuns.includes(runId))return {saved:true,woodGranted:0,before,after};
  if(!runId||runId.length>100)return {saved:false,woodGranted:0,before,after:before};
  awardRunWood(after);after.rewardedRuns.push(runId);after.rewardedRuns=after.rewardedRuns.slice(-100);
  after.diary.push('Run thắng! +15 Gỗ Rừng. Đội xây dựng đã có ngân sách.');after.diary=after.diary.slice(-30);
  if(!saveCamp(after,storage))return {saved:false,woodGranted:0,before,after:before};
  return {saved:true,woodGranted:15,before,after};
}

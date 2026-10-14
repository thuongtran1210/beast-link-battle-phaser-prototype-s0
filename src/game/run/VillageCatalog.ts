export const VILLAGE_PROFESSIONS = [
  { id:'patrol', beastId:'beast-a', name:'Bảo vệ tuần tra', stationId:null, mvp:false },
  { id:'fishing', beastId:'beast-b', name:'Người câu cá', stationId:'fishing', mvp:true },
  { id:'gardening', beastId:'beast-c', name:'Nông dân', stationId:'garden', mvp:true },
  { id:'astronomy', beastId:'beast-d', name:'Thương nhân chèo xuồng', stationId:null, mvp:false },
  { id:'crafting', beastId:'beast-e', name:'Thợ rèn, thợ mộc', stationId:'forge', mvp:true },
  { id:'delivery', beastId:'beast-f', name:'Người vận chuyển hàng', stationId:null, mvp:false },
  { id:'tailoring', beastId:'beast-g', name:'Thợ may, chăm sóc thú', stationId:null, mvp:false },
  { id:'flowers', beastId:'beast-h', name:'Người làm vườn', stationId:null, mvp:false },
  { id:'invention', beastId:'beast-i', name:'Thợ sáng chế', stationId:null, mvp:false },
  { id:'cooking', beastId:'beast-j', name:'Đầu bếp', stationId:null, mvp:false },
] as const;
export type VillageProfessionId = typeof VILLAGE_PROFESSIONS[number]['id'];
export type VillageResidentId = typeof VILLAGE_PROFESSIONS[number]['beastId'];

export const VILLAGE_STATIONS = [
  { id:'forge', name:'Xưởng gỗ và đồ chơi', owner:'beast-e', itemId:'anvil', cost:20, capacity:1 },
  // Null prices intentionally keep unapproved construction out of the shop.
  { id:'garden', name:'Vườn cà rốt', owner:'beast-c', itemId:'garden', cost:null, capacity:1 },
  { id:'fishing', name:'Bến câu cá', owner:'beast-b', itemId:'fishing', cost:null, capacity:1 },
] as const;
export type VillageStationId = typeof VILLAGE_STATIONS[number]['id'];
export const VILLAGE_ITEM_IDS = ['bath','carrot','anvil','garden','fishing'] as const;
export type VillageActivityKind = typeof VILLAGE_ITEM_IDS[number];
export type VillageActivityStationId = VillageStationId | 'bath' | 'carrot';
/** Keep saved production/CSS 'anvil' while exposing canonical station 'forge'. */
export function villageActivityStation(kind: VillageActivityKind): VillageActivityStationId {
  return kind === 'anvil' ? 'forge' : kind;
}
export const VILLAGE_STORIES = [
  {id:'forge.toy-duck', beastId:'beast-e', text:'Tôi đóng đồ chơi. Sao đồ chơi lại hù tôi?'},
  {id:'garden.carrot-bite', beastId:'beast-c', text:'Không thiếu cà rốt. Đây là kiểm định chất lượng.'},
  {id:'fishing.old-boot', beastId:'beast-b', text:'Cá hôm nay mang giày. Đừng kể ai.'},
] as const;
export type VillageStoryId = typeof VILLAGE_STORIES[number]['id'];
export function villageProfession(beastId:string) { return VILLAGE_PROFESSIONS.find(p=>p.beastId===beastId); }

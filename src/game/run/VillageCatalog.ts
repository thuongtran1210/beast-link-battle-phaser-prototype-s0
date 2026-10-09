export const VILLAGE_PROFESSIONS = [
  { beastId:'beast-a', name:'Bảo vệ kiêm giao hàng', stationId:null, mvp:false },
  { beastId:'beast-b', name:'Người câu cá', stationId:'fishing', mvp:true },
  { beastId:'beast-c', name:'Nông dân', stationId:'garden', mvp:true },
  { beastId:'beast-d', name:'Nhà thiên văn', stationId:null, mvp:false },
  { beastId:'beast-e', name:'Thợ rèn, thợ mộc', stationId:'forge', mvp:true },
  { beastId:'beast-f', name:'Người đưa thư', stationId:null, mvp:false },
  { beastId:'beast-g', name:'Thợ may, chăm sóc thú', stationId:null, mvp:false },
  { beastId:'beast-h', name:'Người làm vườn', stationId:null, mvp:false },
  { beastId:'beast-i', name:'Thợ sáng chế', stationId:null, mvp:false },
  { beastId:'beast-j', name:'Đầu bếp', stationId:null, mvp:false },
] as const;

export const VILLAGE_STATIONS = [
  { id:'forge', name:'Xưởng gỗ và đồ chơi', owner:'beast-e', itemId:'anvil', cost:20, capacity:1 },
  // Null prices intentionally keep unapproved construction out of the shop.
  { id:'garden', name:'Vườn cà rốt', owner:'beast-c', itemId:'garden', cost:null, capacity:1 },
  { id:'fishing', name:'Bến câu cá', owner:'beast-b', itemId:'fishing', cost:null, capacity:1 },
] as const;
export type VillageStationId = typeof VILLAGE_STATIONS[number]['id'];
export const VILLAGE_ITEM_IDS = ['bath','carrot','anvil','garden','fishing'] as const;
export const VILLAGE_STORIES = [
  {id:'forge.toy-duck', beastId:'beast-e', text:'Tôi đóng đồ chơi. Sao đồ chơi lại hù tôi?'},
  {id:'garden.carrot-bite', beastId:'beast-c', text:'Không thiếu cà rốt. Đây là kiểm định chất lượng.'},
  {id:'fishing.old-boot', beastId:'beast-b', text:'Cá hôm nay mang giày. Đừng kể ai.'},
] as const;
export function villageProfession(beastId:string) { return VILLAGE_PROFESSIONS.find(p=>p.beastId===beastId); }

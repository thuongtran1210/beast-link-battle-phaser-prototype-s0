import { CAMP_DECOR, craftCampDecor, parseCamp, saveCamp, type CampState, type CampStorage } from './CampState';

/** The first bridge uses existing wood/ownership; no new loot or combat buffs. */
export function forgeGoal(state:CampState) {
  const cost=CAMP_DECOR.find(item=>item.id==='anvil')!.cost;
  const owned=state.crafted.includes('anvil'),resident=state.residents.includes('beast-e');
  const placed=state.slots.includes('anvil')||!!state.placements.forge;
  const missingWood=owned?0:Math.max(0,cost-state.wood);
  const complete=owned&&resident&&placed;
  return {cost,owned,resident,placed,missingWood,complete,
    progress:`Xưởng ${owned?'đã sở hữu':`${Math.min(state.wood,cost)}/${cost} Gỗ`} · Ironclad ${resident?'đã về làng':'chưa về làng'} · ${placed?'đã đặt':'chưa đặt'}`,
    next:complete?'Chạm xưởng để xem công thức sản xuất đồ chơi':!resident?'Chọn Ironclad trong Deck và nối cặp để đón bạn về làng':missingWood>0?`Còn thiếu ${missingWood} Gỗ · Thắng trọn chuyến thám hiểm nhận 15 Gỗ`:!owned?'Đủ Gỗ · Xây và đặt xưởng tại Làng':'Đặt xưởng đã sở hữu để bắt đầu làm việc'};
}

/** Commit only after persistence succeeds; failures leave live state untouched. */
export function trackForgeGoal(state:CampState,track:boolean,storage?:CampStorage):boolean {
  const candidate=parseCamp(state);candidate.trackedGoal=track?'forge':undefined;
  if(!saveCamp(candidate,storage))return false;
  Object.assign(state,candidate);return true;
}
export function buildTrackedForge(state:CampState,slot:number,storage?:CampStorage):boolean {
  if(state.trackedGoal!=='forge')return false;
  const candidate=parseCamp(state);
  if(!craftCampDecor(candidate,'anvil',slot)||!saveCamp(candidate,storage))return false;
  Object.assign(state,candidate);return true;
}
export function commitCampDecor(state:CampState,id:string,slot:number,storage?:CampStorage):boolean {
  const candidate=parseCamp(state);
  if(!craftCampDecor(candidate,id,slot)||!saveCamp(candidate,storage))return false;
  Object.assign(state,candidate);return true;
}

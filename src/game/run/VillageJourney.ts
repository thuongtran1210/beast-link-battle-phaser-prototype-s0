import type { CampState } from './CampState';
/** Story milestones read existing ownership; never grant unlocks or reset saves. */
export function villageJourney(state:CampState) {
  const steps=[
    {title:'Đón người bạn đầu tiên',description:'Tuyển thú trong chuyến thám hiểm để cùng gây dựng quê nhà.',done:state.residents.length>0},
    {title:'Có người chăm vườn',description:'Đón Windstrider để chăm vườn cà rốt chung.',done:state.residents.includes('beast-c')},
    {title:'Mở xưởng đồ chơi',description:'Chế tạo xưởng bằng 20 Gỗ và đón Ironclad.',done:state.crafted.includes('anvil')&&state.residents.includes('beast-e')},
    {title:'Những câu chuyện đầu tiên',description:'Để cư dân hoàn thành công việc ở vườn, bến cá hoặc xưởng.',done:state.seenStoryIds.length>0},
  ];
  return {steps,completed:steps.filter(s=>s.done).length,next:steps.find(s=>!s.done)};
}

import type { CampState } from '../run/CampState';
import { buildTrackedForge, forgeGoal, trackForgeGoal } from '../run/VillageGoal';

export function showVillageGoal(root:HTMLElement,state:CampState,refresh:()=>void,explore?:()=>void):void {
  const dialog=document.createElement('dialog');dialog.className='game-dialog village-goal-dialog';
  dialog.setAttribute('aria-labelledby','village-goal-title');
  const render=()=>{
    dialog.replaceChildren();
    const heading=document.createElement('h2');heading.id='village-goal-title';heading.textContent='Mở xưởng đồ chơi';
    const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Đóng mục tiêu');close.className='village-goal-close';close.onclick=()=>dialog.close();
    const goal=forgeGoal(state),progress=document.createElement('p'),hint=document.createElement('p');
    progress.textContent=goal.progress;hint.textContent=goal.next;
    const result=document.createElement('p');result.textContent='Ironclad làm đồ chơi từ 2 Gỗ + 1 Đồng. Xưởng đã có được giữ nguyên; không phải mua lại.';
    const status=document.createElement('p');status.setAttribute('role','status');
    dialog.append(heading,close,progress,hint,result);
    const track=document.createElement('button');track.textContent=state.trackedGoal==='forge'?'Bỏ theo dõi':'Theo dõi mục tiêu';
    track.onclick=()=>{if(trackForgeGoal(state,state.trackedGoal!=='forge')){refresh();render();}else status.textContent='Chưa lưu được mục tiêu. Vui lòng thử lại.';};dialog.append(track);
    if(state.trackedGoal==='forge'&&!goal.placed){
      const slots=document.createElement('div');slots.className='village-goal-slots';
      state.slots.forEach((item,index)=>{
        const build=document.createElement('button');build.textContent=`${goal.owned?'Đặt':'Xây'} xưởng · Vị trí ${index+1}${item?' (đang dùng)':''}`;
        build.disabled=(!goal.owned&&goal.missingWood>0)||item!==null;
        build.onclick=()=>{if(buildTrackedForge(state,index)){refresh();render();}else status.textContent='Chưa xây được: kiểm tra Gỗ, vị trí hoặc lưu game.';};slots.append(build);
      });dialog.append(slots);
      const note=document.createElement('small');note.textContent='Nếu không còn vị trí trống, cất một đạo cụ tại Xây dựng trước.';dialog.append(note);
    }
    if(explore){const go=document.createElement('button');go.textContent='Đi thám hiểm';go.onclick=()=>{dialog.close();explore();};dialog.append(go);}
    dialog.append(status);
  };
  render();root.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
}

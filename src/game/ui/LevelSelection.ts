import { RUN_LEVELS, completedRunLevels, type RunLevelId } from '../run/RunLevels';
import { transitionScreen } from './SceneTransition';
import { loadCamp } from '../run/CampState';
import { forgeGoal } from '../run/VillageGoal';

export function showLevelSelection(choose: (id: RunLevelId) => void, back: () => void): void {
  const root = document.createElement('section'); root.className = 'level-selection expedition-selection';
  root.innerHTML = '<header class="deck-header"><button class="deck-back" aria-label="Về menu">←</button><div><h1>Thám hiểm</h1><p>3 đợt · Thắng trọn chuyến đi +15 Gỗ</p></div></header><div class="expedition-scroll"><div class="level-cards" aria-label="Chọn vùng thám hiểm"></div></div><footer><span class="expedition-progress"></span><span>Vuốt ngang để chọn vùng →</span></footer>';
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick = () => transitionScreen(root,()=>{root.remove();back();});
  const camp=loadCamp();
  if(camp.trackedGoal==='forge'){
    const goal=forgeGoal(camp),note=document.createElement('details');note.className='expedition-goal';
    const summary=document.createElement('summary');summary.textContent=`${goal.complete?'✓':'○'} Mở xưởng đồ chơi · ${goal.missingWood?`Thiếu ${goal.missingWood} Gỗ`:!goal.resident?'Cần đón Ironclad':goal.complete?'Đã hoàn thành':'Sẵn sàng xây / đặt'}`;
    const description=document.createElement('p');description.textContent=`${goal.progress}. ${goal.next}. Ironclad cần có trong đội và được nối cặp; không bảo đảm xuất hiện. Cả 3 vùng đều thưởng 15 Gỗ khi thắng trọn chuyến đi.`;
    note.append(summary,description);root.querySelector('.expedition-scroll')!.prepend(note);
  }
  const completed = completedRunLevels();
  root.querySelector('.expedition-progress')!.textContent=`${RUN_LEVELS.filter(level=>completed.includes(level.id)).length}/${RUN_LEVELS.length} vùng đã hoàn tất`;
  const presentation={
    woodland:{name:'Đường mòn rừng',theme:'Làm quen đội hình',description:'Qua tán rừng xanh, giữ vững tuyến trước.',stages:['Tiền tuyến','Đột kích','Cung thủ'],symbol:'M8 22 16 7l8 15h-6v5h-4v-5Z',terrain:'RỪNG XANH'},
    shadow:{name:'Lối qua bóng tối',theme:'Bảo vệ tuyến sau',description:'Canh chừng những kẻ đột kích giữa rừng sâu.',stages:['Đột kích','Hỗn hợp','Cung thủ'],symbol:'M22 6a11 11 0 1 0 4 19A12 12 0 0 1 22 6Z',terrain:'RỪNG SÂU'},
    stronghold:{name:'Pháo đài thú',theme:'Phá đội hình địch',description:'Vượt hàng phòng thủ, mở đường cho cả đội.',stages:['Cung thủ','Hỗn hợp','Tiền tuyến'],symbol:'M7 26V10h5v4h4v-4h4v4h4v-4h3v16H7Zm8 0v-7h5v7',terrain:'PHÁO ĐÀI'},
  };
  for (const level of RUN_LEVELS) {
    const view=presentation[level.id],cleared=completed.includes(level.id);
    const card = document.createElement('button'); card.className = `level-card level-${level.id}`;
    card.setAttribute('aria-label',`${view.name} · ${view.theme} · 3 đợt${cleared?' · Đã hoàn tất':''} · Chọn vùng và chuẩn bị đội`);
    card.innerHTML = `<div class="level-art"><span class="level-terrain">${view.terrain}</span><svg class="level-landmark" viewBox="0 0 32 32" aria-hidden="true"><path d="${view.symbol}"/></svg><span class="level-number">${level.label}</span><img src="${level.portrait}" alt="" draggable="false"><span class="level-complete${cleared?' is-cleared':''}">${cleared?'✓ Đã hoàn tất':'3 đợt'}</span></div><div class="level-copy"><h2>${view.name}</h2><strong>${view.theme}</strong><div class="level-stage-route" aria-label="Các đợt theo thứ tự">${view.stages.map((stage,index)=>`<span><i>${index+1}</i>${stage}</span>`).join('')}</div><span class="level-enter">Chọn vùng <span aria-hidden="true">→</span></span></div>`;
    card.onclick = () => transitionScreen(root,()=>{root.remove();choose(level.id);});
    root.querySelector('.level-cards')!.append(card);
  }
  document.getElementById('game-shell')!.append(root);
}

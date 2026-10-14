import { RUN_LEVELS, completedRunLevels, type RunLevelId } from '../run/RunLevels';
import { transitionScreen } from './SceneTransition';
import { loadCamp } from '../run/CampState';
import { forgeGoal } from '../run/VillageGoal';

export function showLevelSelection(choose: (id: RunLevelId) => void, back: () => void): void {
  const root = document.createElement('section'); root.className = 'level-selection journey-selection';
  root.innerHTML = `<header class="deck-header"><button class="deck-back" aria-label="Về sảnh">←</button><div><h1>Chuyến đi của đội thú</h1><p>Chọn điểm đến · Mang những điều mới về làng</p></div></header><div class="journey-body"><div class="journey-map-scroll"><div class="journey-map" aria-label="Bản đồ thám hiểm"><svg class="journey-terrain" viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true"><path fill="#cdddb8" d="M0 30Q180 -20 310 70T800 20V420H0Z"/><path fill="#b8d0a5" d="M0 160Q170 70 320 170T800 100V420H0Z"/><path fill="#a3c5b0" d="M480 0Q400 140 570 240T800 370V420H710Q560 330 505 230T430 0Z"/><path d="M90 325C120 300 170 270 250 220S365 210 465 300S605 270 650 140" fill="none" stroke="#9baa7a" stroke-width="23" stroke-linecap="round"/><path d="M90 325C120 300 170 270 250 220S365 210 465 300S605 270 650 140" fill="none" stroke="#f4e3b4" stroke-width="15" stroke-linecap="round"/><path d="M90 325C120 300 170 270 250 220S365 210 465 300S605 270 650 140" fill="none" stroke="#b89c69" stroke-width="2" stroke-dasharray="3 9"/><g fill="#7da071"><path d="M110 90l25-50 25 50h-15v20h-20V90Z"/><path d="M300 110l22-45 22 45h-13v17h-18v-17Z"/><path d="M360 340l25-50 25 50h-15v20h-20v-20Z"/><path d="M690 350l25-50 25 50h-15v20h-20v-20Z"/></g></svg><div class="journey-home"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M6 28L30 8l24 20" fill="#be9b67"/><path d="M12 28h36v26H12Z" fill="#f2dfaf" stroke="#647650" stroke-width="3"/><path d="M25 54V37h10v17" fill="#81916b"/></svg><span>Làng Thú</span></div><span class="journey-map-note">Mỗi điểm đến là một chuyến đi riêng</span></div></div><aside class="journey-details" aria-label="Thông tin điểm đến" aria-live="polite"></aside></div><div class="journey-goal-slot"></div><footer><span class="expedition-progress"></span><span>Chạm điểm đến trên bản đồ</span></footer>`;
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick = () => transitionScreen(root,()=>{root.remove();back();});
  const terrain = root.querySelector('.journey-terrain')!;
  terrain.insertAdjacentHTML('afterbegin', '<defs><linearGradient id="journey-paper" x2="0" y2="1"><stop stop-color="#f5edcf"/><stop offset="1" stop-color="#cbdab3"/></linearGradient><filter id="journey-soft"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#456344" flood-opacity=".16"/></filter></defs><rect width="800" height="420" fill="url(#journey-paper)"/>');
  const groves = [[65,110],[170,85],[325,115],[370,155],[410,340],[570,90],[710,310],[745,220]];
  terrain.insertAdjacentHTML('beforeend', `<g filter="url(#journey-soft)">${groves.map(([x,y],i) => `<g transform="translate(${x} ${y})"><ellipse cy="22" rx="30" ry="8" fill="#739270" opacity=".2"/><path d="M-4 5h8v18h-8Z" fill="#93866a"/><circle cx="-13" cy="-8" r="19" fill="${i > 3 ? '#77977b' : '#91ad7b'}"/><circle cx="13" cy="-10" r="20" fill="#83a174"/><circle cy="-24" r="22" fill="${i > 3 ? '#688b70' : '#a1bb84'}"/></g>`).join('')}</g><g fill="#f8f1d9" opacity=".7"><ellipse cx="90" cy="190" rx="20" ry="3"/><ellipse cx="580" cy="365" rx="30" ry="3"/><ellipse cx="720" cy="80" rx="24" ry="3"/></g>`);
  const camp=loadCamp();
  if(camp.trackedGoal==='forge'){
    const goal=forgeGoal(camp),note=document.createElement('details');note.className='expedition-goal';
    const summary=document.createElement('summary');summary.textContent=`${goal.complete?'✓':'○'} Mở xưởng đồ chơi · ${goal.missingWood?`Thiếu ${goal.missingWood} Gỗ`:!goal.resident?'Cần đón Ironclad':goal.complete?'Đã hoàn thành':'Sẵn sàng xây / đặt'}`;
    const description=document.createElement('p');description.textContent=`${goal.progress}. ${goal.next}. Ironclad cần có trong đội và được nối cặp; không bảo đảm xuất hiện. Cả 3 vùng đều thưởng 15 Gỗ khi thắng trọn chuyến đi.`;
    note.append(summary,description);root.querySelector('.journey-goal-slot')!.append(note);
  }
  const completed = completedRunLevels();
  root.querySelector('.expedition-progress')!.textContent=`${RUN_LEVELS.filter(level=>completed.includes(level.id)).length}/${RUN_LEVELS.length} vùng đã hoàn tất`;
  const presentation={
    woodland:{name:'Đường mòn rừng',theme:'Làm quen đội hình',description:'Qua tán rừng xanh, giữ vững tuyến trước.',stages:['Tiền tuyến','Đột kích','Cung thủ'],symbol:'M8 22 16 7l8 15h-6v5h-4v-5Z',terrain:'RỪNG XANH'},
    shadow:{name:'Lối qua bóng tối',theme:'Bảo vệ tuyến sau',description:'Canh chừng những kẻ đột kích giữa rừng sâu.',stages:['Đột kích','Hỗn hợp','Cung thủ'],symbol:'M22 6a11 11 0 1 0 4 19A12 12 0 0 1 22 6Z',terrain:'RỪNG SÂU'},
    stronghold:{name:'Pháo đài thú',theme:'Phá đội hình địch',description:'Vượt hàng phòng thủ, mở đường cho cả đội.',stages:['Cung thủ','Hỗn hợp','Tiền tuyến'],symbol:'M7 26V10h5v4h4v-4h4v4h4v-4h3v16H7Zm8 0v-7h5v7',terrain:'PHÁO ĐÀI'},
  };
  const positions = { woodland: [31.25, 52.38], shadow: [58.12, 71.43], stronghold: [81.25, 33.33] };
  const buttons = new Map<RunLevelId, HTMLButtonElement>();
  const select = (id: RunLevelId) => {
    const view = presentation[id], level = RUN_LEVELS.find(item => item.id === id)!;
    buttons.forEach((button, key) => { button.classList.toggle('is-selected', key === id); button.setAttribute('aria-pressed', String(key === id)); });
    const detail = root.querySelector('.journey-details')!;
    detail.innerHTML = `<div class="journey-detail-copy"><span class="journey-eyebrow">ĐIỂM ĐẾN ${level.label} · ${completed.includes(id) ? 'ĐÃ KHÁM PHÁ' : 'SẴN SÀNG KHÁM PHÁ'}</span><img class="journey-guide" src="${level.portrait}" alt=""><h2>${view.name}</h2><p class="journey-story">${view.description}</p><strong class="journey-challenge">${view.theme}</strong><div class="journey-stages" aria-label="Ba đợt chiến đấu">${view.stages.map((stage, index) => `<span><b>${index + 1}</b>${stage}</span>`).join('')}</div><p class="journey-reward">Hoàn thành 3 đợt · Nhận <strong>15 Gỗ</strong></p></div><button class="journey-start">Chuẩn bị đội thú</button>`;
    detail.querySelector<HTMLButtonElement>('.journey-start')!.onclick = () => transitionScreen(root,()=>{root.remove();choose(id);}, { title: 'Chuẩn bị đội hình', message: `Đang tập hợp thú cho ${view.name}…` });
  };
  for (const level of RUN_LEVELS) {
    const view=presentation[level.id],cleared=completed.includes(level.id);
    const card = document.createElement('button'); card.className = `journey-stop journey-${level.id}`;
    card.style.left = `${positions[level.id][0]}%`; card.style.top = `${positions[level.id][1]}%`;
    card.setAttribute('aria-label',`${view.name} · ${view.theme} · 3 đợt${cleared?' · Đã hoàn tất':''} · Chọn vùng và chuẩn bị đội`);
    card.innerHTML = `<span class="journey-landmark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="${view.symbol}"/></svg><img src="${level.portrait}" alt="" draggable="false"><span class="journey-flag">${cleared ? '✓' : level.label}</span></span><strong>${view.name}</strong><span class="journey-party" aria-hidden="true">Đang chọn</span>`;
    card.onclick = () => select(level.id);
    buttons.set(level.id, card); root.querySelector('.journey-map')!.append(card);
  }
  select('woodland');
  document.getElementById('game-shell')!.append(root);
}


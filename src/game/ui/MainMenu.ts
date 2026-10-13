import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { showCamp } from './CampView';
import { transitionScreen } from './SceneTransition';
import { firstJourneyStage } from '../run/FirstJourney';

/** DOM navigation stays separate from the pre-run deck and gameplay scene. */
export function showMainMenu(play: () => void): void {
  const root = document.createElement('section');
  root.className = 'main-menu farming-menu cozy-menu';
  root.innerHTML = `<div class="menu-copy"><span class="menu-eyebrow">A LITTLE SQUAD. A BIG ADVENTURE.</span><h1>Beast Link<br><em>Battle</em></h1><p>Match Beasts. Build your squad.<br>Turn a tiny team into a ridiculous legend.</p><div class="menu-actions"><button class="menu-play">Play <span>Choose a region →</span></button><button class="menu-help">How to play</button><button class="menu-fullscreen">Full screen</button></div><small class="menu-footnote">6 Beast types · 3 Waves · one Run</small></div><div class="menu-party" aria-hidden="true">${(['beast-e', 'beast-d', 'beast-f'] as const).map(id => `<img src="${BATTLE_CHARACTER_ART[id].base}" alt="">`).join('')}</div>`;
  root.querySelector<HTMLButtonElement>('.menu-play')!.onclick = () => transitionScreen(root,()=>{root.remove();play();});
  root.querySelector('.menu-eyebrow')!.remove();root.querySelector('.menu-copy>p')!.remove();root.querySelector('.menu-footnote')!.remove();
  root.querySelector('h1')!.innerHTML='Làng Thú<em>Một góc quê, một khởi đầu</em>';
  root.querySelector('.menu-play')!.textContent='Thám hiểm';
  const camp = document.createElement('button');camp.className='menu-home';camp.textContent='Về làng';
  camp.onclick=()=>transitionScreen(root,()=>{root.remove();showCamp(()=>showMainMenu(play),play);});
  root.querySelector('.menu-actions')!.prepend(camp);
  const onboarding=firstJourneyStage();
  if(onboarding==='expedition'){
    camp.remove();root.querySelector('.menu-play')!.textContent='Chuyến đi đầu tiên →';
    root.querySelector('h1 em')!.textContent='Bắt đầu ở Đường mòn rừng';
  }else if(onboarding==='village'){
    root.querySelector('.menu-play')!.textContent='Khám phá Làng →';
    root.querySelector<HTMLButtonElement>('.menu-play')!.onclick=camp.onclick;
    camp.remove();
  }
  root.querySelector<HTMLButtonElement>('.menu-help')!.onclick = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    dialog.innerHTML = '<h2>Your next adventure</h2><ol><li><strong>Build your deck</strong><p>Choose 6 Beast types before the Run.</p></li><li><strong>Match pairs</strong><p>Beast Rush recruits units. Energy Rush stores tactical skills. The first pair starts the timer.</p></li><li><strong>Arrange & merge</strong><p>Tap a unit, then a board slot. Merge eligible copies or spend 2 Link Shards to deploy a fifth unit.</p></li><li><strong>Watch & cast</strong><p>Your squad fights automatically. Tap an Energy button to help; hold it to read the effect.</p></li></ol><button class="dialog-close">Got it</button>';
    root.append(dialog); dialog.showModal();
    dialog.querySelector('h2')!.textContent='Gây dựng quê nhà';
    const home=document.createElement('li');home.innerHTML='<strong>Trở về làng</strong><p>Thú đã tuyển sẽ về làng. Thắng trọn chuyến thám hiểm nhận 15 Gỗ để xây dựng. Chạm nhà chung để xem hành trình, cư dân để tìm bạn, xây dựng để đặt đạo cụ.</p>';dialog.querySelector('ol')!.append(home);
    dialog.querySelector<HTMLButtonElement>('button')!.onclick = () => dialog.close();
    dialog.onclose = () => dialog.remove();
  };
  const fullscreen = root.querySelector<HTMLButtonElement>('.menu-fullscreen')!;
  const options=document.createElement('details');options.className='cozy-options';
  const toggle=document.createElement('summary');toggle.setAttribute('aria-label','Tùy chọn');toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/></svg>';options.append(toggle);
  const actions=document.createElement('div');actions.className='cozy-option-actions';actions.append(root.querySelector('.menu-help')!,fullscreen);options.append(actions);root.append(options);
  fullscreen.onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { fullscreen.textContent = 'Full screen unavailable'; }
  };
  document.getElementById('game-shell')!.append(root);
}

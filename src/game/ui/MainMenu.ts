import { showSettingsDialog } from './SettingsDialog';
import { toggleFullscreen } from './layout/MobileDisplayManager';
import { showCamp } from './CampView';
import { transitionScreen } from './SceneTransition';
import { firstJourneyStage } from '../run/FirstJourney';
import { bgmManager } from '../audio/BgmManager';
import { MainMenuParallax } from './menu/MainMenuParallax';

import { showOnlineLobbyDialog } from './network/OnlineLobbyDialog';
import { isOnlineExperimentAvailable } from '../config/OnlineAvailability';
import type { OnlineSessionAdapter } from '../network/OnlineSessionAdapter';
import type { MatchStartMessage } from '../../network/protocol/NetworkMessages';

/** DOM navigation stays separate from the pre-run deck and gameplay scene. */
export function showMainMenu(
  play: () => void,
  onStartOnlineMatch?: (adapter: OnlineSessionAdapter, matchInfo: MatchStartMessage) => void,
): void {
  bgmManager.playLobby();
  const root = document.createElement('section');
  root.className = 'main-menu farming-menu cozy-menu';
  root.innerHTML = `<div class="menu-copy"><h1>Làng Thú<em>Một góc quê, một khởi đầu</em></h1><div class="menu-actions"><button class="menu-play">Thám hiểm</button><button class="menu-help">How to play</button><button class="menu-fullscreen">Full screen</button></div></div>`;

  const parallax = new MainMenuParallax(root);

  const cleanupAndNavigate = (next: () => void) => {
    transitionScreen(root, () => {
      parallax.destroy();
      root.remove();
      next();
    });
  };

  root.querySelector<HTMLButtonElement>('.menu-play')!.onclick = () => cleanupAndNavigate(play);

  const camp = document.createElement('button');
  camp.className = 'menu-home';
  camp.textContent = 'Về làng';
  camp.onclick = () => cleanupAndNavigate(() => showCamp(() => showMainMenu(play, onStartOnlineMatch), play));
  root.querySelector('.menu-actions')!.prepend(camp);

  const onlineBtn = document.createElement('button');
  onlineBtn.className = 'menu-online';
  onlineBtn.textContent = 'Đấu Online';
  onlineBtn.onclick = () => {
    showOnlineLobbyDialog({
      onMatchStart: (adapter, matchInfo) => {
        cleanupAndNavigate(() => {
          onStartOnlineMatch?.(adapter, matchInfo);
        });
      },
    });
  };
  if (isOnlineExperimentAvailable()) root.querySelector('.menu-actions')!.append(onlineBtn);

  const onboarding = firstJourneyStage();
  if (onboarding === 'expedition') {
    camp.remove();
    onlineBtn.remove();
    root.querySelector('.menu-play')!.textContent = 'Chuyến đi đầu tiên →';
    root.querySelector('h1 em')!.textContent = 'Bắt đầu ở Đường mòn rừng';
  } else if (onboarding === 'village') {
    root.querySelector('.menu-play')!.textContent = 'Khám phá Làng →';
    root.querySelector<HTMLButtonElement>('.menu-play')!.onclick = camp.onclick;
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
  const toggle=document.createElement('summary');toggle.setAttribute('aria-label','Cài đặt');toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/></svg>';options.append(toggle);
  const settingsBtn=document.createElement('button');settingsBtn.className='menu-settings';settingsBtn.textContent='Cài đặt & Hiển thị';
  settingsBtn.onclick=()=>{ options.removeAttribute('open'); showSettingsDialog(); };
  const actions=document.createElement('div');actions.className='cozy-option-actions';actions.append(root.querySelector('.menu-help')!,settingsBtn,fullscreen);options.append(actions);root.append(options);
  fullscreen.onclick = async () => {
    try { await toggleFullscreen(); }
    catch { fullscreen.textContent = 'Full screen unavailable'; }
  };
  document.getElementById('game-shell')!.append(root);
}

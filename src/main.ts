import { rushSfx } from './game/ui/feedback/RushSfx';
import { bgmManager } from './game/audio/BgmManager';
import { transitionScreen } from './game/ui/SceneTransition';
import Phaser from 'phaser';
import { showDeckPicker } from './game/ui/DeckPicker';
import { showMainMenu } from './game/ui/MainMenu';
import { showCamp } from './game/ui/CampView';
import { showLevelSelection } from './game/ui/LevelSelection';
import { selectRunLevel, selectedRunLevel } from './game/run/RunLevels';
import { lockRunDeck } from './game/run/RunDeck';
import { firstJourneyStage, saveFirstJourney } from './game/run/FirstJourney';
import { isTestHarness } from './game/config/RuntimeMode';
import { ValidationScene } from './game/ValidationScene';
import './styles/prototype.css';
import { isCompactLandscape } from './game/ui/layout/MobilePresentation';
import { installVietnamese } from './game/ui/Vietnamese';
import { requestLandscapeFullscreen } from './game/ui/layout/MobileDisplayManager';
import { setOnlineBattleSession, clearOnlineBattleSession } from './game/network/OnlineBattleSession';
import { isOnlineExperimentAvailable } from './game/config/OnlineAvailability';
import { showOnlineLobbyDialog } from './game/ui/network/OnlineLobbyDialog';
import type { OnlineSessionAdapter } from './game/network/OnlineSessionAdapter';
import type { MatchStartMessage } from './network/protocol/NetworkMessages';

const compact = isCompactLandscape();
if (!isTestHarness()) installVietnamese(Phaser);
document.documentElement.classList.toggle('mobile-landscape', compact);
// Keep a stable reference height; wider phones receive extra horizontal space.
const referenceWidth = compact ? Math.max(1280, Math.round(720 * window.innerWidth / window.innerHeight)) : 1280;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-shell',
  width: referenceWidth,
  height: 720,
  backgroundColor: '#18271f',
  scene: [ValidationScene],
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

if (isTestHarness()) new Phaser.Game(config);
else {
  const startOnlineMatch = (adapter: OnlineSessionAdapter, matchInfo: MatchStartMessage) => {
    setOnlineBattleSession(adapter, matchInfo);
    startRun(['beast-a', 'beast-b', 'beast-c', 'beast-d', 'beast-e', 'beast-f']);
  };
  const openMenu = () => showMainMenu(openLevels, startOnlineMatch);
  const openLevels = () => {
    if(firstJourneyStage()==='expedition'){
      if(!saveFirstJourney('expedition')){showLevelSelection(id=>{selectRunLevel(id);openPicker();},openMenu);return;}
      selectRunLevel('woodland');startRun(['beast-a','beast-b','beast-c','beast-d','beast-e','beast-f']);return;
    }
    if(firstJourneyStage()==='village'){showCamp(openMenu,openLevels);return;}
    showLevelSelection(id => { selectRunLevel(id); openPicker(); }, openMenu);
  };
  const startRun = (deck:string[]) => {
    bgmManager.pause();
    lockRunDeck(deck);
    const shell = document.getElementById('game-shell')!;
    shell.classList.add('run-active');
    const game = new Phaser.Game({ ...config, width: compact ? Math.max(1280, Math.round(720 * window.innerWidth / window.innerHeight)) : 1280 });
    const rotate = document.createElement('div'); rotate.className = 'rotate-notice';
    rotate.innerHTML = `
      <svg class="rotate-phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
        <path d="M12 18h.01"/>
      </svg>
      <strong>Xoay ngang điện thoại</strong>
      <span>Đội hình thú chiến đấu cần không gian màn hình ngang.</span>
      <button class="rotate-action-btn">Toàn màn hình & Khóa ngang</button>
    `;
    const rotateBtn = rotate.querySelector<HTMLButtonElement>('.rotate-action-btn');
    if (rotateBtn) {
      rotateBtn.onclick = async () => {
        await requestLandscapeFullscreen();
      };
    }
    shell.append(rotate);
    let orientationPaused: Phaser.Scene[] = [];
    const orientation = () => {
      if (window.innerHeight > window.innerWidth) {
        if (orientationPaused.length === 0) { orientationPaused = game.scene.getScenes(true); orientationPaused.forEach(scene => scene.scene.pause()); }
      } else { orientationPaused.forEach(scene => scene.scene.resume()); orientationPaused = []; }
    };
    window.addEventListener('orientationchange', orientation);
    window.addEventListener('resize', orientation);
    const change = document.createElement('button');
    const abortOnline = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      returnMenu();
      const notice = document.createElement('dialog');
      notice.className = 'game-dialog';
      const title = document.createElement('h2'); title.textContent = 'Phiên đấu đã kết thúc';
      const text = document.createElement('p'); text.textContent = message;
      const button = document.createElement('button'); button.textContent = 'Đã hiểu'; button.onclick = () => notice.close();
      notice.append(title, text, button); document.body.append(notice);
      notice.onclose = () => notice.remove(); notice.showModal();
    };
    const returnMenu = () => {
      clearOnlineBattleSession();
      change.remove(); rotate.remove(); shell.classList.remove('run-active');
      window.removeEventListener('orientationchange', orientation); window.removeEventListener('resize', orientation);
      window.removeEventListener('beast-link-return-village', returnVillage);
      window.removeEventListener('beast-link-return-menu', returnMenu);
      window.removeEventListener('beast-link-online-abort', abortOnline);
      game.destroy(true); bgmManager.playLobby(); openMenu();
    };
    const returnVillage=()=>{
      clearOnlineBattleSession();
      change.remove();rotate.remove();shell.classList.remove('run-active');
      window.removeEventListener('orientationchange',orientation);window.removeEventListener('resize',orientation);
      window.removeEventListener('beast-link-return-village',returnVillage);
      window.removeEventListener('beast-link-return-menu',returnMenu);
      window.removeEventListener('beast-link-online-abort',abortOnline);
      game.destroy(true);bgmManager.playLobby();showCamp(openMenu,openLevels);
    };
    window.addEventListener('beast-link-return-village',returnVillage);
    window.addEventListener('beast-link-return-menu',returnMenu);
    window.addEventListener('beast-link-online-abort',abortOnline);
    change.className = 'deck-new-run'; change.textContent = '☰'; change.setAttribute('aria-label', 'Pause and open menu');
    change.onclick = () => {
      const scenes = game.scene.getScenes(true); scenes.forEach(scene => scene.scene.pause());
      const dialog = document.createElement('dialog'); dialog.className = 'game-dialog pause-dialog';
      dialog.innerHTML = '<h2>Take a breather</h2><p>Your Run is paused.</p><button class="resume-run">Continue</button><button class="return-menu">End Run & return to menu</button>';
      document.getElementById('game-shell')!.append(dialog); dialog.showModal();
      const sound=document.createElement('button');sound.textContent=rushSfx.enabled?'Âm thanh: Bật':'Âm thanh: Tắt';sound.setAttribute('aria-pressed',String(rushSfx.enabled));sound.onclick=()=>{rushSfx.setEnabled(!rushSfx.enabled);rushSfx.unlock();sound.textContent=rushSfx.enabled?'Âm thanh: Bật':'Âm thanh: Tắt';sound.setAttribute('aria-pressed',String(rushSfx.enabled));};dialog.insertBefore(sound,dialog.querySelector('.return-menu'));
      const bgm=document.createElement('button');bgm.textContent=bgmManager.enabled?'Nhạc nền: Bật':'Nhạc nền: Tắt';bgm.setAttribute('aria-pressed',String(bgmManager.enabled));bgm.onclick=()=>{bgmManager.setEnabled(!bgmManager.enabled);bgm.textContent=bgmManager.enabled?'Nhạc nền: Bật':'Nhạc nền: Tắt';bgm.setAttribute('aria-pressed',String(bgmManager.enabled));};dialog.insertBefore(bgm,dialog.querySelector('.return-menu'));
      dialog.querySelector<HTMLButtonElement>('.resume-run')!.onclick = () => dialog.close();
      dialog.onclose = () => { scenes.forEach(scene => scene.scene.resume()); dialog.remove(); orientation(); };
      dialog.querySelector<HTMLButtonElement>('.return-menu')!.onclick = () => transitionScreen(dialog,()=>{
        clearOnlineBattleSession();
        dialog.onclose = null; dialog.remove(); change.remove(); rotate.remove(); shell.classList.remove('run-active');
        window.removeEventListener('orientationchange', orientation); window.removeEventListener('resize', orientation);
        window.removeEventListener('beast-link-return-village',returnVillage);
        window.removeEventListener('beast-link-return-menu',returnMenu);
        window.removeEventListener('beast-link-online-abort',abortOnline);
        game.destroy(true);bgmManager.playLobby();openMenu();
      });
    };
    document.getElementById('game-shell')!.append(change);
  };
  const openPicker = () => showDeckPicker(startRun, openLevels, selectedRunLevel().name);
  openMenu();

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const inviteCode = urlParams?.get('room') || urlParams?.get('p2p');
  if (inviteCode && isOnlineExperimentAvailable()) {
    showOnlineLobbyDialog({
      initialRoomCode: inviteCode,
      transport: 'p2p',
      onMatchStart: startOnlineMatch,
    });
  }
}

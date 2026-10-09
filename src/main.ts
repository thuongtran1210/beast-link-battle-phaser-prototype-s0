import Phaser from 'phaser';
import { showDeckPicker } from './game/ui/DeckPicker';
import { showMainMenu } from './game/ui/MainMenu';
import { showLevelSelection } from './game/ui/LevelSelection';
import { selectRunLevel, selectedRunLevel } from './game/run/RunLevels';
import { lockRunDeck } from './game/run/RunDeck';
import { isTestHarness } from './game/config/RuntimeMode';
import { ValidationScene } from './game/ValidationScene';
import './styles/prototype.css';
import { isCompactLandscape } from './game/ui/layout/MobilePresentation';
import { installVietnamese } from './game/ui/Vietnamese';

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
  const openMenu = () => showMainMenu(openLevels);
  const openLevels = () => showLevelSelection(id => { selectRunLevel(id); openPicker(); }, openMenu);
  const openPicker = () => showDeckPicker(deck => {
    lockRunDeck(deck);
    const shell = document.getElementById('game-shell')!;
    shell.classList.add('run-active');
    const game = new Phaser.Game({ ...config, width: compact ? Math.max(1280, Math.round(720 * window.innerWidth / window.innerHeight)) : 1280 });
    const rotate = document.createElement('div'); rotate.className = 'rotate-notice';
    rotate.innerHTML = '<strong>Turn your phone sideways</strong><span>Your squad needs a little more room.</span>';
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
    change.className = 'deck-new-run'; change.textContent = '☰'; change.setAttribute('aria-label', 'Pause and open menu');
    change.onclick = () => {
      const scenes = game.scene.getScenes(true); scenes.forEach(scene => scene.scene.pause());
      const dialog = document.createElement('dialog'); dialog.className = 'game-dialog pause-dialog';
      dialog.innerHTML = '<h2>Take a breather</h2><p>Your Run is paused.</p><button class="resume-run">Continue</button><button class="return-menu">End Run & return to menu</button>';
      document.getElementById('game-shell')!.append(dialog); dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('.resume-run')!.onclick = () => dialog.close();
      dialog.onclose = () => { scenes.forEach(scene => scene.scene.resume()); dialog.remove(); orientation(); };
      dialog.querySelector<HTMLButtonElement>('.return-menu')!.onclick = () => {
        dialog.onclose = null; dialog.remove(); change.remove(); rotate.remove(); shell.classList.remove('run-active');
        window.removeEventListener('orientationchange', orientation); window.removeEventListener('resize', orientation);
        game.destroy(true); window.setTimeout(openMenu, 0);
      };
    };
    document.getElementById('game-shell')!.append(change);
  }, openLevels, selectedRunLevel().name);
  openMenu();
}

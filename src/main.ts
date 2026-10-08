import Phaser from 'phaser';
import { showDeckPicker } from './game/ui/DeckPicker';
import { lockRunDeck } from './game/run/RunDeck';
import { isTestHarness } from './game/config/RuntimeMode';
import { ValidationScene } from './game/ValidationScene';
import './styles/prototype.css';
import { isCompactLandscape } from './game/ui/layout/MobilePresentation';

const compact = isCompactLandscape();
document.documentElement.classList.toggle('mobile-landscape', compact);
// Keep a stable reference height; wider phones receive extra horizontal space.
const referenceWidth = compact ? Math.max(1280, Math.round(720 * window.innerWidth / window.innerHeight)) : 1280;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-shell',
  width: referenceWidth,
  height: 720,
  backgroundColor: '#0b0f17',
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
  const openPicker = () => showDeckPicker(deck => {
    lockRunDeck(deck);
    const game = new Phaser.Game(config);
    const change = document.createElement('button');
    change.className = 'deck-new-run'; change.textContent = 'New Run / Deck';
    change.onclick = () => { change.remove(); game.destroy(true); window.setTimeout(openPicker, 0); };
    document.getElementById('game-shell')!.append(change);
  });
  openPicker();
}

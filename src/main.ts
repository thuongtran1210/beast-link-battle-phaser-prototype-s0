import Phaser from 'phaser';
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

new Phaser.Game(config);

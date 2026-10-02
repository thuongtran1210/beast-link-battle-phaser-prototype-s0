import Phaser from 'phaser';
import { ValidationScene } from './game/ValidationScene';
import './styles/prototype.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-shell',
  width: 960,
  height: 760,
  backgroundColor: '#f4f1e8',
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

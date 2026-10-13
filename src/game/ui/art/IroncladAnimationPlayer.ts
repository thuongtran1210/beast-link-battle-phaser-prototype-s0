import type Phaser from 'phaser';
import frames from './IroncladFrames.json';
import {
  UniversalAnimationPlayer,
  IRONCLAD_RIG,
  animationSheetPath,
  type FrameAnimationRig,
  type CharacterAnimationClip,
} from './UniversalAnimationPlayer';

export const IRONCLAD_ANIMATION_RIG: FrameAnimationRig = IRONCLAD_RIG;
export function preloadIroncladAnimations(scene: Phaser.Scene): void {
  for (const clip of Object.keys(frames) as CharacterAnimationClip[]) {
    scene.load.image(`ironclad-sheet-${clip}`, animationSheetPath('ironclad', 'bear-hammer', clip));
  }
}
export class IroncladAnimationPlayer extends UniversalAnimationPlayer {
  constructor(scene: Phaser.Scene, height: number, groundOffset: number) {
    super(scene, height, groundOffset, IRONCLAD_RIG);
  }
  static override available(scene: Phaser.Scene): boolean {
    return UniversalAnimationPlayer.available(scene, IRONCLAD_RIG);
  }
}

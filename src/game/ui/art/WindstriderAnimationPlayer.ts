import type Phaser from 'phaser';
import frames from './WindstriderFrames.json';
import {
  UniversalAnimationPlayer,
  WINDSTRIDER_RIG,
  animationSheetPath,
  type FrameAnimationRig,
  type CharacterAnimationClip,
} from './UniversalAnimationPlayer';

export const WINDSTRIDER_ANIMATION_RIG: FrameAnimationRig = WINDSTRIDER_RIG;
/** Owner's Run sheet maps to the shared locomotion clip named walk. */
export function preloadWindstriderAnimations(scene: Phaser.Scene): void {
  for (const clip of Object.keys(frames) as CharacterAnimationClip[]) {
    scene.load.image(`windstrider-sheet-${clip}`, animationSheetPath('windstrider', 'rabbit-archer', clip));
  }
}
export class WindstriderAnimationPlayer extends UniversalAnimationPlayer {
  constructor(scene: Phaser.Scene, height: number, groundOffset: number) {
    super(scene, height, groundOffset, WINDSTRIDER_RIG);
  }
  static override available(scene: Phaser.Scene): boolean {
    return UniversalAnimationPlayer.available(scene, WINDSTRIDER_RIG);
  }
}

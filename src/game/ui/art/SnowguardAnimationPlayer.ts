import type Phaser from 'phaser';
import frames from './SnowguardFrames.json';
import {
  UniversalAnimationPlayer,
  SNOWGUARD_RIG,
  animationSheetPath as universalSheetPath,
  type FrameAnimationRig,
  type CharacterAnimationClip,
} from './UniversalAnimationPlayer';

export type SnowguardClip = CharacterAnimationClip;
export type { FrameAnimationRig };
export const snowguardRig: FrameAnimationRig = SNOWGUARD_RIG;

export function animationSheetPath(prefix: string, slug: string, clip: SnowguardClip): string {
  return universalSheetPath(prefix, slug, clip);
}

export function preloadSnowguardAnimations(scene: Phaser.Scene): void {
  for (const clip of Object.keys(frames) as SnowguardClip[]) {
    scene.load.image(`snowguard-sheet-${clip}`, animationSheetPath('snowguard', 'duck-guardian', clip));
  }
}

/** Legacy-compatible subclass of UniversalAnimationPlayer for Snowguard. */
export class SnowguardAnimationPlayer extends UniversalAnimationPlayer {
  constructor(scene: Phaser.Scene, height: number, groundOffset: number, rig: FrameAnimationRig = SNOWGUARD_RIG) {
    super(scene, height, groundOffset, rig);
  }

  static override available(scene: Phaser.Scene, rig: FrameAnimationRig = SNOWGUARD_RIG): boolean {
    return UniversalAnimationPlayer.available(scene, rig);
  }
}

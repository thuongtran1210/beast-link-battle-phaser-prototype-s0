import type Phaser from 'phaser';
import frames from './WindstriderFrames.json';
import { SnowguardAnimationPlayer, type FrameAnimationRig, type SnowguardClip } from './SnowguardAnimationPlayer';

export const WINDSTRIDER_ANIMATION_RIG:FrameAnimationRig={prefix:'windstrider',frames};
/** Owner's Run sheet maps to the shared locomotion clip named walk. */
export function preloadWindstriderAnimations(scene:Phaser.Scene):void {
  for(const clip of Object.keys(frames) as SnowguardClip[])scene.load.image(`windstrider-sheet-${clip}`,`/assets/characters/rabbit-archer/animation_v01/${clip}.png`);
}
export class WindstriderAnimationPlayer extends SnowguardAnimationPlayer {
  constructor(scene:Phaser.Scene,height:number,groundOffset:number){super(scene,height,groundOffset,WINDSTRIDER_ANIMATION_RIG);}
  static available(scene:Phaser.Scene):boolean{return SnowguardAnimationPlayer.available(scene,WINDSTRIDER_ANIMATION_RIG);}
}

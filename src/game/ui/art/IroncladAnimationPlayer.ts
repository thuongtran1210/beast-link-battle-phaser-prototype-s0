import type Phaser from 'phaser';
import frames from './IroncladFrames.json';
import { SnowguardAnimationPlayer, type FrameAnimationRig, type SnowguardClip } from './SnowguardAnimationPlayer';

export const IRONCLAD_ANIMATION_RIG:FrameAnimationRig={prefix:'ironclad',frames};
export function preloadIroncladAnimations(scene:Phaser.Scene):void {
  for(const clip of Object.keys(frames) as SnowguardClip[])scene.load.image(`ironclad-sheet-${clip}`,`/assets/characters/bear-hammer/animation_v01/${clip}.png`);
}
export class IroncladAnimationPlayer extends SnowguardAnimationPlayer {
  constructor(scene:Phaser.Scene,height:number,groundOffset:number){super(scene,height,groundOffset,IRONCLAD_ANIMATION_RIG);}
  static available(scene:Phaser.Scene):boolean{return SnowguardAnimationPlayer.available(scene,IRONCLAD_ANIMATION_RIG);}
}

import type Phaser from 'phaser';
import frames from './SnowguardFrames.json';

export type SnowguardClip = keyof typeof frames;
const clips=Object.keys(frames) as SnowguardClip[];
export interface FrameAnimationRig {
  prefix:string;
  frames:Record<SnowguardClip,Array<{x:number;y:number;width:number;height:number;groundY:number;bodyHeight:number}>>;
}
const snowguardRig:FrameAnimationRig={prefix:'snowguard',frames};
export function preloadSnowguardAnimations(scene:Phaser.Scene):void {
  for(const clip of clips) scene.load.image(`snowguard-sheet-${clip}`,`/assets/characters/duck-guardian/animation_v01/${clip}.png`);
}

/** Original sheets are retained; texture windows and origins handle odd cell sizes. */
export class SnowguardAnimationPlayer {
  readonly sprite:Phaser.GameObjects.Sprite;
  private state:SnowguardClip='idle';
  private locomotion:'idle'|'walk'='idle';
  private alive=true;
  constructor(private scene:Phaser.Scene,private height:number,groundOffset:number,private rig:FrameAnimationRig=snowguardRig) {
    const frames=rig.frames;
    for(const clip of clips) {
      const texture=scene.textures.get(`${rig.prefix}-sheet-${clip}`);
      frames[clip].forEach((f,i)=>{if(!texture.has(String(i))) texture.add(String(i),0,f.x,f.y,f.width,f.height);});
      const key=`${rig.prefix}-anim-${clip}`;
      if(!scene.anims.exists(key)) scene.anims.create({key,frames:frames[clip].map((_,i)=>({key:`${rig.prefix}-sheet-${clip}`,frame:i})),frameRate:clip==='idle'?7:10,repeat:clip==='idle'||clip==='walk'?-1:0});
    }
    this.sprite=scene.add.sprite(0,groundOffset,`${rig.prefix}-sheet-idle`,0);
    this.sprite.on('animationupdate',()=>this.align());
    this.sprite.on('animationcomplete',()=>{if(this.alive&&this.state!=='ko') this.loop(this.locomotion);});
    this.loop('idle');
  }
  private align():void {
    const frames=this.rig.frames;
    const index=Number(this.sprite.frame.name);
    const f=frames[this.state][index]??frames[this.state][0];
    // Each sheet's neutral pose calibrates size; planted feet use per-frame origins.
    const reference=frames[this.state][0].bodyHeight;
    let scale=this.height/reference;
    if(this.state==='idle') scale=this.height/f.bodyHeight*(1+(f.bodyHeight/reference-1)*.1);
    this.sprite.setOrigin(.5,f.groundY/f.height).setScale(scale);
  }
  private loop(clip:'idle'|'walk'):void {
    this.state=clip;this.sprite.play(`${this.rig.prefix}-anim-${clip}`);this.align();
  }
  setMoving(moving:boolean):void {
    this.locomotion=moving?'walk':'idle';
    if(this.alive&&(this.state==='idle'||this.state==='walk')&&this.state!==this.locomotion) this.loop(this.locomotion);
  }
  play(clip:'attack'|'skill'|'hit'|'ko',duration:number):void {
    if(!this.alive&&clip!=='ko')return;
    if(this.state==='skill'&&(clip==='attack'||clip==='hit'))return;
    if(clip==='ko')this.alive=false;
    this.state=clip;
    this.sprite.play({key:`${this.rig.prefix}-anim-${clip}`,frameRate:8000/duration,repeat:0});this.align();
  }
  revive():void {this.alive=true;this.locomotion='idle';this.loop('idle');}
  dispose():void {this.sprite.stop();this.sprite.removeAllListeners();}
  static available(scene:Phaser.Scene,rig:FrameAnimationRig=snowguardRig):boolean {return clips.every(clip=>scene.textures.exists(`${rig.prefix}-sheet-${clip}`));}
}

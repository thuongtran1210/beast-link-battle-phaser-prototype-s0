import type Phaser from 'phaser';
import frames from './SnowguardFrames.json';
import {characterRecord} from '../../config/CharacterProjects';
import {AnimationClock} from './AnimationClock';

export type SnowguardClip = keyof typeof frames;
const clips=Object.keys(frames) as SnowguardClip[];
export interface FrameAnimationRig {
  prefix:string;
  frames:Record<SnowguardClip,Array<{x:number;y:number;width:number;height:number;groundY:number;bodyHeight:number}>>;
}
const snowguardRig:FrameAnimationRig={prefix:'snowguard',frames};
const beastForPrefix:Record<string,string>={snowguard:'beast-a',ironclad:'beast-e',windstrider:'beast-c'};
export function animationSheetPath(prefix:string,slug:string,clip:SnowguardClip):string{return characterRecord(beastForPrefix[prefix]).atlases?.[clip]??`/assets/characters/${slug}/animation_v01/${clip}.png`;}
export function preloadSnowguardAnimations(scene:Phaser.Scene):void {
  for(const clip of clips) scene.load.image(`snowguard-sheet-${clip}`,animationSheetPath('snowguard','duck-guardian',clip));
}

/** Original sheets are retained; texture windows and origins handle odd cell sizes. */
export class SnowguardAnimationPlayer {
  readonly sprite:Phaser.GameObjects.Sprite;
  private state:SnowguardClip='idle';
  private locomotion:'idle'|'walk'='idle';
  private alive=true;
  private clock:AnimationClock|undefined;
  private customUpdate=(_time:number,delta:number)=>{this.clock!.step(delta/1000);this.showCustom();};
  constructor(private scene:Phaser.Scene,private height:number,groundOffset:number,private rig:FrameAnimationRig=snowguardRig) {
    const record=characterRecord(beastForPrefix[rig.prefix]);
    if(record.animation&&clips.every(c=>record.atlases?.[c])){
      this.clock=new AnimationClock(record.animation);
      for(const clip of clips){const texture=scene.textures.get(`${rig.prefix}-sheet-${clip}`);for(let i=0;i<8;i++)if(!texture.has(String(i)))texture.add(String(i),0,i%4*512,Math.floor(i/4)*512,512,512);}
      this.sprite=scene.add.sprite(0,groundOffset,`${rig.prefix}-sheet-idle`,0).setOrigin(.5,440/512).setScale(height/320);
      scene.events.on('update',this.customUpdate);this.showCustom();return;
    }
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
  private showCustom(){const clock=this.clock!;this.sprite.setTexture(`${this.rig.prefix}-sheet-${clock.clip}`,String(clock.frame));}
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
    if(this.clock){this.clock.move(moving);this.showCustom();return;}
    this.locomotion=moving?'walk':'idle';
    if(this.alive&&(this.state==='idle'||this.state==='walk')&&this.state!==this.locomotion) this.loop(this.locomotion);
  }
  play(clip:'attack'|'skill'|'hit'|'ko',duration:number):void {
    if(this.clock){this.clock.play(clip,duration);this.showCustom();return;}
    if(!this.alive&&clip!=='ko')return;
    if(this.state==='attack'&&clip==='hit')return;
    if(this.state==='skill'&&(clip==='attack'||clip==='hit'))return;
    if(clip==='ko')this.alive=false;
    this.state=clip;
    this.sprite.play({key:`${this.rig.prefix}-anim-${clip}`,frameRate:this.rig.frames[clip].length*1000/Math.max(1,duration),repeat:0});this.align();
  }
  revive():void {if(this.clock){this.clock.revive();this.showCustom();return;}this.alive=true;this.locomotion='idle';this.loop('idle');}
  dispose():void {if(this.clock)this.scene.events.off('update',this.customUpdate);this.sprite.stop();this.sprite.removeAllListeners();}
  static available(scene:Phaser.Scene,rig:FrameAnimationRig=snowguardRig):boolean {return clips.every(clip=>scene.textures.exists(`${rig.prefix}-sheet-${clip}`));}
}

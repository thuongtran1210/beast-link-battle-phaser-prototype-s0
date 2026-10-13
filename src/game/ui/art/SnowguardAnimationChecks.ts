import type Phaser from 'phaser';
import { SnowguardAnimationPlayer } from './SnowguardAnimationPlayer';
import frames from './SnowguardFrames.json';
import ironcladFrames from './IroncladFrames.json';
import { IroncladAnimationPlayer } from './IroncladAnimationPlayer';
import windstriderFrames from './WindstriderFrames.json';
import { WindstriderAnimationPlayer } from './WindstriderAnimationPlayer';

export function runSnowguardAnimationChecks():void {
  const expect=(ok:boolean,message:string)=>{if(!ok)throw new Error(`Snowguard animation: ${message}`);};
  for(const cells of [...Object.values(frames),...Object.values(ironcladFrames),...Object.values(windstriderFrames)]) {
    expect(cells.length===8,'eight frames per clip');
    for(const f of cells)expect(f.x+f.width<=1774&&f.y+f.height<=887&&f.groundY<=f.height&&f.bodyHeight>0,'frame window and foot origin within original sheet');
  }
  for(const [prefix,Player] of [['snowguard',SnowguardAnimationPlayer],['ironclad',IroncladAnimationPlayer],['windstrider',WindstriderAnimationPlayer]] as const) {
  const handlers:Record<string,()=>void>={};let key='';let stopped=false;let frameRate=0;
  const sprite={frame:{name:0},on:(name:string,fn:()=>void)=>{handlers[name]=fn;return sprite;},play:(value:string|{key:string;frameRate?:number})=>{key=typeof value==='string'?value:value.key;if(typeof value!=='string')frameRate=value.frameRate??0;sprite.frame.name=0;return sprite;},setOrigin:()=>sprite,setScale:()=>sprite,stop:()=>{stopped=true;},removeAllListeners:()=>{for(const name of Object.keys(handlers))delete handlers[name];}};
  const scene={textures:{get:()=>({has:()=>false,add:()=>{}})},anims:{exists:()=>false,create:()=>{}},add:{sprite:()=>sprite}} as unknown as Phaser.Scene;
  const player=new Player(scene,109,38);
  player.setMoving(true);expect(key===`${prefix}-anim-walk`,'walk replaces idle');
  player.play('attack',550);player.setMoving(false);expect(key===`${prefix}-anim-attack`,'locomotion cannot interrupt attack');
  expect(Math.abs(frameRate-8000/550)<.001,'attack respects requested model action duration');
  player.play('hit',180);expect(key===`${prefix}-anim-attack`,'simultaneous incoming hit cannot erase resolved attack');
  handlers.animationcomplete();expect(key===`${prefix}-anim-idle`,'attack returns to latest locomotion');
  player.play('skill',820);player.play('hit',400);expect(key===`${prefix}-anim-skill`,'hit does not conceal skill');
  player.play('ko',850);sprite.frame.name=7;handlers.animationupdate();handlers.animationcomplete();player.setMoving(true);player.play('attack',550);
  expect(key===`${prefix}-anim-ko`&&sprite.frame.name===7,'KO holds last frame and blocks action');
  player.revive();expect(key===`${prefix}-anim-idle`,'revive returns idle');
  player.dispose();expect(stopped&&Object.keys(handlers).length===0,'disposal stops animation callbacks');
  }
}

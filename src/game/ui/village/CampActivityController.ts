import { VillageSimulation, type VillageJob, type VillageWorkHooks } from '../../run/VillageSimulation';
import { VILLAGE_SCENE } from '../../run/VillageSceneLayout';
import { villageActivityStation, type VillageActivityKind, type VillageResidentId } from '../../run/VillageCatalog';
import { browserVillageFrames, VillageActivityLoop } from './VillageActivityLoop';
import { VILLAGE_ANIMATIONS } from './VillageAnimation';
import { VillageSpritePlayer } from './VillageSpritePlayer';
import { VILLAGE_ACTIVITY_PRESENTATION, villageActivityLabel, villageWorkerClip, type VillageClipId } from './VillagePresentationCatalog';
import type { VillageWorkerPhase } from '../../run/VillageActivity';
interface Binding {beast:HTMLElement;station:HTMLElement;kind:VillageActivityKind;job:VillageJob;player?:VillageSpritePlayer;phase?:VillageWorkerPhase;transient?:VillageClipId}
/** Presentation bindings can be rebuilt without resetting the independent clock. */
export class CampActivityController {
 private bindings=new Map<string,Binding>();private disposed=false;
 private readonly workPlayback=new Map<string,{jobId:number;seconds:number}>();
 private readonly simulation:VillageSimulation;
 private readonly loop:VillageActivityLoop;
 private readonly reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 constructor(onWork:(kind:VillageActivityKind)=>void|boolean,hooks?:VillageWorkHooks,onTick?:(seconds:number)=>void,onCheckpoint:()=>void=()=>{}){
  this.simulation=new VillageSimulation(onWork,hooks);
  this.loop=new VillageActivityLoop(browserVillageFrames(),seconds=>{this.simulation.step(seconds);onTick?.(seconds);this.paint(seconds);},onCheckpoint);
 }
 rebind():void{for(const b of this.bindings.values()){b.player?.dispose();b.station.classList.remove(`camp-action-${b.kind}`);b.beast.classList.remove('camp-working',`camp-action-${b.kind}`);}this.bindings.clear();}
 add(beast:HTMLElement,station:HTMLElement,kind:VillageActivityKind,homeX:number,homeY:number,anchor?:{x:number;y:number}):void{
  if(this.disposed)return;
  const width=VILLAGE_SCENE.width,height=VILLAGE_SCENE.height;
  const x=anchor?anchor.x*width/100:station.offsetLeft+station.offsetWidth*(kind==='anvil'?.52:.34);
  const y=anchor?anchor.y*height/100:Math.max(0,station.offsetTop+station.offsetHeight*.7-beast.offsetHeight);
  const id=beast.dataset.beastId!;beast.classList.add('camp-autonomous');beast.style.transition='none';
  const fallback=beast.querySelector<HTMLImageElement>('img');
  const player=fallback?new VillageSpritePlayer(beast,fallback,VILLAGE_ANIMATIONS[id as VillageResidentId]??{}):undefined;
  this.bindings.set(id,{beast,station,kind,player,job:{id,stationId:villageActivityStation(kind),kind,home:{x:homeX*width/100,y:homeY*height/100},work:{x,y},face:kind==='fishing'||station.offsetLeft+station.offsetWidth/2>x+46?1:-1}});
 }
 start():void{if(this.disposed)return;this.simulation.sync([...this.bindings.values()].map(b=>b.job));this.paint();this.loop.start();}
 dispose():void{if(this.disposed)return;this.disposed=true;this.loop.dispose();this.rebind();this.workPlayback.clear();this.simulation.dispose();}
 private paint(seconds=0):void{
  const workers=new Map(this.simulation.snapshot().map(w=>[w.id,w]));
  for(const [id,b] of this.bindings){const w=workers.get(id);if(!w)continue;
   b.beast.style.left=`${w.x/VILLAGE_SCENE.width*100}%`;b.beast.style.top=`${w.y/VILLAGE_SCENE.height*100}%`;b.beast.style.zIndex=String(Math.round(w.y));b.beast.style.setProperty('--camp-facing',String(w.facing));b.beast.dataset.facing=w.facing<0?'left':'right';
   const working=w.phase==='work'&&w.remaining>1e-6&&!w.block&&(!w.gardenStage||w.gardenStage==='growing');
   if(b.beast.classList.contains('camp-working')!==working)b.beast.classList.toggle('camp-working',working);
   if(b.beast.classList.contains(`camp-action-${b.kind}`)!==working)b.beast.classList.toggle(`camp-action-${b.kind}`,working);
   if(b.station.classList.contains(`camp-action-${b.kind}`)!==working)b.station.classList.toggle(`camp-action-${b.kind}`,working);
   const clips=VILLAGE_ACTIVITY_PRESENTATION[b.kind].clips;
   const firstPaint=b.phase===undefined;
   if(b.phase!==undefined&&b.phase!==w.phase){
    const transition=w.phase==='work'&&working?clips.enter:b.phase==='work'&&w.phase==='return'?clips.finish:undefined;
    b.transient=transition&&b.player?.hasClip(transition)?transition:undefined;
   }
   if(w.block)b.transient=undefined;
   b.phase=w.phase;
   b.player?.play(b.transient??villageWorkerClip(w),w.facing);
   const previous=this.workPlayback.get(id);
   if(firstPaint&&w.phase==='work'&&previous&&previous.jobId===w.jobId)b.player?.seek(previous.seconds);
   if(b.player?.advance(seconds,this.reducedMotion.matches).completed){b.transient=undefined;b.player.play(villageWorkerClip(w),w.facing);}
   if(working&&w.jobId!==undefined&&b.player)this.workPlayback.set(id,{jobId:w.jobId,seconds:b.player.elapsedSeconds});
   const display=villageActivityLabel(w);
   b.beast.dataset.phase=w.phase;
   if(w.jobId!==undefined)b.beast.dataset.jobId=String(w.jobId);else delete b.beast.dataset.jobId;
   if(w.block){b.station.dataset.blockReason=w.block.message;b.beast.dataset.blockCode=w.block.code;}else{delete b.station.dataset.blockReason;delete b.beast.dataset.blockCode;}
   if(b.beast.dataset.activity!==display)b.beast.dataset.activity=display;
  }
 }
}

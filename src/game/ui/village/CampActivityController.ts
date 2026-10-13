import { VillageSimulation, type VillageJob, type VillageWorkHooks } from '../../run/VillageSimulation';
import { VILLAGE_SCENE } from '../../run/VillageSceneLayout';
interface Binding {beast:HTMLElement;station:HTMLElement;kind:string;job:VillageJob}
/** Presentation bindings can be rebuilt without resetting the independent clock. */
export class CampActivityController {
 private bindings=new Map<string,Binding>();private frame=0;private last=0;private running=false;
 private readonly simulation:VillageSimulation;
 constructor(onWork:(kind:string)=>void|boolean,hooks?:VillageWorkHooks,private readonly onTick?:(seconds:number)=>void){this.simulation=new VillageSimulation(onWork,hooks);}
 rebind():void{for(const b of this.bindings.values())b.station.classList.remove(`camp-action-${b.kind}`);this.bindings.clear();}
 add(beast:HTMLElement,station:HTMLElement,kind:string,homeX:number,homeY:number,anchor?:{x:number;y:number}):void{
  const width=VILLAGE_SCENE.width,height=VILLAGE_SCENE.height;
  const x=anchor?anchor.x*width/100:station.offsetLeft+station.offsetWidth*(kind==='anvil'?.52:.34);
  const y=anchor?anchor.y*height/100:Math.max(0,station.offsetTop+station.offsetHeight*.7-beast.offsetHeight);
  const id=beast.dataset.beastId!;beast.classList.add('camp-autonomous');beast.style.transition='none';
  this.bindings.set(id,{beast,station,kind,job:{id,stationId:station.dataset.decor??kind,kind,home:{x:homeX*width/100,y:homeY*height/100},work:{x,y},face:kind==='fishing'||station.offsetLeft+station.offsetWidth/2>x+46?1:-1}});
 }
 start():void{this.simulation.sync([...this.bindings.values()].map(b=>b.job));this.paint();if(this.running)return;this.running=true;this.last=0;this.frame=requestAnimationFrame(this.tick);}
 dispose():void{this.running=false;cancelAnimationFrame(this.frame);this.rebind();this.simulation.dispose();}
 private paint():void{
  for(const [id,b] of this.bindings){const w=this.simulation.workers.get(id);if(!w)continue;
   b.beast.style.left=`${w.x/VILLAGE_SCENE.width*100}%`;b.beast.style.top=`${w.y/VILLAGE_SCENE.height*100}%`;b.beast.style.zIndex=String(Math.round(w.y));b.beast.style.setProperty('--camp-facing',String(w.facing));b.beast.dataset.facing=w.facing<0?'left':'right';
   const working=w.phase==='work';
   if(b.beast.classList.contains('camp-working')!==working)b.beast.classList.toggle('camp-working',working);
   if(b.beast.classList.contains(`camp-action-${b.kind}`)!==working)b.beast.classList.toggle(`camp-action-${b.kind}`,working);
   if(b.station.classList.contains(`camp-action-${b.kind}`)!==working)b.station.classList.toggle(`camp-action-${b.kind}`,working);
   const text=working?(b.kind==='anvil'?`Đang làm đồ chơi · ${Math.ceil(w.remaining)}s`:b.kind==='garden'?`Đang trồng rau · ${Math.ceil(w.remaining)}s`:b.kind==='fishing'?`Đang câu cá · ${Math.ceil(w.remaining)}s`:b.kind==='carrot'?'Đang ăn cà rốt':'Đang nghỉ trong bồn'):w.phase==='walk'?'Đang tới nơi làm việc':w.phase==='return'?'Đang về nghỉ':'Đang nghỉ';
   const display=w.phase==='walk'&&b.station.dataset.blockReason?b.station.dataset.blockReason:text;
   if(b.beast.dataset.activity!==display)b.beast.dataset.activity=display;
  }
 }
 private tick=(now:number):void=>{if(!this.running)return;const dt=this.last?Math.min((now-this.last)/1000,.1):0;this.last=now;if(!document.hidden)this.onTick?.(dt);this.simulation.step(dt,document.hidden);if(!document.hidden)this.paint();this.frame=requestAnimationFrame(this.tick);};
}

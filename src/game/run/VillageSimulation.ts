export interface VillageJob {id:string;stationId:string;kind:string;home:{x:number;y:number};work:{x:number;y:number};face:number}
export interface VillageWorker extends VillageJob {phase:'rest'|'walk'|'work'|'return';remaining:number;duration:number;x:number;y:number;from:{x:number;y:number};facing:number}
export interface VillageWorkHooks {begin:(kind:string)=>number|false;advance:(kind:string,seconds:number)=>void;rate?:(id:string)=>number}
export class VillageSimulation {
 readonly workers=new Map<string,VillageWorker>();
 private reservations=new Map<string,string>();
 private disposed=false;
 constructor(private readonly complete:(kind:string)=>void|boolean,private readonly hooks?:VillageWorkHooks){}
 sync(jobs:VillageJob[]):void {
  if(this.disposed)return;
  const ids=new Set(jobs.map(j=>j.id));
  for(const [id,w] of this.workers)if(!ids.has(id)){if(this.reservations.get(w.stationId)===id)this.reservations.delete(w.stationId);this.workers.delete(id);}
  for(const job of jobs){const old=this.workers.get(job.id);
   if(old&&old.stationId===job.stationId&&old.kind===job.kind&&old.work.x===job.work.x&&old.work.y===job.work.y){Object.assign(old,job);continue;}
   if(old&&this.reservations.get(old.stationId)===job.id)this.reservations.delete(old.stationId);
   this.workers.set(job.id,{...job,phase:'rest',remaining:1+this.workers.size*2,duration:0,x:job.home.x,y:job.home.y,from:{...job.home},facing:1});
  }
 }
 private travel(w:VillageWorker,phase:'walk'|'return'):void {
  const to=phase==='walk'?w.work:w.home;w.from={x:w.x,y:w.y};w.duration=Math.max(2,Math.hypot(to.x-w.x,to.y-w.y)/85);w.remaining=w.duration;w.phase=phase;
  if(Math.abs(to.x-w.x)>.01)w.facing=to.x<w.x?-1:1;
 }
 step(seconds:number,paused=false):void {
  if(this.disposed||paused||!Number.isFinite(seconds)||seconds<=0)return;
  for(const w of this.workers.values()){
   let budget=seconds;
   for(let guard=0;budget>0&&guard<100;guard++){
    const rate=w.phase==='work'?Math.max(.01,Math.min(1,this.hooks?.rate?.(w.id)??1)):1;const wall=Math.min(budget,Math.max(0,w.remaining)/rate),used=wall*rate;w.remaining-=used;budget-=wall;
    if(w.phase==='work')this.hooks?.advance(w.kind,used);
    if(w.phase==='walk'||w.phase==='return'){const to=w.phase==='walk'?w.work:w.home,t=1-w.remaining/w.duration;w.x=w.from.x+(to.x-w.from.x)*t;w.y=w.from.y+(to.y-w.from.y)*t;}
    if(w.remaining>1e-8)break;
    if(w.phase==='rest'){
     const holder=this.reservations.get(w.stationId);if(holder&&holder!==w.id){w.remaining=1;continue;}
     this.reservations.set(w.stationId,w.id);this.travel(w,'walk');
    }else if(w.phase==='walk'){const duration=this.hooks?.begin(w.kind)??8;if(duration===false){w.remaining=1;break;}w.phase='work';w.remaining=Math.max(.001,duration);w.facing=w.face;}
    else if(w.phase==='work'){if(this.complete(w.kind)===false){w.remaining=1;break;}this.travel(w,'return');this.reservations.delete(w.stationId);}
    else {w.phase='rest';w.remaining=10;}
   }
  }
 }
 dispose():void{this.disposed=true;this.workers.clear();this.reservations.clear();}
}

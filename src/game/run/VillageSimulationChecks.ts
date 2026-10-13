import { VillageSimulation, type VillageJob } from './VillageSimulation';
export function villageSimulationChecks():void{
 const expect=(ok:boolean,message:string)=>{if(!ok)throw Error(`Village simulation: ${message}`);};
 let completed=0;const sim=new VillageSimulation(()=>{completed++;});
 const job:VillageJob={id:'a',stationId:'garden',kind:'garden',home:{x:0,y:0},work:{x:85,y:0},face:1};
 sim.sync([job]);sim.step(2);const worker=sim.workers.get('a')!;
 expect(worker.phase==='walk'&&worker.x>0&&completed===0,'movement precedes work and rewards');
 const remaining=worker.remaining,x=worker.x;sim.sync([{...job}]);expect(sim.workers.get('a')===worker&&worker.remaining===remaining,'rebind retains phase/time/position');
 sim.step(20,true);expect(worker.remaining===remaining&&worker.x===x,'pause freezes progress');
 sim.step(1);expect(worker.phase==='work'&&completed===0,'arriving does not complete');
 sim.step(7.9);expect(completed===0,'incomplete work emits nothing');sim.step(.1);expect(completed===1&&worker.phase==='return','completion emits once');sim.step(.1);expect(completed===1,'no duplicate completion');
 sim.sync([]);sim.step(100);expect(completed===1&&sim.workers.size===0,'removing job cancels future work');
 const busy=new VillageSimulation(()=>{});busy.sync([job,{...job,id:'b'}]);busy.step(4);expect([...busy.workers.values()].filter(w=>w.phase==='work'||w.phase==='walk').length===1,'station reservation prevents competing workers');
 busy.sync([{...job,id:'b'}]);busy.step(1);expect(busy.workers.get('b')!.phase==='walk','removed owner releases reservation');
 const cancelled=new VillageSimulation(()=>{completed++;});cancelled.sync([job]);cancelled.step(4);cancelled.sync([]);cancelled.step(20);expect(completed===1,'cancelled active work never completes');
 sim.dispose();sim.sync([job]);sim.step(100);expect(sim.workers.size===0&&completed===1,'disposed simulation stays inert');
}

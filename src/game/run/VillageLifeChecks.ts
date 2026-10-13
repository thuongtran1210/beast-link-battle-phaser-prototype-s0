import { parseCamp } from './CampState';
import { advanceVillageLife, resourceCount, tradeResource, villageWorkRate } from './VillageEconomy';
import { VillageSimulation } from './VillageSimulation';
export function villageLifeChecks():void{
 const expect=(ok:boolean,text:string)=>{if(!ok)throw Error(`Village life: ${text}`);};
 const s=parseCamp({version:2,wood:0,residents:['a','b']});
 advanceVillageLife(s,['a','b'],119);expect(resourceCount(s,'carrot')===6,'no premature meal');
 advanceVillageLife(s,['a','b'],1);expect(resourceCount(s,'carrot')===4&&s.economy.life.hungry.length===0,'one portion per resident');
 const reload=parseCamp(s);advanceVillageLife(reload,['a','b'],.1);expect(resourceCount(reload,'carrot')===4,'reload does not repeat meal');
 advanceVillageLife(reload,['a','b'],119.9);expect(resourceCount(reload,'carrot')===0&&reload.economy.life.hungry.length===2&&villageWorkRate(reload,'a')===.75,'expiry before meals and hunger slowdown');
 const t=parseCamp({version:2,wood:0});t.economy.lots=[];advanceVillageLife(t,[],30);tradeResource(t,'fish',1,'buy');
 advanceVillageLife(t,['a','b'],90);expect(resourceCount(t,'fish')===0&&t.economy.life.mealCost===4&&t.economy.life.hungry.length===0&&t.economy.cogs===0,'fish supplies two portions, meal cost is not sales cost');
 const waste=parseCamp({version:2,wood:0});waste.economy.lots=[];tradeResource(waste,'fish',1,'buy');advanceVillageLife(waste,[],120);expect(waste.economy.life.wasteCost===4&&waste.economy.wallet===16,'expiry records cost without charging wallet twice');
 expect(waste.economy.life.reports[0].day===1&&waste.economy.life.reports[0].waste===4,'daily report assigns boundary expiry to completed day');
 const sim=new VillageSimulation(()=>{}, {begin:()=>8,advance:()=>{},rate:()=>.75});sim.sync([{id:'a',stationId:'g',kind:'garden',home:{x:0,y:0},work:{x:0,y:0},face:1}]);sim.step(3);sim.step(4);expect(sim.workers.get('a')!.remaining===5,'four wall seconds perform three work seconds');const before=sim.workers.get('a')!.remaining;sim.step(10,true);expect(sim.workers.get('a')!.remaining===before,'paused work freezes');
 expect(JSON.stringify(parseCamp(reload))===JSON.stringify(reload),'life save parsing is stable');
}

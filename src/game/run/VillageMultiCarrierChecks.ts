import {parseCamp} from './CampState';
import {VillageApplication} from './VillageApplication';
import {resourceCount,tradeResource} from './VillageEconomy';
export function villageMultiCarrierChecks():void {
 const expect=(ok:boolean,text:string)=>{if(!ok)throw Error(`Multi carrier: ${text}`);};
 let state=parseCamp({version:2,wood:20,residents:['beast-b','beast-c','beast-e','beast-f']});let allow=true;
 let app=new VillageApplication(state,{save:()=>allow},()=>1);
 app.begin('fishing');app.begin('anvil');app.begin('garden');app.advance('fishing',40);app.advance('anvil',50);app.advance('garden',60);
 const fish=resourceCount(state,'fish'),toy=resourceCount(state,'toy'),carrot=resourceCount(state,'carrot');
 allow=false;expect(!app.completeActivity('fishing').ok&&!state.economy.fishing?.readyOutput,'failed staging preserves output for retry');allow=true;
 app.completeActivity('fishing');app.completeActivity('anvil');app.completeActivity('garden');
  const wallet=state.economy.wallet;expect(!app.begin('fishing').ok&&!app.begin('anvil').ok&&state.economy.wallet===wallet,'pending cargo blocks a new paid batch');
 expect(resourceCount(state,'fish')===fish&&resourceCount(state,'toy')===toy,'completion leaves stock ungranted');
 const ids=[state.economy.fishing!.id,state.economy.anvil!.id,state.economy.garden!.id];
 app.advanceCarrier(.1);expect(app.carrier()?.jobId===ids[0]&&app.carrier()?.kind==='fishing'&&!app.collectProduction('fishing').ok,'oldest job reserved and manual collection blocked');
 const grants:{kind?:string;quantity:number}[]=[];const phases=new Set<string>();
 for(let i=0;i<2200;i++){
  const c=app.carrier();if(c&&!phases.has(`${c.kind}:${c.phase}`)){phases.add(`${c.kind}:${c.phase}`);state=parseCamp(state);app=new VillageApplication(state,{save:()=>allow},()=>1);expect(app.carrier()?.jobId===c.jobId&&app.carrier()?.elapsed===c.elapsed,'all station phases survive reload');}
  const result=app.advanceCarrier(.1);if(result.delivered)grants.push({kind:result.kind,quantity:result.delivered});
 }
 expect(JSON.stringify(grants)===JSON.stringify([{kind:'fishing',quantity:2},{kind:'anvil',quantity:1},{kind:'garden',quantity:5}]),'serial FIFO delivers each station once');
 expect(resourceCount(state,'fish')===fish+2&&resourceCount(state,'toy')===toy+1&&resourceCount(state,'carrot')===carrot+5,'correct outputs and no duplicate stock');
 expect(!state.economy.fishing&&!state.economy.anvil&&!state.economy.garden&&!app.carrier(),'all jobs released after delivery/return');
 const pending=parseCamp({version:2,wood:96,residents:['beast-f'],economy:{fishing:{id:1,remaining:0,cost:2,readyOutput:true},sequence:1}});pending.economy.lots=[];let save=true;const wait=new VillageApplication(pending,{save:()=>save},()=>1);
 pending.wood=101;for(let i=0;i<800;i++)wait.advanceCarrier(.1);expect(wait.carrier()?.phase==='place'&&resourceCount(pending,'fish')===0,'full stock holds fish parcel');
 tradeResource(pending,'wood',10,'sell');save=false;for(let i=0;i<20;i++)wait.advanceCarrier(.1);expect(resourceCount(pending,'fish')===0&&Boolean(pending.economy.fishing),'failed commit holds fish');save=true;for(let i=0;i<30;i++)wait.advanceCarrier(.1);expect(resourceCount(pending,'fish')===2&&!pending.economy.fishing,'capacity/save recovery grants fish once');
 const orphan=parseCamp({economy:{carrier:{kind:'anvil',jobId:9,phase:'carry',elapsed:0,picked:true,placed:false}}});expect(!orphan.economy.carrier,'orphan nongarden cargo rejected');
 const legacy=parseCamp({economy:{garden:{id:1,remaining:0,cost:1,harvested:true},carrier:{jobId:1,phase:'pickup',elapsed:0,picked:false,placed:false}}});expect(legacy.economy.carrier?.kind==='garden','legacy carrier migrates as garden');
  const manual=parseCamp({version:2,wood:10,residents:['beast-b'],economy:{fishing:{id:1,remaining:0,cost:2,readyOutput:true},sequence:1}});const fallback=new VillageApplication(manual,{save:()=>true},()=>1);fallback.advanceCarrier(100);expect(!fallback.carrier()&&fallback.collectProduction('fishing').ok&&!fallback.collectProduction('fishing').ok&&resourceCount(manual,'fish')===2,'missing carrier permits exactly one manual collection');
}

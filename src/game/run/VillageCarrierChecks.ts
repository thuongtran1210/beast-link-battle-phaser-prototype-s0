import {parseCamp,type CampState} from './CampState';
import {VillageApplication} from './VillageApplication';
import {carrierPosition,parseGardenCarrier} from './VillageCarrier';
import {resourceCount,awardRunWood,tradeResource} from './VillageEconomy';
export function villageCarrierChecks():void {
 const expect=(ok:boolean,text:string)=>{if(!ok)throw Error(`Carrier: ${text}`);};
 let state=parseCamp({version:2,wood:10,residents:['beast-c','beast-f']});let allow=true,persisted:CampState|undefined;
 const storage={save:(candidate:CampState)=>{if(!allow)return false;persisted=parseCamp(candidate);return true;}};
 let app=new VillageApplication(state,storage,()=>1);
 app.begin('garden');app.advance('garden',60);app.harvestGarden();const before=resourceCount(state,'carrot');
 allow=false;expect(!app.advanceCarrier(.1).saved&&!app.carrier(),'failed reservation leaves basket unclaimed');allow=true;
 for(let i=0;i<12;i++)app.advanceCarrier(.1);
 expect(app.carrier()?.phase==='approach'&&!app.collectGarden().ok,'carrier reserves job against manual double claim');
 const old=app.carrier()!;const position=carrierPosition(old);app.checkpoint();state=parseCamp(persisted);app=new VillageApplication(state,storage,()=>1);
 expect(app.carrier()?.elapsed===old.elapsed&&JSON.stringify(carrierPosition(app.carrier()))===JSON.stringify(position),'saved elapsed restores exact route position');
 let sawPicked=false,sawPlaced=false,delivered=0;
 const reloadedPhases=new Set<string>();
 for(let i=0;i<600;i++){
  const c=app.carrier();
  if(c&&!reloadedPhases.has(c.phase)){app.checkpoint();const copy=parseCamp(persisted);expect(copy.economy.carrier?.phase===c.phase,'every phase survives parser');reloadedPhases.add(c.phase);}
  const result=app.advanceCarrier(.1);delivered+=result.delivered;
  if(app.carrier()?.picked)sawPicked=true;if(app.carrier()?.placed)sawPlaced=true;
  if(app.carrier()?.phase==='return')break;
 }
 expect(sawPicked&&sawPlaced&&delivered===5&&resourceCount(state,'carrot')===before+5,'one physical route grants exactly one batch');
 expect(!state.economy.garden&&app.carrier()?.phase==='return','delivery and return phase commit atomically');
 for(let i=0;i<300;i++)expect(app.advanceCarrier(.1).delivered===0,'return/replay never grants again');
 expect(!app.carrier(),'return clears carrier reservation');
 const pending=parseCamp({version:2,wood:90,residents:['beast-c','beast-f']});pending.economy.lots=[];
 let canSave=true;const stuck=new VillageApplication(pending,{save:()=>canSave},()=>1);
 stuck.begin('garden');stuck.advance('garden',60);stuck.harvestGarden();awardRunWood(pending);
 for(let i=0;i<500;i++)stuck.advanceCarrier(.1);
 expect(stuck.carrier()?.phase==='place'&&stuck.carrier()?.placed===true&&pending.economy.garden?.harvested===true,'full storage retains parcel at receiving point');
 const stuckBefore=JSON.stringify(pending);canSave=false;tradeResource(pending,'wood',10,'sell');const afterTrade=JSON.stringify(pending);
 for(let i=0;i<30;i++)stuck.advanceCarrier(.1);
 expect(JSON.stringify(pending)===afterTrade&&resourceCount(pending,'carrot')===0,'failed delivery save cannot remove parcel or grant stock');
 canSave=true;let received=0;for(let i=0;i<30;i++)received+=stuck.advanceCarrier(.1).delivered;
 expect(received===5&&resourceCount(pending,'carrot')===5,'space/save recovery delivers once');
 expect(stuckBefore!==afterTrade,'fixture frees actual inventory space');
 expect(!parseGardenCarrier({jobId:1,phase:'carry',elapsed:Infinity}), 'invalid saved time rejected');
 const ghost=parseCamp({version:3,economy:{carrier:{jobId:44,phase:'carry',elapsed:0,picked:true,placed:false}}});
 expect(!ghost.economy.carrier,'orphan carrying record cannot create cargo');
 const noWorker=parseCamp({version:2,wood:10,residents:['beast-c']});const waiting=new VillageApplication(noWorker,{save:()=>true});waiting.begin('garden');waiting.advance('garden',60);waiting.harvestGarden();waiting.advanceCarrier(100);
 expect(!waiting.carrier()&&noWorker.economy.garden?.harvested===true,'no Swiftwing leaves basket waiting for manual fallback');
}

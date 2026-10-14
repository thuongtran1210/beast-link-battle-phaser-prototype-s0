import { parseCamp, type CampState } from './CampState';
import { VillageApplication } from './VillageApplication';
import { gardenCycleSnapshot } from './VillageGardenCycle';
import { resourceCount, reservedProductionSpace, awardRunWood } from './VillageEconomy';

export function villageGardenCycleChecks():void {
 const expect=(ok:boolean,text:string)=>{if(!ok)throw Error(`Garden cycle: ${text}`);};
 const state=parseCamp({version:2,wood:10,residents:['beast-c']});let saved:CampState|undefined;let allow=true;
 const app=new VillageApplication(state,{save:candidate=>{if(!allow)return false;saved=parseCamp(candidate);return true;}},()=>1);
 expect(app.garden().stage==='empty'&&app.begin('garden').ok,'empty plot starts paid cycle');
 expect(state.economy.garden?.totalSeconds===60&&state.economy.garden.quantity===5&&reservedProductionSpace(state)===5,'new batch captures approved time/yield and reserves five slots');
 expect(app.garden().stage==='sowing','first stage is sowing');app.advance('garden',6);
 expect(app.garden().stage==='growing','seed transitions to growing');app.advance('garden',39);
 expect(app.garden().stage==='mature','grown plants become mature once');app.advance('garden',6);
 expect(app.garden().stage==='harvesting','harvest follows maturity');app.advance('garden',9);
 const count=resourceCount(state,'carrot'),jobId=state.economy.garden!.id;
 allow=false;expect(!app.harvestGarden().ok&&!state.economy.garden?.harvested&&resourceCount(state,'carrot')===count,'failed harvest save cannot create a committed basket');
 allow=true;const harvest=app.completeActivity('garden');
 expect(harvest.ok&&harvest.events?.[0]?.type==='garden-harvested'&&app.garden().stage==='waiting-pickup','harvest saves one basket instead of inventory');
 expect(resourceCount(state,'carrot')===count&&state.economy.garden?.id===jobId,'harvest does not grant or replace job identity');
 const replay=app.harvestGarden();expect(replay.ok&&replay.events?.length===0,'replayed harvest emits nothing');
 expect(!app.begin('garden').ok&&state.economy.garden?.id===jobId,'waiting basket blocks another paid cycle');
 const reloaded=parseCamp(saved),restored=new VillageApplication(reloaded,{save:()=>true});
 expect(restored.garden().stage==='waiting-pickup'&&reloaded.economy.garden?.quantity===5,'basket/job metadata survive reload');
 allow=false;expect(!app.collectGarden().ok&&state.economy.garden?.harvested===true,'failed collection retains basket');allow=true;
 expect(app.collectGarden().ok&&resourceCount(state,'carrot')===count+5&&!app.collectGarden().ok,'collection grants one batch only');
 expect(app.garden().stage==='empty'&&app.begin('garden').ok,'successful collection permits next sowing');
 const legacy=parseCamp({version:3,wood:10,residents:['beast-c'],economy:{wallet:10,garden:{id:9,remaining:18,cost:1}}});
 const old=new VillageApplication(legacy,{save:()=>true});const before=legacy.economy.wallet;
 expect(legacy.economy.garden?.totalSeconds===30&&legacy.economy.garden.quantity===3&&old.begin('garden').ok&&legacy.economy.wallet===before,'legacy paid cycle preserves 30 seconds/three carrots/no recharge');
 old.advance('garden',18);old.harvestGarden();expect(old.collectGarden().ok&&resourceCount(legacy,'carrot')===3,'legacy cycle retains old yield');
 const full=parseCamp({version:2,wood:90,residents:['beast-c']});full.economy.lots=[];
 const overflow=new VillageApplication(full,{save:()=>true});overflow.begin('garden');overflow.advance('garden',60);overflow.harvestGarden();awardRunWood(full);
 expect(!overflow.collectGarden().ok&&full.economy.garden?.harvested===true,'incoming Run overflow cannot discard the waiting basket');
 expect(gardenCycleSnapshot({jobId:1,totalSeconds:60,remaining:30,quantity:5}).stage==='growing','stage derives from saved clock, no separate animation timer');
}

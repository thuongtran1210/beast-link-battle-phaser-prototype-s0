import { parseCamp } from './CampState';
import { VillageApplication } from './VillageApplication';
import { resourceCount, inventorySize } from './VillageEconomy';
export function villageBoatChecks():void {
 const expect=(ok:boolean,label:string)=>{if(!ok)throw Error(`Boat sale: ${label}`);};
 let state=parseCamp({version:2,wood:90,residents:['beast-d'],economy:{wallet:20,lots:[{id:1,resource:'toy',quantity:10,cost:5}],sequence:1}}),allow=false;
 let app=new VillageApplication(state,{save:()=>allow});
 expect(!app.advanceBoat(.1).saved&&inventorySize(state)===100&&!state.economy.boatSale,'failed departure preserves stock');
 allow=true;app.advanceBoat(1);app.advanceBoat(.1);
 expect(state.wood===90&&resourceCount(state,'toy')===0&&state.economy.wallet===20&&Boolean(state.economy.boatSale),'departure removes goods without granting coins or selling wood');
 app.advanceBoat(10);state=parseCamp(state);app=new VillageApplication(state,{save:()=>allow});
 expect(Math.abs(state.economy.boatSale!.remaining-20)<.001,'reload preserves cargo and active remaining time');
 allow=false;expect(!app.advanceBoat(20).saved&&state.economy.wallet===20&&Boolean(state.economy.boatSale),'failed sale preserves cargo and no money');
 allow=true;app.advanceBoat(1);expect(app.advanceBoat(20).revenue===100&&state.economy.wallet===120&&!state.economy.boatSale,'sale credits exactly once');
 expect(app.advanceBoat(100).revenue===0&&state.economy.cogs===5&&state.economy.ledger.filter(e=>e.type==='sell').length===1,'no replay and cost ledger');
 const absent=parseCamp({version:2,wood:90,economy:{lots:[{id:1,resource:'toy',quantity:10,cost:5}]}});new VillageApplication(absent,{save:()=>true}).advanceBoat(30);expect(inventorySize(absent)===100,'no trader no auto sale');
 const woodOnly=parseCamp({version:2,wood:100,residents:['beast-d']});woodOnly.economy.lots=[];new VillageApplication(woodOnly,{save:()=>true}).advanceBoat(30);expect(woodOnly.wood===100&&!woodOnly.economy.boatSale,'wood-only full store waits for manual action');
 expect(!parseCamp({economy:{boatSale:{remaining:3,cargo:[null]}}}).economy.boatSale,'malformed cargo rejected safely');
  const expired=parseCamp({version:2,wood:90,residents:['beast-d'],economy:{wallet:0,lots:[{id:1,resource:'fish',quantity:10,cost:4,expiresAt:1}],life:{seconds:0}}});const perish=new VillageApplication(expired,{save:()=>true});perish.advanceBoat(.1);expired.economy.life.seconds=31;expect(perish.advanceBoat(30).revenue===0&&expired.economy.life.wasteCost===4&&!expired.economy.boatSale,'cargo keeps expiry and cannot sell spoiled goods');
}

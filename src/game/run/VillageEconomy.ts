import { parseGardenCarrier, type GardenCarrier } from './VillageCarrier';
export const VILLAGE_RESOURCES={wood:{name:'Gỗ',buy:3,sell:1},carrot:{name:'Cà rốt',buy:2,sell:2},fish:{name:'Cá',buy:4,sell:4},toy:{name:'Đồ chơi',buy:10,sell:10}} as const;
export type ResourceId=keyof typeof VILLAGE_RESOURCES;
export interface ResourceLot {id:number;resource:Exclude<ResourceId,'wood'>;quantity:number;cost:number;expiresAt?:number}
export interface LedgerEntry {id:number;type:'grant'|'buy'|'sell'|'build'|'run'|'production'|'meal'|'waste';text:string;money:number;resource:ResourceId;quantity:number;cost:number}
export interface GardenProduction {id:number;remaining:number;cost:number;totalSeconds?:number;quantity?:number;harvested?:boolean;readyOutput?:boolean}
export interface DailyVillageReport {day:number;revenue:number;cogs:number;meals:number;waste:number}
export interface VillageLife {reports:DailyVillageReport[];seconds:number;hungry:string[];mealCost:number;wasteCost:number}
export interface BoatSale {remaining:number;cargo:{resource:Exclude<ResourceId,'wood'>;quantity:number;cost:number;expiresAt?:number}[]}
export interface VillageEconomy {boatSale?:BoatSale;carrier?:GardenCarrier;life:VillageLife;wallet:number;woodCost:number;lots:ResourceLot[];ledger:LedgerEntry[];sequence:number;revenue:number;cogs:number;cashIn:number;cashOut:number;investment:number;garden?:GardenProduction;fishing?:GardenProduction;anvil?:GardenProduction}
interface EconomyCamp {wood:number;economy:VillageEconomy}
const nonnegative=(n:unknown,fallback=0)=>typeof n==='number'&&Number.isFinite(n)&&n>=0?n:fallback;
export function parseVillageEconomy(value:unknown,wood:number,startup=true):VillageEconomy{
 if(!value||typeof value!=='object')return {life:{reports:[],seconds:0,hungry:[],mealCost:0,wasteCost:0},wallet:startup?20:0,woodCost:wood*2,lots:startup?[{id:1,resource:'carrot',quantity:6,cost:0,expiresAt:240}]:[],ledger:startup?[{id:1,type:'grant',text:'Hỗ trợ khởi nghiệp: 20 Đồng và 6 cà rốt',money:20,resource:'carrot',quantity:6,cost:0}]:[],sequence:startup?1:0,revenue:0,cogs:0,cashIn:startup?20:0,cashOut:0,investment:0};
 const raw=value as Partial<VillageEconomy>;
 const reports:DailyVillageReport[]=Array.isArray(raw.life?.reports)?raw.life.reports.filter(r=>r&&Number.isInteger(r.day)&&r.day>0).slice(-14).map(r=>({day:r.day,revenue:nonnegative(r.revenue),cogs:nonnegative(r.cogs),meals:nonnegative(r.meals),waste:nonnegative(r.waste)})):[];
 const life:VillageLife={reports,seconds:nonnegative(raw.life?.seconds),hungry:Array.isArray(raw.life?.hungry)?raw.life.hungry.filter((id):id is string=>typeof id==='string'):[],mealCost:nonnegative(raw.life?.mealCost),wasteCost:nonnegative(raw.life?.wasteCost)};
 const lots:ResourceLot[]=[];
 if(Array.isArray(raw.lots))for(const l of raw.lots){if(l&&['carrot','fish','toy'].includes(l.resource)&&Number.isInteger(l.quantity)&&l.quantity>0&&Number.isInteger(l.id)&&l.id>0&&Number.isFinite(l.cost)&&l.cost>=0)lots.push({...l,...(l.resource==='carrot'||l.resource==='fish'?{expiresAt:nonnegative(l.expiresAt,life.seconds+(l.resource==='carrot'?240:120))}:{})});}
 const types=['grant','buy','sell','build','run','production','meal','waste'];
 const ledger=Array.isArray(raw.ledger)?raw.ledger.filter(e=>e&&types.includes(e.type)&&Object.hasOwn(VILLAGE_RESOURCES,e.resource)&&typeof e.text==='string'&&Number.isFinite(e.money)&&Number.isFinite(e.quantity)&&Number.isFinite(e.cost)&&e.cost>=0&&Number.isInteger(e.id)&&e.id>0).slice(-100).map(e=>({...e})):[];
 const gardenRaw=raw.garden;
 const gardenTotal=gardenRaw?.totalSeconds??30,gardenQuantity=gardenRaw?.quantity??3;
 const garden=gardenRaw&&Number.isInteger(gardenRaw.id)&&gardenRaw.id>0&&Number.isFinite(gardenRaw.remaining)&&gardenRaw.remaining>=0
  &&Number.isFinite(gardenTotal)&&gardenTotal>0&&gardenTotal<=3600&&gardenRaw.remaining<=gardenTotal
  &&Number.isInteger(gardenQuantity)&&gardenQuantity>0&&gardenQuantity<=100&&gardenRaw.cost===1
  ?{id:gardenRaw.id,remaining:gardenRaw.remaining,cost:gardenRaw.cost,totalSeconds:gardenTotal,quantity:gardenQuantity,...(gardenRaw.harvested===true&&gardenRaw.remaining===0?{harvested:true}:{})}:undefined;
 const jobs:Partial<Record<'fishing'|'anvil',GardenProduction>>={};
 for(const kind of ['fishing','anvil'] as const){const job=raw[kind];if(job&&Number.isInteger(job.id)&&job.id>0&&Number.isFinite(job.remaining)&&job.remaining>=0&&job.remaining<=VILLAGE_RECIPES[kind].seconds&&Number.isFinite(job.cost)&&job.cost>=0)jobs[kind]={id:job.id,remaining:job.remaining,cost:job.cost,...(job.readyOutput===true&&job.remaining===0?{readyOutput:true}:{})};}
 const carrier=parseGardenCarrier(raw.carrier);
 const carrierJob:GardenProduction|undefined=carrier?.kind==='fishing'?jobs.fishing:carrier?.kind==='anvil'?jobs.anvil:garden;
 const b=raw.boatSale;
 const boatSale=b&&Number.isFinite(b.remaining)&&b.remaining>=0&&b.remaining<=30&&Array.isArray(b.cargo)&&b.cargo.length>0&&b.cargo.length<=10&&b.cargo.every(c=>c&&typeof c==='object')&&b.cargo.every(c=>c&&['carrot','fish','toy'].includes(c.resource)&&Number.isInteger(c.quantity)&&c.quantity>0&&Number.isFinite(c.cost)&&c.cost>=0&&(c.expiresAt===undefined||(Number.isFinite(c.expiresAt)&&c.expiresAt>=0)))&&b.cargo.reduce((n,c)=>n+c.quantity,0)<=10?{remaining:b.remaining,cargo:b.cargo.map(c=>({...c}))}:undefined;
 return {...jobs,...(boatSale?{boatSale}:{}),...(carrier&&(carrier.phase==='return'||(carrierJob?.id===carrier.jobId&&(carrierJob?.harvested||carrierJob?.readyOutput)))?{carrier}:{}),life,wallet:nonnegative(raw.wallet),woodCost:nonnegative(raw.woodCost,wood*2),lots,ledger,sequence:Math.max(Math.floor(nonnegative(raw.sequence)),garden?.id??0,...Object.values(jobs).map(j=>j.id),...lots.map(l=>l.id),...ledger.map(e=>e.id)),revenue:nonnegative(raw.revenue),cogs:nonnegative(raw.cogs),cashIn:nonnegative(raw.cashIn),cashOut:nonnegative(raw.cashOut),investment:nonnegative(raw.investment),...(garden?{garden}:{})};
}
/** Cargo leaves stock at departure; only completion books revenue. No wood sales. */
export function beginBoatSale(s:EconomyCamp):boolean {
 if(s.economy.boatSale||inventorySize(s)+reservedProductionSpace(s)<100)return false;
 let space=10;const cargo:BoatSale['cargo']=[];
 for(const lot of foodOrder(s.economy.lots)){
  if(lot.expiresAt!==undefined&&lot.expiresAt<=s.economy.life.seconds)continue;
  const quantity=Math.min(space,lot.quantity),cost=lot.cost*quantity/lot.quantity;
  cargo.push({resource:lot.resource,quantity,cost,...(lot.expiresAt!==undefined?{expiresAt:lot.expiresAt}:{})});
  lot.quantity-=quantity;lot.cost=Math.max(0,lot.cost-cost);space-=quantity;if(!space)break;
 }
 s.economy.lots=s.economy.lots.filter(l=>l.quantity>0);
 if(!cargo.length)return false;
 s.economy.boatSale={remaining:30,cargo};return true;
}
export function finishBoatSale(s:EconomyCamp):number {
 const boat=s.economy.boatSale;if(!boat||boat.remaining>1e-6)return 0;
 let revenue=0;
 for(const c of boat.cargo){if(c.expiresAt!==undefined&&c.expiresAt<=s.economy.life.seconds){s.economy.life.wasteCost+=c.cost;record(s,{type:'waste',text:`Hàng trên xuồng hết hạn: ${c.quantity} ${VILLAGE_RESOURCES[c.resource].name}`,money:0,resource:c.resource,quantity:-c.quantity,cost:c.cost});continue;}const money=VILLAGE_RESOURCES[c.resource].sell*c.quantity;revenue+=money;s.economy.wallet+=money;s.economy.cashIn+=money;s.economy.revenue+=money;s.economy.cogs+=c.cost;record(s,{type:'sell',text:`Starcaller chèo xuồng bán ${c.quantity} ${VILLAGE_RESOURCES[c.resource].name}`,money,resource:c.resource,quantity:-c.quantity,cost:c.cost});}
 delete s.economy.boatSale;return revenue;
}
export function resourceCount(s:EconomyCamp,id:ResourceId):number{return id==='wood'?s.wood:s.economy.lots.filter(l=>l.resource===id).reduce((n,l)=>n+l.quantity,0);}
export function inventorySize(s:EconomyCamp):number{return s.wood+s.economy.lots.reduce((n,l)=>n+l.quantity,0);}
export function saleCost(s:EconomyCamp,id:ResourceId,q:number):number{
 if(id==='wood')return s.wood?s.economy.woodCost*Math.min(q,s.wood)/s.wood:0;
 let remaining=q,cost=0;for(const lot of foodOrder(s.economy.lots)){if(lot.resource!==id||remaining<=0)continue;const used=Math.min(remaining,lot.quantity);cost+=lot.cost*used/lot.quantity;remaining-=used;}return cost;
}
function record(s:EconomyCamp,e:Omit<LedgerEntry,'id'>):void{
 const life=s.economy.life,day=Math.max(1,Math.floor(life.seconds/120)+(e.type==='meal'||(e.type==='waste'&&life.seconds%120===0)?0:1));
 if(e.type==='sell'||e.type==='meal'||e.type==='waste'){
  let report=life.reports.find(r=>r.day===day);if(!report){report={day,revenue:0,cogs:0,meals:0,waste:0};life.reports.push(report);life.reports=life.reports.slice(-14);}
  if(e.type==='sell'){report.revenue+=e.money;report.cogs+=e.cost;}else if(e.type==='meal')report.meals+=e.cost;else report.waste+=e.cost;
 }
 s.economy.ledger.push({...e,id:++s.economy.sequence});s.economy.ledger=s.economy.ledger.slice(-100);}
function consume(s:EconomyCamp,id:ResourceId,q:number):number{
 if(id==='wood'){const cost=s.wood?s.economy.woodCost*q/s.wood:0;s.wood-=q;s.economy.woodCost=Math.max(0,s.economy.woodCost-cost);return cost;}
 let remaining=q,cost=0;
 for(const lot of foodOrder(s.economy.lots)){if(lot.resource!==id||!remaining)continue;const used=Math.min(remaining,lot.quantity),part=lot.cost*used/lot.quantity;lot.quantity-=used;lot.cost=Math.max(0,lot.cost-part);cost+=part;remaining-=used;}
 s.economy.lots=s.economy.lots.filter(l=>l.quantity>0);return cost;
}
export function tradeResource(s:EconomyCamp,id:ResourceId,q:number,mode:'buy'|'sell'):boolean{
 if(!Object.hasOwn(VILLAGE_RESOURCES,id)||!Number.isInteger(q)||q<=0)return false;
 const price=VILLAGE_RESOURCES[id][mode]*q;
 if(mode==='buy'){
  if(s.economy.wallet<price||inventorySize(s)+q+reservedProductionSpace(s)>100)return false;
  s.economy.wallet-=price;s.economy.cashOut+=price;
  if(id==='wood'){s.wood+=q;s.economy.woodCost+=price;}else s.economy.lots.push({id:++s.economy.sequence,resource:id,quantity:q,cost:price,...(id==='carrot'||id==='fish'?{expiresAt:s.economy.life.seconds+(id==='carrot'?240:120)}:{})});
  record(s,{type:'buy',text:`Mua ${q} ${VILLAGE_RESOURCES[id].name}`,money:-price,resource:id,quantity:q,cost:price});
 }else{
  if(resourceCount(s,id)<q)return false;const cost=consume(s,id,q);s.economy.wallet+=price;s.economy.cashIn+=price;s.economy.revenue+=price;s.economy.cogs+=cost;
  record(s,{type:'sell',text:`Bán ${q} ${VILLAGE_RESOURCES[id].name}`,money:price,resource:id,quantity:-q,cost});
 }
 return true;
}
export function spendBuildingWood(s:EconomyCamp,q:number,name:string):void{const cost=consume(s,'wood',q);s.economy.investment+=cost;record(s,{type:'build',text:`Xây ${name}`,money:0,resource:'wood',quantity:-q,cost});}
export function awardRunWood(s:EconomyCamp):void{s.wood+=15;s.economy.woodCost+=30;record(s,{type:'run',text:'Thám hiểm hoàn tất: +15 Gỗ',money:0,resource:'wood',quantity:15,cost:30});}
export const VILLAGE_RECIPES={
 garden:{name:'Vườn cà rốt',worker:'beast-c',seconds:60,output:'carrot',quantity:5,money:1,input:'wood',inputQuantity:0},
 fishing:{name:'Bến câu cá',worker:'beast-b',seconds:40,output:'fish',quantity:2,money:0,input:'carrot',inputQuantity:1},
 anvil:{name:'Xưởng đồ chơi',worker:'beast-e',seconds:50,output:'toy',quantity:1,money:1,input:'wood',inputQuantity:2},
} as const;
export type ProductionKind=keyof typeof VILLAGE_RECIPES;
export function isProductionKind(kind:string):kind is ProductionKind{return Object.hasOwn(VILLAGE_RECIPES,kind);}
export function reservedProductionSpace(s:EconomyCamp):number{return (Object.keys(VILLAGE_RECIPES) as ProductionKind[]).reduce((total,kind)=>total+(s.economy[kind]?(kind==='garden'?(s.economy.garden!.quantity??3):VILLAGE_RECIPES[kind].quantity):0),0);}
export function productionBlock(s:EconomyCamp,kind:ProductionKind):import('./VillageActivity').VillageBlock|undefined{
 if(s.economy[kind])return undefined;const recipe=VILLAGE_RECIPES[kind];
 if(s.economy.wallet<recipe.money)return {code:'missing-funds',message:`Thiếu ${recipe.money} Đồng vật tư`};
 if(resourceCount(s,recipe.input)<recipe.inputQuantity)return {code:'missing-input',message:`Thiếu ${recipe.inputQuantity} ${VILLAGE_RESOURCES[recipe.input].name}`};
 if(inventorySize(s)-recipe.inputQuantity+reservedProductionSpace(s)+recipe.quantity>100)return {code:'storage-full',message:`Kho đầy · Cần chỗ cho ${recipe.quantity} sản phẩm`};
 return undefined;
}
export function productionBlockReason(s:EconomyCamp,kind:ProductionKind):string|undefined{return productionBlock(s,kind)?.message;}
export function beginProduction(s:EconomyCamp,kind:ProductionKind):boolean{
 if(s.economy[kind])return true;if(productionBlockReason(s,kind))return false;
 const r=VILLAGE_RECIPES[kind],cost=r.money+consume(s,r.input,r.inputQuantity);
 s.economy.wallet-=r.money;s.economy.cashOut+=r.money;s.economy[kind]={id:++s.economy.sequence,remaining:r.seconds,cost,...(kind==='garden'?{totalSeconds:r.seconds,quantity:r.quantity}:{})};
 record(s,{type:'production',text:`${r.name}: vật tư${r.inputQuantity?` · Dùng ${r.inputQuantity} ${VILLAGE_RESOURCES[r.input].name}`:''}`,money:-r.money,resource:r.inputQuantity?r.input:r.output,quantity:-r.inputQuantity,cost});return true;
}
export function advanceProduction(s:EconomyCamp,kind:ProductionKind,seconds:number):void{const job=s.economy[kind];if(job&&Number.isFinite(seconds)&&seconds>0)job.remaining=Math.max(0,job.remaining-seconds);}
export function finishProduction(s:EconomyCamp,kind:ProductionKind):boolean{
 const job=s.economy[kind],r=VILLAGE_RECIPES[kind];if(!job||job.remaining>1e-6||inventorySize(s)+reservedProductionSpace(s)>100)return false;
 const quantity=kind==='garden'?(job.quantity??3):r.quantity;
 s.economy.lots.push({id:++s.economy.sequence,resource:r.output,quantity,cost:job.cost,...(r.output==='carrot'||r.output==='fish'?{expiresAt:s.economy.life.seconds+(r.output==='carrot'?240:120)}:{})});delete s.economy[kind];
 record(s,{type:'production',text:`${r.name}: giao ${quantity} ${VILLAGE_RESOURCES[r.output].name} · Lượt ${job.id}`,money:0,resource:r.output,quantity,cost:job.cost});return true;
}
export function gardenBlockReason(s:EconomyCamp):string|undefined{return productionBlockReason(s,'garden');}
export function beginGarden(s:EconomyCamp):boolean{return beginProduction(s,'garden');}
export function advanceGarden(s:EconomyCamp,seconds:number):void{advanceProduction(s,'garden',seconds);}
export function finishGarden(s:EconomyCamp):boolean{return finishProduction(s,'garden');}

function foodOrder(lots:ResourceLot[]):ResourceLot[]{return [...lots].sort((a,b)=>(a.expiresAt??Infinity)-(b.expiresAt??Infinity)||a.id-b.id);}
/** Active village time only. Settle every crossed boundary, including long steps. */
export function advanceVillageLife(s:EconomyCamp,residents:string[],seconds:number):number{
 if(!Number.isFinite(seconds)||seconds<=0)return 0;
 const life=s.economy.life,target=life.seconds+seconds;let days=0;
 while(life.seconds<target){
  const boundary=(Math.floor(life.seconds/120)+1)*120;life.seconds=Math.min(target,boundary);
  for(const lot of [...s.economy.lots])if(lot.expiresAt!==undefined&&lot.expiresAt<=life.seconds){
   life.wasteCost+=lot.cost;record(s,{type:'waste',text:`Ngày ${Math.floor(life.seconds/120)+1}: ${lot.quantity} ${VILLAGE_RESOURCES[lot.resource].name} hết hạn`,money:0,resource:lot.resource,quantity:-lot.quantity,cost:lot.cost});s.economy.lots=s.economy.lots.filter(l=>l!==lot);
  }
  if(life.seconds!==boundary)continue;
  let portions=0;life.hungry=[];
  const unique=[...new Set(residents)],day=Math.floor(boundary/120);
  // Rotate allocation so the same resident does not always miss meals.
  const ordered=unique.slice(day%Math.max(1,unique.length)).concat(unique.slice(0,day%Math.max(1,unique.length)));
  for(const id of ordered){
   if(!portions){const food=foodOrder(s.economy.lots).find(l=>l.resource==='carrot'||l.resource==='fish');
    if(food){const cost=consume(s,food.resource,1);life.mealCost+=cost;portions=food.resource==='fish'?2:1;record(s,{type:'meal',text:`Bữa ăn ngày ${day}`,money:0,resource:food.resource,quantity:-1,cost});}
   }
   if(portions)portions--;else life.hungry.push(id);
  }
  days++;
 }
 return days;
}
export function villageWorkRate(s:EconomyCamp,id:string):number{return s.economy.life.hungry.includes(id)?.75:1;}

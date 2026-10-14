import { VILLAGE_SCENE } from './VillageSceneLayout';
export type CarrierPhase='approach'|'pickup'|'carry'|'place'|'return';
export interface GardenCarrier {jobId:number;kind?:'garden'|'fishing'|'anvil';phase:CarrierPhase;elapsed:number;picked:boolean;placed:boolean}
export const CARRIER_HOME={x:860,y:680};
export const GARDEN_PICKUP={x:440,y:710};
export const VILLAGE_RECEIVING={x:680,y:390};
const approach=[CARRIER_HOME,{x:680,y:740},{x:500,y:740},GARDEN_PICKUP];
const carry=[GARDEN_PICKUP,{x:500,y:740},{x:680,y:740},VILLAGE_RECEIVING];
const returning=[VILLAGE_RECEIVING,{x:680,y:740},CARRIER_HOME];
export function carrierPickup(kind:GardenCarrier['kind']='garden'):{x:number;y:number} {
 if(kind==='fishing')return {x:VILLAGE_SCENE.fishing.x+50,y:VILLAGE_SCENE.fishing.y+VILLAGE_SCENE.fishing.height+10};
 if(kind==='anvil')return {x:VILLAGE_SCENE.forge.x+VILLAGE_SCENE.forge.width+25,y:VILLAGE_SCENE.forge.y+VILLAGE_SCENE.forge.height+30};
 return GARDEN_PICKUP;
}
const route=(phase:CarrierPhase,kind:GardenCarrier['kind']='garden')=>{
 if(phase==='return')return returning;
 if(kind==='garden')return phase==='approach'?approach:carry;
 const pickup=carrierPickup(kind),access=kind==='fishing'?[{x:1000,y:740},{x:1000,y:pickup.y},pickup]:[{x:960,y:740},pickup];
 return phase==='approach'?[CARRIER_HOME,...access]:[pickup,...access.slice(0,-1).reverse(),{x:680,y:740},VILLAGE_RECEIVING];
};
export function carrierDuration(phase:CarrierPhase,kind:GardenCarrier['kind']='garden'):number {
 if(phase==='pickup'||phase==='place')return 1;
 const points=route(phase,kind);return points.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)/85;
}
export function carrierPosition(state?:GardenCarrier):{x:number;y:number;facing:number}{
 if(!state)return {...CARRIER_HOME,facing:1};
 if(state.phase==='pickup')return {...carrierPickup(state.kind),facing:1};
 if(state.phase==='place')return {...VILLAGE_RECEIVING,facing:1};
 const points=route(state.phase,state.kind);let distance=state.elapsed*85;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);if(distance<=length){const t=length?distance/length:1;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,facing:b.x<a.x?-1:1};}distance-=length;}
 return {...points[points.length-1],facing:1};
}
export function parseGardenCarrier(raw:unknown):GardenCarrier|undefined {
 if(!raw||typeof raw!=='object')return undefined;
 const s=raw as GardenCarrier;const kind=s.kind??'garden';if(!['garden','fishing','anvil'].includes(kind))return undefined;
 if(!Number.isInteger(s.jobId)||s.jobId<=0||!['approach','pickup','carry','place','return'].includes(s.phase)||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>carrierDuration(s.phase,kind)+.001)return undefined;
 return {jobId:s.jobId,kind,phase:s.phase,elapsed:s.elapsed,picked:s.phase==='carry'||s.phase==='place'||s.phase==='return'||(s.phase==='pickup'&&s.elapsed>=.375&&s.picked===true),placed:s.phase==='return'||(s.phase==='place'&&s.elapsed>=.5&&s.placed===true)};
}

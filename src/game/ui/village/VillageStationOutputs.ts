import type { CampState } from '../../run/CampState';
import {carrierPickup} from '../../run/VillageCarrier';
/** World cargo is separate from the worker sheet; no inventory effects. */
export function paintStationOutputs(root:HTMLElement,state:CampState):void {
 const world=root.querySelector<HTMLElement>('.village-world');if(!world)return;
 for(const kind of ['fishing','anvil'] as const){
  const job=state.economy[kind],carrier=state.economy.carrier;
  const visible=job?.readyOutput&&!(carrier?.kind===kind&&carrier.jobId===job.id&&carrier.picked&&carrier.phase!=='return');
  let output=world.querySelector<HTMLElement>(`[data-station-output="${kind}"]`);
  if(!visible){output?.remove();continue;}
  if(!output){output=document.createElement('span');output.dataset.stationOutput=kind;const point=carrierPickup(kind);output.style.cssText=`position:absolute;left:${point.x+18}px;top:${point.y-35}px;width:52px;height:36px;z-index:${point.y};pointer-events:none`;output.setAttribute('role','img');output.setAttribute('aria-label',kind==='fishing'?'Giỏ 2 cá chờ lấy':'Kiện 1 đồ chơi chờ lấy');output.innerHTML=kind==='fishing'?'<svg viewBox="0 0 52 36"><path d="M5 15h42l-5 18H10Z" fill="#b98a51" stroke="#65452c" stroke-width="3"/><path d="M12 12q12-12 22 0-10 10-22 0m20 0 10-7v14Z" fill="#89b9c1" stroke="#4b707a" stroke-width="2"/></svg>':'<svg viewBox="0 0 52 36"><rect x="6" y="4" width="40" height="29" fill="#cc9a62" stroke="#65452c" stroke-width="3"/><path d="M24 5h7v27h-7" fill="#f4e5bc"/></svg>';world.append(output);}
 }
}

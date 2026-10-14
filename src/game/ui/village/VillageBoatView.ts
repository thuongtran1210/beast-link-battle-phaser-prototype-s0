import {VillageSpritePlayer} from './VillageSpritePlayer';
import {VILLAGE_ANIMATIONS} from './VillageAnimation';
const players=new WeakMap<HTMLElement,{host:HTMLElement;player:VillageSpritePlayer}>();
export function disposeVillageBoat(root:HTMLElement):void{players.get(root)?.player.dispose();players.delete(root);}
import type { BoatSale } from '../../run/VillageEconomy';

/** Separate prototype boat layer; shared Camp tick owns all movement. */
export function paintVillageBoat(root:HTMLElement,sale?:BoatSale):void {
 const host=root.querySelector<HTMLElement>('.camp-beast[data-beast-id="beast-d"]');if(!host)return;
 let record=players.get(root);if(record&&record.host!==host){disposeVillageBoat(root);record=undefined;}
 let boat=host.querySelector<SVGElement>('.village-sale-boat');
 if(!sale){disposeVillageBoat(root);if(boat){boat.remove();host.style.cssText=host.dataset.boatOriginalStyle??'';delete host.dataset.boatOriginalStyle;delete host.dataset.activity;}return;}
 if(!boat){host.dataset.boatOriginalStyle=host.style.cssText;boat=document.createElementNS('http://www.w3.org/2000/svg','svg');boat.classList.add('village-sale-boat');boat.setAttribute('viewBox','0 0 160 80');boat.style.cssText='position:absolute;left:-34px;top:66px;width:160px;height:80px;pointer-events:none';boat.innerHTML='<path d="M8 32Q80 53 152 32L128 66H32Z" fill="#98643d" stroke="#513820" stroke-width="4"/><rect x="108" y="15" width="25" height="22" fill="#d4a573" stroke="#513820" stroke-width="3"/>';host.append(boat);}
 if(!record){const image=host.querySelector<HTMLImageElement>('img');if(image){record={host,player:new VillageSpritePlayer(host,image,VILLAGE_ANIMATIONS['beast-d']??{})};players.set(root,record);}}record?.player.play('boat-row');record?.player.seek(30-sale.remaining);
 const progress=1-sale.remaining/30,t=progress<.5?progress*2:(1-progress)*2;
 host.style.left=`${920+t*400}px`;host.style.top=`${790-t*120}px`;host.style.zIndex='900';host.style.transition='none';host.dataset.activity=`Starcaller chèo xuồng đi bán · ${Math.ceil(sale.remaining)}s`;
}

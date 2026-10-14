import { carrierPosition, VILLAGE_RECEIVING, type GardenCarrier } from '../../run/VillageCarrier';
import { VILLAGE_ANIMATIONS } from './VillageAnimation';
import { VillageSpritePlayer } from './VillageSpritePlayer';
import type { VillageClipId } from './VillagePresentationCatalog';
/** Shares the village tick; no extra timer/RAF or inventory callbacks. */
export class VillageCarrierView {
 private host?:HTMLElement;private player?:VillageSpritePlayer;
 constructor(private readonly root:HTMLElement){}
 rebind():void{this.player?.dispose();this.player=undefined;this.host=undefined;}
 paint(carrier?:Readonly<GardenCarrier>):void {
  const host=this.root.querySelector<HTMLElement>('.camp-beast[data-beast-id="beast-f"]');if(!host)return;
  if(host!==this.host){this.rebind();this.host=host;const image=host.querySelector<HTMLImageElement>('img');if(image)this.player=new VillageSpritePlayer(host,image,VILLAGE_ANIMATIONS['beast-f']??{});}
  const point=carrierPosition(carrier);host.style.left=`${point.x-46}px`;host.style.top=`${point.y-100}px`;host.style.zIndex=String(Math.round(point.y));host.style.transition='none';
  const clip:VillageClipId=carrier?.phase==='pickup'?'pickup':carrier?.phase==='carry'?'loaded-walk':carrier?.phase==='place'?'finish':carrier?'walk':'idle';
  this.player?.play(clip,point.facing);if(carrier)this.player?.seek(carrier.elapsed);
  const labels={approach:'Tới trạm lấy hàng',pickup:'Nhặt kiện',carry:'Mang hàng về điểm nhận',place:'Đặt hàng vào điểm nhận',return:'Quay về nghỉ'};
  host.dataset.activity=carrier?labels[carrier.phase]:'Chờ hàng tại trạm';host.dataset.carrierPhase=carrier?.phase??'idle';
  const receiving=this.root.querySelector<HTMLElement>('.village-receiving');
  if(receiving){receiving.dataset.cargo=carrier?.phase==='place'&&carrier.placed?'yes':'no';receiving.setAttribute('aria-label',carrier?.phase==='place'&&carrier.placed?'Điểm nhận · Kiện đang chờ nhập Kho':'Điểm nhận hàng cạnh nhà chung');}
 }
 dispose():void{this.rebind();}
}
export function receivingPoint():HTMLButtonElement {
 const element=document.createElement('button');element.className='village-receiving';
 element.style.cssText=`position:absolute;left:${VILLAGE_RECEIVING.x-65}px;top:${VILLAGE_RECEIVING.y-50}px;width:110px;height:60px;border:0;background:transparent;z-index:380`;
 element.innerHTML='<svg viewBox="0 0 110 60" aria-hidden="true"><path d="M8 22h94v15H8zM15 35v22m80-22v22" fill="#bd8a50" stroke="#62472d" stroke-width="4"/><rect class="receiving-parcel" x="36" y="3" width="44" height="28" fill="#d2a06a" stroke="#62472d" stroke-width="3"/></svg>';
 return element;
}

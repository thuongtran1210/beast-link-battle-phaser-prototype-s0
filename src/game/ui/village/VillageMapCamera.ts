import { villageCloseScale, villageOverviewScale, villageClampCamera } from './VillageCameraLayout';
/** A single world transform keeps map, props and residents registered. */
export function mountVillageCamera(viewport:HTMLElement,world:HTMLElement):()=>void {
  let x=0,y=0,scale=1;
  let drag:{id:number;startX:number;startY:number;lastX:number;lastY:number;moved:boolean}|undefined;
  let suppressClick=false;
  let overviewMode=false;
  const apply=()=>{
    const w=viewport.clientWidth,h=viewport.clientHeight;
    ({x,y}=villageClampCamera(w,h,scale,x,y));
    world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    viewport.dispatchEvent(new CustomEvent('village-camera-transform',{detail:{x,y,scale}}));
  };
  let initialized=false;
  const resize=()=>{
    const center={x:(viewport.clientWidth/2-x)/scale,y:(viewport.clientHeight/2-y)/scale};
    scale=overviewMode?villageOverviewScale(viewport.clientWidth,viewport.clientHeight):villageCloseScale(viewport.clientWidth,viewport.clientHeight);
    if(!initialized){x=viewport.clientWidth/2-768*scale;y=viewport.clientHeight/2-560*scale;initialized=true;}
    else {x=viewport.clientWidth/2-center.x*scale;y=viewport.clientHeight/2-center.y*scale;}
    apply();
  };
  const down=(e:PointerEvent)=>{if(e.button!==0)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};suppressClick=false;};
  const move=(e:PointerEvent)=>{
    if(!drag||drag.id!==e.pointerId)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7){drag.moved=true;viewport.setPointerCapture(e.pointerId);}
    if(drag.moved){x+=e.clientX-drag.lastX;y+=e.clientY-drag.lastY;apply();}
    drag.lastX=e.clientX;drag.lastY=e.clientY;
  };
  const up=(e:PointerEvent)=>{if(drag?.id===e.pointerId){suppressClick=drag.moved;drag=undefined;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);}};
  const click=(e:MouseEvent)=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}};
  const overview=()=>{
    overviewMode=!overviewMode;
    scale=overviewMode?villageOverviewScale(viewport.clientWidth,viewport.clientHeight):villageCloseScale(viewport.clientWidth,viewport.clientHeight);
    x=viewport.clientWidth/2-768*scale;y=viewport.clientHeight/2-560*scale;apply();
    viewport.dispatchEvent(new CustomEvent('village-camera-state',{detail:{overview:overviewMode}}));
  };
  const zoom=(e:Event)=>{
    const delta=(e as CustomEvent<number>).detail;
    if(delta!==1 && delta!==-1)return;
    const cx=(viewport.clientWidth/2-x)/scale,cy=(viewport.clientHeight/2-y)/scale;
    scale=Math.max(villageCloseScale(viewport.clientWidth,viewport.clientHeight),Math.min(2.5,scale*(delta>0?1.2:1/1.2)));
    overviewMode=false;x=viewport.clientWidth/2-cx*scale;y=viewport.clientHeight/2-cy*scale;apply();
    viewport.dispatchEvent(new CustomEvent('village-camera-state',{detail:{overview:false}}));
  };
  const focus=(e:Event)=>{
    const point=(e as CustomEvent<{x:number;y:number}>).detail;
    if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
    overviewMode=false;scale=villageCloseScale(viewport.clientWidth,viewport.clientHeight);
    x=viewport.clientWidth/2-point.x*scale;y=viewport.clientHeight/2-point.y*scale;apply();
    viewport.dispatchEvent(new CustomEvent('village-camera-state',{detail:{overview:false}}));
  };
  viewport.addEventListener('village-overview',overview);
  viewport.addEventListener('village-zoom',zoom);viewport.addEventListener('village-focus',focus);
  viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointermove',move);
  viewport.addEventListener('pointerup',up);viewport.addEventListener('pointercancel',up);viewport.addEventListener('click',click,true);
  const observer=new ResizeObserver(resize);observer.observe(viewport);resize();
  return ()=>{observer.disconnect();viewport.removeEventListener('village-zoom',zoom);viewport.removeEventListener('village-focus',focus);viewport.removeEventListener('village-overview',overview);viewport.removeEventListener('pointerdown',down);viewport.removeEventListener('pointermove',move);viewport.removeEventListener('pointerup',up);viewport.removeEventListener('pointercancel',up);viewport.removeEventListener('click',click,true);};
}

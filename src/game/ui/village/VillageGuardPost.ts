import { VILLAGE_SCENE } from '../../run/VillageSceneLayout';

/** Separate scene prop; click reports the current job without adding a new loop. */
export function guardPost(onInspect:()=>void):HTMLButtonElement {
 const station=VILLAGE_SCENE.guardPost,element=document.createElement('button');
 element.className='village-guard-post';element.setAttribute('aria-label','Trạm canh · Tuyến tuần tra Snowguard');
 element.style.cssText=`position:absolute;left:${station.x}px;top:${station.y}px;width:${station.width}px;height:${station.height}px;z-index:${station.y+station.height};border:0;padding:0;background:transparent;cursor:pointer`;
 element.innerHTML='<img src="/assets/ui/camp/guard-post-prototype.svg" alt="" draggable="false" style="width:100%;height:100%;pointer-events:none">';
 element.onclick=onInspect;return element;
}

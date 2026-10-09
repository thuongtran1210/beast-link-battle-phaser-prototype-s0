import { villageProfession } from '../run/VillageCatalog';
import { mountVillageCamera } from './village/VillageMapCamera';
import { CampActivityController } from './village/CampActivityController';
import { CAMP_DECOR, craftCampDecor, loadCamp, saveCamp } from '../run/CampState';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName, type BeastId } from './icons/UnitIconRegistry';
const props:Record<string,string> = {
  bath:'<svg viewBox="0 0 120 90"><ellipse cx="60" cy="34" rx="49" ry="18" fill="#aad1cf" stroke="#293c30" stroke-width="5"/><path d="M11 34 Q15 77 60 77 Q105 77 109 34" fill="#e3d6b8" stroke="#293c30" stroke-width="5"/><circle cx="42" cy="25" r="7" fill="white"/><circle cx="78" cy="20" r="5" fill="white"/></svg>',
  carrot:'<svg viewBox="0 0 120 90"><path d="M25 30 L93 48 L28 79 Z" fill="#e9a15e" stroke="#293c30" stroke-width="5"/><path d="M28 38 L9 14 M28 38 L40 9" stroke="#769953" stroke-width="10" stroke-linecap="round"/><path d="M47 44 L44 56 M63 47 L60 58" stroke="#ae643c" stroke-width="4"/></svg>',
  anvil:'<svg viewBox="0 0 120 90"><path d="M10 21 H103 L89 40 H72 V61 H91 V76 H32 V61 H49 V40 H26 Z" fill="#8e9990" stroke="#293c30" stroke-width="5"/><path d="M83 9 L107 29" stroke="#b88f5b" stroke-width="9"/><path d="M70 6 L85 0 L99 13 L84 25 Z" fill="#55665d" stroke="#293c30" stroke-width="4"/></svg>',
};
// ViewBox windows preserve the owner's transparent atlas without raster edits.
const furnitureWindows:Record<string,string>={bath:'20 130 620 550',carrot:'630 210 610 490',anvil:'220 690 910 530'};
for(const [id,viewBox] of Object.entries(furnitureWindows)) {
  const [x,y,width,height]=viewBox.split(' ');
  // The SVG viewport can have letterbox space outside its viewBox. Clip the
  // image itself so neighboring atlas items cannot appear in that space.
  props[id]=`<svg class="camp-furniture" viewBox="${viewBox}" aria-hidden="true"><defs><clipPath id="camp-furniture-${id}" clipPathUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="/assets/ui/camp/owner-furniture-v1.png" width="1254" height="1254" clip-path="url(#camp-furniture-${id})"/></svg>`;
}

props.anvil='<svg class="camp-furniture" viewBox="35 230 1202 849" aria-hidden="true"><image href="/assets/ui/camp/village-owner-v1/forge.png" width="1254" height="1254"/></svg>';
const gardenProp='<svg viewBox="46 284 1160 759" aria-hidden="true"><image href="/assets/ui/camp/village-owner-v1/garden.png" width="1254" height="1254"/></svg>';
const residentPositions=[[42,29],[62,40],[22,36],[74,27],[36,51],[56,55],[13,52],[80,53],[47,43],[66,61]];
export function showCamp(back:()=>void):void {
  const state = loadCamp(); saveCamp(state);
  const root = document.createElement('section'); root.className='camp-view village-camp'; let slot=0;
  root.innerHTML='<header class="deck-header"><button class="deck-back" aria-label="Back to menu">←</button><div><h1>Làng Thú</h1><p>Mỗi người một nghề, cả làng một câu chuyện</p></div><strong class="camp-wood"></strong><button class="village-overview-button" aria-label="Xem toàn cảnh làng">Toàn cảnh</button></header><div class="camp-ground village-viewport"><div class="village-world"></div></div><div class="camp-status" role="status" aria-live="polite">Kéo để khám phá làng · Chạm thú để xem công việc</div><div class="village-zoom-controls" aria-label="Phóng bản đồ"><button class="village-zoom-in" aria-label="Phóng to">+</button><button class="village-zoom-out" aria-label="Thu nhỏ">−</button></div><div class="camp-workshop" hidden></div><nav class="village-navigation" aria-label="Hoạt động trong làng"><button class="village-build" aria-expanded="false">Xây dựng</button><button class="village-residents">Cư dân</button><button class="camp-diary-button">Nhật ký</button></nav>';
  const status = root.querySelector('.camp-status')!;
  document.getElementById('game-shell')!.append(root);
  const stopCamera=mountVillageCamera(root.querySelector('.village-viewport')!,root.querySelector('.village-world')!);
  let activities:CampActivityController|undefined;
  const render = () => {
    activities?.dispose();
    activities=new CampActivityController(kind=>{
      const decor=CAMP_DECOR.find(d=>d.id===kind);
      if(decor && !state.diary.includes(decor.meme)) {state.diary.push(decor.meme);saveCamp(state);}
    });
    root.querySelector('.camp-wood')!.textContent=`WOOD ${state.wood}`;
    const ground = root.querySelector('.village-world')!; ground.replaceChildren();
    for (let i=0;i<3;i++) {
      const station = document.createElement('button'); station.className='camp-station'; station.setAttribute('aria-pressed',String(i===slot));
      station.setAttribute('aria-label',`Vị trí ${i+1}${state.slots[i]?` · ${CAMP_DECOR.find(d=>d.id===state.slots[i])?.name}`:''}`);
      station.dataset.decor=state.slots[i]??'empty';
      station.innerHTML=`<span>Vị trí ${i+1}</span>${state.slots[i] ? props[state.slots[i]!] : '<i>+</i>'}`;
      station.onclick=()=>{slot=i; render();openWorkshop(true);}; ground.append(station);
    }
    const garden=document.createElement('button');garden.className='village-garden';garden.setAttribute('aria-label','Vườn cà rốt');garden.innerHTML=gardenProp;
    garden.onclick=()=>{status.textContent='Vườn chung · Windstrider tự chăm rau khi đã gia nhập làng.';};ground.append(garden);
    const fishing=document.createElement('button');fishing.className='village-fishing';fishing.setAttribute('aria-label','Bến câu cá');fishing.innerHTML='<span>Bến cá</span>';
    fishing.onclick=()=>{status.textContent='Bến cá chung · Shadowclaw tự tới câu cá khi đã gia nhập làng.';};ground.append(fishing);
    if (!state.residents.length) { const empty=document.createElement('p'); empty.className='camp-empty'; empty.textContent='Recruit Beasts in a Run to bring them home.'; ground.append(empty); }
    state.residents.slice(0,10).forEach((id,index)=>{
      const beast=document.createElement('button'); beast.className='camp-beast';
      const homes:Record<string,number[]>={'beast-e':[67,60],'beast-c':[34,58],'beast-b':[70,32]};
      const [x,y]=homes[id]??residentPositions[index];
      beast.style.left=`${x}%`; beast.style.top=`${y}%`; beast.style.zIndex=String(Math.round(y)); beast.style.animationDelay=`-${index*1.7}s`;
      beast.dataset.beastId=id;
      beast.setAttribute('aria-label',`Interact with ${beastDisplayName(id)}`);
      beast.innerHTML=`<img src="${BATTLE_CHARACTER_ART[id as BeastId].base}" alt=""><small>${beastDisplayName(id)}</small>`;
      if(id==='beast-c') beast.insertAdjacentHTML('beforeend','<span class="village-water-tool" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M10 18 Q-2 18 4 35" fill="none" stroke="#3b4235" stroke-width="5"/><path d="M12 15 H40 V44 H12 Z M40 25 L64 16 L68 23 L40 36" fill="#81bca3" stroke="#3b4235" stroke-width="3"/><path d="M64 30 L70 43 M70 28 L77 40" stroke="#73bed0" stroke-width="3"/></svg></span>');
      if(id==='beast-b') beast.insertAdjacentHTML('beforeend','<span class="village-rod" aria-hidden="true"></span>');
      const favorite=CAMP_DECOR.find(d=>d.favorite===id && state.slots.includes(d.id));
      if(id==='beast-c') activities!.add(beast,garden,'garden',x,y,{x:28.6,y:49.8});
      else if(id==='beast-b') activities!.add(beast,fishing,'fishing',x,y,{x:79,y:17});
      else if(favorite) activities!.add(beast,ground.children[state.slots.indexOf(favorite.id)] as HTMLElement,favorite.id,x,y,favorite.id==='anvil'?{x:71.5,y:57}:undefined);
      beast.onclick=()=>{
        status.textContent=`${beastDisplayName(id)}: ${beast.dataset.activity??'Đang nghỉ'} · ${favorite?.meme??villageProfession(id)?.name??'Cư dân'}`;
      };
      ground.append(beast);
    });
    const workshop=root.querySelector('.camp-workshop')!; workshop.replaceChildren();
    const heading=document.createElement('strong');heading.className='village-build-heading';heading.textContent=`Trang trí · Vị trí ${slot+1}`;workshop.append(heading);
    const closeWorkshop=document.createElement('button');closeWorkshop.className='village-build-close';closeWorkshop.textContent='Đóng';closeWorkshop.onclick=()=>openWorkshop(false);workshop.append(closeWorkshop);
    CAMP_DECOR.forEach(decor=>{
      const button=document.createElement('button'); const owned=state.crafted.includes(decor.id);
      button.innerHTML=`<strong>${decor.name}</strong><span>${owned?'Place · owned':`Craft · ${decor.cost} wood`}</span>`;
      button.disabled=!owned && state.wood<decor.cost;
      button.onclick=()=>{if(craftCampDecor(state,decor.id,slot)){saveCamp(state); status.textContent=`${decor.name} placed in spot ${slot+1} · tap its favorite Beast`; render();}};
      workshop.append(button);
    });
    const clear=document.createElement('button'); clear.textContent=`Clear spot ${slot+1}`;
    clear.onclick=()=>{state.slots[slot]=null;saveCamp(state);render();};workshop.append(clear);
    activities.start();
  };
  const openWorkshop=(open:boolean)=>{root.querySelector<HTMLElement>('.camp-workshop')!.hidden=!open;root.querySelector('.village-build')!.setAttribute('aria-expanded',String(open));};
  const viewport=root.querySelector<HTMLElement>('.village-viewport')!;
  viewport.addEventListener('village-camera-state',e=>{const overview=(e as CustomEvent<{overview:boolean}>).detail.overview;const button=root.querySelector('.village-overview-button')!;button.textContent=overview?'Cận cảnh':'Toàn cảnh';button.setAttribute('aria-pressed',String(overview));});
  root.querySelector<HTMLButtonElement>('.village-zoom-in')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:1}));
  root.querySelector<HTMLButtonElement>('.village-zoom-out')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:-1}));
  root.querySelector<HTMLButtonElement>('.village-build')!.onclick=()=>openWorkshop(root.querySelector<HTMLElement>('.camp-workshop')!.hidden);
  root.querySelector<HTMLButtonElement>('.village-overview-button')!.onclick=()=>root.querySelector('.village-viewport')!.dispatchEvent(new Event('village-overview'));
  root.querySelector<HTMLButtonElement>('.village-residents')!.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.className='game-dialog';
    const heading=document.createElement('h2');heading.textContent=`Cư dân · ${state.residents.length}`;dialog.append(heading);
    for(const id of state.residents){
      const line=document.createElement('button');line.textContent=`${beastDisplayName(id)} · ${villageProfession(id)?.name??'Cư dân'} →`;
      line.onclick=()=>{const beast=[...root.querySelectorAll<HTMLElement>('.camp-beast')].find(b=>b.dataset.beastId===id);if(beast){viewport.dispatchEvent(new CustomEvent('village-focus',{detail:{x:parseFloat(beast.style.left)*1536/100+46,y:parseFloat(beast.style.top)*1024/100+54}}));beast.focus({preventScroll:true});status.textContent=`${beastDisplayName(id)} · ${beast.dataset.activity??'Đang nghỉ'}`;}dialog.close();};dialog.append(line);
    }
    if(!state.residents.length){const line=document.createElement('p');line.textContent='Tuyển thú trong chuyến phiêu lưu để đưa họ về làng.';dialog.append(line);}
    const close=document.createElement('button');close.textContent='Đóng';close.onclick=()=>dialog.close();dialog.append(close);root.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
  };
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick=()=>{activities?.dispose();stopCamera();root.remove();back();};
  root.querySelector<HTMLButtonElement>('.camp-diary-button')!.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.className='game-dialog';
    const heading=document.createElement('h2');heading.textContent='Nhật ký làng';dialog.append(heading);
    for(const line of state.diary.slice(-12).reverse()){const p=document.createElement('p');p.textContent=line.replace(/beast-[a-j]/g,id=>beastDisplayName(id));dialog.append(p);}
    if(!state.diary.length){const p=document.createElement('p');p.textContent='Your Beasts will write here when they arrive.';dialog.append(p);}
    const close=document.createElement('button');close.textContent='Close';close.onclick=()=>dialog.close();dialog.append(close);root.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
  };
  render();
}

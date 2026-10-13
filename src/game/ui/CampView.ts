import { mountVillageRiverLayers } from './village/VillageRiverLayers';
import { mountVillageCloudShader } from './village/VillageCloudShader';
import { villageProfession } from '../run/VillageCatalog';
import { VILLAGE_SCENE, villageWorkPercent } from '../run/VillageSceneLayout';
import { villageJourney } from '../run/VillageJourney';
import { forgeGoal, commitCampDecor } from '../run/VillageGoal';
import { showVillageGoal } from './VillageGoalView';
import { showFirstVillage } from './FirstJourneyView';
import { transitionScreen } from './SceneTransition';
import { showVillageInventory } from './VillageInventoryView';
import { showVillageProduction } from './VillageProductionView';
import { showVillageGarden } from './VillageGardenView';
import { advanceVillageLife, villageWorkRate, beginProduction, advanceProduction, finishProduction, productionBlockReason, isProductionKind, VILLAGE_RECIPES } from '../run/VillageEconomy';
import { parseCamp } from '../run/CampState';
import { recordVillageStory } from '../run/CampState';
import { mountVillageCamera } from './village/VillageMapCamera';
import { CampActivityController } from './village/CampActivityController';
import { CAMP_DECOR, loadCamp, saveCamp } from '../run/CampState';
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
const residentPositions=[[36,29],[52,40],[22,36],[60,27],[36,51],[56,55],[13,52],[60,73],[47,43],[54,68]];
export function showCamp(back:()=>void,explore?:()=>void):void {
  const state = loadCamp();
  // Current editor still uses legacy slots; retain authored forge ownership and
  // expose its saved placement through the same visible controls.
  if(state.placements.forge&&state.crafted.includes('anvil')&&!state.slots.includes('anvil')){
    const empty=state.slots.indexOf(null);
    if(empty>=0){state.slots[empty]='anvil';delete state.placements.forge;}
  }
  saveCamp(state);
  const root = document.createElement('section'); root.className='camp-view village-camp'; let slot=0;
  root.innerHTML='<header class="deck-header"><button class="deck-back" aria-label="Back to menu">←</button><div><h1>Làng Thú</h1><p>Mỗi người một nghề, cả làng một câu chuyện</p></div><strong class="camp-wood"></strong><button class="village-overview-button" aria-label="Xem toàn cảnh làng">Toàn cảnh</button></header><div class="camp-ground village-viewport"><div class="village-world"></div></div><div class="camp-status" role="status" aria-live="polite">Kéo để khám phá làng · Chạm thú để xem công việc</div><div class="village-zoom-controls" aria-label="Phóng bản đồ"><button class="village-zoom-in" aria-label="Phóng to">+</button><button class="village-zoom-out" aria-label="Thu nhỏ">−</button></div><div class="camp-workshop" hidden></div><nav class="village-navigation" aria-label="Hoạt động trong làng"><button class="village-build" aria-expanded="false">Xây dựng</button><button class="village-residents">Cư dân</button><button class="camp-diary-button">Nhật ký</button></nav>';
  const status = root.querySelector('.camp-status')!;
  const icon=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  const overviewIcon=icon('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>');
  root.querySelector('.village-overview-button')!.innerHTML=overviewIcon;
  const navIcons=[icon('<path d="m4 20 7-7m-3-6 5-4 7 7-4 5-8-8Z"/>'),icon('<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v2"/>'),icon('<path d="M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h4"/>')];
  root.querySelectorAll('.village-navigation button').forEach((button,index)=>{const label=button.textContent;button.innerHTML=`${navIcons[index]}<span>${label}</span>`;});
  const inventoryButton=document.createElement('button');inventoryButton.className='village-inventory';inventoryButton.innerHTML=`${icon('<path d="M3 8h18v13H3zM2 3h20v5H2zm7 9h6"/>')}<span>Kho</span>`;inventoryButton.setAttribute('aria-label','Kho và thu chi');root.querySelector('.village-navigation')!.append(inventoryButton);
  inventoryButton.onclick=()=>showVillageInventory(root,state,()=>render());
  let statusTimer=window.setTimeout(()=>status.classList.add('village-status-hidden'),5000);
  const statusObserver=new MutationObserver(()=>{status.classList.remove('village-status-hidden');window.clearTimeout(statusTimer);statusTimer=window.setTimeout(()=>status.classList.add('village-status-hidden'),5000);});
  statusObserver.observe(status,{childList:true,characterData:true,subtree:true});
  document.getElementById('game-shell')!.append(root);
  const stopClouds=mountVillageCloudShader(root.querySelector('.village-viewport')!);
  const stopCamera=mountVillageCamera(root.querySelector('.village-viewport')!,root.querySelector('.village-world')!);
  const stopRiver=mountVillageRiverLayers(root.querySelector('.village-world')!);
  let activities:CampActivityController|undefined;
  let productionSaveClock=0;
  const goalButton=document.createElement('button');goalButton.className='village-goal-button';
  root.querySelector('.deck-header')!.append(goalButton);
  const updateBalance=()=>{root.querySelector('.camp-wood')!.textContent=`Gỗ ${state.wood} · ${state.economy.wallet.toLocaleString('vi-VN',{maximumFractionDigits:2})} Đồng`;
    goalButton.textContent=state.trackedGoal==='forge'?(forgeGoal(state).complete?'Xưởng đã hoạt động':'Mục tiêu: Mở xưởng'):'Mục tiêu';};
  const render = () => {
    activities?.rebind();
    activities??=new CampActivityController(kind=>{
      if(isProductionKind(kind)){
        const candidate=parseCamp(state);
        if(!finishProduction(candidate,kind)||!saveCamp(candidate)){status.textContent=`${VILLAGE_RECIPES[kind].name} chờ giao · Kiểm tra chỗ kho hoặc lưu game`;return false;}
        Object.assign(state,candidate);updateBalance();status.textContent=`${VILLAGE_RECIPES[kind].name} vừa giao +${VILLAGE_RECIPES[kind].quantity} ${VILLAGE_RECIPES[kind].output==='fish'?'cá':kind==='anvil'?'đồ chơi':'cà rốt'} vào kho`;
      }
      const story=kind==='anvil'?'forge.toy-duck':kind==='garden'?'garden.carrot-bite':kind==='fishing'?'fishing.old-boot':undefined;
      if(story&&recordVillageStory(state,story))saveCamp(state);
      const decor=CAMP_DECOR.find(d=>d.id===kind);
      if(decor && !state.diary.includes(decor.meme)) {state.diary.push(decor.meme);saveCamp(state);}
    },{
      begin:kind=>{
        if(!isProductionKind(kind))return 8;
        const candidate=parseCamp(state),station=root.querySelector<HTMLElement>(kind==='garden'?'.village-garden':kind==='fishing'?'.village-fishing':'.camp-station[data-decor="anvil"]');
        const reason=productionBlockReason(state,kind);
        if(!beginProduction(candidate,kind)||!saveCamp(candidate)){if(station)station.dataset.blockReason=reason??'Chưa lưu được vật tư';return false;}
        if(station)delete station.dataset.blockReason;Object.assign(state,candidate);updateBalance();return state.economy[kind]!.remaining;
      },
      advance:(kind,seconds)=>{if(isProductionKind(kind))advanceProduction(state,kind,seconds);},
      rate:id=>villageWorkRate(state,id),
    },seconds=>{
      const days=advanceVillageLife(state,state.residents,seconds);
      if(days){updateBalance();status.textContent=`Ngày ${Math.floor(state.economy.life.seconds/120)+1} · ${state.economy.life.hungry.length} cư dân thiếu ăn · Mở Kho để bổ sung thực phẩm`;}
      productionSaveClock+=seconds;
      if(productionSaveClock>=1){productionSaveClock=0;if(!saveCamp(state))status.textContent='Sinh hoạt làng chưa lưu được';}
      for(const beast of root.querySelectorAll<HTMLElement>('[data-beast-id]')){
        const label=state.economy.life.hungry.includes(beast.dataset.beastId!)?'Thiếu ăn · Làm việc chậm 25%':'Đủ bữa';
        if(beast.dataset.food!==label){beast.dataset.food=label;beast.title=label;}
      }
    });
    updateBalance();
    const ground = root.querySelector('.village-world')!; ground.replaceChildren();
    const house=document.createElement('button');house.className='village-house';house.setAttribute('aria-label','Nhà chung · Hành trình về quê');house.innerHTML='<img src="/assets/ui/camp/river-owner-v1/house.png" alt="" draggable="false">';ground.append(house);
    house.onclick=()=>{
      const journey=villageJourney(state),dialog=document.createElement('dialog');dialog.className='game-dialog village-diary-dialog';
      const header=document.createElement('header');header.className='diary-panel-header';const title=document.createElement('h2');title.textContent='Hành trình về quê';header.append(title);
      const close=document.createElement('button');close.className='diary-panel-close';close.textContent='×';close.setAttribute('aria-label','Đóng hành trình');close.onclick=()=>dialog.close();header.append(close);dialog.append(header);
      const subtitle=document.createElement('p');subtitle.className='diary-panel-hint';subtitle.textContent=`${journey.completed}/${journey.steps.length} dấu mốc · Cùng bạn bè gây dựng quê nhà`;dialog.append(subtitle);
      const list=document.createElement('div');list.className='diary-event-list';
      for(const step of journey.steps){const card=document.createElement('article');card.className='journey-step';const heading=document.createElement('strong');heading.textContent=`${step.done?'✓':'○'} ${step.title}`;const description=document.createElement('p');description.textContent=step.description;card.append(heading,description);list.append(card);}
      const note=document.createElement('p');note.textContent='Chạm vườn, bến cá hoặc xưởng để xem nguyên liệu và tiến độ. Mở Kho để mua bán và xem thu chi. Cư dân ăn tự động mỗi ngày.';list.append(note);dialog.append(list);root.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
    };
    house.style.left=`${VILLAGE_SCENE.house.x}px`;house.style.top=`${VILLAGE_SCENE.house.y}px`;house.style.width=`${VILLAGE_SCENE.house.width}px`;
    for (let i=0;i<3;i++) {
      const station = document.createElement('button'); station.className='camp-station'; station.setAttribute('aria-pressed',String(i===slot));
      station.setAttribute('aria-label',`Vị trí ${i+1}${state.slots[i]?` · ${CAMP_DECOR.find(d=>d.id===state.slots[i])?.name}`:''}`);
      station.dataset.decor=state.slots[i]??'empty';
      station.dataset.slot=String(i);
      if(station.dataset.decor==='anvil'){const p=VILLAGE_SCENE.forge;Object.assign(station.style,{left:`${p.x}px`,top:`${p.y}px`,width:`${p.width}px`,height:`${p.height}px`});}
      station.innerHTML=`<span>Vị trí ${i+1}</span>${state.slots[i] ? props[state.slots[i]!] : '<i>+</i>'}`;
      station.onclick=()=>{if(station.dataset.decor==='anvil'){showVillageProduction(root,state,'anvil',()=>{slot=i;render();openWorkshop(true);});return;}slot=i; render();openWorkshop(true);}; ground.append(station);
    }
    const garden=document.createElement('button');garden.className='village-garden';garden.setAttribute('aria-label','Vườn cà rốt');garden.innerHTML=gardenProp;
    garden.onclick=()=>showVillageGarden(root,state);ground.append(garden);
    Object.assign(garden.style,{left:`${VILLAGE_SCENE.garden.x}px`,top:`${VILLAGE_SCENE.garden.y}px`,width:`${VILLAGE_SCENE.garden.width}px`,height:`${VILLAGE_SCENE.garden.height}px`});
    const fishing=document.createElement('button');fishing.className='village-fishing';fishing.setAttribute('aria-label','Bến câu cá');fishing.innerHTML='<svg viewBox="45 203 1198 878" aria-hidden="true"><image href="/assets/ui/camp/village-owner-v1/dock.png" width="1254" height="1254"/></svg><span>Bến cá</span>';
    fishing.onclick=()=>showVillageProduction(root,state,'fishing');ground.append(fishing);
    Object.assign(fishing.style,{left:`${VILLAGE_SCENE.fishing.x}px`,top:`${VILLAGE_SCENE.fishing.y}px`,width:`${VILLAGE_SCENE.fishing.width}px`,height:`${VILLAGE_SCENE.fishing.height}px`});
    if (!state.residents.length) { const empty=document.createElement('p'); empty.className='camp-empty'; empty.textContent='Recruit Beasts in a Run to bring them home.'; ground.append(empty); }
    state.residents.slice(0,10).forEach((id,index)=>{
      const beast=document.createElement('button'); beast.className='camp-beast';
      const homes:Record<string,number[]>={'beast-e':[39,48],'beast-c':[34,58],'beast-b':[62,70]};
      const [x,y]=homes[id]??residentPositions[index];
      beast.style.left=`${x}%`; beast.style.top=`${y}%`; beast.style.zIndex=String(Math.round(y)); beast.style.animationDelay=`-${index*1.7}s`;
      beast.dataset.beastId=id;
      beast.setAttribute('aria-label',`Interact with ${beastDisplayName(id)}`);
      beast.innerHTML=`<img src="${BATTLE_CHARACTER_ART[id as BeastId].base}" alt=""><small>${beastDisplayName(id)}</small>`;
      if(id==='beast-c') beast.insertAdjacentHTML('beforeend','<span class="village-water-tool" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M10 18 Q-2 18 4 35" fill="none" stroke="#3b4235" stroke-width="5"/><path d="M12 15 H40 V44 H12 Z M40 25 L64 16 L68 23 L40 36" fill="#81bca3" stroke="#3b4235" stroke-width="3"/><path d="M64 30 L70 43 M70 28 L77 40" stroke="#73bed0" stroke-width="3"/></svg></span>');
      if(id==='beast-b') beast.insertAdjacentHTML('beforeend','<span class="village-rod" aria-hidden="true"></span>');
      const favorite=CAMP_DECOR.find(d=>d.favorite===id && state.slots.includes(d.id));
      if(id==='beast-c') activities!.add(beast,garden,'garden',x,y,villageWorkPercent('garden'));
      else if(id==='beast-b') activities!.add(beast,fishing,'fishing',x,y,villageWorkPercent('fishing'));
      else if(favorite) activities!.add(beast,ground.querySelector<HTMLElement>(`.camp-station[data-decor="${favorite.id}"]`)!,favorite.id,x,y,favorite.id==='anvil'?villageWorkPercent('forge'):undefined);
      beast.onclick=()=>{
        status.textContent=`${beastDisplayName(id)}: ${beast.dataset.activity??'Đang nghỉ'} · ${favorite?.meme??villageProfession(id)?.name??'Cư dân'}`;
      };
      ground.append(beast);
    });
    const workshop=root.querySelector('.camp-workshop')!; workshop.replaceChildren();
    const names:Record<string,string>={bath:'Bồn tắm vịt',carrot:'Cà rốt khổng lồ',anvil:'Xưởng đồ chơi'};
    const header=document.createElement('header');header.className='build-panel-header';
    const heading=document.createElement('strong');heading.className='village-build-heading';heading.textContent='Xây dựng';header.append(heading);
    const balance=document.createElement('span');balance.className='build-balance';balance.textContent=`Gỗ ${state.wood}`;header.append(balance);
    const closeWorkshop=document.createElement('button');closeWorkshop.className='village-build-close';closeWorkshop.textContent='×';closeWorkshop.setAttribute('aria-label','Đóng xây dựng');closeWorkshop.onclick=()=>openWorkshop(false);header.append(closeWorkshop);workshop.append(header);
    const slots=document.createElement('div');slots.className='build-slot-tabs';slots.setAttribute('aria-label','Chọn vị trí trang trí');
    state.slots.forEach((item,index)=>{const tab=document.createElement('button');tab.textContent=`${index+1} · ${item?'Đã đặt':'Trống'}`;tab.setAttribute('aria-pressed',String(slot===index));tab.onclick=()=>{slot=index;render();};slots.append(tab);});workshop.append(slots);
    const list=document.createElement('div');list.className='build-card-list';workshop.append(list);
    CAMP_DECOR.forEach(decor=>{
      const button=document.createElement('button');button.className='build-decor-card';const owned=state.crafted.includes(decor.id),placed=state.slots[slot]===decor.id;
      const action=placed?'Đã đặt':owned?'Đặt':`Chế tạo · ${decor.cost} Gỗ`;
      const note=placed?`Ở vị trí ${slot+1}`:owned?'Đã sở hữu':state.wood<decor.cost?`Thiếu ${decor.cost-state.wood} Gỗ`:'Chế tạo và đặt vào vị trí đã chọn';
      button.innerHTML=`<span class="build-decor-preview">${props[decor.id].replaceAll('camp-furniture','build-furniture')}</span><span class="build-decor-info"><strong>${names[decor.id]}</strong><span>${note}</span><small>${beastDisplayName(decor.favorite)}</small></span><span class="build-decor-action">${action}</span>`;
      button.disabled=placed||(!owned && state.wood<decor.cost);button.setAttribute('aria-label',`${names[decor.id]} · ${note} · ${action}`);
      button.onclick=()=>{if(commitCampDecor(state,decor.id,slot)){status.textContent=`Đã đặt ${names[decor.id]} ở vị trí ${slot+1}`;render();}else status.textContent='Chưa lưu được xây dựng. Vui lòng thử lại.';};list.append(button);
    });
    const clear=document.createElement('button');clear.className='build-clear-slot';clear.textContent=state.slots[slot]?`Cất ${names[state.slots[slot]!]??'đạo cụ'} vào kho`:'Vị trí đang trống';clear.disabled=!state.slots[slot];
    clear.onclick=()=>{const candidate=parseCamp(state);candidate.slots[slot]=null;if(saveCamp(candidate)){Object.assign(state,candidate);render();}else status.textContent='Chưa lưu được thay đổi.';};workshop.append(clear);
    activities.start();
  };
  const openWorkshop=(open:boolean)=>{root.querySelector<HTMLElement>('.camp-workshop')!.hidden=!open;root.querySelector('.village-build')!.setAttribute('aria-expanded',String(open));};
  const viewport=root.querySelector<HTMLElement>('.village-viewport')!;
  viewport.addEventListener('village-camera-state',e=>{const overview=(e as CustomEvent<{overview:boolean}>).detail.overview;const button=root.querySelector('.village-overview-button')!;button.setAttribute('aria-label',overview?'Về cận cảnh':'Xem toàn cảnh làng');button.setAttribute('aria-pressed',String(overview));});
  root.querySelector<HTMLButtonElement>('.village-zoom-in')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:1}));
  root.querySelector<HTMLButtonElement>('.village-zoom-out')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:-1}));
  root.querySelector<HTMLButtonElement>('.village-build')!.onclick=()=>openWorkshop(root.querySelector<HTMLElement>('.camp-workshop')!.hidden);
  root.querySelector<HTMLButtonElement>('.village-overview-button')!.onclick=()=>root.querySelector('.village-viewport')!.dispatchEvent(new Event('village-overview'));
  root.querySelector<HTMLButtonElement>('.village-residents')!.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.className='game-dialog village-resident-dialog';
    const header=document.createElement('header');header.className='resident-panel-header';
    const heading=document.createElement('h2');heading.id='village-residents-title';heading.textContent=`Cư dân · ${state.residents.length}`;header.append(heading);dialog.setAttribute('aria-labelledby',heading.id);
    const close=document.createElement('button');close.className='resident-panel-close';close.textContent='×';close.setAttribute('aria-label','Đóng danh sách cư dân');close.onclick=()=>dialog.close();header.append(close);dialog.append(header);
    const hint=document.createElement('p');hint.className='resident-panel-hint';hint.textContent='Chạm một cư dân để tìm trên bản đồ';dialog.append(hint);
    const list=document.createElement('div');list.className='resident-card-list';dialog.append(list);
    const refreshers:Array<()=>void>=[];
    for(const id of state.residents){
      const line=document.createElement('button');line.className='resident-card';line.setAttribute('aria-label',`Tìm ${beastDisplayName(id)} trên bản đồ`);
      const portrait=document.createElement('span');portrait.className='resident-portrait';const sprite=document.createElement('img');sprite.src=BATTLE_CHARACTER_ART[id as BeastId].base??'';sprite.alt='';sprite.draggable=false;portrait.append(sprite);line.append(portrait);
      const info=document.createElement('span');info.className='resident-card-info';
      const name=document.createElement('strong');name.textContent=beastDisplayName(id);
      const profession=document.createElement('span');profession.className='resident-profession';profession.textContent=villageProfession(id)?.name??'Cư dân';
      const activity=document.createElement('span');activity.className='resident-activity';
      const findBeast=()=>[...root.querySelectorAll<HTMLElement>('.camp-beast')].find(b=>b.dataset.beastId===id);
      const refresh=()=>{const beast=findBeast();activity.textContent=`${beast?.dataset.activity??'Đang nghỉ'} · ${state.economy.life.hungry.includes(id)?'Thiếu ăn · Chậm 25%':'Đủ bữa'}`;activity.dataset.working=String(!!beast?.classList.contains('camp-working'));};refreshers.push(refresh);refresh();
      info.append(name,profession,activity);line.append(info);const arrow=document.createElement('span');arrow.className='resident-find';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');line.append(arrow);
      line.onclick=()=>{const beast=findBeast();dialog.close();if(beast){viewport.dispatchEvent(new CustomEvent('village-focus',{detail:{x:parseFloat(beast.style.left)*1536/100+46,y:parseFloat(beast.style.top)*1024/100+54}}));beast.focus({preventScroll:true});status.textContent=`${beastDisplayName(id)} · ${beast.dataset.activity??'Đang nghỉ'}`;}};list.append(line);
    }
    if(!state.residents.length){const line=document.createElement('p');line.className='resident-empty';line.textContent='Làng đang chờ những người bạn mới. Tuyển thú trong chuyến phiêu lưu để đưa họ về làng.';list.append(line);}
    const observer=new MutationObserver(()=>refreshers.forEach(refresh=>refresh()));observer.observe(root.querySelector('.village-world')!,{subtree:true,attributes:true,attributeFilter:['data-activity','data-food','class']});
    dialog.onclose=()=>{observer.disconnect();dialog.remove();};root.append(dialog);dialog.showModal();
  };
  const leave=(next:()=>void)=>transitionScreen(root,()=>{saveCamp(state);window.clearTimeout(statusTimer);statusObserver.disconnect();activities?.dispose();stopRiver();stopClouds();stopCamera();root.remove();next();});
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick=()=>leave(back);
  goalButton.onclick=()=>showVillageGoal(root,state,render,explore?()=>leave(explore):undefined);
  root.querySelector<HTMLButtonElement>('.camp-diary-button')!.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.className='game-dialog village-diary-dialog';dialog.setAttribute('aria-labelledby','village-diary-title');
    const header=document.createElement('header');header.className='diary-panel-header';
    const heading=document.createElement('h2');heading.id='village-diary-title';heading.textContent='Nhật ký làng';header.append(heading);
    const close=document.createElement('button');close.className='diary-panel-close';close.textContent='×';close.setAttribute('aria-label','Đóng nhật ký');close.onclick=()=>dialog.close();header.append(close);dialog.append(header);
    const hint=document.createElement('p');hint.className='diary-panel-hint';hint.textContent=state.diary.length?`${state.diary.length} câu chuyện · Mới nhất ở trên`:'Những câu chuyện nhỏ của làng';dialog.append(hint);
    const list=document.createElement('ol');list.className='diary-event-list';dialog.append(list);
    for(const line of [...state.diary].reverse()){
      const event=document.createElement('li');event.className='diary-event';
      const id=line.match(/beast-[a-j]/)?.[0]??CAMP_DECOR.find(decor=>decor.meme===line)?.favorite;
      const portrait=document.createElement('span');portrait.className='diary-event-portrait';
      if(id&&BATTLE_CHARACTER_ART[id as BeastId]?.base){const sprite=document.createElement('img');sprite.src=BATTLE_CHARACTER_ART[id as BeastId].base!;sprite.alt='';portrait.append(sprite);}else{portrait.innerHTML=icon('<path d="M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h4"/>');}
      const content=document.createElement('div');const label=document.createElement('strong');label.textContent=line.includes('vừa gia nhập')?'Bạn mới đến làng':line.startsWith('Run thắng')?'Chuyến phiêu lưu':id?beastDisplayName(id):'Chuyện trong làng';
      const p=document.createElement('p');p.textContent=line.replace(/beast-[a-j]/g,beastId=>beastDisplayName(beastId));content.append(label,p);event.append(portrait,content);list.append(event);
    }
    if(!state.diary.length){const p=document.createElement('p');p.className='diary-empty';p.textContent='Làng còn yên ắng. Đưa thú về làng và khám phá công việc của họ để có những câu chuyện đầu tiên.';list.append(p);}
    root.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
  };
  render();
  showFirstVillage(root);
}

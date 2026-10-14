import { mountVillageRiverLayers } from './village/VillageRiverLayers';
import { mountVillageCloudShader } from './village/VillageCloudShader';
import { VILLAGE_SCENE } from '../run/VillageSceneLayout';
import { villageJourney } from '../run/VillageJourney';
import { forgeGoal } from '../run/VillageGoal';
import { showVillageGoal } from './VillageGoalView';
import { showFirstVillage } from './FirstJourneyView';
import { transitionScreen } from './SceneTransition';
import { showVillageInventory } from './VillageInventoryView';
import { showVillageProduction } from './VillageProductionView';
import { showVillageGarden } from './VillageGardenView';
import { isProductionKind, VILLAGE_RECIPES } from '../run/VillageEconomy';
import { VillageApplication } from '../run/VillageApplication';
import { paintVillageBoat,disposeVillageBoat } from './village/VillageBoatView';
import { VillagePatrolView } from './village/VillagePatrolView';
import { guardPost } from './village/VillageGuardPost';
import { paintStationOutputs } from './village/VillageStationOutputs';
import { gardenPrototypeLayers } from './village/VillageGardenLayers';
import { VillageCarrierView,receivingPoint } from './village/VillageCarrierView';
import { mountVillageCamera } from './village/VillageMapCamera';
import { CampActivityController } from './village/CampActivityController';
import { CAMP_DECOR, loadCamp, saveCamp } from '../run/CampState';
import { CampBeastInteractionManager } from './village/CampBeastInteraction';
import { showVillageResidentDialog } from './village/VillageResidentDialog';
import { showVillageDiaryDialog } from './village/VillageDiaryDialog';
import { renderVillageWorkshopPanel } from './village/VillageWorkshopPanel';
import { bgmManager } from '../audio/BgmManager';
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
export function showCamp(back:()=>void,explore?:()=>void):void {
  bgmManager.playLobby();
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
  const status = root.querySelector<HTMLElement>('.camp-status')!;
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
  let beastManager: CampBeastInteractionManager | undefined;
  const village=new VillageApplication(state,{save:saveCamp});
  const carrierView=new VillageCarrierView(root);
  const patrolView=new VillagePatrolView(root);
  let gardenKey='';
  const refreshGarden=()=>{const element=root.querySelector<HTMLElement>('.village-garden');if(!element)return;const snapshot=village.garden(),carrier=village.carrier(),hidden=Boolean(carrier&&(carrier.kind??'garden')==='garden'&&carrier.jobId===snapshot.jobId&&carrier.picked&&carrier.phase!=='return'),key=`${snapshot.jobId}:${snapshot.stage}:${snapshot.quantity}:${hidden}`;if(key!==gardenKey){gardenKey=key;element.innerHTML=gardenPrototypeLayers(snapshot,hidden);element.dataset.gardenStage=snapshot.stage;}};
  const goalButton=document.createElement('button');goalButton.className='village-goal-button';
  root.querySelector('.deck-header')!.append(goalButton);
  const updateBalance=()=>{root.querySelector('.camp-wood')!.textContent=`Gỗ ${state.wood} · ${state.economy.wallet.toLocaleString('vi-VN',{maximumFractionDigits:2})} Đồng`;
    goalButton.textContent=state.trackedGoal==='forge'?(forgeGoal(state).complete?'Xưởng đã hoạt động':'Mục tiêu: Mở xưởng'):'Mục tiêu';};
  const render = () => {
    carrierView.rebind();
    patrolView.rebind();disposeVillageBoat(root);
    beastManager?.dispose();
    activities?.rebind();
    activities??=new CampActivityController(kind=>{
      const result=village.completeActivity(kind);
      if(!result.ok){status.textContent=result.block.message;return false;}
      for(const event of result.events??[]){
        if(event.type==='production-staged'){status.textContent=`${VILLAGE_RECIPES[event.kind].name} đã làm xong · Hàng tại trạm chờ Swiftwing`;paintStationOutputs(root,state);continue;}
        if(event.type==='garden-harvested'){status.textContent=`Đã thu hoạch ${event.quantity} cà rốt · Giỏ chờ lấy tại vườn`;refreshGarden();continue;}
        if(event.type!=='production-delivered')continue;
        updateBalance();
        status.textContent=`${VILLAGE_RECIPES[event.kind].name} vừa giao +${event.quantity} ${event.resource==='fish'?'cá':event.resource==='toy'?'đồ chơi':'cà rốt'} vào kho`;
        if(event.incident){
          const incident=event.incident;
          status.textContent=`${incident.icon} ${incident.title}: ${incident.dialogue}`;
          const workerBeast=root.querySelector<HTMLElement>(`[data-beast-id="${event.workerId}"]`);
          if(workerBeast)beastManager?.showIncidentNotification(workerBeast,incident.icon,incident.dialogue);
        }
      }
    },{
      begin:kind=>{
        if(!isProductionKind(kind))return 8;
        const station=root.querySelector<HTMLElement>(kind==='garden'?'.village-garden':kind==='fishing'?'.village-fishing':'.camp-station[data-decor="anvil"]');
        const result=village.begin(kind);
        if(!result.ok){if(station)station.dataset.blockReason=result.block.message;return false;}
        if(station)delete station.dataset.blockReason;updateBalance();return result.value;
      },
      advance:(kind,seconds)=>{if(isProductionKind(kind))village.advance(kind,seconds);},
      rate:id=>village.workRate(id),
      available:kind=>!isProductionKind(kind)||(!state.economy[kind]?.harvested&&!state.economy[kind]?.readyOutput),
      progress:kind=>isProductionKind(kind)?village.production(kind):undefined,
    },seconds=>{
      const sale=village.advanceBoat(seconds);
      if(!sale.saved)status.textContent='Chuyến xuồng đang chờ lưu';
      if(sale.revenue){updateBalance();status.textContent=`Starcaller đã bán hàng · +${sale.revenue} Đồng`;}
      const delivery=village.advanceCarrier(seconds);
      if(!delivery.saved)status.textContent='Swiftwing chờ giao · Kiểm tra chỗ Kho hoặc lưu game';
      if(delivery.delivered){updateBalance();status.textContent=`Swiftwing đã giao ${delivery.delivered} ${delivery.kind==='fishing'?'cá':delivery.kind==='anvil'?'đồ chơi':'cà rốt'} vào Kho`;}
      const {days,saved}=village.advanceLife(seconds);
      if(days){updateBalance();status.textContent=`Ngày ${Math.floor(state.economy.life.seconds/120)+1} · ${state.economy.life.hungry.length} cư dân thiếu ăn · Mở Kho để bổ sung thực phẩm`;}
      if(!saved)status.textContent='Sinh hoạt làng chưa lưu được';
      refreshGarden();
      paintStationOutputs(root,state);
      carrierView.paint(village.carrier());
      paintVillageBoat(root,state.economy.boatSale);
      patrolView.paint(seconds);
      for(const beast of root.querySelectorAll<HTMLElement>('[data-beast-id]')){
        const label=state.economy.life.hungry.includes(beast.dataset.beastId!)?'Thiếu ăn · Làm việc chậm 25%':'Đủ bữa';
        if(beast.dataset.food!==label){beast.dataset.food=label;beast.title=label;}
      }
    },()=>{if(!village.checkpoint())status.textContent='Sinh hoạt làng chưa lưu được';});
    updateBalance();
    const ground = root.querySelector<HTMLElement>('.village-world')!; ground.replaceChildren();
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
    const garden=document.createElement('button');garden.className='village-garden';garden.setAttribute('aria-label','Vườn cà rốt');gardenKey='';ground.append(garden);refreshGarden();
    garden.onclick=()=>showVillageGarden(root,state,village,()=>{updateBalance();refreshGarden();});
    Object.assign(garden.style,{left:`${VILLAGE_SCENE.garden.x}px`,top:`${VILLAGE_SCENE.garden.y}px`,width:`${VILLAGE_SCENE.garden.width}px`,height:`${VILLAGE_SCENE.garden.height}px`});
    const fishing=document.createElement('button');fishing.className='village-fishing';fishing.setAttribute('aria-label','Bến câu cá');fishing.innerHTML='<svg viewBox="45 203 1198 878" aria-hidden="true"><image href="/assets/ui/camp/village-owner-v1/dock.png" width="1254" height="1254"/></svg><span>Bến cá</span>';
    fishing.onclick=()=>showVillageProduction(root,state,'fishing');ground.append(fishing);
    Object.assign(fishing.style,{left:`${VILLAGE_SCENE.fishing.x}px`,top:`${VILLAGE_SCENE.fishing.y}px`,width:`${VILLAGE_SCENE.fishing.width}px`,height:`${VILLAGE_SCENE.fishing.height}px`});
    beastManager = new CampBeastInteractionManager({
      state,
      ground,
      garden,
      fishing,
      activities: activities!,
      onStatus: (msg) => { status.textContent = msg; },
    });
    beastManager.renderResidents();
    ground.append(guardPost(()=>{status.textContent=state.residents.includes('beast-a')?(root.querySelector<HTMLElement>('[data-beast-id="beast-a"]')?.dataset.activity??'Snowguard phụ trách tuần tra'):'Trạm canh đang trống · Cần đón Snowguard từ chuyến thám hiểm';}));
    paintStationOutputs(root,state);
    const receiving=receivingPoint();receiving.onclick=()=>showVillageInventory(root,state,()=>render());ground.append(receiving);carrierView.paint(village.carrier());patrolView.paint();paintVillageBoat(root,state.economy.boatSale);
    renderVillageWorkshopPanel({
      workshop: root.querySelector('.camp-workshop')!,
      state,
      slot,
      props,
      onSlotChange: (newSlot) => { slot = newSlot; render(); },
      onStateChange: () => render(),
      onClose: () => openWorkshop(false),
      onStatus: (msg) => { status.textContent = msg; },
    });
    activities.start();
  };
  const openWorkshop=(open:boolean)=>{root.querySelector<HTMLElement>('.camp-workshop')!.hidden=!open;root.querySelector('.village-build')!.setAttribute('aria-expanded',String(open));};
  const viewport=root.querySelector<HTMLElement>('.village-viewport')!;
  const cameraState=(e:Event)=>{const overview=(e as CustomEvent<{overview:boolean}>).detail.overview;const button=root.querySelector('.village-overview-button')!;button.setAttribute('aria-label',overview?'Về cận cảnh':'Xem toàn cảnh làng');button.setAttribute('aria-pressed',String(overview));};
  viewport.addEventListener('village-camera-state',cameraState);
  root.querySelector<HTMLButtonElement>('.village-zoom-in')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:1}));
  root.querySelector<HTMLButtonElement>('.village-zoom-out')!.onclick=()=>viewport.dispatchEvent(new CustomEvent('village-zoom',{detail:-1}));
  root.querySelector<HTMLButtonElement>('.village-build')!.onclick=()=>openWorkshop(root.querySelector<HTMLElement>('.camp-workshop')!.hidden);
  root.querySelector<HTMLButtonElement>('.village-overview-button')!.onclick=()=>root.querySelector('.village-viewport')!.dispatchEvent(new Event('village-overview'));
  root.querySelector<HTMLButtonElement>('.village-residents')!.onclick=()=>showVillageResidentDialog(root,state,viewport,status);
  const leave=(next:()=>void)=>transitionScreen(root,()=>{
    activities?.dispose();beastManager?.dispose();carrierView.dispose();patrolView.dispose();disposeVillageBoat(root);village.checkpoint();
    for(const dialog of root.querySelectorAll<HTMLDialogElement>('dialog'))dialog.close();
    window.clearTimeout(statusTimer);statusObserver.disconnect();
    viewport.removeEventListener('village-camera-state',cameraState);
    stopRiver();stopClouds();stopCamera();root.remove();next();
  });
  root.querySelector<HTMLButtonElement>('.deck-back')!.onclick=()=>leave(back);
  goalButton.onclick=()=>showVillageGoal(root,state,render,explore?()=>leave(explore):undefined);
  root.querySelector<HTMLButtonElement>('.camp-diary-button')!.onclick=()=>showVillageDiaryDialog(root,state);
  render();
  showFirstVillage(root);
}

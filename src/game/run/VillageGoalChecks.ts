import { CAMP_SAVE_KEY, loadCamp, parseCamp, rewardCampWin, saveCamp } from './CampState';
import { buildTrackedForge, forgeGoal, trackForgeGoal } from './VillageGoal';
import { RunLifecycleCoordinator, type RunLifecycleContext } from '../scene/RunLifecycleCoordinator';

export function villageGoalChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw Error(`Dual core: ${label}`);};
  const data=new Map<string,string>();
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  const failed={getItem:storage.getItem,setItem:()=>{throw Error('quota');}};
  const state=parseCamp({version:3,wood:5,residents:['beast-e'],crafted:[],slots:[]});
  expect(trackForgeGoal(state,true,storage),'can select goal');
  expect(loadCamp(storage).trackedGoal==='forge'&&forgeGoal(state).missingWood===15,'goal reload and actual deficit');
  const before=JSON.stringify(state),saved=data.get(CAMP_SAVE_KEY);
  expect(!buildTrackedForge(state,0,storage)&&JSON.stringify(state)===before,'insufficient wood is atomic');
  expect(!trackForgeGoal(state,false,failed)&&JSON.stringify(state)===before,'tracking save failure leaves state intact');
  const failedReward=rewardCampWin('run-1',failed);
  expect(!failedReward.saved&&failedReward.woodGranted===0&&data.get(CAMP_SAVE_KEY)===saved,'failed reward grants nothing');
  const reward=rewardCampWin('run-1',storage);
  expect(reward.saved&&reward.woodGranted===15&&reward.before.wood===5&&reward.after.wood===20,'win fills deficit');
  expect(rewardCampWin('run-1',storage).woodGranted===0&&loadCamp(storage).wood===20,'same Run never grants twice after reload');
  const ready=loadCamp(storage);
  expect(!buildTrackedForge(ready,0,failed)&&ready.wood===20&&!ready.crafted.includes('anvil'),'build save failure preserves ownership and funds');
  expect(buildTrackedForge(ready,0,storage)&&ready.wood===0&&forgeGoal(ready).complete,'build unlocks placed forge for resident');
  expect(buildTrackedForge(ready,1,storage)&&ready.wood===0&&ready.slots[0]===null,'owned forge moves without payment');
  expect(trackForgeGoal(ready,false,storage)&&ready.crafted.includes('anvil'),'untracking never removes assets');
  expect(rewardCampWin('run-2',storage).woodGranted===15,'new Run can grant reward');
  const old=parseCamp({version:2,wood:0,residents:['beast-e'],crafted:['anvil'],placements:{forge:{x:1400,y:780}}});
  expect(forgeGoal(old).complete&&forgeGoal(old).missingWood===0,'legacy owned/placed forge needs no repurchase');
  expect(!forgeGoal(parseCamp({wood:20,crafted:['anvil'],slots:['anvil']})).complete,'forge alone does not invent resident');
  expect(parseCamp({trackedGoal:'fake',rewardedRuns:['run-1','run-1',7]}).rewardedRuns.length===1,'malformed IDs sanitized');
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  let failWrites=false;
  const sceneData=new Map<string,string>();
  const sceneStorage={getItem:(key:string)=>sceneData.get(key)??null,setItem:(key:string,value:string)=>{if(failWrites)throw Error('quota');sceneData.set(key,value);}};
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:sceneStorage});
  try {
    let outcome:'Win'|'Lose'='Lose',final=true,level:string|undefined='woodland',retry:(()=>void)|undefined;
    const coordinator=new RunLifecycleCoordinator({
      getBattleModel:()=>undefined,getBattleOutcome:()=>outcome,
      fixtureManager:{recordMetrics:()=>({comparison:undefined,history:{}})},
      waveRun:{get isFinalWave(){return final;},get levelId(){return level;},totalWaves:3,currentWaveIndex:2},
      metrics:{snapshot:{}},syncTopHud:()=>{},
      getSummaryView:()=>({render:()=>{},setVisible:()=>{},setVillageReport:(_text:string,action?:()=>void)=>{retry=action;}}),
    } as unknown as RunLifecycleContext);
    coordinator.enterResult();expect(!sceneData.has(CAMP_SAVE_KEY),'loss grants no camp resources');
    outcome='Win';final=false;coordinator.enterResult();expect(loadCamp().wood===25,'partial Wave grants nothing');
    final=true;level=undefined;coordinator.enterResult();expect(!sceneData.has(CAMP_SAVE_KEY),'harness never writes camp');
    level='woodland';failWrites=true;coordinator.enterResult();expect(!!retry&&loadCamp().wood===25,'result exposes retry on save failure');
    failWrites=false;retry!();expect(loadCamp().wood===40,'retry grants exactly once');
    coordinator.enterResult();expect(loadCamp().wood===40&&!retry,'repeated Result does not grant twice');
  } finally {
    if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);
    else delete (globalThis as {localStorage?:unknown}).localStorage;
  }
  console.log('Dual-Core village goal checks passed.');
}

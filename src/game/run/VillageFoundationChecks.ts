import { CAMP_SAVE_KEY, LEGACY_CAMP_SAVE_KEY, campInventory, loadCamp, parseCamp, recordVillageStory, saveCamp } from './CampState';
import { VILLAGE_PROFESSIONS, VILLAGE_STATIONS } from './VillageCatalog';
import { VILLAGE_OBSTACLES, VILLAGE_PATHS, VILLAGE_STATION_LAYOUTS, VILLAGE_WAYPOINTS, villagePointInWorld } from './VillageLayout';
import { DECK_UNITS } from './RunDeck';
import { createVillagePreviewFixture } from './VillageFixtures';

export function villageFoundationChecks():void {
  const expect=(ok:boolean,message:string)=>{if(!ok)throw Error(`Village foundation: ${message}`);};
  expect(VILLAGE_PROFESSIONS.length===DECK_UNITS.length && DECK_UNITS.every(id=>VILLAGE_PROFESSIONS.some(p=>p.beastId===id)),'every playable Beast has a profession');
  expect(VILLAGE_STATIONS.filter(s=>s.cost===null).length===2,'new station prices remain unapproved');
  expect(createVillagePreviewFixture().residents.length===3 && Object.keys(createVillagePreviewFixture().placements).length===3,'explicit preview fixture has three working areas');
  expect(parseCamp(null).residents.length===0 && parseCamp(null).crafted.length===0,'player initialization never unlocks preview contents');
  const old={wood:47,residents:['beast-e','beast-c','beast-b'],crafted:['bath','carrot','anvil'],slots:['bath','carrot',null],diary:['old event','old event']};
  const records=new Map<string,string>([[LEGACY_CAMP_SAVE_KEY,JSON.stringify(old)]]);
  const storage={getItem:(key:string)=>records.get(key)??null,setItem:(key:string,value:string)=>{records.set(key,value);}};
  const migrated=loadCamp(storage);
  expect(migrated.version===2 && migrated.wood===47 && migrated.residents.length===3,'migration preserves balance and residents');
  expect(migrated.crafted.length===3 && migrated.slots[1]==='carrot' && migrated.diary.length===2,'ownership, legacy placements and history preserved');
  expect(campInventory(migrated).includes('anvil') && !migrated.crafted.includes('garden'),'unplaced item retained; no free stations');
  saveCamp(migrated,storage);
  expect(records.get(LEGACY_CAMP_SAVE_KEY)===JSON.stringify(old),'v1 backup untouched');
  expect(JSON.stringify(loadCamp(storage))===JSON.stringify(migrated),'v2 save reload stable');
  expect(JSON.stringify(parseCamp(migrated))===JSON.stringify(migrated),'repeated migration idempotent');
  records.set(CAMP_SAVE_KEY,'{broken');
  expect(loadCamp(storage).wood===47,'invalid v2 falls back to intact v1');
  records.set(CAMP_SAVE_KEY,JSON.stringify({...migrated,wood:9}));
  expect(loadCamp(storage).wood===9,'v2 takes precedence without reverting spent balance');
  saveCamp(migrated,{getItem:storage.getItem,setItem:()=>{throw Error('quota');}});
  expect(records.get(LEGACY_CAMP_SAVE_KEY)===JSON.stringify(old),'failed writes preserve backup');
  const corrupted=parseCamp({wood:NaN,crafted:['anvil','garden','fake'],slots:['anvil','anvil','fake'],placements:{forge:{x:1400,y:780},garden:{x:-1,y:780},fishing:{x:1390,y:510}},seenStoryIds:['fake']});
  expect(corrupted.slots[1]===null && corrupted.placements.forge?.x===1400 && !corrupted.placements.garden && !corrupted.placements.fishing,'duplicate, invalid and unowned placement sanitization');
  expect(corrupted.slots[0]===null,'world placement cannot duplicate legacy decor placement');
  expect(corrupted.seenStoryIds.length===0,'unknown story IDs stripped');
  expect(recordVillageStory(migrated,'forge.toy-duck') && !recordVillageStory(migrated,'forge.toy-duck'),'story records once');
  expect(!recordVillageStory(parseCamp(null),'forge.toy-duck'),'undiscovered resident cannot produce story');
  for(const layout of Object.values(VILLAGE_STATION_LAYOUTS)) {
    for(const p of [layout.workAnchor,layout.approachAnchor]) {
      expect(villagePointInWorld(p),'anchors inside world');
      expect(!VILLAGE_OBSTACLES.some(o=>p.x>=o.x&&p.x<=o.x+o.width&&p.y>=o.y&&p.y<=o.y+o.height),'anchors outside house/water');
    }
    expect(VILLAGE_WAYPOINTS.some(p=>p.id===layout.waypoint),'station connects to path');
  }
  expect(VILLAGE_PATHS.every(edge=>edge.every(id=>VILLAGE_WAYPOINTS.some(p=>p.id===id))),'valid path edges');
}

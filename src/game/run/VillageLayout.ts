import type { VillageStationId } from './VillageCatalog';
import { VILLAGE_SCENE } from './VillageSceneLayout';
export interface VillagePoint { x:number; y:number }
export interface VillageRect extends VillagePoint { width:number; height:number }
export const VILLAGE_WORLD = {width:VILLAGE_SCENE.width,height:VILLAGE_SCENE.height} as const;
export const VILLAGE_WAYPOINTS = [
 {id:'square',x:760,y:730},{id:'west',x:540,y:730},{id:'east',x:970,y:730},
 {id:'north',x:650,y:400},{id:'lake',x:1040,y:650},
] as const;
export const VILLAGE_PATHS = [['west','square'],['square','east'],['square','north'],['north','lake'],['lake','east']] as const;
export const VILLAGE_STATION_LAYOUTS:Record<VillageStationId,{bounds:VillageRect;approachAnchor:VillagePoint;workAnchor:VillagePoint;foreground:VillageRect;waypoint:string}>={
 forge:{bounds:VILLAGE_SCENE.forge,approachAnchor:{x:620,y:570},workAnchor:VILLAGE_SCENE.forge.work,foreground:{x:710,y:540,width:225,height:49},waypoint:'north'},
 garden:{bounds:VILLAGE_SCENE.garden,approachAnchor:{x:510,y:590},workAnchor:VILLAGE_SCENE.garden.work,foreground:{x:150,y:660,width:345,height:31},waypoint:'west'},
 fishing:{bounds:VILLAGE_SCENE.fishing,approachAnchor:{x:1040,y:740},workAnchor:VILLAGE_SCENE.fishing.work,foreground:{x:1070,y:790,width:230,height:29},waypoint:'lake'},
};
export const VILLAGE_OBSTACLES:VillageRect[]=[{x:210,y:8,width:420,height:280},{x:1320,y:0,width:216,height:1024}];
export function villagePointInWorld(p:VillagePoint):boolean{return Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=VILLAGE_WORLD.width&&p.y<=VILLAGE_WORLD.height;}
export function validVillagePlacement(id:VillageStationId,p:VillagePoint):boolean{const a=VILLAGE_STATION_LAYOUTS[id]?.workAnchor;return Boolean(a&&villagePointInWorld(p)&&p.x===a.x&&p.y===a.y);}
/** Recognize only authored v2 anchors; arbitrary old coordinates are never accepted. */
export function migrateVillageAnchor(id:VillageStationId,p:VillagePoint):VillagePoint{
 const old:Record<VillageStationId,VillagePoint>={forge:{x:1400,y:780},garden:{x:460,y:780},fishing:{x:1390,y:510}};
 return p.x===old[id].x&&p.y===old[id].y?{...VILLAGE_STATION_LAYOUTS[id].workAnchor}:p;
}

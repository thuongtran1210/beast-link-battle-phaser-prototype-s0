import type { VillageStationId } from './VillageCatalog';
export interface VillagePoint { x:number; y:number }
export interface VillageRect extends VillagePoint { width:number; height:number }
export const VILLAGE_WORLD = {width:1800,height:1200} as const;
// Coordinates are world pixels, independent of viewport orientation.
export const VILLAGE_WAYPOINTS = [
  {id:'square',x:900,y:780}, {id:'west',x:600,y:780}, {id:'east',x:1200,y:780},
  {id:'north',x:900,y:560}, {id:'lake',x:1200,y:560},
] as const;
export const VILLAGE_PATHS = [
  ['west','square'],['square','east'],['square','north'],['north','lake'],['lake','east'],
] as const;
export const VILLAGE_STATION_LAYOUTS: Record<VillageStationId, {
  bounds:VillageRect; approachAnchor:VillagePoint; workAnchor:VillagePoint;
  foreground:VillageRect; waypoint:string;
}> = {
  forge:{bounds:{x:1250,y:650,width:360,height:240}, approachAnchor:{x:1240,y:780},workAnchor:{x:1400,y:780},foreground:{x:1280,y:790,width:300,height:100},waypoint:'east'},
  garden:{bounds:{x:220,y:650,width:340,height:260},approachAnchor:{x:570,y:780},workAnchor:{x:460,y:780},foreground:{x:250,y:800,width:280,height:110},waypoint:'west'},
  fishing:{bounds:{x:1250,y:340,width:350,height:220},approachAnchor:{x:1220,y:560},workAnchor:{x:1390,y:510},foreground:{x:1290,y:520,width:280,height:40},waypoint:'lake'},
};
export const VILLAGE_OBSTACLES:VillageRect[] = [
  {x:500,y:160,width:570,height:330}, // communal house
  {x:1320,y:160,width:440,height:290}, // lake; fishing access stays on the bank
];
export function villagePointInWorld(p:VillagePoint):boolean {
  return Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=VILLAGE_WORLD.width&&p.y<=VILLAGE_WORLD.height;
}
/** MVP stations use authored fixed work areas; decor positioning remains legacy. */
export function validVillagePlacement(id:VillageStationId,p:VillagePoint):boolean {
  const anchor=VILLAGE_STATION_LAYOUTS[id]?.workAnchor;
  return Boolean(anchor && villagePointInWorld(p) && p.x===anchor.x && p.y===anchor.y);
}

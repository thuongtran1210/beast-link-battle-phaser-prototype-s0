import { parseCamp, type CampState } from './CampState';
import { VILLAGE_STATION_LAYOUTS } from './VillageLayout';
/** Explicit preview/test data only. Never called by player save initialization. */
export function createVillagePreviewFixture():CampState {
  return parseCamp({version:2,wood:25,residents:['beast-e','beast-c','beast-b'],
    crafted:['anvil','garden','fishing'],slots:[],diary:[],seenStoryIds:[],
    placements:Object.fromEntries(Object.entries(VILLAGE_STATION_LAYOUTS).map(([id,layout])=>[id,{...layout.workAnchor}]))});
}

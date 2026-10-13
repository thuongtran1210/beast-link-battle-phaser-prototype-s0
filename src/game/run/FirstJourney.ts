import { CAMP_SAVE_KEY, PREVIOUS_CAMP_SAVE_KEY, LEGACY_CAMP_SAVE_KEY, type CampStorage } from './CampState';
export const FIRST_JOURNEY_KEY='beast-link-first-journey-v1';
export type FirstJourneyStage='expedition'|'village'|'done';

export function firstJourneyStage(storage?:CampStorage):FirstJourneyStage {
  try {
    const source=storage??localStorage,record=source.getItem(FIRST_JOURNEY_KEY);
    if(record){try{const value=JSON.parse(record);if(value?.version===1&&['expedition','village','done'].includes(value.stage))return value.stage;}catch{/* Recover from malformed onboarding without discarding legacy progress. */}}
    // Existing saves are never forced through onboarding or reset.
    for(const key of [CAMP_SAVE_KEY,PREVIOUS_CAMP_SAVE_KEY,LEGACY_CAMP_SAVE_KEY,'beast-link-levels-v1','beast-link-deck-v1']){
      const value=source.getItem(key);if(!value)continue;
      try {const parsed=JSON.parse(value);if(parsed&&typeof parsed==='object')return 'done';}catch{/* Ignore malformed legacy records. */}
    }
    return 'expedition';
  }catch{return 'done';} // Unavailable storage must not trap navigation.
}
export function saveFirstJourney(stage:FirstJourneyStage,storage?:CampStorage):boolean {
  try{(storage??localStorage).setItem(FIRST_JOURNEY_KEY,JSON.stringify({version:1,stage}));return true;}catch{return false;}
}
export function finishFirstExpedition(level:string|undefined,outcome:'Win'|'Lose'|undefined,finalWave:boolean,storage?:CampStorage):boolean {
  if(level!=='woodland'||firstJourneyStage(storage)!=='expedition'||!(outcome==='Lose'||(outcome==='Win'&&finalWave)))return false;
  return saveFirstJourney('village',storage);
}

import { FIRST_JOURNEY_KEY, firstJourneyStage, saveFirstJourney, finishFirstExpedition } from './FirstJourney';
import { CAMP_SAVE_KEY, LEGACY_CAMP_SAVE_KEY } from './CampState';
export function firstJourneyChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw Error(`First journey: ${label}`);};
  const records=new Map<string,string>();
  const storage={getItem:(key:string)=>records.get(key)??null,setItem:(key:string,value:string)=>{records.set(key,value);}};
  expect(firstJourneyStage(storage)==='expedition','new device begins expedition');
  expect(saveFirstJourney('expedition',storage),'first stage saves before recruitment');
  records.set(CAMP_SAVE_KEY,JSON.stringify({version:3,residents:['beast-a']}));
  expect(firstJourneyStage(storage)==='expedition','new recruitment does not skip expedition');
  expect(!finishFirstExpedition(undefined,'Win',true,storage)&&!finishFirstExpedition('shadow','Win',true,storage),'harness and other regions never advance guide');
  expect(!finishFirstExpedition('woodland','Win',false,storage),'partial victory is not Run completion');
  expect(finishFirstExpedition('woodland','Lose',false,storage)&&firstJourneyStage(storage)==='village','defeat can proceed to Village');
  saveFirstJourney('expedition',storage);
  expect(finishFirstExpedition('woodland','Win',true,storage),'final victory proceeds to Village');
  expect(saveFirstJourney('village',storage)&&firstJourneyStage(storage)==='village','result persists next Village stage');
  expect(saveFirstJourney('done',storage)&&firstJourneyStage(storage)==='done','Village guide completion survives reload');
  records.delete(FIRST_JOURNEY_KEY);expect(firstJourneyStage(storage)==='done','old camp is not reset or onboarded');
  records.delete(CAMP_SAVE_KEY);records.set(LEGACY_CAMP_SAVE_KEY,JSON.stringify({wood:47}));
  expect(firstJourneyStage(storage)==='done','v1 owner retains free navigation');
  records.clear();records.set(FIRST_JOURNEY_KEY,'{bad');records.set(LEGACY_CAMP_SAVE_KEY,'bad');
  expect(firstJourneyStage(storage)==='expedition','malformed empty records recover');
  const failing={getItem:storage.getItem,setItem:()=>{throw Error('quota');}};
  expect(!saveFirstJourney('village',failing)&&firstJourneyStage(storage)==='expedition','failed write never claims progression');
  expect(!finishFirstExpedition('woodland','Lose',false,failing),'failed result transition remains retryable');
  expect(firstJourneyStage({getItem:()=>{throw Error('denied');},setItem:()=>{}})==='done','unavailable storage does not trap navigation');
  console.log('First journey checks passed.');
}

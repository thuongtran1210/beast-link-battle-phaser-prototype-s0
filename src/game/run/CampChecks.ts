import { parseCamp, craftCampDecor } from './CampState';
export function campChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw new Error(`Camp: ${label}`);};
  const state=parseCamp(null);expect(state.wood===25 && state.slots.length===3,'welcome state');
  expect(craftCampDecor(state,'bath',0) && state.wood===15,'craft spends wood');
  expect(craftCampDecor(state,'bath',2) && state.wood===15 && state.slots[0]===null,'owned decor moves freely without duplicates');
  expect(!craftCampDecor(state,'anvil',1) && state.wood===15,'insufficient wood preserves balance');
  expect(!craftCampDecor(state,'carrot',3),'invalid slot rejected');
  const malformed=parseCamp({wood:-100,residents:['beast-a','fake','beast-a'],crafted:['fake'],slots:['fake'],diary:'invalid'});
  expect(malformed.wood===0 && malformed.residents.length===1 && malformed.slots.every(id=>id===null),'corrupt storage sanitized');
  expect(parseCamp(JSON.parse(JSON.stringify(state))).slots[2]==='bath','state roundtrip');
}

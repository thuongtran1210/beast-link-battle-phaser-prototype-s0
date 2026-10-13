import { rushSoundRecipe, rushSfx } from './RushSfx';
export function rushSfxChecks():void {
  for(const id of ['beast-a','beast-j','energy-a','energy-e','energy-c','energy-f']) {
    for(const kind of ['select','invalid','match','spawn'] as const) {
      const recipe=rushSoundRecipe(kind,id);
      if(recipe.length>2 || recipe.some(t=>t.frequency<=0||t.end<=0||t.duration<=0||t.duration+t.delay>.3)) throw Error('Rush SFX must stay short and bounded');
    }
  }
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const values=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}}});
  try {
    rushSfx.setEnabled(false);
    if(rushSfx.enabled || values.get('beast-link-sfx')!=='off')throw Error('Mute preference not saved');
    rushSfx.unlock();rushSfx.play('match','energy-a'); // Safe without audio support.
    rushSfx.setEnabled(true);
    if(!rushSfx.enabled || values.get('beast-link-sfx')!=='on')throw Error('Unmute preference not saved');
  } finally {
    if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');
  }
}

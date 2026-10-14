/** Owner river map coordinates, shared by rendering and authored work anchors. */
export const VILLAGE_SCENE = {
  width:1536,height:1024,
  house:{x:210,y:8,width:420},
  garden:{x:150,y:465,width:345,height:226,work:{x:439.296,y:509.952}},
  fishing:{x:1070,y:650,width:230,height:169,work:{x:1200,y:650.24}},
  forge:{x:710,y:430,width:225,height:159,work:{x:648.192,y:459.776}},
  guardPost:{x:710,y:655,width:144,height:118,observe:{x:-30,y:85}},
} as const;
export function villageWorkPercent(id:'garden'|'fishing'|'forge') {
  const p=VILLAGE_SCENE[id].work;
  return {x:p.x/VILLAGE_SCENE.width*100,y:p.y/VILLAGE_SCENE.height*100};
}

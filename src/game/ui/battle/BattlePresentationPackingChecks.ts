import { packBattleBodies, type PresentationBody } from './BattlePresentationPacking';
export function battlePresentationPackingChecks(): void {
  const bodies:PresentationBody[]=Array.from({length:10},(_,i)=>({id:`unit-${i}`,x:640,y:330,side:i<5?'player':'enemy'}));
  const bounds={left:78,right:1202,top:210,bottom:470};
  const packed=packBattleBodies(bodies,bounds);
  const points=[...packed.values()];
  for(let i=0;i<points.length;i++) {
    const p=points[i];
    if(p.x<bounds.left||p.x>bounds.right||p.y<bounds.top||p.y>bounds.bottom) throw Error('Body outside safe arena');
    for(let j=0;j<i;j++) if(Math.abs(p.x-points[j].x)<100&&Math.abs(p.y-points[j].y)<106) throw Error('Opposing silhouettes overlap');
  }
  const reversed=packBattleBodies([...bodies].reverse(),bounds);
  for(const [id,p] of packed) if(JSON.stringify(p)!==JSON.stringify(reversed.get(id))) throw Error('Packing depends on snapshot order');
}

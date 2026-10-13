export interface PresentationBody { id: string; x: number; y: number; side: 'player' | 'enemy' }
export interface PresentationBounds { left: number; right: number; top: number; bottom: number }

/** Presentation only: reserve distinct silhouettes across BOTH teams. */
export function packBattleBodies(entries: PresentationBody[], bounds: PresentationBounds): Map<string, {x:number;y:number}> {
  const result = new Map<string, {x:number;y:number}>();
  const placed: Array<{x:number;y:number}> = [];
  const clamp = (n:number, lo:number, hi:number) => Math.max(lo, Math.min(hi,n));
  const center = (bounds.left+bounds.right)/2;
  // IDs keep allocation stable when movement changes lane ordering.
  for (const entry of [...entries].sort((a,b)=>a.id.localeCompare(b.id))) {
    const desired = {x:clamp(entry.x,bounds.left,bounds.right),y:clamp(entry.y,bounds.top,bounds.bottom)};
    const candidates = [desired];
    for(let y=bounds.top;y<=bounds.bottom;y+=110) {
      for(let x=bounds.left;x<=bounds.right;x+=104) candidates.push({x,y});
    }
    const score = (p:{x:number;y:number}) => {
      const overlap = placed.reduce((sum,q)=>sum+(Math.abs(p.x-q.x)<100 && Math.abs(p.y-q.y)<106 ? 1:0),0);
      const wrongSide = entry.side==='player' ? Math.max(0,p.x-center) : Math.max(0,center-p.x);
      return overlap*1e9 + (p.x-desired.x)**2 + (p.y-desired.y)**2 + wrongSide**2*2;
    };
    candidates.sort((a,b)=>score(a)-score(b));
    const selected=candidates[0];
    placed.push(selected);
    result.set(entry.id,selected);
  }
  return result;
}

/** Keep combat X/range truthful. Stable small lane insets never reflow after a death. */
export function combatBodyOffsets(ids: readonly string[]): Map<string,{x:number;y:number}> {
  return new Map([...ids].sort().map((id,index)=>[id,{x:0,y:((index%3)-1)*24}]));
}

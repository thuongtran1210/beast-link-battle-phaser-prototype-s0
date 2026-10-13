import snow from './SnowguardFrames.json';
import iron from './IroncladFrames.json';
import rabbit from './WindstriderFrames.json';
import type { SnowguardClip } from './SnowguardAnimationPlayer';

export const EDITABLE_RIGS={
  'beast-a':{name:'Snowguard',prefix:'snowguard',slug:'duck-guardian',frames:snow},
  'beast-e':{name:'Ironclad',prefix:'ironclad',slug:'bear-hammer',frames:iron},
  'beast-c':{name:'Windstrider',prefix:'windstrider',slug:'rabbit-archer',frames:rabbit},
} as const;
export type EditableBeast=keyof typeof EDITABLE_RIGS;
export const ANIMATION_CLIPS:SnowguardClip[]=['idle','walk','attack','skill','hit','ko'];
export interface EditableFrame {x:number;y:number;width:number;height:number;groundY:number;bodyHeight:number;groundX:number;scaleMultiplier:number;offsetX:number;offsetY:number;durationMs:number}
export interface EditableClip {frames:EditableFrame[];order:number[];fps:number;loop:boolean;normalizeIdle:boolean;referenceHeight:number}
export interface AnimationProject {version:1;beastId:EditableBeast;sheetWidth:number;sheetHeight:number;clips:Record<SnowguardClip,EditableClip>}
export function createAnimationProject(id:EditableBeast):AnimationProject {
  const clips={} as AnimationProject['clips'];
  for(const clip of ANIMATION_CLIPS){const cells=EDITABLE_RIGS[id].frames[clip];clips[clip]={frames:cells.map(f=>({...f,groundX:f.width/2,scaleMultiplier:1,offsetX:0,offsetY:0,durationMs:100})),order:cells.map((_,i)=>i),fps:clip==='idle'?7:10,loop:clip==='idle'||clip==='walk',normalizeIdle:clip==='idle',referenceHeight:cells[0].bodyHeight};}
  return {version:1,beastId:id,sheetWidth:1774,sheetHeight:887,clips};
}
export function validateAnimationProject(value:unknown):AnimationProject {
  const p=value as AnimationProject;
  if(!p||p.version!==1||!(p.beastId in EDITABLE_RIGS)||p.sheetWidth!==1774||p.sheetHeight!==887||!p.clips)throw Error('Sai phiên bản, nhân vật hoặc kích thước sheet (1774×887).');
  for(const clip of ANIMATION_CLIPS){
    const c=p.clips[clip];
    if(!c||!Array.isArray(c.frames)||c.frames.length!==8||!Array.isArray(c.order)||c.order.length!==8||new Set(c.order).size!==8||c.order.some(i=>!Number.isInteger(i)||i<0||i>7))throw Error(`${clip}: cần 8 frame và thứ tự chứa mỗi frame đúng một lần.`);
    if(!Number.isFinite(c.fps)||c.fps<1||c.fps>60||typeof c.loop!=='boolean'||typeof c.normalizeIdle!=='boolean'||!Number.isFinite(c.referenceHeight)||c.referenceHeight<1||c.referenceHeight>887)throw Error(`${clip}: nhịp phát hoặc chiều cao chuẩn không hợp lệ.`);
    c.frames.forEach((f,i)=>{
      if(['x','y','width','height','groundX','groundY','bodyHeight','scaleMultiplier','offsetX','offsetY','durationMs'].some(k=>!Number.isFinite(f[k as keyof EditableFrame])))throw Error(`${clip} frame ${i+1}: thông số phải là số hữu hạn.`);
      if(![f.x,f.y,f.width,f.height].every(Number.isInteger)||f.x<0||f.y<0||f.width<1||f.height<1||f.x+f.width>p.sheetWidth||f.y+f.height>p.sheetHeight)throw Error(`${clip} frame ${i+1}: vùng cắt nằm ngoài sheet.`);
      if(f.groundX<0||f.groundX>f.width||f.groundY<0||f.groundY>f.height||f.bodyHeight<1||f.bodyHeight>887||f.scaleMultiplier<.1||f.scaleMultiplier>5||Math.abs(f.offsetX)>887||Math.abs(f.offsetY)>887||f.durationMs<10||f.durationMs>5000)throw Error(`${clip} frame ${i+1}: neo, tỷ lệ, dịch chuyển hoặc thời gian không hợp lệ.`);
    });
  }
  return JSON.parse(JSON.stringify(p));
}
export function frameAtTime(c:EditableClip,seconds:number):{frame:number;slot:number} {
  const weights=c.order.map(i=>c.frames[i].durationMs),total=weights.reduce((a,b)=>a+b,0);
  const duration=c.order.length/c.fps;
  let t=Math.max(0,seconds);
  if(c.loop)t%=duration;else if(t>=duration)return {frame:c.order[7],slot:7};
  const weighted=t/duration*total;let sum=0;
  for(let slot=0;slot<weights.length;slot++){sum+=weights[slot];if(weighted<sum)return {frame:c.order[slot],slot};}
  return {frame:c.order[7],slot:7};
}
export function timeForFrame(c:EditableClip,index:number):number {
  const slot=c.order.indexOf(index),total=c.frames.reduce((sum,f)=>sum+f.durationMs,0);
  return c.order.slice(0,slot).reduce((sum,i)=>sum+c.frames[i].durationMs,0)/total*(8/c.fps);
}
export function animationFrameTransform(c:EditableClip,index:number,height=250){
  const f=c.frames[index],base=c.normalizeIdle?height/f.bodyHeight*(1+(f.bodyHeight/c.referenceHeight-1)*.1):height/c.referenceHeight;
  const scale=base*f.scaleMultiplier;
  return {scale,x:-f.groundX*scale+f.offsetX*scale,y:-f.groundY*scale+f.offsetY*scale};
}
export const animationDraftKey=(id:EditableBeast)=>`beast-link-animation-draft-v1:${id}`;
export function readAnimationDraft(id:EditableBeast):AnimationProject|undefined {
  try{const raw=localStorage.getItem(animationDraftKey(id));if(!raw)return;const p=validateAnimationProject(JSON.parse(raw));if(p.beastId===id)return p;}catch{/* Editor surfaces invalid draft instead of silently adopting it. */}
}

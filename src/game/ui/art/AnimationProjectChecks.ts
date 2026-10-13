import { createAnimationProject, validateAnimationProject, frameAtTime, timeForFrame, animationFrameTransform } from './AnimationProject';
export function animationProjectChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw Error(`Animation project: ${label}`);};
  const p=createAnimationProject('beast-c');
  expect(validateAnimationProject(JSON.parse(JSON.stringify(p))).beastId==='beast-c','export/import roundtrip');
  const clone=createAnimationProject('beast-c');clone.clips.attack.frames[0].x=2000;
  let rejected=false;try{validateAnimationProject(clone);}catch{rejected=true;}expect(rejected,'crop outside sheet rejected');
  clone.clips.attack.frames[0].x=0;clone.clips.attack.order=[0,0,2,3,4,5,6,7];rejected=false;try{validateAnimationProject(clone);}catch{rejected=true;}expect(rejected,'duplicate frame order rejected');
  clone.clips.attack.order=[0,1,2,3,4,5,6,7];clone.clips.attack.frames[0].groundX=NaN;rejected=false;try{validateAnimationProject(clone);}catch{rejected=true;}expect(rejected,'nonfinite metadata rejected');
  const c=p.clips.attack;c.order=[7,6,5,4,3,2,1,0];c.frames[7].durationMs=500;
  expect(frameAtTime(c,0).frame===7&&frameAtTime(c,100).frame===0,'one-shot order and terminal frame');
  expect(frameAtTime(c,timeForFrame(c,5)+.00001).frame===5,'weighted frame seeking matches order');
  c.loop=true;expect(frameAtTime(c,8/c.fps).frame===7,'loop returns to first ordered frame');
  const f=c.frames[7];f.groundX=10;f.groundY=20;f.scaleMultiplier=2;f.offsetX=3;f.offsetY=-4;
  const t=animationFrameTransform(c,7);expect(Math.abs(t.x-(-10+3)*t.scale)<.000001&&Math.abs(t.y-(-20-4)*t.scale)<.000001,'anchor/offset transform shared by editor and review');
  expect(createAnimationProject('beast-c').clips.attack.frames[7].scaleMultiplier===1,'edits never mutate source JSON');
  console.log('Animation Studio project checks passed.');
}

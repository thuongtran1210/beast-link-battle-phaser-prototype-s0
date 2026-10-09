import { campTravelSeconds } from './CampMovement';
interface Activity {
  beast:HTMLElement; station:HTMLElement; kind:string; homeX:number; homeY:number;
  phase:'rest'|'walk'|'work'|'return'; remaining:number;
  anchor?:{x:number;y:number};
}
/** One clock per mounted Camp, with lifecycle cleanup and hidden-tab pause. */
export class CampActivityController {
  private activities:Activity[]=[];
  private frame=0;
  private last=0;
  private running=false;
  constructor(private readonly onWork:(kind:string)=>void) {}
  add(beast:HTMLElement,station:HTMLElement,kind:string,homeX:number,homeY:number,anchor?:{x:number;y:number}):void {
    beast.classList.add('camp-autonomous');
    this.activities.push({beast,station,kind,homeX,homeY,anchor,phase:'rest',remaining:1+this.activities.length*2});
  }
  start():void {
    if(this.running)return;
    this.running=true; this.frame=requestAnimationFrame(this.tick);
  }
  dispose():void {
    this.running=false;cancelAnimationFrame(this.frame);
    for(const a of this.activities) {
      a.beast.classList.remove('camp-autonomous','camp-working',`camp-action-${a.kind}`);
      a.station.classList.remove(`camp-action-${a.kind}`);
    }
    this.activities=[];
  }
  private tick=(now:number):void=>{
    if(!this.running)return;
    const dt=this.last?Math.min((now-this.last)/1000,.1):0;this.last=now;
    if(!document.hidden) for(const a of this.activities) {
      a.remaining-=dt;
      if(a.remaining>0)continue;
      const ground=a.beast.parentElement;
      if(!ground)continue;
      if(a.phase==='rest') {
        // Measure the rendered prop: anchors remain attached across resize/cover.
        const x=a.anchor?.x ?? (a.station.offsetLeft+a.station.offsetWidth*(a.kind==='anvil'?.52:.34))/ground.clientWidth*100;
        const y=a.anchor?.y ?? (a.station.offsetTop+a.station.offsetHeight*.70-a.beast.offsetHeight)/ground.clientHeight*100;
        const duration=campTravelSeconds(parseFloat(a.beast.style.left),parseFloat(a.beast.style.top),x,y,ground.clientWidth,ground.clientHeight);
        a.beast.style.setProperty('--camp-travel',`${duration}s`);
        this.face(a.beast,x-parseFloat(a.beast.style.left));
        a.beast.style.left=`${x}%`;a.beast.style.top=`${Math.max(0,y)}%`;
        a.beast.style.zIndex=String(Math.round(y*10));a.phase='walk';a.remaining=duration;
      } else if(a.phase==='walk') {
        const prop=a.station.getBoundingClientRect(),body=a.beast.getBoundingClientRect();
        this.face(a.beast,a.kind==='fishing'?1:prop.left+prop.width/2-body.left-body.width/2);
        a.beast.classList.add('camp-working',`camp-action-${a.kind}`);
        a.station.classList.add(`camp-action-${a.kind}`);
        a.beast.dataset.activity=a.kind==='anvil'?'Đang làm đồ chơi':a.kind==='garden'?'Đang tưới rau':a.kind==='fishing'?'Đang câu cá':a.kind==='carrot'?'Đang ăn cà rốt':'Đang nghỉ trong bồn';
        this.onWork(a.kind);a.phase='work';a.remaining=8;
      } else if(a.phase==='work') {
        a.beast.classList.remove('camp-working',`camp-action-${a.kind}`);
        a.station.classList.remove(`camp-action-${a.kind}`);
        this.face(a.beast,a.homeX-parseFloat(a.beast.style.left));
        const duration=campTravelSeconds(parseFloat(a.beast.style.left),parseFloat(a.beast.style.top),a.homeX,a.homeY,ground.clientWidth,ground.clientHeight);
        a.beast.style.setProperty('--camp-travel',`${duration}s`);
        a.beast.style.left=`${a.homeX}%`;a.beast.style.top=`${a.homeY}%`;
        a.beast.style.zIndex=String(Math.round(a.homeY));a.beast.dataset.activity='Đang nghỉ';
        a.phase='return';a.remaining=duration;
      } else {a.phase='rest';a.remaining=10;}
    }
    this.frame=requestAnimationFrame(this.tick);
  };
  private face(beast:HTMLElement,dx:number):void {
    // Vertical-only movement retains the last horizontal facing.
    if(Math.abs(dx)>.01) {
      beast.style.setProperty('--camp-facing',dx<0?'-1':'1');
      beast.dataset.facing=dx<0?'left':'right';
    }
  }
}

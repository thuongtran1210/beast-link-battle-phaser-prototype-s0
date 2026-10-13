export interface RushTone {frequency:number;end:number;delay:number;duration:number;type:OscillatorType}
export function rushSoundRecipe(kind:'select'|'invalid'|'match'|'spawn',contentId:string):RushTone[] {
  const energy=contentId.startsWith('energy-');
  const tone=(frequency:number,end:number,delay=0,duration=.12,type:OscillatorType='sine'):RushTone=>({frequency,end,delay,duration,type});
  if(kind==='select')return [tone(energy?430:560,energy?300:780,0,.075)];
  if(kind==='invalid')return [tone(190,105,0,.14,'triangle')];
  if(kind==='spawn')return [tone(330,480,0,.06)];
  if(!energy)return [tone(480,650),tone(650,880,.065,.14)];
  if(contentId==='energy-a')return [tone(780,1040),tone(1040,1250,.05,.10)];
  if(contentId==='energy-e')return [tone(260,180,0,.13,'triangle'),tone(520,350,.015,.08)];
  if(contentId==='energy-c')return [tone(170,75,0,.12,'triangle'),tone(670,220,.04,.09,'triangle')];
  return [tone(300,95,0,.1,'triangle'),tone(480,240,.035,.08)];
}

/** Gesture-unlocked, quiet synthesized prototype SFX; no audio files required. */
class RushSfxPlayer {
  private context?:AudioContext;
  private enabledValue?:boolean;
  private voices=new Set<OscillatorNode>();
  private lastSelection=-Infinity;
  get enabled():boolean {
    if(this.enabledValue===undefined){try{this.enabledValue=localStorage.getItem('beast-link-sfx')!=='off';}catch{this.enabledValue=true;}}
    return this.enabledValue;
  }
  setEnabled(enabled:boolean):void {
    this.enabledValue=enabled;
    try{localStorage.setItem('beast-link-sfx',enabled?'on':'off');}catch{/* Optional device preference. */}
    if(!enabled)for(const voice of this.voices){try{voice.stop();}catch{/* Already ended. */}}
  }
  unlock():void {
    if(!this.enabled || typeof window==='undefined')return;
    try{this.context??=new AudioContext();if(this.context.state==='suspended')void this.context.resume().catch(()=>{});}catch{/* Unsupported audio must not affect play. */}
  }
  play(kind:'select'|'invalid'|'match'|'spawn',contentId:string,pitch=1):void {
    const ctx=this.context;
    if(!this.enabled||!ctx||ctx.state!=='running'||document.hidden)return;
    if(kind==='select' && ctx.currentTime-this.lastSelection<.045)return;
    if(kind==='select')this.lastSelection=ctx.currentTime;
    for(const tone of rushSoundRecipe(kind,contentId)) {
      if(this.voices.size>=4)break;
      const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+tone.delay;
      osc.type=tone.type;osc.frequency.setValueAtTime(tone.frequency*pitch,t);osc.frequency.exponentialRampToValueAtTime(tone.end*pitch,t+tone.duration);
      gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.045,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+tone.duration);
      osc.connect(gain);gain.connect(ctx.destination);this.voices.add(osc);
      osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};
      osc.start(t);osc.stop(t+tone.duration+.01);
    }
  }
}
export const rushSfx=new RushSfxPlayer();

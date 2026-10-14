import { VILLAGE_ANIMATIONS } from './VillageAnimation';
import { VillageSpritePlayer } from './VillageSpritePlayer';
import { VILLAGE_SCENE } from '../../run/VillageSceneLayout';
const station=VILLAGE_SCENE.guardPost;
const post={x:station.x+station.observe.x,y:station.y+station.observe.y};
const route=[post,{x:500,y:740},{x:500,y:400},{x:680,y:400}];
/** Patrol is presentation only; no raid/combat effects or independent RAF. */
export class VillagePatrolView {
 private player?:VillageSpritePlayer;private host?:HTMLElement;private elapsed=0;
 constructor(private root:HTMLElement){}
 rebind():void{this.player?.dispose();this.player=undefined;this.host=undefined;}
 paint(seconds=0):void {
  const host=this.root.querySelector<HTMLElement>('.camp-beast[data-beast-id="beast-a"]');if(!host)return;
  this.elapsed+=Number.isFinite(seconds)&&seconds>0?seconds:0;
  if(host!==this.host){this.rebind();this.host=host;const image=host.querySelector<HTMLImageElement>('img');if(image)this.player=new VillageSpritePlayer(host,image,VILLAGE_ANIMATIONS['beast-a']??{});}
  // Observe at the post, walk the circuit and return. Still only walk/idle clips.
  let t=this.elapsed;let total=4;for(let i=0;i<route.length;i++){const a=route[i],b=route[(i+1)%route.length];total+=Math.hypot(b.x-a.x,b.y-a.y)/65+(i===route.length-1?0:2);}t%=total;
  if(t<4){this.pose(post.x,post.y,false,1,t,true);return;}t-=4;
  for(let i=0;i<route.length;i++){const a=route[i],b=route[(i+1)%route.length],duration=Math.hypot(b.x-a.x,b.y-a.y)/65,pause=i===route.length-1?0:2;if(t<duration+pause){const moving=t<duration,ratio=Math.min(1,t/duration);this.pose(a.x+(b.x-a.x)*ratio,a.y+(b.y-a.y)*ratio,moving,b.x<a.x?-1:1,t,false);return;}t-=duration+pause;}
 }
 private pose(x:number,y:number,moving:boolean,facing:number,time:number,atPost:boolean):void {
  const host=this.host!;host.style.left=`${x-46}px`;host.style.top=`${y-100}px`;host.style.zIndex=String(Math.round(y));host.style.transition='none';host.dataset.activity=moving?'Snowguard đi tuần':atPost?'Snowguard quan sát tại trạm canh':'Snowguard quan sát trên tuyến';host.dataset.patrolLocation=atPost?'post':'route';this.player?.play(moving?'walk':'idle',facing);if(moving)this.player?.seek(time);
  const station=this.root.querySelector<HTMLElement>('.village-guard-post');if(station){station.dataset.guardStatus=atPost?'observing':'patrolling';station.setAttribute('aria-label',atPost?'Trạm canh · Snowguard đang quan sát':'Trạm canh · Snowguard đang đi tuần');}
 }
 dispose():void{this.rebind();}
}

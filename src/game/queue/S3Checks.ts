import { BattleQueue } from './BattleQueue'; import { StarConverter } from './StarConverter'; import { GamePhase } from '../state/GamePhase'; import { PhaseController } from '../state/PhaseController';
export function runS3Checks(): void {
 const c=new StarConverter(); const stars=(n:number)=>c.bulk('beast-a',n).map(x=>x.star).join(',');
 ok(stars(0)==='', '0'); ok(stars(1)==='1','1'); ok(stars(3)==='2','3'); ok(stars(9)==='3','9'); ok(stars(10)==='3,1','10 bulk');
 const q=new BattleQueue(); q.addBeastMatch('a');q.addBeastMatch('a');q.addBeastMatch('a'); q.addBeastMatch('b'); ok(q.consume('a',3)&&q.count('a')===0&&!q.consume('b',2)&&q.count('b')===1,'safe exact consumption');
 const i=new BattleQueue(); for(let x=0;x<10;x++)i.addBeastMatch('a'); const individual:number[]=[]; while(true){const n=c.highestAffordable(i.count('a'));if(!n)break;i.consume('a',n.cost);individual.push(n.star)} ok(individual.join(',')===stars(10)&&i.count('a')===0,'individual equals bulk');
 const p=new PhaseController(); p.setPhase(GamePhase.EnergyRush); p.setPhase(GamePhase.BattleSetup); const all=new BattleQueue(); for(let x=0;x<3;x++)all.addBeastMatch('a'); all.addBeastMatch('b'); const units=all.entries().flatMap(e=>c.bulk(e.contentId,e.count)); for(const e of [...all.entries()]) all.consume(e.contentId,e.count); p.setPhase(GamePhase.Battle); ok(units.length===2&&all.entries().length===0&&p.phase===GamePhase.Battle,'start battle');
}
function ok(v:boolean,n:string):void{if(!v)throw new Error(`S3 check failed: ${n}`)}

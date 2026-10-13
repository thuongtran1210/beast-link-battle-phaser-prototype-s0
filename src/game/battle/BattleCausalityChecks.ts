import { BattleFormation } from './BattleFormation';
import { AutonomousBattleModel, P1V11A_TIMELINE_RULES, SIMULATION_STEP } from './AutonomousBattleModel';
import { deriveBattleTickPresentation } from './BattlePresentation';
export function battleCausalityChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw Error('Battle causality: '+label);};
  const formation=new BattleFormation([{contentId:'beast-a',star:1}]);
  formation.place(formation.units[0].unitId,'front-3');
  const model=new AutonomousBattleModel(formation,[
    {enemyId:'killer-a',slotId:'enemy-front-3',row:'Front',column:3,maxHp:1000,damage:25},
    {enemyId:'killer-b',slotId:'enemy-front-4',row:'Front',column:4,maxHp:1000,damage:25},
  ],P1V11A_TIMELINE_RULES);
  let sawHit=false,sawKO=false;
  for(let i=0;i<400&&model.snapshot.status==='Running';i++) {
    const before=model.snapshot,after=model.step(SIMULATION_STEP);
    const event=deriveBattleTickPresentation(before,after);
    const actions=after.lastEnemyActions??[];
    const hpLoss=before.units[0].currentHp-after.units[0].currentHp;
    expect(Math.abs(actions.reduce((sum,a)=>sum+a.damage,0)-hpLoss)<.0001,'resolved source events account for all HP loss');
    expect(JSON.stringify(event.enemyAttackers)===JSON.stringify(after.lastEnemyActions),'presentation retains exact source, target and damage');
    for(const action of actions) {
      sawHit=true;
      expect(action.enemyId==='killer-a'||action.enemyId==='killer-b','source is actual fixture enemy');
      expect(action.targetUnitId===formation.units[0].unitId,'target is stable unit identity');
      expect(action.damage>=0&&action.damage<=25,'damage uses actual clamped HP loss');
      if(action.defeated){sawKO=true;expect(event.defeatedUnitIds.includes(action.targetUnitId),'lethal action matches KO event');}
    }
    if(actions.length){actions[0].damage=-99;expect((model.snapshot.lastEnemyActions?.[0].damage??-99)>=0,'snapshot action cannot mutate model');}
  }
  const before=model.snapshot;
  const duplicate={...before,lastPlayerActions:[
    {unitId:formation.units[0].unitId,role:'Tanker' as const,kind:'GuardStrike' as const,hits:[{enemyId:'killer-a',damage:1}]},
    {unitId:formation.units[0].unitId,role:'Tanker' as const,kind:'Ram' as const,hits:[{enemyId:'killer-b',damage:2}]},
  ]};
  const event=deriveBattleTickPresentation(before,duplicate);
  expect(event.attackers.length===2&&event.attackers[0].targetEnemyIds[0]==='killer-a'&&event.attackers[1].targetEnemyIds[0]==='killer-b','multiple actions by one source retain both targets');
  expect(sawHit&&sawKO,'fixture reaches sourced hits and lethal impact');
}

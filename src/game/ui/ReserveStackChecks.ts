import { reserveStacks } from './ReserveStacks';
import { BattleFormation } from '../battle/BattleFormation';
import { RunRoster } from '../run/RunRoster';
export function reserveStackChecks():void {
  const expect=(ok:boolean,label:string)=>{if(!ok)throw new Error(`Reserve stacks: ${label}`);};
  const roster=new RunRoster(); roster.recruit([{contentId:'beast-a',star:1},{contentId:'beast-a',star:1},{contentId:'beast-a',star:2},{contentId:'beast-c',star:1}]);
  const formation=new BattleFormation(roster.formationUnits());
  const stacks=reserveStacks(formation.units,roster.units);
  expect(stacks.length===3 && stacks[0].count===2,'identical bodies grouped, species/tier separate');
  const bodies=roster.units;bodies[1].currentHp-=1;
  expect(reserveStacks(formation.units,bodies).length===4,'wounded body stays individually visible');
  formation.place(stacks[0].unit.unitId,'front-1');
  const reserve=formation.units.filter(unit=>unit.slotId===null);
  expect(reserveStacks(reserve,roster.units)[0].count===1,'deploying representative reveals next copy');
  expect(roster.units.length===4,'presentation does not consume roster');
}

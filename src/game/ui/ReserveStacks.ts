import type { FormationUnit } from '../battle/BattleFormation';
import type { RunUnitInstance } from '../run/RunRoster';
/** Stack only identical type/tier/HP bodies. Wounded instances remain distinct. */
export function reserveStacks(units:readonly FormationUnit[], roster:readonly RunUnitInstance[]):Array<{unit:FormationUnit; count:number}> {
  const bodies=new Map(roster.map(unit=>[unit.instanceId,unit]));
  const stacks=new Map<string,{unit:FormationUnit;count:number}>();
  for(const unit of units){
    const body=bodies.get(unit.unitId);
    const key=`${unit.beastId}:${unit.star}:${body?.currentHp ?? unit.unitId}:${body?.maxHp ?? 0}:${body?.status ?? 'ready'}`;
    const existing=stacks.get(key);if(existing)existing.count++;else stacks.set(key,{unit,count:1});
  }
  return [...stacks.values()];
}

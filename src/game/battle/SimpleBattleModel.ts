import type { DeployedUnit } from '../queue/StarConverter';
/** Prototype-only technical fixture: enemyPressure starts at 90; not a design/balance rule. */
export class SimpleBattleModel { enemyPressure=90; constructor(readonly deployedUnits:ReadonlyArray<DeployedUnit>){} castDamageSkill():void{this.enemyPressure=Math.max(0,this.enemyPressure-10)} }

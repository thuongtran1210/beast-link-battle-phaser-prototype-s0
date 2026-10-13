import {characterRecord} from './CharacterProjects';
import {validateUnitConfig,type UnitConfig,type CharacterId} from './CharacterSchema';
export type UnitOverride=UnitConfig;
export function unitOverride(id:string):Readonly<UnitOverride> { return characterRecord(id).unit??{}; }
export function unitBaseStats(id:string,base:Readonly<{hp:number;damage:number}>):{hp:number;damage:number} {
  const edit=unitOverride(id);return {hp:edit.hp??base.hp,damage:edit.damage??base.damage};
}
export function validateUnitOverride(value:unknown,id:CharacterId='beast-a'):UnitOverride {return validateUnitConfig(value,id);}

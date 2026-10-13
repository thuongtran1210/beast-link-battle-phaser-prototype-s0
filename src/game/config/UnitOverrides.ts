import saved from './UnitOverrides.json';
export interface UnitOverride { hp?:number; damage?:number; avatar?:string }
const overrides:Record<string,UnitOverride>=saved;
export function unitOverride(id:string):Readonly<UnitOverride> { return overrides[id]??{}; }
export function unitBaseStats(id:string,base:Readonly<{hp:number;damage:number}>):{hp:number;damage:number} {
  const edit=unitOverride(id);return {hp:edit.hp??base.hp,damage:edit.damage??base.damage};
}
export function validateUnitOverride(value:unknown):UnitOverride {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Cấu hình không hợp lệ.');
  const data=value as Record<string,unknown>,out:UnitOverride={};
  if(Object.keys(data).some(k=>!['hp','damage','avatar'].includes(k)))throw Error('Trường cấu hình không hỗ trợ.');
  for(const key of ['hp','damage'] as const){const n=data[key];if(n!==undefined){if(typeof n!=='number'||!Number.isFinite(n)||n<1||n>100000)throw Error(`${key}: nhập số từ 1 đến 100000.`);out[key]=n;}}
  if(data.avatar!==undefined){if(typeof data.avatar!=='string'||!/^\/assets\/unit-custom\/beast-[a-j]-[a-f0-9]{16}\.png$/.test(data.avatar))throw Error('Đường dẫn avatar không hợp lệ.');out.avatar=data.avatar;}
  return out;
}

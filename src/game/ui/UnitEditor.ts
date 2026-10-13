import './UnitEditor.css';
import { DECK_UNITS } from '../run/RunDeck';
import { roleForBeast } from '../battle/BeastRoles';
import { roleBaseStats } from '../battle/AutonomousBattleModel';
import { starStatMultiplier } from '../run/StarProfile';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { unitOverride,validateUnitOverride,type UnitOverride } from '../config/UnitOverrides';
const requested=new URLSearchParams(location.search).get('unit');
const id=DECK_UNITS.includes(requested as typeof DECK_UNITS[number])?requested!:DECK_UNITS[0];
const original=JSON.parse(JSON.stringify(unitOverride(id))) as UnitOverride;
let avatarData:string|undefined,dirty=false,busy=false,revision='';
const root=document.querySelector<HTMLDivElement>('#unit-editor')!;
root.innerHTML=`<header><div><small>BEAST LINK BATTLE · UNIT STUDIO</small><h1>Avatar & thông số</h1><p>Chỉnh từng Beast, xem thử và lưu vào dự án.</p></div><a href="/unit-review.html?unit=${id}">← Review nhân vật</a></header><main><nav aria-label="Nhân vật"></nav><article><h2>${beastDisplayName(id)}</h2><section><h3>Avatar Grid Board</h3><div class="avatar-tools"><label class="upload">Chọn ảnh mới<input type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button class="original-avatar">Dùng avatar gốc</button></div><p>PNG / JPEG / WebP · tối đa 5 MB. Ảnh được căn giữa, giữ tỷ lệ trên canvas trong suốt 256×256.</p><div class="avatar-previews"><div><img class="large-avatar" alt="Avatar đang chỉnh"><span>Ảnh 128px</span></div><div><div class="grid-sample" aria-label="Mẫu avatar ở kích thước ô Grid"></div><span>Ô Grid 44 / 56 / 72px</span></div></div></section><section><h3>Thông số cơ sở · 1★</h3><p>Thay đổi riêng nhân vật này. 2★ và 3★ dùng hệ số STAR hiện có.</p><div class="stat-fields"><label>HP tối đa<input class="hp" type="number" min="1" max="100000" step="1"></label><label>Sát thương cơ sở<input class="damage" type="number" min="1" max="100000" step="0.1"></label></div><table><thead><tr><th>STAR</th><th>HP</th><th>Sát thương</th></tr></thead><tbody></tbody></table><p>Kỹ năng đặc trưng, nhịp đánh và thời gian khống chế vẫn theo cấu hình hiện tại.</p></section><div class="save-actions"><button class="save">Lưu vào dự án</button><button class="reset">Khôi phục mặc định</button><a class="animation">Chỉnh animation →</a></div><p class="status" role="status" aria-live="polite">Chưa thay đổi.</p><footer>Lưu trực tiếp cần server phát triển local. Cấu hình cũ được sao lưu trước mỗi lần ghi. Tải lại game để dùng avatar/thông số mới; trận đang chạy giữ nguyên trạng thái.</footer></article></main>`;
const q=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
q('.upload').tabIndex=0;q('.upload').setAttribute('role','button');q('.upload').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();q<HTMLInputElement>('input[type=file]').click();}};
const base=roleBaseStats(roleForBeast(id));
q<HTMLInputElement>('.hp').value=String(original.hp??base.hp);q<HTMLInputElement>('.damage').value=String(original.damage??base.damage);
const art=BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART];
let avatar=original.avatar;
function status(text:string,error=false){q('.status').textContent=text;q('.status').classList.toggle('error',error);}
function preview(){
  const source=avatarData??avatar??art.icon!;q<HTMLImageElement>('.large-avatar').src=source;q('.grid-sample').replaceChildren();
  for(const size of [44,56,72]){const cell=document.createElement('div');cell.className='grid-cell';cell.style.width=cell.style.height=`${size}px`;const image=new Image();image.src=source;image.alt=beastDisplayName(id);cell.append(image);q('.grid-sample').append(cell);}
  const hp=Number(q<HTMLInputElement>('.hp').value),damage=Number(q<HTMLInputElement>('.damage').value);
  q('tbody').innerHTML=[1,2,3].map(star=>{const m=starStatMultiplier(star as 1|2|3);return `<tr><td>${star}★</td><td>${Number.isFinite(hp)?Number((hp*m).toFixed(3)):'—'}</td><td>${Number.isFinite(damage)?Number((damage*m).toFixed(3)):'—'}</td></tr>`;}).join('');
}
for(const beast of DECK_UNITS){const a=document.createElement('a');a.href=`/unit-editor.html?unit=${beast}`;a.textContent=beastDisplayName(beast);if(beast===id)a.setAttribute('aria-current','page');q('nav').append(a);}
q<HTMLAnchorElement>('.animation').href=`/animation-editor.html?unit=${id}`;q<HTMLAnchorElement>('.animation').hidden=!['beast-a','beast-c','beast-e'].includes(id);
for(const key of ['hp','damage'])q<HTMLInputElement>(`.${key}`).oninput=()=>{dirty=true;preview();status('Có thay đổi chưa lưu.');};
q<HTMLInputElement>('input[type=file]').onchange=async event=>{
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
  try{if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Chọn PNG/JPEG/WebP tối đa 5 MB.');
    const bitmap=await createImageBitmap(file);try{if(bitmap.width>8192||bitmap.height>8192)throw Error('Ảnh tối đa 8192px mỗi chiều.');const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!,s=256/Math.max(bitmap.width,bitmap.height),w=bitmap.width*s,h=bitmap.height*s;ctx.drawImage(bitmap,(256-w)/2,(256-h)/2,w,h);avatarData=canvas.toDataURL('image/png');}finally{bitmap.close();}
    dirty=true;preview();status('Avatar mới chưa lưu.');
  }catch(error){status((error as Error).message,true);}finally{input.value='';}
};
q<HTMLButtonElement>('.original-avatar').onclick=()=>{avatarData=undefined;avatar=undefined;dirty=true;preview();status('Đã chọn avatar gốc; cần lưu để áp dụng.');};
async function hash(value:UnitOverride){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))).map(n=>n.toString(16).padStart(2,'0')).join('');}
async function save(reset=false){
  if(busy)return;busy=true;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
  try{const value=reset?{}:validateUnitOverride({hp:Number(q<HTMLInputElement>('.hp').value),damage:Number(q<HTMLInputElement>('.damage').value),...(avatar?{avatar}:{})});
    status('Đang kiểm tra và lưu vào dự án…');if(!revision)revision=await hash(original);
    const response=await fetch('/__unit-editor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,value,reset,revision,...(!reset&&avatarData?{avatarData}:{})})});
    const result=await response.json();if(!response.ok)throw Error(result.error??'Không lưu được.');
    revision=result.revision;dirty=false;avatar=result.value.avatar;avatarData=undefined;preview();status('Đã lưu vào dự án và sao lưu bản cũ. Tải lại Review/game để áp dụng.');
    if(reset){q<HTMLInputElement>('.hp').value=String(base.hp);q<HTMLInputElement>('.damage').value=String(base.damage);preview();}
  }catch(error){status(`${(error as Error).message} Dữ liệu trên form vẫn được giữ.`,true);}finally{busy=false;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);}
}
q<HTMLButtonElement>('.save').onclick=()=>void save();q<HTMLButtonElement>('.reset').onclick=()=>{if(confirm('Khôi phục avatar và HP/sát thương mặc định của nhân vật? Bản cũ được sao lưu.'))void save(true);};
addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});preview();

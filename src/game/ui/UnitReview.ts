import './UnitReview.css';
import { DECK_UNITS } from '../run/RunDeck';
import { roleForBeast, signatureForBeast, recommendedRows } from '../battle/BeastRoles';
import { roleBaseStats } from '../battle/AutonomousBattleModel';
import { P1V11A_ACTION_TIMING_FIXTURE, P1V13A_SIGNATURE_FIXTURE } from '../battle/BattleConfig';
import * as profile from '../run/StarProfile';
import { BATTLE_CHARACTER_ART } from './art/BattleCharacterManifest';
import { beastDisplayName } from './icons/UnitIconRegistry';
import { vietnameseText } from './Vietnamese';
import snow from './art/SnowguardFrames.json';
import iron from './art/IroncladFrames.json';
import rabbit from './art/WindstriderFrames.json';
import type { SnowguardClip } from './art/SnowguardAnimationPlayer';

const rigs:Record<string,{path:string;frames:typeof snow}>={
  'beast-a':{path:'duck-guardian',frames:snow},'beast-e':{path:'bear-hammer',frames:iron},'beast-c':{path:'rabbit-archer',frames:rabbit},
};
const clipNames:Record<SnowguardClip,string>={idle:'Idle · Đứng chờ',walk:'Run · Di chuyển',attack:'Attack · Tấn công',skill:'Skill · Kỹ năng',hit:'Hit · Trúng đòn',ko:'KO · Gục ngã'};
let id=DECK_UNITS[0] as string,star:profile.StarLevel=2,clip:SnowguardClip='idle';
const requested=new URLSearchParams(location.search).get('unit');if(DECK_UNITS.includes(requested as typeof DECK_UNITS[number]))id=requested!;
const root=document.querySelector<HTMLDivElement>('#unit-review')!;
root.innerHTML=`<header><div><small>BEAST LINK BATTLE · TRANG REVIEW</small><h1>Nhân vật & kỹ năng</h1><p>Xem thông số, so sánh STAR và kiểm tra từng frame animation.</p></div><a href="/">Về game →</a></header><main><aside><h2>Đội hình · 10 Beast</h2><nav aria-label="Chọn nhân vật"></nav></aside><section class="review-detail"><div class="review-identity"><img alt=""><div><h2></h2><p></p></div><div class="review-stars" aria-label="Chọn STAR"></div></div><div class="review-stats"></div><section class="review-skill"><h3></h3><p class="skill-summary"></p><dl></dl><details><summary>So sánh 1★ / 2★ / 3★</summary><div class="tier-comparison"></div></details></section><section class="review-animation"><div class="animation-heading"><h3>Animation</h3><span class="animation-status"></span></div><div class="review-clips"></div><canvas width="640" height="440" aria-label="Preview animation nhân vật"></canvas><div class="animation-controls"><button class="play-pause">Tạm dừng</button><button class="replay">Phát lại</button><button class="facing" aria-pressed="false">Hướng: Phải</button><label>Tốc độ <select><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label></div><div class="review-frames" aria-label="Chọn frame"></div><p class="frame-label" role="status"></p></section><footer>Trang kiểm tra nội bộ, không thay đổi save hoặc thông số game. Preview chỉ phát sheet; projectile, khống chế, khiên và sát thương do Battle xử lý riêng.</footer></section></main>`;
const roleNames={Tanker:'Đỡ đòn',Assassin:'Sát thủ',Ranger:'Cung thủ',Mage:'Pháp sư / hỗ trợ'};
for(const beast of DECK_UNITS){const button=document.createElement('button');button.dataset.id=beast;button.innerHTML=`<img src="${BATTLE_CHARACTER_ART[beast].icon}" alt=""><span>${beastDisplayName(beast)}</span>`;button.onclick=()=>{id=beast;render();};root.querySelector('nav')!.append(button);}
for(const value of [1,2,3] as const){const button=document.createElement('button');button.textContent=`${value}★`;button.dataset.star=String(value);button.onclick=()=>{star=value;renderStats();};root.querySelector('.review-stars')!.append(button);}
for(const value of Object.keys(clipNames) as SnowguardClip[]){const button=document.createElement('button');button.dataset.clip=value;button.textContent=clipNames[value];button.onclick=()=>{clip=value;loadClip();};root.querySelector('.review-clips')!.append(button);}

function skillValues():[string,string][] {
  const strength=profile.signatureStrengthForStar(signatureForBeast(id),star);
  switch(signatureForBeast(id)){
    case 'GuardianBrace':return [['Khiên',`${strength} HP · ${P1V13A_SIGNATURE_FIXTURE.guardianBraceDuration}s`],['Số lần Brace',`${profile.guardianBraceActivationLimit(star)}`],['Chia sẻ khiên',`${Math.round(profile.guardianBraceShareRatio(star)*100)}%`]];
    case 'AmbushStrike':return [['Hệ số phục kích',`${strength}× sát thương`],['Giới hạn kích hoạt',`${profile.ambushActivationLimit(star)}`],['Đánh nối tiếp',`${Math.round(profile.ambushChainRatio(star)*100)}% sát thương`]];
    case 'FocusShot':return [['Nạp Focus',`${profile.focusHoldThresholdForStar(star)}s giữ vị trí an toàn`],['Hệ số Focus',`${strength}× sát thương`],['Xuyên',`${profile.focusPierceTargets(star)} mục tiêu phụ · ${Math.round(profile.focusPierceRatio(star)*100)}% sát thương`],['Nhử cà rốt',star===1?'Chưa có':`${star===2?1:2}s · 1 mục tiêu sống · Focus đầu tiên mỗi Battle`]];
    case 'ArcaneBloom':return [['Bán kính Bloom',`${profile.arcaneBloomRadiusForStar(star)} đơn vị model`],['Đánh lan',`${strength}× sát thương · tối đa ${profile.arcaneBloomSecondaryLimitForStar(star)} mục tiêu phụ`],['Echo',`${Math.round(profile.arcaneBloomEchoRatio(star)*100)}% sát thương`],['Vịt hóa',star===1?'Chưa có':`${star===2?'1 mục tiêu / 1s':'tối đa 3 mục tiêu / 1,5s'} · Bloom đầu tiên mỗi Battle`]];
    case 'IronRam':return [['Hệ số Ram',`${strength}× sát thương`],['Đẩy lùi',`${profile.ironRamKnockbackForStar(star)} đơn vị model`],['Gián đoạn',`${profile.ironRamStaggerForStar(star)}s`],['Đánh lan',`${profile.ironRamCleaveTargets(star)} mục tiêu · ${Math.round(profile.ironRamCleaveRatio(star)*100)}% sát thương`]];
    case 'TwinVolley':return [['Nhịp Volley',`Mỗi ${profile.twinVolleyAttackThreshold(star)} đòn`],['Mục tiêu phụ',`${profile.twinVolleySecondaryTargets(star)}`],['Sát thương phụ',`${strength}× sát thương`]];
    case 'WoollyRescue':return [['Hồi máu',`${strength} HP · tối đa ${star===3?2:1} đồng minh bị thương`],['Hồi chiêu',`${star===1?4:3}s`],['Khiên',star===3?'18 HP / 2s':'Chưa có'],['Ưu tiên','Tỷ lệ HP thấp nhất; không hồi sinh hoặc vượt HP tối đa']];
    case 'BubbleTrap':return [['Bong bóng',`${star===3?2:1} địch · ${star===1?'0,8':'1,2'}s`],['Hồi chiêu','5s'],['Hiệu ứng','Ngăn di chuyển và tấn công; bỏ qua địch đã bị khống chế']];
    case 'ToyWorkshop':return [['Khiên',`${star===1?20:star===2?32:44} HP / 3s`],['Mục tiêu',`${star===3?2:1} đồng minh còn sống với khiên <5`],['Hồi chiêu','5s']];
    case 'TickingBomb':return [['Ngòi bom','1,2s'],['Sát thương',`1,5× sát thương nguồn`],['Mục tiêu',`Tối đa ${star} địch sống trong khoảng cách 1,5 model`],['Hồi chiêu','5s'],['Lưu ý','Bom đã đặt vẫn nổ nếu mục tiêu chết']];
  }
}
function renderStats(){
  const role=roleForBeast(id),base=roleBaseStats(role),multiply=profile.starStatMultiplier(star),timing=P1V11A_ACTION_TIMING_FIXTURE[role];
  root.querySelectorAll<HTMLButtonElement>('[data-star]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.star)===star)));
  root.querySelector('.review-stats')!.innerHTML=[['HP tối đa',base.hp*multiply],['Sát thương cơ sở',base.damage*multiply],['Nhịp đánh',`${timing.attackInterval}s`],['Windup',`${timing.windup}s`]].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  root.querySelector('.review-skill h3')!.textContent=signatureForBeast(id).replace(/([A-Z])/g,' $1').trim();
  root.querySelector('.skill-summary')!.textContent=vietnameseText(profile.signatureTierSummary(signatureForBeast(id),star));
  root.querySelector('dl')!.innerHTML=skillValues().map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  root.querySelector('.tier-comparison')!.innerHTML=([1,2,3] as const).map(s=>`<p><b>${s}★</b> ${vietnameseText(profile.signatureTierSummary(signatureForBeast(id),s))}</p>`).join('');
}
const canvas=root.querySelector('canvas')!,context=canvas.getContext('2d')!;
let image:HTMLImageElement|undefined,version=0,position=0,last=0,playing=true,flip=false,speed=1,frameIndex=0;
const duration={idle:8/7,walk:.8,attack:.55,skill:.82,hit:.4,ko:.85};
function render(){
  root.querySelectorAll<HTMLButtonElement>('[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  const art=BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART];
  root.querySelector<HTMLImageElement>('.review-identity img')!.src=art.icon!;
  root.querySelector('.review-identity h2')!.textContent=beastDisplayName(id);
  root.querySelector('.review-identity p')!.textContent=`${roleNames[roleForBeast(id)]} · ${recommendedRows(roleForBeast(id))} · ${id}`;
  renderStats();loadClip();
}
async function loadClip(){
  const current=++version;image=undefined;position=0;frameIndex=0;playing=true;
  root.querySelector('.play-pause')!.textContent='Tạm dừng';
  const rig=rigs[id];
  root.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b=>{b.disabled=!rig;b.setAttribute('aria-pressed',String(b.dataset.clip===clip));});
  root.querySelector('.animation-status')!.textContent=rig?'Sheet 8 frame · đã tích hợp':'Chưa có sheet · xem ảnh cutout';
  root.querySelector('.review-frames')!.replaceChildren();
  if(rig)for(let i=0;i<8;i++){const button=document.createElement('button');button.textContent=String(i+1);button.setAttribute('aria-label',`Xem frame ${i+1}`);button.onclick=()=>{playing=false;position=i*duration[clip]/8;root.querySelector('.play-pause')!.textContent='Phát';};root.querySelector('.review-frames')!.append(button);}
  const next=new Image();next.src=rig?`/assets/characters/${rig.path}/animation_v01/${clip}.png`:BATTLE_CHARACTER_ART[id as keyof typeof BATTLE_CHARACTER_ART].base!;
  try{await next.decode();if(current===version)image=next;}catch{if(current===version)root.querySelector('.animation-status')!.textContent='Không tải được ảnh; kiểm tra asset';}
}
root.querySelector<HTMLButtonElement>('.play-pause')!.onclick=()=>{playing=!playing;root.querySelector('.play-pause')!.textContent=playing?'Tạm dừng':'Phát';};
root.querySelector<HTMLButtonElement>('.replay')!.onclick=()=>{position=0;playing=true;root.querySelector('.play-pause')!.textContent='Tạm dừng';};
root.querySelector<HTMLButtonElement>('.facing')!.onclick=()=>{flip=!flip;root.querySelector('.facing')!.textContent=`Hướng: ${flip?'Trái':'Phải'}`;root.querySelector('.facing')!.setAttribute('aria-pressed',String(flip));};
root.querySelector<HTMLSelectElement>('select')!.onchange=e=>{speed=Number((e.target as HTMLSelectElement).value);};
function draw(now:number){
  const dt=last?Math.max(0,Math.min(.1,(now-last)/1000)):0;last=now;
  if(playing&&!document.hidden)position+=dt*speed;
  context.clearRect(0,0,640,440);context.save();context.translate(320,0);if(flip)context.scale(-1,1);
  context.strokeStyle='#acb59a';context.beginPath();context.moveTo(-280,370);context.lineTo(280,370);context.stroke();
  if(image){
    const rig=rigs[id];
    if(rig){const cells=rig.frames[clip],loop=clip==='idle'||clip==='walk';frameIndex=loop?Math.floor(position/duration[clip]*8)%8:Math.min(7,Math.floor(position/duration[clip]*8));const f=cells[frameIndex];let scale=250/cells[0].bodyHeight;if(clip==='idle')scale=250/f.bodyHeight*(1+(f.bodyHeight/cells[0].bodyHeight-1)*.1);context.drawImage(image,f.x,f.y,f.width,f.height,-f.width*scale/2,370-f.groundY*scale,f.width*scale,f.height*scale);
      root.querySelector('.frame-label')!.textContent=`${clipNames[clip]} · Frame ${frameIndex+1}/8 · ${loop?'Lặp':'Phát một lần, giữ pose cuối trong trang review'} · Sheet ${image.naturalWidth}×${image.naturalHeight}`;
      root.querySelectorAll<HTMLButtonElement>('.review-frames button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===frameIndex)));
    }else{const scale=250/image.naturalHeight;context.drawImage(image,-image.naturalWidth*scale/2,370-250,image.naturalWidth*scale,250);root.querySelector('.frame-label')!.textContent='Ảnh cutout tĩnh; chưa có sheet cho các clip. STAR không thay sheet nhân vật.';}
  }context.restore();requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange',()=>{last=0;});render();requestAnimationFrame(draw);


import { saveCamp, type CampState } from '../run/CampState';
import { gardenBlockReason, VILLAGE_RECIPES } from '../run/VillageEconomy';
import { VillageApplication } from '../run/VillageApplication';

export function showVillageGarden(root:HTMLElement,state:CampState,application=new VillageApplication(state,{save:saveCamp}),onChange:()=>void=()=>{}):void{
 const dialog=document.createElement('dialog');dialog.className='game-dialog village-diary-dialog';dialog.setAttribute('aria-label','Vườn cà rốt');
 const header=document.createElement('header');header.className='diary-panel-header';header.innerHTML='<h2>Vườn cà rốt</h2>';const close=document.createElement('button');close.className='diary-panel-close';close.textContent='×';close.setAttribute('aria-label','Đóng vườn');close.onclick=()=>dialog.close();header.append(close);dialog.append(header);
 const recipe=VILLAGE_RECIPES.garden,content=document.createElement('div');content.className='diary-event-list';content.innerHTML=`<article class="journey-step"><strong>Windstrider · Nông dân</strong><p>${recipe.money} Đồng vật tư → ${recipe.seconds} giây làm việc → ${recipe.quantity} cà rốt.</p><p>Gieo → cây lớn → trưởng thành → thu hoạch một lần → giỏ chờ lấy. Sprite luống hiện là hình thử bằng SVG; chưa phải art đã duyệt.</p></article>`;
 const status=document.createElement('p');status.setAttribute('role','status');const progress=document.createElement('progress');progress.setAttribute('aria-label','Tiến độ trồng cà rốt');content.append(status,progress);
 const collect=document.createElement('button');collect.textContent='Nhận giỏ vào Kho (thủ công tạm)';
 collect.onclick=()=>{const result=application.collectGarden();if(!result.ok){status.textContent=result.block.message;return;}onChange();refresh();};content.append(collect);
 const note=document.createElement('p');note.textContent='Swiftwing tự mang giỏ tới điểm nhận cạnh nhà chung nếu đã là cư dân. Nhận thủ công là fallback khi chưa có người vận chuyển; không lấy giỏ đã được nhận vận chuyển. Hàng giữ chỗ kho, không sản xuất offline; lượt cũ giữ thông số đã lưu.';content.append(note);dialog.append(content);
 const labels={empty:'Luống trống',sowing:'Đang gieo hạt',growing:'Cây đang lớn',mature:'Cà rốt trưởng thành',harvesting:'Đang thu hoạch', 'waiting-pickup':'Giỏ cà rốt chờ lấy'};
 const refresh=()=>{const job=state.economy.garden,snapshot=application.garden();progress.max=job?.totalSeconds??recipe.seconds;progress.value=job?progress.max-job.remaining:0;collect.disabled=!job?.harvested||Boolean(application.carrier()&&application.carrier()?.phase!=='return');status.textContent=!state.residents.includes('beast-c')?'Cần đón Windstrider':job?`${labels[snapshot.stage]} · ${snapshot.quantity} cà rốt/lượt${job.remaining>0?` · Còn ${Math.ceil(job.remaining)}s`:''}`:gardenBlockReason(state)??'Luống trống · Chờ gieo hạt';};
 refresh();const timer=window.setInterval(refresh,1000);dialog.onclose=()=>{window.clearInterval(timer);dialog.remove();};root.append(dialog);dialog.showModal();
}

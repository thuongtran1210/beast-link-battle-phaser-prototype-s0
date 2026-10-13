import type Phaser from 'phaser';
import { firstJourneyStage, saveFirstJourney } from '../run/FirstJourney';
import { GamePhase } from '../state/GamePhase';

const guidance:Partial<Record<GamePhase,{title:string;text:string}>>={
  [GamePhase.BeastRush]:{title:'1 · Gặp những người bạn đầu tiên',text:'Chạm hai ô Beast giống nhau có đường nối hợp lệ, tối đa 2 lần đổi hướng. Mỗi cặp mang về một Beast. Đồng hồ chỉ bắt đầu sau cặp đúng đầu tiên.'},
  [GamePhase.EnergyRush]:{title:'2 · Mang kỹ năng vào trận',text:'Nối các ô Energy giống nhau để tích lượt dùng. Hồi máu, tạo khiên, phá tuyến và ngắt đòn sẽ giúp đội trong Battle. Lượt chưa dùng giữ qua các đợt.'},
  [GamePhase.BattleSetup]:{title:'3 · Chuẩn bị đội hình',text:'Chọn Beast ở Reserve rồi chạm một vị trí trên sân. Đặt quân đỡ đòn phía trước, cung thủ và pháp sư phía sau. Có thể bắt đầu với 1–4 quân; không cần đưa tất cả ra trận.'},
  [GamePhase.Battle]:{title:'4 · Quan sát và giúp đội đúng lúc',text:'Beast tự chiến đấu. Chạm nhanh Energy để dùng khi hợp lệ; giữ để xem hiệu ứng. Mỗi lần dùng thành công mất 1 lượt. Bạn không cần nối ô khi giao chiến.'},
  [GamePhase.WaveResult]:{title:'Tiếp tục chuyến đi',text:'Beast còn sống giữ HP; quân KO không thể ra trận. Qua đợt mới, bạn tuyển thêm bạn và xếp lại đội hình. Thắng cả 3 đợt nhận 15 Gỗ mang về Làng.'},
};
const shown=new WeakMap<Phaser.Scene,Set<GamePhase>>();
export function showFirstJourneyPhase(scene:Phaser.Scene,phase:GamePhase):void {
  if(firstJourneyStage()!=='expedition'||!guidance[phase])return;
  let seen=shown.get(scene);if(!seen){seen=new Set();shown.set(scene,seen);}
  if(seen.has(phase))return;seen.add(phase);
  const info=guidance[phase]!;
  // Schedule after scene creation/phase setup; timers and combat pause under the guide.
  scene.time.delayedCall(0,()=>{
    const dialog=document.createElement('dialog');dialog.className='game-dialog first-journey-dialog';
    const title=document.createElement('h2');title.textContent=info.title;
    const text=document.createElement('p');text.textContent=info.text;
    const button=document.createElement('button');button.textContent='Đã hiểu · Tiếp tục';
    dialog.append(title,text,button);document.getElementById('game-shell')!.append(dialog);
    scene.scene.pause();dialog.showModal();button.onclick=()=>dialog.close();
    const dispose=()=>{dialog.onclose=null;dialog.remove();};scene.events.once('shutdown',dispose);
    dialog.onclose=()=>{scene.events.off('shutdown',dispose);dialog.remove();scene.scene.resume();window.dispatchEvent(new Event('resize'));};
  });
}

export function showFirstVillage(root:HTMLElement):void {
  if(firstJourneyStage()!=='village')return;
  const dialog=document.createElement('dialog');dialog.className='game-dialog first-journey-dialog';
  dialog.innerHTML='<h2>Chào mừng về Làng</h2><p>Những Beast đã chiêu mộ sẽ trở thành cư dân, kể cả khi chuyến đi vừa rồi thất bại.</p><ol><li><strong>Cư dân</strong> — tìm bạn và xem công việc.</li><li><strong>Xây dựng</strong> — dùng Gỗ để đặt công trình.</li><li><strong>Kho</strong> — quản lý sản phẩm, thức ăn và thu chi.</li></ol><p>Chạm Mục tiêu để bắt đầu mở xưởng đồ chơi. Bạn có thể thám hiểm tiếp để gặp Ironclad và kiếm Gỗ.</p><button>Khám phá Làng</button>';
  const status=document.createElement('p');status.setAttribute('role','status');dialog.append(status);
  root.append(dialog);dialog.showModal();dialog.oncancel=e=>e.preventDefault();
  dialog.querySelector('button')!.onclick=()=>{
    if(saveFirstJourney('done'))dialog.close();
    else {
      status.textContent='Chưa lưu được hướng dẫn; lần sau có thể hiện lại.';
      if(!dialog.querySelector('.first-journey-continue')){
        const proceed=document.createElement('button');proceed.className='first-journey-continue';proceed.textContent='Tiếp tục không lưu';proceed.onclick=()=>dialog.close();dialog.append(proceed);
      }
    }
  };
  dialog.onclose=()=>dialog.remove();
}

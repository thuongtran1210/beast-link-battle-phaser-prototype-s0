import type Phaser from 'phaser';

const phrases: Record<string, string> = {
  'A LITTLE SQUAD. A BIG ADVENTURE.':'ĐỘI QUÂN NHỎ. CHUYẾN PHIÊU LƯU LỚN.',
  'Match Beasts. Build your squad.':'Ghép thú. Xây dựng đội hình.',
  'Turn a tiny team into a ridiculous legend.':'Biến đội quân nhỏ thành huyền thoại bá đạo.',
  'Choose a region →':'Chọn khu vực →', 'How to play':'Cách chơi', 'Full screen unavailable':'Không hỗ trợ toàn màn hình', 'Full screen':'Toàn màn hình',
  '6 Beast types · 3 Waves · one Run':'6 loại thú · 3 đợt chiến đấu · một lượt chơi',
  'Your next adventure':'Sẵn sàng phiêu lưu', 'Build your deck':'Chọn đội thú',
  'Choose 6 Beast types before the Run.':'Chọn 6 loại thú trước khi bắt đầu lượt chơi.',
  'Match pairs':'Ghép cặp', 'Beast Rush recruits units. Energy Rush stores tactical skills. The first pair starts the timer.':'Ghép thú để tuyển quân. Ghép năng lượng để tích kỹ năng. Cặp đầu tiên bắt đầu tính giờ.',
  'Arrange & merge':'Xếp đội hình và gộp thú', 'Tap a unit, then a board slot. Merge eligible copies or spend 2 Link Shards to deploy a fifth unit.':'Chạm thú rồi chạm ô để đặt quân. Gộp thú khi đủ điều kiện hoặc dùng 2 Mảnh Liên Kết để mở vị trí thứ năm.',
  'Watch & cast':'Quan sát và dùng kỹ năng', 'Your squad fights automatically. Tap an Energy button to help; hold it to read the effect.':'Đội tự chiến đấu. Chạm nút năng lượng để hỗ trợ; giữ nút để đọc hiệu ứng.', 'Got it':'Đã hiểu',
  'Play':'Chơi', 'Camp & Dorm':'Doanh trại thú', 'Back to menu':'Về menu',
  'Choose your adventure':'Chọn chuyến phiêu lưu', '3 Waves per Run · choose a region, then build your deck':'3 đợt mỗi lượt · chọn khu vực rồi chọn đội thú',
  'All regions available · progress saved on this device':'Các khu vực đều mở · tiến độ lưu trên thiết bị này',
  'Woodland Trail':'Đường mòn rừng', 'Shadow Crossing':'Lối qua bóng tối', 'Beast Stronghold':'Pháo đài thú',
  'Learn the formation':'Làm quen đội hình', 'Protect your backline':'Bảo vệ tuyến sau', 'Break the enemy formation':'Phá đội hình địch',
  'Frontline → Divers → Protected ranged':'Tiền tuyến → Đột kích → Cung thủ được bảo vệ',
  'Divers → Mixed pressure → Protected ranged':'Đột kích → Đội hình hỗn hợp → Cung thủ được bảo vệ',
  'Protected ranged → Mixed pressure → Frontline':'Cung thủ được bảo vệ → Đội hình hỗn hợp → Tiền tuyến',
  '✓ CLEARED':'✓ ĐÃ VƯỢT QUA', '3 WAVES':'3 ĐỢT', 'Build deck →':'Chọn đội →',
  'Build Your ':'Chọn ', 'Deck':'đội thú', 'selected':'đã chọn', 'Locked across Waves':'Giữ cố định trong lượt',
  'Choose 6 types · recruit and deploy during the Run':'Chọn 6 loại · tuyển và triển khai trong lượt chơi',
  'Start Run →':'Bắt đầu →', 'Deck ready · unselect a card to swap a Beast':'Đội sẵn sàng · bỏ chọn một thẻ để đổi thú',
  'Deck ready · rotate to landscape to start':'Đội sẵn sàng · xoay ngang để bắt đầu',
  'Deck full — unselect a Beast first':'Đội đã đủ — hãy bỏ chọn một thú trước',
  'Back to level selection':'Về chọn khu vực', 'Take a breather':'Nghỉ một chút', 'Your Run is paused.':'Lượt chơi đang tạm dừng.',
  'Continue':'Tiếp tục', 'End Run & return to menu':'Kết thúc lượt và về menu',
  'Turn your phone sideways':'Hãy xoay ngang điện thoại', 'Your squad needs a little more room.':'Đội thú cần thêm không gian chiến đấu.',
  'A little home for your ridiculous legends':'Mái nhà nhỏ của những huyền thoại bá đạo',
  'Diary':'Nhật ký', 'Meme Diary':'Nhật ký thú', 'Close':'Đóng', 'Welcome gift: 25 wood · Win a Run for +15 wood':'Quà chào mừng: 25 Gỗ · thắng một lượt nhận 15 Gỗ',
  'Recruit Beasts in a Run to bring them home.':'Tuyển thú trong lượt chơi để đưa chúng về trại.',
  'Your Beasts will write here when they arrive.':'Thú sẽ viết lời chào ở đây khi về trại.',
  'Duck tub':'Bồn tắm vịt', 'Giant carrot':'Cà rốt khổng lồ', 'Toy forge':'Xưởng đồ chơi', 'Place · owned':'Đặt · đã sở hữu',
  'Tap to cast · hold for details':'Chạm để dùng · giữ để xem chi tiết',
  'BEAST RUSH':'TUYỂN THÚ', 'ENERGY RUSH':'TÍCH NĂNG LƯỢNG', 'BATTLE SETUP':'XẾP ĐỘI HÌNH', 'BATTLE':'CHIẾN ĐẤU', 'WAVE RESULT':'KẾT QUẢ ĐỢT', 'RESULT':'KẾT QUẢ',
  'MATCH TO START':'GHÉP ĐỂ BẮT ĐẦU', 'TIME LEFT':'CÒN LẠI', 'COLLECT ENERGY':'TÍCH NĂNG LƯỢNG',
  'First pair starts the timer':'Cặp đầu tiên bắt đầu tính giờ', 'Each pair stores +1 charge':'Mỗi cặp thêm 1 lần dùng',
  'TACTICAL INVENTORY':'KỸ NĂNG ĐÃ TÍCH', 'Saved for Battle · carries over Waves':'Dùng trong trận · giữ qua các đợt',
  'YOUR BEASTS':'THÚ ĐÃ TUYỂN', 'No Beasts yet':'Chưa có thú', 'Choose a pair':'Chọn một cặp',
  'YOUR FORMATION':'ĐỘI HÌNH CỦA BẠN', 'ENEMY LINEUP':'ĐỘI HÌNH ĐỊCH', 'Tap a Beast, then a slot · tap an ally to swap':'Chạm thú rồi chạm ô · chạm đồng đội để đổi chỗ',
  'UNLOCK 5TH SLOT':'MỞ VỊ TRÍ THỨ 5', '5 UNIT SLOTS':'5 VỊ TRÍ', 'Unlocked for this Run':'Đã mở trong lượt này', '2 Link Shards · this Run':'2 Mảnh Liên Kết · lượt này',
  'START BATTLE':'XUẤT TRẬN', 'Deploy at least 1 Beast':'Đặt ít nhất 1 thú',
  'Tanker':'Đỡ đòn', 'Ranger':'Cung thủ', 'Mage':'Pháp sư', 'Assassin':'Sát thủ', 'Frontliner':'Tiền tuyến', 'Diver':'Đột kích', 'Ranged':'Đánh xa',
  'Heal frontline':'Hồi máu tiền tuyến', 'Heal backline':'Hồi máu tuyến sau', 'Damage Frontliner':'Đánh tiền tuyến', 'Damage Ranged':'Đánh tuyến xa',
  'Interrupt enemy':'Ngắt đòn địch', 'Shield frontline':'Khiên tiền tuyến',
  'MEND':'HỒI MÁU', 'GUARD':'KHIÊN', 'BREAK':'PHÁ GIÁP', 'DISRUPT':'NGẮT ĐÒN', 'RESCUE':'CỨU VIỆN', 'PIERCE':'XUYÊN PHÁ',
  'READY':'SẴN SÀNG', 'DISABLED':'CHƯA DÙNG', 'SUGGESTED':'GỢI Ý', 'NO CHARGE':'HẾT LƯỢT', 'NO TARGET':'KHÔNG CÓ ĐÍCH', 'PAUSED':'TẠM DỪNG', 'LIVE':'ĐANG ĐẤU',
  'FRONT':'TRƯỚC', 'MID':'GIỮA', 'BACK':'SAU', 'FRESH':'KHỎE', 'INJURED':'BỊ THƯƠNG', 'SQUAD FULL':'ĐỘI ĐÃ ĐỦ', 'PLACE':'ĐẶT',
  'TOY GUARD':'VỆ SĨ ĐỒ CHƠI', 'WOOL HUG!':'ÔM BÔNG!', 'INTERRUPTED':'ĐÃ NGẮT ĐÒN', 'INTERRUPT':'NGẮT ĐÒN', 'SHIELD':'KHIÊN', 'HEAL':'HỒI MÁU', 'QUACK!':'CẠP CẠP!', 'YUM!':'NGON!', 'POP?':'BỤP?',
  'share shield with ally':'chia sẻ khiên với đồng đội', 'kill chains a strike':'hạ địch rồi đánh nối tiếp',
  'pierce + one-shot carrot decoy':'xuyên mục tiêu + mồi cà rốt một lần', 'Echo + one-shot duck flock':'đánh vọng + vịt hóa một lần',
  'Ram + cleave':'húc + đánh lan', 'Volley every shot':'mỗi đòn bắn một loạt',
  'Heal two allies + wool shields':'hồi máu hai đồng đội + khiên bông', 'Bubble party traps two enemies':'nhốt hai địch trong bong bóng',
  'Toy workshop shields two allies':'đồ chơi tạo khiên cho hai đồng đội', 'Giant bomb hits three enemies':'bom khổng lồ đánh ba địch',
  'NO FRONTLINE':'KHÔNG CÓ TIỀN TUYẾN', 'FULL HP':'ĐẦY MÁU', 'FRONTLINER PROTECTED':'TIỀN TUYẾN ĐƯỢC BẢO VỆ', 'RANGED PROTECTED':'TUYẾN XA ĐƯỢC BẢO VỆ',
  'MAX':'TỐI ĐA', 'NEXT':'SAU', 'PREV':'TRƯỚC', 'PAGE':'TRANG', 'WIN':'THẮNG', 'LOSE':'THUA', 'RESTART':'CHƠI LẠI', 'NEXT WAVE':'ĐỢT TIẾP',
  'TANKER':'ĐỠ ĐÒN', 'RANGER':'CUNG THỦ', 'MAGE':'PHÁP SƯ', 'ASSASSIN':'SÁT THỦ', 'Front':'Trước', 'Mid':'Giữa', 'Back':'Sau',
  'ENERGY':'NL',
};
const keys = Object.keys(phrases).sort((a,b)=>b.length-a.length);
const pattern=new RegExp(keys.map(key=>{
  const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return `${/^[A-Za-z]/.test(key)?'(?<![A-Za-z])':''}${escaped}${/[A-Za-z]$/.test(key)?'(?![A-Za-z])':''}`;
}).join('|'),'g');
export function vietnameseText(text:string):string {
  if (phrases[text]) return phrases[text];
  // Apply source phrases once, without translating replacements a second time.
  const translated=text.replace(pattern, match=>phrases[match]);
  return translated.replace(/Choose (\d+) more Beasts/g,'Chọn thêm $1 thú')
    .replace(/Choose 6 types for this Run/g,'Chọn 6 loại cho lượt này')
    .replace(/Clear spot (\d+)/g,'Dọn vị trí $1').replace(/Craft · (\d+) wood/g,'Chế tạo · $1 Gỗ')
    .replace(/placed in spot (\d+) · tap its favorite Beast/g,'đã đặt ở vị trí $1 · chạm thú yêu thích món này')
    .replace(/WOOD (\d+)/g,'GỖ $1').replace(/SPOT (\d+)/g,'VỊ TRÍ $1')
    .replace(/WAVE (\d+)/g,'ĐỢT $1').replace(/LANE (\d+)/g,'LÀN $1')
    .replace(/BEAST (\d+)/g,'THÚ $1').replace(/ENERGY (\d+)/g,'NL $1')
    .replace(/ENEMIES (\d+)/g,'ĐỊCH $1').replace(/RESERVE (\d+)/g,'DỰ BỊ $1')
    .replace(/MATCHES (\d+)/g,'CẶP $1').replace(/RECRUITED (\d+)/g,'ĐÃ TUYỂN $1')
    .replace(/CHARGES (\d+)/g,'LƯỢT DÙNG $1').replace(/CARRY (\d+)/g,'TỪ TRƯỚC $1')
    .replace(/THIS RUSH/g,'ĐỢT NÀY').replace(/STORED/g,'ĐÃ TÍCH').replace(/DEPLOYED/g,'ĐÃ ĐẶT')
    .replace(/ deployed/g,' đã đặt').replace(/COPIES/g,'BẢN SAO').replace(/MERGE/g,'GỘP')
    .replace(/ACTIVE/g,'ĐÃ ĐẶT').replace(/GRID/g,'Ô').replace(/BEST/g,'TỐT NHẤT')
    .replace(/RUN COMPLETE/g,'HOÀN THÀNH LƯỢT').replace(/RUN DEFEAT/g,'THẤT BẠI').replace(/Waves Cleared/g,'đợt đã vượt qua').replace(/Reached Wave/g,'Đến đợt');
}

export function installVietnamese(PhaserRuntime:typeof Phaser):void {
  document.documentElement.lang='vi';
  const original=PhaserRuntime.GameObjects.Text.prototype.setText;
  PhaserRuntime.GameObjects.Text.prototype.setText=function(value:string|string[]) {
    return original.call(this, Array.isArray(value)?value.map(vietnameseText):vietnameseText(value ?? ''));
  };
  const translate=(node:Node):void=>{
    if(node.nodeType===Node.TEXT_NODE){const value=node.nodeValue??'';const next=vietnameseText(value);if(next!==value)node.nodeValue=next;return;}
    if(node instanceof Element && ['SCRIPT','STYLE','CANVAS'].includes(node.tagName))return;
    if(node instanceof Element) { for(const attr of ['aria-label','title']) {const value=node.getAttribute(attr);if(value)node.setAttribute(attr,vietnameseText(value));} }
    node.childNodes.forEach(translate);
  };
  translate(document.body);
  new MutationObserver(records=>records.forEach(record=>{if(record.type==='characterData')translate(record.target);else record.addedNodes.forEach(translate);})).observe(document.body,{subtree:true,childList:true,characterData:true});
}

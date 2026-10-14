Cập nhật mới nhất 2026-10-14: Swiftwing vận chuyển vườn; Starcaller bỏ phụ vận chuyển, chèo xuồng bán hàng thành phẩm khi Kho đầy; Snowguard có sheet đi tuần và tuyến thử. Chi tiết trạng thái/code/checklist: [carrier/boat/patrol](VILLAGE-CARRIER-BOAT-PATROL-2026-10-14.md). Các đoạn “chưa triển khai” bên dưới là lịch sử nếu trùng phạm vi này; trạm canh/báo động vẫn chưa làm.

# Làng Thú — Câu chuyện làng quê (Village Life Stories)

Ngày: 2026-10-14 (Cập nhật định hướng cốt truyện & cơ chế trải nghiệm theo phản hồi chủ dự án).  
Chủ đề chủ đạo: **CÂU CHUYỆN LÀNG QUÊ** (thay thế hoàn toàn định hướng "về quê khởi nghiệp").

Đặc tả chuẩn bị hình ảnh cư dân, công cụ và trạng thái trạm: [VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md](VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md). Chủ dự án đồng ý hướng nghề và tay nghề riêng; chương mở đầu Run → vào làng. Giải cứu theo checkpoint khám phá (map 3/10/15 là ví dụ, chưa cố định phân bổ cư dân). Chi tiết hình ảnh không phải xác nhận đã triển khai gameplay.

---

## 1. Tiền đề & Không khí cốt truyện (Tone & Setting)

Cập nhật owner 2026-10-14: cư dân làm xong đặt sản phẩm tại trạm; **Swiftwing vận chuyển đi bộ chính, Starcaller chèo xuồng đi bán cà rốt/cá/đồ chơi khi Kho đầy, giữ Gỗ** tới giỏ/kệ nhận hàng cạnh nhà chung. Bỏ dịch chuyển phép. Snowguard tuần tra/trạm canh gần cổng; đội hình canh gác vẫn làm nghề thường ngày, báo động giữ tiến độ và hàng đang mang. Chuỗi mới chưa triển khai. Nguồn hiện hành: [transport/guard](VILLAGE-TRANSPORT-GUARD-UPDATE-2026-10-14.md), [prompt sáu cư dân](VILLAGE-PROFESSION-ANIMATION-PROMPTS-2026-10-14.md).

Ngôi làng là tổ ấm bình dị, yên bình nép mình bên dòng sông xanh. Đây không phải là thương trường kinh doanh hay câu chuyện khởi nghiệp kiếm lời, mà là **những lát cắt cuộc sống làng quê (Slice of Life)** mộc mạc, ấm cúng và đầy ắp tiếng cười của các bạn Thú.

- **Không khí chủ đạo:** Ấm áp, thư thái, hài hước (Slapstick Chibi), đoàn kết và tình làng nghĩa xóm.
- **Triết lý sống:**
  - Mỗi người một nghề, cùng nhau lao động chia ngọt sẻ bùi: Thỏ trồng rau, Mèo câu cá, Gấu rèn nông cụ, Vịt tuần tra lối xóm.
  - Tự cấp tự túc, cùng nhau chia sẻ nồi cơm chung mỗi ngày.
  - Khi có kẻ trộm hay bầy thú dữ đến quấy nhiễu: Cả làng đồng lòng đứng lên bảo vệ xóm làng, bảo vệ kho lương thực và sự bình yên của quê hương.

---

## 2. Sáu cư dân cơ bản và giải cứu bạn mới

### 2.1. Sáu cư dân Day 1 — chủ dự án đã chốt ngày 2026-10-14

Thay thế hoàn toàn định hướng “Bộ ba khởi đầu”. Sáu cư dân cơ bản gồm **Snowguard, Shadowclaw, Windstrider, Starcaller, Ironclad và Swiftwing** theo lựa chọn của chủ dự án.

Cả sáu có sẵn từ Day 1, được chọn vào đội thú cho Run và là cư dân tham gia các hoạt động trong làng. Shadowclaw không còn là cư dân phải giải cứu; không khóa Bến Câu Cá sau sự kiện giải cứu Shadowclaw.

Quyền chọn Beast vào Run không đồng nghĩa tự động có bản thể chiến đấu hoặc STAR; các bước tuyển quân và chuẩn bị trong Run theo luật gameplay hiện hành.

### 2.2. Giải cứu mở quyền chọn Run và kết nạp vào làng — đã chốt

Các cư dân ngoài nhóm sáu cơ bản là **Woolkeeper, Hophex, Gadgetduck và Boomhog**. Giải cứu thành công một cư dân sẽ đồng thời:

1. Mở quyền chọn Beast đó vào đội thú cho Run.
2. Kết nạp cư dân đó vào làng để tham gia các hoạt động trong làng.

Tuyển bản thể trong Run không thay thế điều kiện giải cứu cư dân mới. Điều kiện hoàn tất giải cứu, vùng tương ứng và cách ghi nhận một lần còn cần chốt; chưa mặc định thắng Wave Boss hoặc thắng trọn Run là điều kiện chung.

Gợi ý truyện chưa chốt: Woolkeeper bị cuộn len quấn vào bụi gai; Boomhog đang nấu súp thì bị quái rừng bao vây. Tình huống cho Hophex/Gadgetduck và phần thưởng nghề của từng cư dân cần thiết kế tiếp.

### 2.3. Trạng thái áp dụng

Các quyết định trên là định hướng đã chốt, chưa xác nhận triển khai hoặc live PASS. Cần kế hoạch đồng bộ onboarding, quyền chọn Run, cư dân và save cũ; không tự thu hồi tài sản hoặc cư dân đã có.

---

## 3. Vai Trò Của Chuyến Thám Hiểm (Run) trong Câu Chuyện Làng Quê

Run là những chuyến **Thám hiểm thiên nhiên & Rừng sâu** quanh làng:
1. **Tìm kiếm nguyên liệu:** Nhặt nhạnh từng khúc Gỗ Rừng mang về dựng nhà riêng, đóng bàn ghế cho làng.
2. **Giải cứu bạn bè:** Mở quyền chọn bạn mới vào Run, đồng thời đưa bạn về làng định cư và tham gia hoạt động làng.
3. **Bảo vệ ranh giới:** Dọn dẹp bầy quái rừng quấy phá để giữ an toàn cho lối đi lại của dân làng.
- Thắng lợi trong Run là niềm vui mang quà rừng về cho làng; thất bại là bài học kinh nghiệm để cả làng cùng nhau rèn luyện.

---

## 4. Tay nghề làng độc lập với Battle Run

### 4.1. Ranh giới đã chốt ngày 2026-10-14

- **Tay nghề làng là tiến trình riêng, được lưu lâu dài.**
- Tay nghề chỉ phục vụ hoạt động làng, **không ảnh hưởng Battle Run**: không thay đổi HP, damage, STAR, Signature hoặc luật chiến đấu Run.
- STAR của bản thể trong Run không phải cấp tay nghề làng. Kết thúc hoặc reset Run không xóa tay nghề làng.
- Giải cứu mở quyền chọn Run và tư cách cư dân; không tự chuyển STAR/sức mạnh chiến đấu thành tay nghề.

### 4.2. Hướng năng suất còn cần chốt

- **Công cụ / Trạm:** Định hướng quyết định công thức và sản lượng mỗi mẻ.
- **Tay nghề:** Tiến trình chuyên môn trong làng; cách tích lũy, cấp và tác động cụ thể chưa chốt.
- **Đời sống:** Bữa ăn theo quy tắc sinh hoạt hiện hành; lợi ích cơ học của nhà riêng chưa chốt.

Nâng cấp trạm, giảm thời gian làm và hàng hiếm cần thiết kế/cân bằng riêng. Các ví dụ cũ gắn 2★/3★ với 22 giây hoặc 15% hàng hiếm không còn là quy tắc của tài liệu này. Chưa xác nhận tay nghề lâu dài đã triển khai.

---

## 5. Ý Nghĩa Của Kinh Tế, Kho Lương & Nhật Ký Làng

- **Kho lương thực & Đồng làng:**
  - Tiền đồng và hàng hóa trong làng đóng vai trò phương tiện **trao đổi vật tư, chia sẻ lương thực và mua sắm giống/gỗ**, không mang tính chất tích lũy tư bản hay báo cáo tài chính doanh nghiệp.
  - Đảm bảo làng luôn đủ ăn qua từng ngày, tích lũy lương thảo phòng khi mất mùa hay thú rừng quấy phá.
- **Sổ sách & Nhật ký:**
  - Sổ sách ghi chép giản dị về thu hoạch mùa màng và xuất nhập vật tư.
  - Nhật ký lưu giữ kỷ niệm, những sự kiện hài hước và chiến tích giải cứu bạn bè của dân làng.


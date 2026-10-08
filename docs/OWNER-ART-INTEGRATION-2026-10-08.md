# Phân tích và tích hợp bộ ảnh chủ dự án

## Hướng hình ảnh

Bộ ảnh dùng nét đen dày, mắt dạng vạch, hình khối lớn, thân nhỏ, ít đường nội bộ. Nhận diện đến từ loài và đạo cụ, không phụ thuộc nhãn tên. Icon tròn có màu nền tương phản; sprite toàn thân phù hợp animation bằng transform hiện có.

Ảnh icon gốc có alpha. Ảnh toàn thân có nền sáng và bóng chân. Built-in imagegen được dùng để tách nền/bóng, giữ thiết kế, màu, pose và đạo cụ. Đây là bản extraction có thể có sai khác đường nét nhỏ, không phải phép cắt pixel nguyên bản. Sau đó script tách từng vùng alpha, xuất canvas 512×512 cho body và 256×256 cho icon, giữ tỉ lệ và chuẩn hóa chân.

## Mapping vào game

| Hình chủ dự án | Beast hiện có | Vai trò | Cơ sở |
| --- | --- | --- | --- |
| Vịt mũ đỏ, khiên | Snowguard | Tanker / Protector | Khiên và dáng đứng vững thể hiện bảo vệ |
| Gấu cầm búa | Ironclad | Tanker / Disruptor | Khối nặng và búa thể hiện va chạm |
| Thỏ áo xanh, cung | Windstrider | Ranger / Focus | Màu xanh và tư thế ngắm cung |
| Cáo áo đỏ, cung | Swiftwing | Ranger / Fast | Silhouette gọn, tai nhọn và đuôi giúp phân biệt Ranger thứ hai |
| Gấu mèo khăn đỏ, kiếm | Shadowclaw | Assassin | Kiếm và dáng gọn thể hiện cận chiến |

Tên gameplay, ID, chỉ số, targeting, STAR, Signature và Energy giữ nguyên. Tên Snowguard hiện dùng hình vịt vì chủ dự án yêu cầu sử dụng bộ ảnh; việc đổi tên nhân vật là quyết định riêng. Bộ ảnh không có Mage, nên Starcaller và ba enemy vẫn dùng V2 hiện tại.

## Runtime

Năm body/icon mới được bật ở URL mặc định và `?art=preview`, không cần bật chế độ art riêng. Icon dùng trong Beast Rush, queue, Reserve và Setup qua `createIconImage()`. Body dùng trong Battle qua manifest/loader và `BattleCharacterView`.

Các sprite được tăng reference canvas height lên 124–136 px; HP anchor được đưa lên trên vùng đầu/tai tương ứng. Animation attack/hit/KO và Signature VFX hiện có vẫn hoạt động qua cùng API. Asset cũ được giữ lại; khi asset lỗi tải, fallback procedural vẫn có.

Nguồn: `art/owner-supplied/2026-10-08/`. File runtime: `public/assets/beasts/<slug>/base_owner_v01.png` và `icon_owner_v01.png`. Script export: `scripts/import-owner-character-art.ps1`.

## Evidence và giới hạn

- Owner đã yêu cầu trực tiếp sử dụng bộ ảnh này; integration được thực hiện trong phạm vi đó.
- Script xác nhận 5 vùng alpha riêng trên mỗi sheet, xuất đủ 10 PNG và kiểm tra padding alpha.
- Bảng `runtime-lineup-v01.png` dùng để kiểm tra crop/nhận diện ở kích thước nhỏ.
- Không coi integration là GAME READY hoặc owner live PASS.
- Live QA cần xác nhận HP/ground anchor, overlap, attack, hit, Signature và KO trong Phaser; công cụ browser của phiên này trước đó bị lỗi khởi tạo.
- Background chiến trường và HUD chưa được redesign trong phần tích hợp bộ nhân vật này.

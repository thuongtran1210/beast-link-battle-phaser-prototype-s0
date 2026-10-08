# Hoàn thiện bộ nhân vật chủ dự án — 2026-10-08

## Đã thực hiện

Tách nền và bóng chân bộ 27 nhân vật bằng built-in imagegen; giữ thứ tự và thiết kế trong ảnh chủ dự án. Vì extraction qua imagegen, đường nét có thể khác nhẹ so với pixel nguồn. Script `scripts/import-owner-roster.ps1` phát hiện vùng alpha theo từng hàng và xuất 27 body PNG 512×512, 27 icon tròn PNG 256×256, manifest JSON và bảng xem ở kích thước nhỏ.

Nguồn gốc và extraction nằm trong `art/owner-supplied/2026-10-08/`; thư viện nằm trong `public/assets/characters/`. Nguồn sheet chỉ khoảng 150–360 px chiều rộng cho từng nhân vật: export 512 không tạo thêm chi tiết gốc.

## Nhân vật đang hoạt động

| Slot game | Hình ảnh | Trạng thái |
| --- | --- | --- |
| Snowguard | Vịt khiên, bộ 5 hình đã tích hợp | ACTIVE |
| Ironclad | Gấu búa, bộ 5 hình đã tích hợp | ACTIVE |
| Windstrider | Thỏ cung, bộ 5 hình đã tích hợp | ACTIVE |
| Swiftwing | Cáo cung, bộ 5 hình đã tích hợp | ACTIVE |
| Shadowclaw | Gấu mèo kiếm, bộ 5 hình đã tích hợp | ACTIVE |
| Starcaller | Mage áo tím / badger-mage | ACTIVE — mới hoàn thiện |
| Enemy Frontliner | Penguin knight, giáp + khiên | ACTIVE — mới hoàn thiện |
| Enemy Diver | Crow assassin, áo choàng + kiếm | ACTIVE — mới hoàn thiện |
| Enemy Ranged | Deer archer, cung | ACTIVE — mới hoàn thiện |

Đủ 6 Beast và 3 enemy archetype hiện hành cùng phong cách. Sprite, icon, facing và HP anchors được nối vào manifest/loader hiện tại. Enemy icon trong Setup dùng portrait mới; fallback procedural vẫn còn khi texture thiếu. Attack/hit/KO và Signature VFX vẫn dùng presentation hiện có.

## Thư viện dự phòng

27 mẫu có `base_v01.png` và `icon_v01.png` riêng; danh sách đầy đủ ở `public/assets/characters/manifest.json`. Những mẫu không map vào roster hiện hành là asset dự phòng, không phải unit có gameplay đã triển khai. Không thêm role, unit ID, balance hay kỹ năng mới.

## Kiểm chứng

Trang xem thư viện: `http://127.0.0.1:5173/character-library.html`, có lọc active/dự phòng, đổi nền sáng/tối, kích thước 128/240 px và link tải PNG riêng. Trang phục vụ việc xem art; không tạo các slot gameplay mới.

Script kiểm tra đủ 9 vùng alpha mỗi hàng và alpha padding của 54 PNG; bảng `roster27-runtime-v01.png` đã được xem để kiểm tra đạo cụ/crop/nhận diện. Check và build được chạy sau integration; kết quả báo ở bàn giao.

Live Phaser QA về overlap, ground/HP anchor, hit, Signature và KO chưa được ghi nhận. Không gọi exported/integrated asset là GAME READY hoặc owner-live PASS. Những SVG/candidate cũ được giữ nguyên.

# Cập nhật portrait màu — 2026-10-08

Owner gửi sheet mới có 27 portrait nhân vật, một badge rìu và một portrait gấu trắng thay thế. Đã tách nền trắng bên ngoài bằng built-in imagegen, giữ nền màu bên trong từng badge, sau đó xuất icon 256×256 bằng `scripts/update-owner-portraits.ps1`. Extraction có thể có sai khác đường nét nhỏ so với pixel nguồn.

Các circle hàng cuối chạm nhau, nên script dùng ranh giới theo bố cục nguồn thay vì chỉ tìm khoảng alpha. Badge cá sấu giữ hai vòng xanh chồng nhau như ảnh owner; không tự sửa thiết kế đó.

## Tích hợp

- 27 thư mục `public/assets/characters/<slug>/icon_v02.png`.
- Sáu Beast và ba enemy archetype đang chạy đều dùng portrait màu mới qua manifest.
- Thư viện `character-library.html` đọc manifest JSON đã cập nhật sang V02.
- Badge rìu: `public/assets/ui/axe_owner_v02.png`.
- Portrait gấu trắng thay thế: `public/assets/characters/polar-bear-axeman/icon_alternate_v02.png`.
- Sprite toàn thân và gameplay giữ nguyên; V01 được giữ để so sánh.
- Nguồn gốc/extraction được lưu ở `art/owner-supplied/2026-10-08/portraits27-colored-original-v02.png` và `portraits27-colored-cutout-v02.png`.

Đã xem crop mẫu Panda, Elephant và Crocodile để xác nhận nhận diện/màu. Live Phaser QA vẫn mở; không suy ra GAME READY từ export hoặc build.

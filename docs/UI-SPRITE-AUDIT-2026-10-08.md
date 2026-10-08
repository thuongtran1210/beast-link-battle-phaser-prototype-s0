# UI / Sprite audit — 2026-10-08

## Kết luận

Repository local đã có UI Phaser và asset nhân vật. Công việc hiện tại là đồng bộ và polish presentation, không cần xây toàn bộ UI hoặc roster từ đầu.

Nguồn kiểm tra: `CURRENT_REPO_HANDOFF.md`, `AI_INSTRUCTIONS.md`, tài liệu Battle V2, manifest, loader và các view hiện tại. Các tài liệu art V1 vẫn chứa trạng thái cũ; Battle V2 là hướng presentation hiện hành theo handoff.

## Những phần hiện có

| Hạng mục | Bằng chứng trong mã | Trạng thái |
| --- | --- | --- |
| Beast Rush / Energy Rush | `BoardView`, `PhaseStatusPanel`, `TacticalEnergyPresentation` | UI bằng mã đã tồn tại |
| Battle Setup | `BattleSetupPresentation`, `BattleSetupInteractionController` | Formation, Reserve, triển khai đội hình đã tồn tại |
| Battle | `BattleActionView`, `ShowcaseBattleHUDView` | Cutout, HP, Energy và Signature VFX đã tồn tại |
| Kết quả | `ResolutionPanel`, `SessionSummaryView` | UI đã tồn tại |
| 6 Beast | `BattleCharacterManifest`, `public/assets/beasts/*/base_v2.svg` | Base và icon V2 đã có |
| 3 enemy | `EnemyCharacterManifest`, `public/assets/enemies/*/base_v2.svg` | Cutout V2 đã có |
| Animation | `BattleCharacterView`, `BattleMotionProfiles` | Transform/tween; không yêu cầu spritesheet từng hành động |

## Lỗ hổng được sửa trong audit này

Loader đã nạp icon V2, nhưng `createIconImage()` vẫn luôn chọn portrait procedural. Điều này khiến Beast Rush, queue, Reserve và Setup không dùng cùng nhận diện với Battle.

Hàm dùng chung nay ưu tiên texture icon V2 của Beast khi tải thành công. Nếu thiếu texture, dùng lại portrait procedural. Energy tiếp tục dùng bộ icon Energy riêng. Không thay đổi damage, targeting, STAR, roster, HP persistence hoặc timing.

## Ưu tiên visual tiếp theo

1. Kiểm tra live ở 1280×720: sáu portrait trong Beast Rush/Setup có cùng nhận diện với Battle; không bị cắt hoặc khó phân biệt.
2. Trong Battle, kiểm tra silhouette, overlap, HP anchor; đặc biệt Snowguard/Ironclad và Swiftwing/Windstrider.
3. Đánh giá các trạng thái Setup: selected, Active, Reserve, injured, KO; primary CTA và phân trang Reserve.
4. Sau live readability pass, chọn các frame showcase và mới quyết định có cần thêm animation/art hay không.

Không cần sản xuất 5 pose hoặc 3 bộ costume STAR cho mỗi Beast: V2 dùng base + transform + Signature VFX. Asset mới chỉ nên được tạo khi một vấn đề hiển thị cụ thể cần chúng.

## Cách xem bản hiện tại

Chạy `npm run dev` và mở URL Vite trả về. Mặc định là GAME; `npm run dev:test` là test harness.

Click vào canvas rồi nhấn `L` để mở Battle fixture phục vụ visual QA. Đây là đường tắt xem presentation; kiểm tra flow chơi bình thường vẫn cần thực hiện riêng.

## Validation

- `npm run check`: PASS.
- `npm run build`: PASS; Vite báo bundle lớn.
- Live visual QA sau thay đổi: chưa xác nhận. Công cụ trình duyệt không khởi tạo được trong phiên này; build pass không thay thế live pass.
- Không thay đổi trạng thái owner approval hoặc adoption gameplay.

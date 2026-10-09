# Làng Thú — kế hoạch thực hiện

Ngày: 2026-10-09. Trạng thái: nền móng giai đoạn 1 đã triển khai; bản đồ mobile và simulation chưa triển khai.

Evidence giai đoạn 1: VillageCatalog.ts (10 nghề / 3 trạm), VillageLayout.ts (world/anchors/paths), VillageFixtures.ts (preview riêng), CampState.ts (v2 + fallback v1/kho/story IDs), VillageFoundationChecks.ts. Prompt tại BEAST-VILLAGE-ASSET-BRIEF-2026-10-09.md. Giá hai trạm mới vẫn null; chưa bán hoặc unlock cho player. UI Camp vẫn dùng ba slot cũ qua adapter. Live mobile/art gate còn mở.
Thiết kế: [BEAST-VILLAGE-DESIGN-2026-10-09.md](BEAST-VILLAGE-DESIGN-2026-10-09.md).

## Phạm vi và thứ tự

Camera: top-down orthographic; cư dân chỉ right/left. World layer di chuyển x/y, facing lấy dấu chuyển động ngang, giữ hướng khi đi dọc; workFacing hướng về đạo cụ. Clip nghề tạo một hướng RIGHT và flip sprite sang LEFT. Chữ/HUD không flip, map/công trình không lật. Asset brief đã cập nhật theo tham chiếu top-down mới của chủ dự án; các điểm tay/đứng phải review lại khi có map cuối.

Giữ entry Camp và các hook tuyển thú/thưởng Run đang có. MVP chỉ hoàn thiện xưởng Ironclad, vườn Windstrider và bến câu Shadowclaw. Các nghề còn lại triển khai sau live review. Không đổi hệ thống chiến đấu, Energy hoặc deck trong nhánh công việc này.

| Giai đoạn | Công việc / đầu ra | Điều kiện chuyển tiếp |
|---|---|---|
| 1. Nền móng | Catalog nghề/trạm, layout tọa độ thế giới, save v2 + migration, đặc tả asset | Migration giữ tài sản; quyết định giá trạm mới được ghi rõ trước khi bán bằng Gỗ |
| 2. Mobile và bản đồ | Camera kéo có bounds, HUD cố định, thẻ thú, bảng Xây dựng/Cư dân/Nhật ký, lối đi và điểm đứng | Prototype bằng asset hiện có; chạm/kéo không nhầm, portrait/landscape đọc được |
| 3. Nhịp sống | Scheduler có seed, reservation trạm, đường đi qua waypoint, nghỉ/làm việc, pause/dispose | Không xuyên vật cản, không trùng chỗ, đóng/mở không tăng số timer |
| 4. Ba nghề | Chu trình thường + tình huống vui, đạo cụ/timing, animation nghề và che khuất | Cả ba nghề đọc được bằng hình; asset thiếu được đánh dấu prototype, không tuyên bố hoàn thiện |
| 5. Kết nối phát triển | Đặt công trình sở hữu, mua trạm theo giá đã chốt, mở chuyện khi thực sự xảy ra | Không tiêu Gỗ hai lần; diary dedupe theo ID; Run hooks/harness không đổi |
| 6. Hoàn thiện | Live mobile, hiệu năng, reduced motion, sửa hình/đường đi; cập nhật handoff | Checks/build + evidence thiết bị; owner review chất lượng đời sống riêng |

Giai đoạn 1–3 có thể tiến hành với ảnh hiện có và placeholder được ghi rõ. Giai đoạn 4 cần asset nghề đúng nhận diện để đóng gate hình ảnh. Không chặn công việc code độc lập vì thiếu ảnh; không dùng placeholder để báo GAME READY.

## Cấu trúc code dự kiến

- `src/game/run/CampState.ts`: giữ API tương thích hoặc adapter, version/migration/save sanitization.
- `src/game/run/VillageCatalog.ts`: nghề, trạm, điểm đứng, event/copy IDs; không chứa timer runtime.
- `src/game/run/VillageSimulation.ts`: state machine, seed, reservation và pause; độc lập DOM để kiểm thử.
- `src/game/ui/CampView.ts`: mount/unmount và entry hiện có; chia phần bản đồ, HUD, panel thành module khi cần.
- `src/game/ui/village/`: camera/input, resident renderer, station layers, activity presentation.
- `src/styles/prototype.css`: UI mobile Camp mới, safe-area và reduced-motion.
- `public/assets/ui/camp/`: giữ nguyên owner assets; bổ sung manifest nghề/trạm chỉ khi có nguồn.

Chọn DOM world layer trong MVP để phù hợp CampView hiện có, dùng một clock cập nhật chung thay timer cho từng cư dân. Camera transform world layer, HUD ngoài world layer. Nếu profiling cho thấy DOM không đáp ứng, đánh giá chuyển Phaser ở gate hiệu năng; không viết song song hai renderer ngay từ đầu.

## Ticket có thể thực hiện

1. Catalog mười nghề, ba trạm MVP, ID câu chuyện; fixture làng có đủ ba cư dân để kiểm thử, không tự unlock ở save người chơi.
2. Save v2 migration và kho đồ; test v1 thực tế, dữ liệu hỏng, save lại/load lại và migration lặp.
3. World bounds, vùng đi, waypoint, trạm có workAnchor/approachAnchor/occluder; bản đồ bằng asset fallback.
4. Kéo/chạm, zoom tùy chọn để sau; panel và focus camera; kiểm tra CSS touch target 44px trên viewport thực.
5. Simulation nghỉ/đi/làm/phản hồi, station reservation và disposal; seed cố định cho fixture.
6. Ironclad nghề thợ rèn: first vertical slice từ vào làng → tới xưởng → làm → chuyện → rời trạm.
7. Windstrider và Shadowclaw theo cùng contract; thêm asset nghề/đạo cụ, không fork scheduler từng thú.
8. Xây dựng/kho/chi phí được duyệt và diary event IDs; giữ lịch sử cũ như legacy text.
9. Live review, sửa che khuất/chồng hình, tối ưu hidden-tab và long-session; cập nhật evidence.

Mỗi ticket đóng với code, kiểm thử phù hợp và ghi rõ phần live/art còn mở. Trình bày Ironclad vertical slice trước khi mở rộng hai nghề còn lại để phát hiện sớm lỗi scale, path và điểm chân.

## Kế hoạch asset

| Asset | Tái sử dụng | Cần mới / xác minh |
|---|---|---|
| Nền làng | Camp background làm fallback | Bản đồ đủ rộng, lối đi rõ, không bake thú/UI |
| Xưởng | Owner anvil/workbench | Điểm tay/búa, foreground nếu cần |
| Vườn | Cà rốt cũ giữ trang trí | Luống rau, bình tưới, cà rốt cắn |
| Bến câu | Không có trạm nghề đã tích hợp | Bến, cần, phao, cá, giày |
| Cư dân | Mười ảnh nhận diện hiện có | Clip làm nghề của ba Beast; walk nghề nếu thiếu |

Đọc art routing/workflow trước production. Khi cần, viết prompt từng asset kèm reference, kích thước/frame count và lớp trước/sau. Ảnh tham chiếu không phải atlas có thể cắt thành công trình tương tác hoàn chỉnh.

## Kiểm thử và live review

Pure checks: save migration/sanitize; ownership/cost; state transitions có seed; thiếu trạm; reservation; diary một lần; pause không tiến thời gian; dispose không phát event. Giữ CampChecks và gameplay regression hiện có, chạy `npm run check` và `npm run build` sau code.

Live matrix: portrait 390×844 và landscape 844×390, thêm viewport nhỏ 667×375; quay màn hình, thao tác bằng touch, kéo khi panel đóng/mở, trạm nằm sát mép camera, đủ mười cư dân, tab ẩn rồi trở lại, vào/ra Camp mười lần. Đây là viewport kiểm thử đề xuất, chưa là device PASS.

Quan sát: trong 15 giây có hành động nghề dễ nhận biết; chữ/đạo cụ không bị HUD che; không có hai thú cùng đứng ở workAnchor; không giật chân/đổi scale; reduced motion vẫn hiểu công việc. Profiling mục tiêu 30 FPS ổn định trên thiết bị kiểm thử được ghi tên; phải đo trước khi tuyên bố đạt.

## Quyết định còn mở

- Giá vườn/bến và cách mở trạm mới: chưa chốt. Có thể hoàn thiện fixture và giao diện trước.
- Art cuối: chủ dự án cung cấp hay tạo theo prompt; chưa có lệnh tạo ảnh trong yêu cầu ghi tài liệu này.
- Tên chính thức Làng Thú hay Doanh trại thú: dùng Làng Thú cho tài liệu, chưa thay nhãn runtime.
- Nghề thứ tư và buff Run: ngoài MVP, đánh giá sau phản hồi.

## Điểm bắt đầu tiếp theo

Tiếp theo ticket 3–4: dựng world layer/camera và các bảng mobile trên dữ liệu đã có. Layout dữ liệu của ticket 3 đã có, chưa có renderer hoặc pathfinding runtime. Sau đó làm scheduler và Ironclad vertical slice. Chưa cần chỉnh Battle hoặc chờ đủ animation của mười Beast.

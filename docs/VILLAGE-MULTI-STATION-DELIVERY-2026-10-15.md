# Swiftwing vận chuyển ba trạm

Ngày 2026-10-15. CODE IMPLEMENTED / OWNER UI REVIEW OPEN. Không chạy browser automation.

## Luồng hiện tại

- Vườn, bến cá và xưởng hoàn tất công việc rồi để hàng chờ tại trạm. Không nhập Kho ngay lúc câu/chế tác xong. Cá/kiện đồ chơi là layer SVG thử riêng; sheet worker không chứa hàng.
- Một Swiftwing nhận một kiện, theo ID job cũ nhất trong các kiện đã sẵn sàng. Đây là ưu tiên theo ID lúc bắt đầu job, không phải timestamp hoàn tất. Đi lấy → nhặt → mang → đặt tại kệ → nhập Kho → quay về, sau đó mới nhận kiện tiếp.
- Trạm có hàng chờ không bắt đầu lượt mới và không thu phí lại. Worker xong việc vẫn quay về theo simulation hiện có. Chưa có Swiftwing thì người chơi nhận thủ công từ panel trạm; kiện đã được nhận vận chuyển khóa lấy tay.
- Giữ recipe: vườn 60 giây/5 cà rốt/1 Đồng cho job mới; câu 40 giây/2 cá/1 cà rốt; xưởng 50 giây/1 đồ chơi/2 Gỗ + 1 Đồng. Job vườn legacy giữ thông số đã lưu.
- Save cargo có kind/jobId/phase/elapsed. Carrier cũ không có kind migrate thành garden; carrier không khớp job chờ bị loại, không cấp hàng. Lỗi save giữ hàng/tiến độ tại boundary và retry; reload không cấp hai lần.
- Capacity reservation, giá vốn và hạn dùng baseline giữ nguyên: hàng còn giữ chỗ khi chờ/đang mang; expiry bắt đầu sau khi nhập Kho. Kho đầy giữ kiện tại điểm nhận cho đến khi có chỗ. Starcaller tiếp tục chuyến bán thành phẩm khi đầy, không bán Gỗ.
- Vị trí lấy cá tính từ góc dưới bến; đồ chơi ở phía dưới/phải xưởng. Tuyến waypoint là bản thử, không có pathfinding/editor. World giỏ/kiện đổi ownership sau giao dịch lấy thành công; animation cue không cấp tài nguyên.
- Không thay Battle, trạm canh, công trình bến hay điểm đứng Shadowclaw đã sửa. Cá/đồ chơi dùng lại hộp generic trong tay Swiftwing; chưa tạo thêm animation.

## Checklist owner

Reload [Làng](http://127.0.0.1:5180/) hoặc [fixture](http://127.0.0.1:5180/village-foundation-preview.html).

- [ ] Đủ cư dân/nguyên liệu, để bến cá/xưởng làm xong: thấy giỏ cá/kiện đồ chơi riêng; Kho chưa tăng trước giao.
- [ ] Swiftwing lấy từng kiện, không nhận hai trạm cùng lúc. Trạm có hàng chờ không tiếp tục sản xuất chồng kiện.
- [ ] Nhặt xong giỏ tại nguồn ẩn, kiện xuất hiện trong tay; không có hai bản hàng. Cá vẫn dùng sheet enter/work/finish và một cần.
- [ ] Đặt tại kệ xong Kho tăng đúng 2 cá hoặc 1 đồ chơi, chỉ một lần. Sau đó worker được làm lượt mới.
- [ ] Reload ở các chặng nhặt/mang/đặt/quay về: tiếp tục kiện đúng trạm, không mất hoặc cấp lại.
- [ ] Kho đầy: giữ kiện; tạo chỗ trống/bán hàng rồi giao được. Khi thiếu Swiftwing, nhận thủ công một lần trong panel trạm.
- [ ] Nút nhận thủ công bị khóa khi kiện đã do Swiftwing nhận. Vắng worker không tự sản xuất nhưng hàng đã xong vẫn được giao.
- [ ] Tuyến cá/xưởng không xuyên công trình/nước; báo tọa độ cần chỉnh. Ẩn tab/rời Làng không sản xuất hoặc vận chuyển offline.

## Kiểm tra

`VillageMultiCarrierChecks` kiểm FIFO ba trạm, staging/save failure, không charge lại, reload mọi phase/kind, đúng sản lượng/giao một lần, Kho đầy và save recovery, orphan/legacy cargo, fallback thiếu Swiftwing.
Kiểm tra UI/art và vị trí route thuộc owner, không suy ra từ code PASS.

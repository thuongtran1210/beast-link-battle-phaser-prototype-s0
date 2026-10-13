# Đồng bộ xây dựng và tài nguyên Làng Thú

Slice kinh tế 1 đã triển khai: save v3, Kho/ví/thu chi và mua bán có preview giá vốn/lãi lỗ; chi xây dựng và Gỗ thưởng Run cùng ledger. Gỗ legacy là số lượng duy nhất, không có balance kho Gỗ độc lập. Migration giữ v2/v1. Sản xuất cà rốt là bước tiếp theo; hạn dùng/sinh hoạt chưa chạy.

Cập nhật tiếp theo: VillageSimulation độc lập DOM đã triển khai, giữ tiến độ qua rebind, reservation trạm, hủy khi bỏ job, callback sau hoàn tất và pause/dispose. Kiểm thử pure bao phủ các quy tắc này. Tiến độ chỉ giữ trong phiên làng, chưa lưu offline; đường đi vẫn thẳng, chưa tránh vật cản. Kho sản phẩm và chu kỳ thu cà rốt là bước tiếp theo.

Ngày: 2026-10-09. Phạm vi cập nhật: nền tọa độ, tương thích save, sự kiện hoàn thành nghề; không thêm phần thưởng sản xuất hoặc buff Run.

## Phân tích

Gỗ hiện khởi đầu 25, thưởng thắng Run cuối 15; chi phí bath/carrot/anvil là 10/15/20. Energy và Link Shards thuộc vòng Run. Garden/pier là cơ sở chung, chưa có giá bán. Cư dân mở qua tuyển thú trong Run. Scheduler hiện nghỉ/đi/làm/quay về, chưa có reservation/pathfinding hoặc kho sản phẩm. UI ba slot là adapter, không phải editor đặt tự do.

Trước cập nhật: dữ liệu layout 1800x1200 khác renderer 1536x1024, anchors lặp trong UI; sự kiện nghề xảy ra lúc bắt đầu làm. Sau cập nhật: VillageSceneLayout là nguồn chung cho bounds/work anchors; VillageLayout và save dùng cùng world. Chỉ nhận diện tọa độ cố định cũ để chuyển đổi, không chấp nhận vị trí tùy ý. Story catalog ghi sau khi hoàn tất và dedupe theo ID. Xưởng world placement chuyển sang slot trống trong editor hiện tại, không tiêu Gỗ lại.

## Lộ trình tiếp theo

1. Tách simulation khỏi DOM để mở panel/chọn slot không reset tiến độ; có reservation trạm, trạng thái đi/làm/hoàn tất, kiểm tra pause/dispose.
2. Một nghề hoàn chỉnh: vườn tạo cà rốt sau chu kỳ hoàn tất, kho sản phẩm và ID completion chống nhận trùng; migration lưu sản phẩm. Chốt thời gian/sản lượng trước cân bằng.
3. Cá và đồ chơi dùng cùng contract; thêm đơn hàng làm nơi tiêu thụ sản phẩm, thưởng Gỗ và câu chuyện. Giữ số tài nguyên nhỏ.
4. Cấp công trình/Nhà chung mở nghề và năng lực; giá vườn/bến hoặc mô hình nâng cấp cơ sở chung cần chốt. Giữ tài sản đã có.
5. Offline production/buff Run chỉ sau kiểm chứng kinh tế nhỏ; không đổi Energy/Shards sang tiền làng ở giai đoạn đầu.

Gate: migration không mất Gỗ/cư dân/sở hữu, thưởng một lần sau hoàn thành, đường đi không xuyên vật cản, viewport 390x844/844x390/667x375 và thiết bị thật. Check/build không thay thế live review. Chưa triển khai sản xuất, đơn hàng, nâng cấp hay offline trong cập nhật này.

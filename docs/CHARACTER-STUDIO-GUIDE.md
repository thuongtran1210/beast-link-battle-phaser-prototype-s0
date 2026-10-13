# Character Studio — hướng dẫn sử dụng

Chạy `npm run dev`, mở `/character-studio.html?unit=beast-a`. Trang Review có nút mở Studio đúng nhân vật và clip. Công cụ là nội bộ; không xuất hiện trong luồng chơi chính.

## Avatar, thông số và kỹ năng

1. Chọn Beast ở danh sách. Chọn ảnh avatar PNG/JPEG/WebP; ảnh được giữ tỷ lệ và căn giữa trên PNG 256×256. Mẫu Grid có kích thước 44/56/72px.
2. Chỉnh HP/sát thương cơ sở. Bảng STAR dùng hệ số hiện hành; nhập trống hoặc ngoài giới hạn không được lưu.
3. Chọn 1★/2★/3★ trong phần kỹ năng, chỉnh giá trị có tên và đơn vị. Không thay điều kiện kích hoạt hoặc cơ chế chọn mục tiêu. Nhử cà rốt/vịt hóa ở 1★ vẫn khóa.
4. **Xem thay đổi & lưu → kiểm tra danh sách thay đổi → Lưu thay đổi**. Đặt lại mặc định chỉ sửa form; cần lưu để áp dụng.

## Animation và sprite vượt ô lưới

1. Chọn clip và frame trong Timeline. Di chuyển/đổi cỡ vùng nguồn hoặc Vẽ lại khung; được phép vượt ranh giới ô của sheet.
2. Nếu lấy cả hình bên cạnh, dùng **Khoanh giữ sprite**: click ít nhất ba điểm quanh sprite cần giữ, bấm **Áp dụng vùng giữ**. Dùng **Loại vùng thừa** và kéo hình chữ nhật để bỏ phần dư. **Xóa mask frame** bỏ cả hai loại mask. Escape hủy polygon đang vẽ.
3. Đặt điểm chân, chỉnh tỷ lệ/offset. **Dịch sprite** cho phép kéo trên Preview; phím mũi tên khi Preview có focus dịch 1px nguồn, Shift dịch 10px. Khung nguồn vẫn giữ nguyên. Lật hướng chỉ phục vụ preview.
4. Khi nhập các số frame/FPS/chiều cao chuẩn, bấm **Áp dụng thông số**. Công cụ kiểm tra cả nhóm rồi cập nhật preview và nháp; không phụ thuộc blur từng ô. Lưu dự án cũng áp dụng nhóm số hợp lệ trước khi mở diff.
5. Phát thử, xem pose trước, chỉnh thứ tự và thời lượng tương đối. FPS quyết định thời gian preview; Attack/Skill/Hit/KO trong Battle được fit vào thời lượng hành động gameplay, không thay nhịp gây damage. Tùy chọn lặp ở các clip hành động chỉ dùng cho preview; Battle phát một lần. Idle/Run dùng tùy chọn lặp trong cả Review và Battle.
6. **Xem thay đổi & lưu → Lưu thay đổi** xuất atlas của đủ sáu clip và ghi cấu hình. Atlas 2048×1024, ô 512×512, điểm chân (256,440), chiều cao chuẩn 320px. Sprite vượt khung xuất bị chặn lưu; giảm tỷ lệ hoặc dịch vị trí. PNG nguồn không bị sửa.

Mask không phục hồi phần đã bị pose khác che trong ảnh nguồn. Nếu crop thiếu phần khiên, phải mở rộng vùng nguồn trước; offset không tạo lại pixel bị thiếu.

## Review không đổi sau khi chỉnh

- **Nháp trên máy** khác **bản đã lưu vào dự án**. Review mặc định xem bản dự án. Muốn xem nháp, bật **Xem bản nháp đã chỉnh trên máy**.
- Nếu Studio báo nháp khác bản dự án, **Mở bản đã lưu** thay form/nháp bằng bản đang lưu; không ghi file dự án. Chỉ dùng khi bạn muốn bỏ chỉnh sửa nháp hiện tại.
- Sau lưu dự án, Review nhận thông báo và đọc API mới. Quay lại tab cũng đọc lại; có nút **Cập nhật từ dự án**. Caption cho biết frame, crop và offset thực đang dùng.
- Game đang mở cần tải lại để Phaser nạp texture/cấu hình mới. Trận đang chạy không bị thay thông số giữa trận.

## Revision, lịch sử và lỗi lưu

Nếu tab khác đã sửa cùng phần dữ liệu, server từ chối ghi đè. **Đọc lại revision** giữ form của bạn và cập nhật bản dùng để so sánh; xem diff trước khi lưu lại. Lưu phần unit và phần animation có revision riêng.

Danh sách sao lưu ghi **Trước lần lưu…**. Chọn bản rồi **Khôi phục phiên bản** khôi phục toàn bộ Beast: avatar, thông số, kỹ năng, animation. Bản hiện tại cũng được sao lưu trước restore. Không tự xóa ảnh cũ.

## File và kiểm chứng

- Cấu hình chung: `src/game/config/CharacterProjects.json`, schema: `CharacterSchema.ts`.
- Avatar: `public/assets/unit-custom`; atlas: `public/assets/character-custom`, tên theo content hash.
- Backup: `art/backups/character-studio/<beast-id>`. UnitOverrides cũ là nguồn migration, không còn là đích ghi mới.
- `npm run check`: validate bản đã lưu, regression bằng fixture mặc định trong bộ nhớ, cùng checks tùy chỉnh có kiểm soát. Không sửa file dự án.
- `npm run check:studio-server`: kiểm tra API trong thư mục tạm.
- `/character-studio-checks.html`: raster/mask/atlas; `/review-sync-checks.html?unit=beast-a`: Review đồng bộ. Đây là harness dev, không ghi cấu hình.

# Checklist chủ dự án — nền dân làng M0

Ngày: 2026-10-14. Trạng thái: **OWNER REVIEW OPEN**.

Chủ dự án tự kiểm giao diện; agent không tiếp tục browser automation. Mọi ô dưới đây dành cho kết quả bạn tự xác nhận. Check/build là bằng chứng code riêng, không thay thế checklist này.

## Mở trang

- [Làng với dữ liệu thử](http://127.0.0.1:5180/village-foundation-preview.html)
- [Player animation chẩn đoán](http://127.0.0.1:5180/village-animation-preview.html)
- [Game thật ở origin kiểm thử](http://127.0.0.1:5180/)

Nếu server đã dừng: chạy `npm run dev -- --host 127.0.0.1 --port 5180 --strictPort` tại thư mục repo.

Fixture chỉ cho tạo save mới ở cổng 5180, không ghi đè save có sẵn. Nút tạo bị khóa nếu đã có save là bình thường; chọn **Mở làng** để tiếp tục. Save ở cổng 5173 khác với save thử ở 5180. Sáu cư dân và xưởng trong fixture chỉ phục vụ kiểm thử, không phải quyền mở khóa mới của GAME.

Preview animation dùng tám ô SVG chẩn đoán và cutout hiện có. Chưa có sheet nghề mới hoặc art đã được duyệt.

## A. Làng và công việc

1. Mở trang dữ liệu thử; tạo fixture nếu nút còn cho phép; chọn **Mở làng**.
   - [ ] Có sáu cư dân, vườn, bến cá và xưởng; nút Kho/Cư dân/Xây dựng dùng được.
2. Chờ Windstrider/Shadowclaw/Ironclad tới trạm.
   - [ ] Cư dân tới trạm rồi mới làm; tên và hướng quay đọc được.
   - [ ] Panel nghề có tiến độ; số giây giảm trong lúc làm.
   - [ ] Khi hoàn tất, kho tăng đúng một đợt: vườn +3 cà rốt, câu cá +2 cá, xưởng +1 đồ chơi.
   - [ ] Không nhận sản phẩm liên tiếp nhiều lần cho cùng một đợt.
3. Khi một nghề đang làm, ghi số giây còn lại và Gỗ/Đồng; mở **Xây dựng**, chọn một vị trí trống rồi đóng panel. Không bấm chế tạo/đặt.
   - [ ] Cư dân không quay về điểm xuất phát; tiến độ không trở lại thời gian đầu.
   - [ ] Gỗ/Đồng không bị trừ lần nữa vì render lại.
4. Khi job đang làm, tải lại trang rồi chọn **Mở làng**.
   - [ ] Cư dân đi tới trạm lại, sau đó tiếp tục thời gian đã lưu.
   - [ ] Không trả phí vật tư hoặc tiêu đầu vào lần thứ hai cho job đã trả.

## B. Ẩn tab, rời làng và timer

- [ ] Khi đang làm, chuyển sang tab khác khoảng 10 giây rồi quay lại: không cộng thêm 10 giây sản xuất; tiến độ tiếp tục từ lúc ẩn.
- [ ] Rời làng, đợi khoảng 10 giây rồi vào lại: không có sản xuất offline.
- [ ] Chạm thú để hiện bong bóng; chọn vị trí xây dựng để render lại: bong bóng cũ biến mất, không xuất hiện lại trên node cũ.
- [ ] Bấm **Đọc tài nguyên QA** trong làng: bình thường có 2 RAF (mây và hoạt động), không tăng thêm sau nhiều lần chọn vị trí.
- [ ] Sau khi đóng mọi dialog và bấm quay lại, bấm **Đọc tài nguyên QA**: kết quả cuối là `RAF 0 · Interval 0 · Timeout 0`. Đợi chuyển cảnh hoàn tất trước khi đọc.
- [ ] Lặp vào/rời làng ba lần: điều khiển vẫn hoạt động, không có nhiều bong bóng hay thông báo lặp bất thường.

## C. Trạng thái bị chặn

Các thao tác mua/bán bên dưới chỉ làm ở fixture cổng 5180.

- [ ] Hết Đồng, vườn/xưởng hiện lý do thiếu tiền và chờ; bổ sung bằng bán tài nguyên thì có thể làm tiếp.
- [ ] Hết cà rốt, bến cá hiện thiếu vật tư; mua cà rốt thì làm tiếp.
- [ ] Khi không đủ chỗ kho cho đợt mới, hiện kho đầy và không trừ vật tư cho đợt không bắt đầu được.
- [ ] Cư dân đang chờ vật tư vẫn đứng tại trạm; không đi lùi qua lại khi retry.

Lỗi lưu và kho tràn sau khi job bắt đầu đã có kiểm thử code bằng storage giả; bạn không cần sửa trình duyệt hoặc xóa save để giả lập. Nếu tự gặp lỗi lưu thật, ghi thông báo và hành động vừa thực hiện.

## D. Player animation chẩn đoán

1. Chọn **Loop chẩn đoán**, bấm **Tiến 1 frame**.
   - [ ] Frame chạy 0 → 7 → 0; điểm neo chữ thập giữ vị trí ổn định.
   - [ ] Qua frame 3, `Cues 1`; bước kế tiếp không lặp lại cue frame 3.
2. Bấm **Tạm dừng**, rồi **Tiến 1 frame** vài lần.
   - [ ] Frame không đổi và không phát cue. Bỏ tạm dừng thì tiếp tục được.
3. Bấm **Đổi hướng**.
   - [ ] Toàn bộ sprite lật quanh điểm neo, không lật chữ/nút của giao diện.
4. Chọn **One-shot chẩn đoán**; bỏ pause nếu đang bật; bấm **Tiến 1 frame** tám lần.
   - [ ] Giữ frame 7; lần hoàn tất hiện `Completed true` đúng một lần.
   - [ ] Bấm tiếp vẫn frame 7 nhưng `Completed false`; **Chạy lại** về frame 0.
5. Chọn **Thiếu sheet → cutout**, sau đó **Ảnh lỗi → cutout**.
   - [ ] Cả hai trường hợp đều hiện Windstrider cutout, không mất nhân vật.
6. Bấm **Dispose player**, rồi thử bước tiếp/chạy lại.
   - [ ] Layer sprite biến mất; cutout còn; player không hoạt động trở lại.

## E. Điện thoại và ghi nhận

- [ ] Dọc: thấy nút quay lại, Kho, Cư dân và nút đóng dialog.
- [ ] Ngang: dialog không cắt mất nội dung hoặc nút đóng; pan/zoom vẫn dùng được.
- [ ] Chạm trạm khi có cư dân đứng gần: mở được panel. Nếu chạm trúng cư dân thay vì trạm, ghi vị trí và ảnh; đây là hạng mục touch review cần xác nhận.

Mẫu phản hồi:

```text
Mục: A3 / B / D4 ...
Kết quả: PASS hoặc FAIL
Thiết bị / trình duyệt:
Các bước tái hiện:
Kỳ vọng:
Thực tế:
Ảnh hoặc video (nếu có):
```

Nghiệm thu M0 sau khi các mục liên quan được chủ dự án xác nhận. Kiểm tra sheet nghề thật, grip/công cụ và hiệu ứng trạm thuộc M1 khi có asset; chưa đánh dấu STYLE APPROVED hoặc GAME READY.

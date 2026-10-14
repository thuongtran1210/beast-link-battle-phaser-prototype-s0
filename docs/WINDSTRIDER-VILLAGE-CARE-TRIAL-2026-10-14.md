# Windstrider — thử sheet chăm vườn owner

2026-10-14. **OWNER-SUPPLIED / RUNTIME TRIAL INTEGRATED / OWNER VISUAL REVIEW OPEN**. Không phải STYLE APPROVED hoặc GAME READY.

Source từ clipboard owner được copy nguyên byte vào `public/assets/characters/rabbit-archer/village_animation_v01/garden-action-owner-v01.png`. Không sửa bitmap, không tác động Battle sheets. PNG 1774×887, RGBA 8-bit, 1,007,748 pixel alpha 0. Tám ô chia bằng floor boundaries; metadata giữ alpha bounds và cửa sổ có padding. Pivot neo theo dải chân thấp của từng pose; neutral height theo frame 1 là 414 px, không scale từng pose cho bằng nhau.

Sheet có đứng/lấy bình/tưới/đứng lại, không có gieo hạt hay thu hoạch. Registry `work` chỉ phát một lần ở 5 fps, giữ frame 8 tay trống khi job còn chạy. Rebind cùng job khôi phục thời gian hình ảnh thay vì replay pickup. Job mới được phát lại. Đi/idle vẫn dùng cutout fallback vì owner chưa gửi các sheet đó. Vườn và cây vẫn là asset riêng; bình prototype ẩn khi sheet đang hiển thị để không có hai bình. Sheet không chứa nước; layer nước ghép riêng là bước sau.

Không đổi recipe, sản lượng, tiền, save hoặc giao hàng. Chu kỳ luống trống → gieo → lớn → trưởng thành → thu hoạch một lần → hàng tại trạm mới là hướng thảo luận; chưa được triển khai trong lượt thử sheet này. Không gọi frame 8 để cấp hàng.

Owner tự kiểm:

- [ ] Reload [preview](http://127.0.0.1:5180/village-animation-preview.html), chọn “Thỏ chăm vườn — sheet owner”, bấm Tiến 1 frame tám lần: thấy đúng thứ tự và giữ pose cuối. Chạy lại trở về pose đầu.
- [ ] Mở [fixture Làng](http://127.0.0.1:5180/village-foundation-preview.html) → Mở làng; Windstrider tới vườn và chăm một lượt, không lặp pickup/đặt bình suốt job.
- [ ] Chỉ có một bình trong hình; không có thỏ thứ hai hoặc mảng nền đen.
- [ ] Chân không nhảy khỏi điểm đứng, không cắt tai/cán bình, kích thước khớp vườn.
- [ ] Khi job đang chạy, chọn vị trí xây dựng để render lại: không phát lại cả chuỗi chăm sóc.
- [ ] Ẩn tab/rời làng không chạy thêm job; các nghề khác và Battle không bị đổi hình.

Kiểm chứng code: animation clock kiểm one-shot/hold/rebind seek; check/build chạy riêng. Browser automation không chạy theo yêu cầu owner. Live/art PASS chỉ ghi sau phản hồi owner.

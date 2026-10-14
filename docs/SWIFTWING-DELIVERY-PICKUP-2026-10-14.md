# Swiftwing — delivery-pickup owner

2026-10-14. **OWNER-SUPPLIED / PLAYER REGISTERED / OWNER VISUAL REVIEW OPEN**. Chưa STYLE APPROVED hoặc GAME READY; vận chuyển tự động chưa được bật.

Source copy nguyên byte tới `public/assets/characters/fox-archer/village_animation_v01/delivery-pickup-owner-v01.png`. File RGBA8 1774×887, tám frame 4×2, 920,929 pixel alpha 0. Metadata giữ hash/source bounds, neutral height 398px; không resize/repaint/cắt lại bitmap. Một số pivot được hiệu chỉnh theo chân thay vì đáy kiện; owner cần kiểm registration.

Đăng ký `beast-f / pickup`: one-shot 8fps, giữ frame 8 đang ôm kiện. Cue frame 4 (index 3) chỉ là handoff hình ảnh; vị trí socket hand còn cần ghép/review với world parcel. Cue không cộng Kho, xóa giỏ hoặc nhận reservation. Sheet không có sprite trạm hay điểm nhận.

Hiện chỉ player registry và preview dùng clip này. Scene Làng chưa có carrier controller nên Swiftwing chưa tự nhặt hàng. Loaded-walk và delivery-finish còn thiếu; khi tích hợp vận chuyển phải dùng fallback phù hợp, không loop pickup để giả đi bộ.

Owner checklist — reload [preview](http://127.0.0.1:5180/village-animation-preview.html), chọn **Swiftwing delivery-pickup — sheet owner**:

- [ ] Frame 1–3 tay trống; frame 4 có kiện; frame 5–8 nâng và ôm kiện.
- [ ] Bấm Tiến 1 frame: thứ tự đúng, không có mảng đen hoặc cắt đuôi/tai/kiện.
- [ ] Chân/scale không nhảy khi cúi và nâng kiện, nhất là frame 3/4.
- [ ] Pause giữ pose; đổi hướng lật cả nhân vật/kiện, không lật UI.
- [ ] Sau tám bước giữ pose cuối; bước tiếp không phát pickup/cue lần nữa. Chạy lại về pose đầu.

Kiểm tra code: animation checks xác nhận metadata, frame-four cue và one-shot completion/hold. Build kiểm TypeScript/bundle. Browser automation không chạy; nhận định về grip/tỷ lệ chỉ được đóng sau owner review.

## Bổ sung loaded-walk / finish / ảnh 3

Owner gửi ba RGBA 1774×887 sheet, source giữ nguyên. Loaded-walk đã đăng ký loop 8fps; delivery-finish one-shot 8fps, cue release frame 5 chỉ là presentation. Ảnh 3 mang nhãn delivery-greet nhưng thực tế ôm kiện và bước đi, nên giữ delivery-greet-review-owner-v01 riêng và chỉ cho xem review, không bind greet. Các clip dùng neutral scale 398px của pickup, pivots/khớp pose cần owner review. Chưa bật carrier controller hoặc nhập kho từ animation.

Owner reload preview và chọn từng clip:

- [ ] Loaded-walk nối frame 8→1, kiện không biến dạng, chân/scale không nhảy.
- [ ] Finish: frame 1–4 có kiện; từ frame 5 tay trống; giữ frame 8, không release lặp.
- [ ] Pickup→walk→finish không đổi kích thước nhân vật/kiện bất thường.
- [ ] Ảnh 3 cần thay bằng sheet tay trống/vẫy chào nếu muốn dùng delivery-greet; chưa cần để nối vận chuyển cơ bản.

Animation checks PASS; build chạy riêng. Không browser automation/art approval.

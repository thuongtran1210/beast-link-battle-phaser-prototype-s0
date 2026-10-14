# Chu kỳ vườn cà rốt — triển khai đầu tiên

2026-10-14. **IMPLEMENTED / DOMAIN CHECK PASS / BUILD PASS / OWNER UI REVIEW OPEN**.

Owner chọn thay baseline và đồng ý ví dụ được nêu: lượt mới **60 giây làm việc / 5 cà rốt / 1 Đồng**. Mốc hình ảnh đề xuất trong lần đầu: gieo 6s, cây lớn/chăm 39s, trưởng thành 6s, thu hoạch 9s. Đây là một job/đồng hồ kinh tế, không phải bốn timer độc lập. Đói vẫn giảm work rate về 75%; 60 work seconds có thể dài hơn 60 giây đồng hồ. Tab ẩn/rời Làng không tiến triển.

## Hành vi

- Luống trống → gieo → cây nhỏ → cây trưởng thành → thu hoạch → giỏ tại trạm.
- `harvestGarden` lưu cờ harvested trên cùng job ID/quantity/cost; không cộng inventory. Lỗi lưu không tạo giỏ đã xác nhận.
- Giỏ chờ giữ reservation kho, không tự gieo lượt mới và không thu hoạch lặp. Thỏ quay về nghỉ; lần nghỉ sau không đi tới trạm khi giỏ chưa lấy.
- Trong slice này, panel Vườn có **Nhận giỏ vào Kho (thủ công tạm)**. Chưa có người vận chuyển tự động. Collection lưu trước commit, cộng đúng một lần, xóa job/giỏ và cho phép lượt mới. Kho tràn hoặc lỗi lưu giữ giỏ để retry.
- Carrot expiry bắt đầu lúc nhập Kho, giữ baseline delivery hiện có. Chưa mô phỏng spoilage của giỏ ngoài trạm trong slice này; quy tắc đó cần đặc tả khi nối vận chuyển.
- Garden job lưu totalSeconds/quantity. Legacy job thiếu hai trường migrate thành 30s/3 củ, không trả vật tư lại hoặc đổi yield đã trả. Không reset cư dân/tài sản.
- Vườn hiện hiển thị **prototype SVG theo trạng thái**, độc lập nhân vật; ảnh garden owner gốc giữ nguyên. Chưa có sprite đất/cây/giỏ được owner duyệt.
- Sheet owner hiện chỉ dùng cho chăm sóc khi cây lớn, phát một lần rồi giữ pose cuối. Gieo/thu hoạch dùng cutout fallback vì chưa có clip thật; không phát lại tưới để giả nhổ cà rốt. Chưa bổ sung planting/harvest sheet hoặc vận chuyển trong lượt này.

## Owner checklist

Mở [fixture Làng](http://127.0.0.1:5180/village-foundation-preview.html), reload → Mở làng. Nếu còn job cũ thì hoàn tất/nhận giỏ trước để thấy lượt mới 60s/5 củ.

- [ ] Thấy luống trống/đất, cây nhỏ, cây trưởng thành; sau harvest cây biến mất và giỏ xuất hiện.
- [ ] Panel Vườn hiển thị giai đoạn, số giây và quantity đúng; recipe mới ghi 60s/5 củ/1 Đồng.
- [ ] Khi giỏ xuất hiện, Kho chưa tăng cà rốt; không trả phí hoặc thu hoạch lần nữa trong lúc chờ.
- [ ] Thỏ tưới một lượt ở giai đoạn cây lớn, không tưới/nhổ liên tục; sau harvest về nghỉ.
- [ ] Reload khi đang trồng hoặc có giỏ: giữ đúng job/stage/yield; không trả tiền hoặc tạo giỏ lần nữa.
- [ ] Bấm nhận thủ công: Kho tăng đúng số củ của lượt (5 mới, 3 legacy), giỏ biến mất; bấm lặp không cấp thêm.
- [ ] Lượt sau bắt đầu từ gieo, trừ vật tư một lần; vườn không giữ cây trưởng thành từ lượt cũ.
- [ ] Đổi tab/rời làng giữ tiến độ, không offline; pan/zoom vẫn dùng được.

Nếu nguồn server dừng, chạy `npm run dev -- --host 127.0.0.1 --port 5180 --strictPort`. Agent không chạy browser automation; owner review và art status ghi riêng.

## Code evidence

Checks có boundary stages, harvest/collection save failure, replay, pending reload, reservation/overflow và legacy 30s/3 yield. Chạy `npm run check` và `npm run build`; ghi kết quả cuối trong handoff. Không dùng kết quả code thay live/art acceptance.

Kết quả cuối: npm run check PASS; garden-cycle targeted checks PASS sau giới hạn quantity riêng garden; npm run build PASS. Owner UI/art review OPEN.

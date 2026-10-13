# Animation Studio — công cụ chỉnh bản nháp

Trang `/unit-review.html` có nút mở `/animation-editor.html` theo nhân vật và clip đang xem. Studio hỗ trợ ba sheet rig Snowguard, Ironclad, Windstrider; chỉnh vùng cắt, điểm chân, tỷ lệ, dịch chuyển, thời lượng và thứ tự frame. Có preview, onion skin, undo/redo, lưu bản nháp local và import/export JSON đã kiểm tra cấu trúc. Review có tùy chọn xem bản nháp trên máy.

Ảnh nguồn và cấu hình Battle không tự thay đổi. JSON xuất là bản nháp cần tích hợp riêng. `npm run check` và `npm run build` đã qua; thao tác nhập thông số/lưu/reload cần tiếp tục kiểm chứng trực tiếp trên trình duyệt.

## Giới hạn và đề xuất sau phản hồi frame 5 Attack

Sprite có thể vượt ranh giới ô lưới. Dịch X/Y trong preview không phục hồi phần bị cắt hoặc loại phần sprite lân cận. Studio hiện chỉnh vùng nguồn hình chữ nhật, chưa có mask chọn sprite, dịch pixel trong atlas hoặc xuất atlas PNG mới.

Đề xuất workflow: chọn vùng nguồn độc lập với ô lưới → mask không phá hủy để bỏ sprite bên cạnh → đặt sprite vào frame xuất cố định bằng điểm chân và offset → kiểm tra onion skin → xuất atlas PNG cùng JSON. Khung nguồn được phép đi qua ranh giới ô; vùng xuất vẫn có kích thước thống nhất. Nếu các pose thực sự chồng pixel và che nhau trong ảnh gốc, mask/offset không phục hồi phần bị che.

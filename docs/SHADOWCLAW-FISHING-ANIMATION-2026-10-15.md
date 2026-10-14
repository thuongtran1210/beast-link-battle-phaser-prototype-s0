# Shadowclaw — animation câu cá owner

Ngày 2026-10-15. OWNER-SUPPLIED / VILLAGE INTEGRATED / OWNER VISUAL REVIEW OPEN.

Ảnh 1 fishing-enter, ảnh 2 fishing-work, ảnh 3 fishing-finish. Ba source RGBA 1774×887 được copy nguyên byte vào public/assets/characters/raccoon-rogue/village_animation_v01. Metadata lưu SHA256, alpha và tám cửa sổ từ file thực. Pivot thân/đáy chân là ước lượng, scale thân chung 320px không tính cần câu; cần owner kiểm tra độ ổn định. Đầu cần/dây sát hoặc vượt ranh giới ô ở một số frame; không sửa ảnh gốc hay tự coi art đạt chuẩn.

Registry beast-b: enter one-shot 8fps → work loop 8fps → finish one-shot 8fps. Controller hiện có phát clip khi vào làm và khi job hoàn tất chuyển về; finish là presentation trên chuyển động trở về hiện có. Cần câu trong sheet có quyền sở hữu tool, prototype rod ẩn khi sheet tải thành công. Thiếu/lỗi source dùng cutout/prototype như trước. Khi tab ẩn vòng tick dừng; reduced motion dùng chế độ hiện có.

Không đổi recipe, thời gian câu, số cá, save hoặc tiền. Finish không có cá trong hình, không tự sinh cá hay cộng Kho từ frame. Cá vẫn dùng delivery baseline hiện tại; chuỗi Swiftwing nhận cá/đồ chơi chưa được triển khai trong lượt nhận sheet này. Battle không đổi.

## Checklist tự mở

Mở http://127.0.0.1:5180/village-animation-preview.html, chọn từng clip Shadowclaw; mở Làng hoặc fixture để xem với bến câu.

- [ ] Đúng thứ tự enter/work/finish, đủ tám frame, không lẫn sheet.
- [ ] Bấm từng frame: đủ tai/đuôi/cần/dây, không lấy nhầm nét từ ô bên cạnh. Báo frame cần sửa source nếu dây bị cắt.
- [ ] Pivot/thân/đầu giữ tỷ lệ, chân không giật ngang khi chuyển clip. Loop work nối frame 8→1 hợp lý.
- [ ] Enter/finish chạy một lần và giữ pose cuối trong preview; pause/restart/flip hoạt động.
- [ ] Trong Làng: tới bến, tung cần, câu, kéo cần khi xong. Chỉ một cần câu; không hiện cần SVG chồng sheet.
- [ ] Reload/tab ẩn không mất job hoặc cộng cá hai lần. Giảm chuyển động và fallback khi lỗi source vẫn đọc được trạng thái.

Agent không chạy browser automation. Code checks/build tách biệt với owner visual approval.

## Sửa lỗi từ ảnh owner

Owner báo điểm câu lệch và mảnh dư. Điểm đứng dịch sang bên phải cầu câu (work x=1200,y=650.24; renderer dùng top-left nhân vật, chân x≈1246,y≈747), hướng cần ra mặt nước. Không di chuyển bến/công trình.

Đo connected components cho từng ô phát hiện dây/cần từ ô kế bên: enter frames 3/5/6, work frames 3/7, finish frames 3/5. Crop clamp đúng biên ô; exclusion rectangles chỉ ẩn các mảnh rời tại runtime qua clip-path, không chỉnh PNG owner. Dấu giật mình trong finish frame 2 được giữ vì thuộc animation. Các đầu dây bị cắt sẵn trong source không được tự vẽ lại.

Owner reload và kiểm lại điểm chân đứng trên cầu, đầu cần hướng ra nước; bước từng frame trong preview để xác nhận mảnh dư biến mất và cần chính còn đủ. Agent chưa chạy UI.

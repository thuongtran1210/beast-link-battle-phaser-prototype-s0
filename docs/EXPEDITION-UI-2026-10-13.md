# Chọn vùng thám hiểm — giao diện mobile

Đã triển khai theo phản hồi: header nhỏ, bỏ mô tả dài trên card, danh sách card cuộn ngang khi thiếu chiều rộng. Thẻ giữ tên, bản sắc vùng, ba đợt theo thứ tự, trạng thái hoàn tất và nút chọn tối thiểu 44px. Mục tiêu Làng thu gọn; header ghi điều kiện +15 Gỗ thay banner lớn.

Card 216px ở màn ngang, 240px ở chiều dọc; màn ngang thấp dùng bản compact. Một vùng cuộn ngang có scroll snap, không ép card co nhỏ để vừa ba cột. Màn đủ rộng hiển thị cả ba thẻ.

Kiểm tra trình duyệt: 390×844 có nội dung ngang 750px trên vùng 362px, thao tác cuộn dịch được 388px; nút chọn cao 44px. 625×350 có card không tràn chiều cao sau chỉnh compact. Build đạt. Chưa xác nhận QA cảm ứng trên điện thoại thật.

Chỉ thay trình bày. Region IDs, encounter, phần thưởng, lựa chọn Deck và save không đổi.

# Unit Studio — avatar Grid và thông số

Owner yêu cầu chỉnh avatar Grid Board và thông số thuận tiện cùng workflow review/animation. `/unit-editor.html?unit=beast-a` hỗ trợ cả 10 Beast; Review liên kết theo Beast đang chọn. Ba Beast có sheet hiện có thêm liên kết Animation Studio.

## Đã tích hợp

- Chọn PNG/JPEG/WebP tối đa 5 MB, giữ tỷ lệ, căn giữa trên PNG trong suốt 256×256; preview 128px và mẫu ô 44/56/72px.
- Chỉnh HP và damage cơ sở riêng từng Beast, preview hệ số STAR hiện hành. Nhịp đánh và thông số signature chưa có trường chỉnh.
- Lưu qua Vite dev middleware trên localhost, yêu cầu Origin cùng host và JSON; giới hạn request, whitelist Beast/field/range, tên file do server tạo.
- Cấu hình tại `src/game/config/UnitOverrides.json`; avatar có tên theo hash tại `public/assets/unit-custom`. Sao lưu cấu hình trước khi ghi tại `art/backups/unit-editor`; ghi file tạm rồi rename. Revision riêng Beast tránh ghi đè cấu hình đã thay đổi ở tab khác. Khôi phục mặc định được sao lưu như thao tác lưu.
- Review đọc avatar/HP/damage; Phaser icon preload (bao gồm Grid) đọc avatar override; Battle khởi tạo HP/damage riêng rồi nhân STAR. Không ghi save người chơi. Game cần tải lại để nhận cấu hình/texture mới.
- Bản build chứa các giá trị đã lưu; chỉ dev server có API ghi. Animation Studio vẫn là bản nháp local/JSON, chưa có API lưu animation hoặc atlas PNG.

## Kiểm chứng

`npm run check` pass. Kiểm thử API trong thư mục tạm bằng `node scripts/unit-editor-server-checks.js` pass: origin sai, path sai, số âm bị từ chối; lưu, conflict, restore và backup. Browser Unit Studio mở được; thay HP/damage cập nhật ngay so sánh STAR. Không chốt thông số mới thay owner; file override ban đầu rỗng. Live avatar upload và Battle/Grid sau save vẫn cần owner review.

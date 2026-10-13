# Character Studio — kế hoạch và tiêu chí hoàn thành

Owner yêu cầu lập kế hoạch rồi thực hiện (2026-10-13). Phạm vi là công cụ nội bộ chỉnh avatar Grid, HP/damage, tham số kỹ năng theo STAR và animation; giữ ảnh nguồn, không tự chốt balance mới.

1. **Dữ liệu chung:** một schema versioned cho từng Beast, một file cấu hình dự án; chuyển dữ liệu UnitOverrides hiện có, giữ fallback mặc định. Editor/Review/game dùng cùng accessor và validator. Không sửa save người chơi.
2. **Lưu có kiểm soát:** API localhost đọc revision mới, preview thay đổi, lưu từng phần, sao lưu trước atomic commit; lịch sử và khôi phục phiên bản. Hai editor không ghi đè phần khác. Validation thất bại giữ form/bản nháp.
3. **Animation:** giữ vùng nguồn độc lập ô lưới; polygon giữ sprite và hình chữ nhật loại sprite bên cạnh, dịch sprite/điểm chân, undo/redo. Preview dùng cùng hàm raster với xuất atlas 2048×1024 (8 ô 512px). Lưu atlas theo content hash, JSON chỉ trỏ tới file đã ghi; ảnh nguồn không bị ghi đè.
4. **Runtime:** ba rig đọc cấu hình đã lưu; frame order/duration/crop/anchor/offset/mask nhất quán Review và Battle. Attack/Skill/Hit/KO giữ đồng bộ thời lượng hành động gameplay. Chưa có sheet vẫn giữ cutout fallback.
5. **Thông số kỹ năng:** schema trường có tên/đơn vị/giới hạn theo signature và STAR; editor và Review dùng catalogue chung, handler Battle dùng giá trị đã lưu hoặc mặc định. Không thay logic targeting/activation ngoài các tham số công khai.
6. **Kiểm chứng và bàn giao:** regression mặc định, validation/migration, lưu/conflict/backup/restore, raster/mask/frame timing và runtime; build; smoke UI. Ghi rõ phần kiểm chứng tự động và phần live owner còn mở.

## Kết quả triển khai

- [x] Schema chung `CharacterSchema.ts`, file versioned `CharacterProjects.json`; fallback/migration UnitOverrides cũ. Entry `/character-studio.html` có hai tab; URL editor cũ còn tương thích.
- [x] API đọc bản mới/revision, lưu từng phần, backup, atomic commit, lịch sử/restore và thông báo lưu cho Review. Preview diff trước ghi; lỗi giữ form; thao tác đang lưu khóa editor. Lưu unit không ghi đè animation và ngược lại.
- [x] Crop vượt ô lưới, polygon giữ sprite, rect loại phần thừa, offset bằng số/kéo preview/phím, undo/redo; raster cache. Xuất/lưu atlas sáu clip 2048×1024; chặn pixel sprite vượt khung xuất, giữ ảnh nguồn.
- [x] Review và ba renderer Battle đọc cấu hình đã lưu. Thứ tự/weight pose trong hành động dùng clock theo thời lượng gameplay; KO giữ cuối; dispose bỏ callback. Game đang mở cần reload để nhận texture mới.
- [x] Kỹ năng 10 Beast có catalogue trường và đơn vị/giới hạn theo 1★–3★; handler và Review đọc chung. Cà rốt/vịt hóa vẫn bắt đầu từ 2★. Nhịp đánh/targeting/activation grammar không được thay bằng dữ liệu tùy ý.
- [x] Regression/schema/tuning/mask/action-clock/renderer checks; API isolated migration/avatar/atlas/conflict/concurrent save/history restore; browser raster kiểm tra pixel và đủ 18 sheet; browser Review stale→API/HP/seek frame5; UI áp dụng offset, undo và diff modal.

Owner đã có các lần lưu Snowguard trong quá trình dùng công cụ; giữ nguyên cấu hình và file atlas/backup đó. Kiểm thử số mới sử dụng thư mục tạm hoặc cấu hình trong bộ nhớ, không áp đặt balance/ảnh mới. Kiểm tra gameplay bằng dữ liệu tùy chỉnh trên thiết bị và duyệt art của owner còn mở; code/check pass không đồng nghĩa GAME READY.

Xem hướng dẫn sử dụng tại `docs/CHARACTER-STUDIO-GUIDE.md`.

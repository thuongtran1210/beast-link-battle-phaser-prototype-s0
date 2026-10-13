# Trang review nhân vật

URL: /unit-review.html; chọn sẵn Windstrider: /unit-review.html?unit=beast-c.

Trang độc lập ngoài player flow, không đọc/ghi save. Có 10 Beast, chọn STAR, HP và sát thương theo roleBaseStats × starStatMultiplier, nhịp đánh/windup theo BattleConfig, thông số kỹ năng theo StarProfile và các quy tắc support hiện tại. Giá trị cơ sở không đồng nghĩa sát thương cuối sau Signature; kỹ năng hỗ trợ có luật riêng.

Animation có sheet cho Snowguard, Ironclad và Windstrider. Idle/Run lặp; clip còn lại phát một lần và giữ pose cuối để xem. Runtime Battle trở lại locomotion sau Attack/Skill/Hit; KO giữ pose cuối. Điều khiển: pause/replay, tốc độ, lật hướng, chọn frame 1–8. Unit khác hiển thị cutout tĩnh và thông báo chưa có sheet. Đổi STAR chỉ đổi thông số, không tự tạo art evolution.

Preview không mô phỏng damage, projectile hoặc hiệu ứng fun; cần xem Battle để kiểm chứng kỹ năng trong ngữ cảnh. Vite multi-page build đưa trang review vào dist/unit-review.html.

Browser smoke: chọn Windstrider 3★, clip Skill, thông số và frame thay đổi đúng; review mobile/device còn mở. Không xác nhận cân bằng hoặc duyệt phong cách từ preview.

# Windstrider — sheet animation chủ dự án

Thứ tự chủ dự án: Idle, Run, Attack, Skill, Hit, KO. Sáu PNG RGBA 1774×887, mỗi sheet 8 frame 4×2. Tệp gốc giữ nguyên dưới public/assets/characters/rabbit-archer/animation_v01; Run dùng tên walk.png để tương thích rig chung, không đổi nội dung ảnh.

scripts/import-windstrider-animation.py sao chép ảnh, đo alpha >=32 để lấy cửa sổ frame, điểm chân và chiều cao pose đầu. Kích thước ô thực 443/444 px; không giả định sheet 2048×1024. WindstriderFrames.json và bản frames.json runtime ghi dữ liệu đo. KO thấp xuống tự nhiên; scale theo pose đầu, không phóng to pose ngã.

Setup/Battle dùng WindstriderAnimationPlayer qua state machine chung: Idle/Run lặp; Attack/Skill/Hit một lần; Skill ưu tiên hơn Attack/Hit; KO giữ frame cuối; revive về Idle. Các event gameplay và projectile/nhử cà rốt vẫn do model/VFX hiện có quyết định. Camp chưa chuyển sang sheet animation.

Preview: /windstrider-animation-preview.html. Kiểm thử chung mở rộng cho Snowguard, Ironclad, Windstrider. Owner-supplied / integrated; chưa STYLE APPROVED hoặc GAME READY; review chuyển pose, neo chân, cung/mũi tên và mobile Battle còn riêng.

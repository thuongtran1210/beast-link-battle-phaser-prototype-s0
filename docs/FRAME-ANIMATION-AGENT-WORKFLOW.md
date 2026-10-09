# Workflow cho agent — Tạo và tích hợp animation theo reference

Ngày: 2026-10-09. Phạm vi: animation hình ảnh của nhân vật; không đổi gameplay.

## 1. Nhận việc và chọn reference

- Đọc AGENTS.md, CURRENT_REPO_HANDOFF.md, AI_INSTRUCTIONS.md và bộ art instructions được điều hướng trong AGENTS.md. Dùng nguồn repo, không gọi Notion nếu người dùng không yêu cầu.
- Xác định unit ID, slug asset, ảnh toàn thân reference và animation người dùng yêu cầu. Vai trò/kỹ năng phải lấy từ code, không suy diễn thêm từ hình.
- Ảnh chủ sở hữu cung cấp là reference nhận diện: giữ loài, tỷ lệ, trang phục, màu, phụ kiện, vũ khí, nét viền và hướng nhìn. Không chuyển thành thiết kế khác để hợp một mô tả style cũ.
- Chỉ làm nhân vật/phạm vi đang được yêu cầu. Việc owner yêu cầu tiếp tục Ironclad cho phép làm Ironclad; không tự coi đó là duyệt tạo cả roster.
- Nếu viết prompt cho owner tự tạo: cung cấp prompt kèm yêu cầu đính kèm đúng reference. Nếu agent được yêu cầu tạo/chỉnh bitmap: đọc và dùng skill imagegen đang có trong phiên. Không gọi tạo ảnh chỉ vì đang viết tài liệu/prompt.

## 2. Chuẩn đầu ra yêu cầu

| Thuộc tính | Quy cách |
| --- | --- |
| Canvas yêu cầu | 2048 × 1024 px |
| Lưới | 4 cột × 2 hàng |
| Số frame | Chính xác 8 cho mỗi animation |
| Mỗi ô yêu cầu | 512 × 512 px |
| Thứ tự frame | Trái → phải hàng trên, rồi hàng dưới |
| Nền | PNG alpha trong suốt thật; không vẽ nền caro |
| Hướng | Sang phải; runtime có thể lật cả nhân vật |
| Điểm neo đất | Tọa độ cục bộ (256, 440) trong mỗi ô |
| Nội dung | Một nhân vật, một động tác, một sheet |

Mọi sheet cùng nhân vật dùng cùng tỷ lệ trung tính. Để đủ khoảng trống cho vũ khí. KO được thấp đi tự nhiên khi ngồi/ngã, không phóng lớn pose KO để lấp ô.

Tên file/thứ tự bàn giao chuẩn: `idle.png`, `walk.png`, `attack.png`, `skill.png`, `hit.png`, `ko.png`. Luôn ưu tiên thứ tự owner xác nhận; không đoán theo thứ tự chuẩn nếu owner gửi khác.

## 3. Prompt chung gửi công cụ tạo ảnh

Đính kèm ảnh reference thật trong công cụ, không chỉ ghi tên file trong prompt. Thay phần trong ngoặc vuông bằng nhận diện cụ thể và chỉ MỘT chuỗi động tác ở mục 4.

```text
Create an 8-frame 2D animation sprite sheet for [UNIT NAME],
the EXACT character in the attached full-body reference image.

REFERENCE LOCK:
[Describe species, face, costume, colors, weapon, accessories,
and the exact neutral equipment position visible in the reference.]
Preserve the reference silhouette, body proportions, camera angle,
outline thickness, colors and restrained shading.
Do not redesign the character or add equipment.
Face RIGHT in all frames. Do not switch hands or mirror individual poses.

STRICT SHEET FORMAT:
Exactly 2048 × 1024 pixels, 4 columns × 2 rows.
Exactly 8 frames, one complete character in each 512 × 512 cell.
Read left to right across the top row, then the bottom row.
True transparent PNG background. Do not reproduce reference checkerboards.
No text, numbers, grid lines, borders or scenery.

REGISTRATION AND SCALE:
Same neutral character scale in every frame and every sheet.
Neutral character height including the hat: [320 or 350] pixels.
Fixed ground anchor at local pixel (256, 440) in every cell.
Position every pose relative to this anchor.
Do not independently recenter or resize each pose.
Keep the complete character and weapon within every cell with safe padding.
For planted actions, feet stay around this anchor.
Walking is animated IN PLACE; game code handles world movement.
Seated or fallen poses become shorter naturally, without enlarging the body.

ANATOMY AND EQUIPMENT:
Preserve body volume, face and clothing details across all frames.
Equipment is rigid: never bend, stretch, detach or duplicate it.
Keep gripping hands attached consistently to the same handle location.
Only add simplified visible paws when required by the action.

ANIMATION:
[Insert one eight-frame sequence.]

STYLE:
Match the attached reference: clean chunky 2D cartoon,
thick dark outlines, simple flat colors, restrained cel shading,
readable mobile-game silhouette.

AVOID:
Redesign, changing proportions, extra limbs, missing equipment,
weapon morphing, inconsistent scale, different viewing angles,
motion blur, trails, particles, glow, ground shadows,
cropped objects, duplicated characters or uneven frame spacing.
```

Reference lock đang dùng:

- **Snowguard / beast-a**: vịt trắng, mắt đen nhỏ, mỏ/chân vàng, mũ phớt đỏ có băng đen, vest đen, áo trắng, cà vạt đỏ; khiên chữ nhật đen có mảng xám ở bên trái ảnh. Chiều cao trung tính yêu cầu khoảng 350 px.
- **Ironclad / beast-e**: gấu nâu, tai tròn, mõm kem, mắt/mũi đen; mũ lưỡi trai đen, áo trắng, dây đeo đen với hai khóa vàng, quần/giày đen; búa đầu xám đậm, cán gỗ đặt chéo sau vai bên trái ảnh. Chiều cao trung tính yêu cầu khoảng 320 px.

## 4. Viết chuỗi pose cho từng animation

Mỗi dòng dưới là 8 frame theo thứ tự. Khi gửi prompt, viết thành danh sách frame 1–8 và nêu rõ vũ khí/chi đang chuyển động. Attack và Skill phải có silhouette khác nhau.

| Sheet | Chuỗi pose |
| --- | --- |
| Idle | Trung tính → hít vào → ngực nâng nhẹ → đỉnh hít → thở ra → hạ ngực → gần trung tính → trở về frame 1. Chân đứng yên, nhún tối đa 1–3 px. |
| Walk | Chân trái trước → dồn trọng lượng → chân đi qua giữa → chân phải tiến → chân phải trước → dồn trọng lượng → chân đi qua giữa → chân trái tiến để nối vòng. Không tịnh tiến cả nhân vật trong ô. |
| Attack | Trung tính → chuẩn bị → lấy đà → bắt đầu đòn → đỉnh đòn → follow-through → hồi phục → trung tính. Vẽ chuyển động vũ khí, không vẽ mục tiêu hoặc hiệu ứng va chạm. |
| Skill | Trung tính → chuẩn bị riêng → lấy lực → vào động tác → pose đặc trưng → thu lực → hồi phục → trung tính. Bám cơ chế hiện có, không tự tạo kỹ năng mới. |
| Hit | Trung tính → giật lùi → đỉnh phản ứng → giữ thăng bằng → hồi phục → đứng thẳng → gần trung tính → trung tính. Không bay khỏi mặt đất. |
| KO | Trung tính → khuỵu → mất thăng bằng/hạ vũ khí → hạ thân → ngồi/ngã → ổn định → thả lỏng → pose cuối để giữ. Không lặp và không biến mất. |

Ironclad Attack: chuẩn bị cầm cán → nâng búa trên vai → vung xuống bên phải → giữ búa thấp → kéo về vai. Ironclad Skill (Iron Ram): hạ trọng tâm → rướn vai → đẩy bằng chân sau → húc vai sang phải → lấy lại thăng bằng; búa vẫn giữ sau vai, không đập búa lần nữa.

Snowguard Attack: lấy đà → ôm khiên sát thân → húc khiên sang phải → chịu phản lực → hồi khiên. Snowguard Skill: hạ thế → nâng khiên → nép sau khiên → giữ bảo vệ → hạ khiên; không sinh thêm khiên phép trong bitmap.

## 5. Vòng tạo và kiểm tra

1. Tạo Idle và Attack của nhân vật đang được yêu cầu trước, kiểm tra reference/tỷ lệ/đường vũ khí trước khi mở rộng. Nếu owner đã gửi đủ sáu sheet, kiểm tra bộ có sẵn, không yêu cầu tạo lại vô cớ.
2. Kiểm tra cả 8 pose: giữ nhận diện, không đổi tay, không mất vũ khí, không cắt đầu/chân; vòng Idle/Walk nối được, KO có pose cuối hợp lý.
3. Đọc kích thước, mode màu và alpha thực tế. Prompt không phải bằng chứng rằng file thật là 2048×1024 hoặc trong suốt.
4. Nếu file thực tế khác kích thước nhưng lưới rõ: giữ bản gốc, khai báo cửa sổ texture theo kích thước thật. Ví dụ các sheet Snowguard/Ironclad hiện tại là **1774×887**, ô có kích thước nguyên 443/444 px, không phải 512 px.
5. Chia biên bằng `floor(col * width / 4)` và `floor(row * height / 2)`; không làm tròn độc lập khiến sót/đè pixel. Không ghi rằng các ô bằng nhau tuyệt đối khi kích thước nguồn không chia hết.
6. Alpha thật mới dùng được trực tiếp. Nếu nền đen/caro bị bake, thiếu frame, pose bị cắt hoặc thiết bị biến dạng: báo chính xác lỗi, cung cấp prompt sửa có reference. Không tự xóa màu đen vì viền/quần cũng màu đen.
7. Không ghi đè source đã duyệt. Lưu phiên bản mới riêng; không đổi bitmap chỉ để thuận tiện slicing. Crop/resize kỹ thuật qua texture frames/runtime không thay đổi file nguồn.

## 6. Căn frame và tích hợp

- Source path: `public/assets/characters/<asset-slug>/animation_vNN/`.
- Ghi metadata `x/y/width/height/groundY/bodyHeight` và mapping unit ID rõ ràng. PNG gốc giữ nguyên. Công cụ đọc alpha để tính metadata không được tự sửa bitmap.
- Chân là điểm neo, không dùng đáy của mọi pixel khi búa/kiếm xuống thấp hơn chân. Ironclad hiện dùng alpha trong dải giữa chứa giày; kiểm tra dải đó phù hợp từng pose trước khi áp dụng cho unit khác.
- Giữ tỷ lệ theo pose trung tính của mỗi sheet; không co giãn từng pose Attack/KO về cùng chiều cao vì sẽ làm mất động tác. Hiệu chỉnh Idle hiện có chỉ giảm sai lệch kích thước của ảnh sinh.
- Dùng rig riêng/prefix texture-animation riêng. Hệ thống hiện tại: SnowguardAnimationPlayer hỗ trợ FrameAnimationRig; IroncladAnimationPlayer cung cấp rig riêng. Không sao chép cả state machine cho mỗi unit mới.
- Mount Sprite vào root chuyển động cục bộ; root nằm trong container tọa độ sân. **Không đặt world position trực tiếp lên root có tween idle**: lỗi này từng khiến thú nhảy liên tục về y≈0.
- Khi sheet đủ và load được, dùng frame animation thay tween transform của chính unit đó. Unit chưa có sheet tiếp tục fallback cũ.
- Idle/Walk lặp. Attack/Skill/Hit phát một lần, kết thúc trở về locomotion mới nhất. Di chuyển không được cắt ngang one-shot. Skill hiện được bảo vệ khỏi Attack/Hit. KO ưu tiên, giữ frame cuối; revive trở về Idle.
- Setup và Battle dùng cùng kích thước/điểm neo. Camp hiện vẫn dùng cutout; không tự tuyên bố Camp đã có sheet animation.
- Nối Walk từ di chuyển, Attack từ sự kiện tấn công, Skill từ Signature thật, Hit từ nhận đòn, KO từ chuyển sang hết HP. Dọn listener/animation/timer khi destroy.
- Projectile, shield, damage number, impact và hiệu ứng hài hước vẽ riêng trong game; không bake vào sheet. Tích hợp hình ảnh không thay damage, cooldown, targeting hoặc thời điểm resolve đòn.

## 7. Kiểm tra và bàn giao

- Chạy `npm run check` và `npm run build` khi đổi runtime. Kiểm tra mapping/cửa sổ frame, chuyển loop-one-shot, ưu tiên Skill/KO, revive và disposal. Khi dùng chung player, chạy lại cả Snowguard lẫn Ironclad.
- Tạo/cập nhật trang preview ngoài mô phỏng để xem đủ sáu clip. Hiện có `/snowguard-animation-preview.html` và `/ironclad-animation-preview.html`.
- Khi browser khả dụng: xem loop seam, neo chân, hướng quay, clipping của vũ khí, đổi Idle↔Walk, KO giữ pose, drag/drop trong Setup và readability lúc combat trên mobile ngang.
- Nếu chưa xem trực tiếp: ghi **live QA chưa thực hiện**; fake-scene checks/build không phải bằng chứng visual pass.
- Ghi CURRENT_REPO_HANDOFF.md và ASSET_MANIFEST.md: source, resolution thật, số frame, mapping, normalization, trạng thái và hạn chế.
- Bàn giao ngắn: unit/clip nào đã tích hợp, URL preview, kết quả checks/build và phần live review còn mở. Không tự gán STYLE APPROVED/GAME READY từ việc owner gửi ảnh hay code chạy được.

## Lệnh giao việc mẫu cho agent

> Làm animation cho [UNIT NAME / ID] theo docs/FRAME-ANIMATION-AGENT-WORKFLOW.md. Dùng [ảnh toàn thân] làm reference bắt buộc. Viết prompt chung + chuỗi 8 pose cho Idle, Walk, Attack, Skill, Hit, KO, cùng chuẩn 2048×1024 và 4×2 ô. Chỉ tạo ảnh nếu người dùng đã yêu cầu agent tạo. Khi owner gửi sheet, ưu tiên thứ tự owner xác nhận, đo kích thước/alpha thực tế, giữ source, căn chân và tích hợp vào Setup/Battle qua rig chung. Không đổi gameplay. Tạo preview, chạy checks/build, cập nhật handoff/manifest và báo riêng live QA.

# Làng Thú — đặc tả asset và prompt MVP

Trạng thái: prompt sẵn dùng, chưa tạo ảnh / chưa duyệt asset. Dùng ảnh làng chủ dự án gửi để tham chiếu không khí, ảnh gốc từng Beast để khóa nhân vật. Đọc art routing và FRAME-ANIMATION-AGENT-WORKFLOW trước production. Không thay nhận diện Beast bằng thú trong ảnh làng.

## Điều chỉnh theo phản hồi chủ dự án: map trước, đạo cụ bám map

Các prompt vật thể riêng bên dưới chỉ mô tả nội dung; không đủ để đảm bảo hợp map. Quy trình chính thay bằng:

1. Chốt một ảnh map sạch làm Master Scene. Gửi chính ảnh map này trong mọi lần tạo đạo cụ, không chỉ ảnh làng tham khảo.
2. Đánh dấu vùng cần đặt đạo cụ và gửi ảnh composite có Beast gốc đứng thử để khóa kích thước tương đối. Vùng đứng phải là khoảng trống có thể tiếp cận.
3. Tạo đạo cụ trong đúng bối cảnh map, cùng góc camera, hướng sáng, palette và độ dày viền. Giữ nguyên mọi phần ngoài vùng chỉnh. Xem composite để duyệt tỷ lệ trước.
4. Tách đạo cụ đã duyệt sang lớp trong suốt ở cùng canvas/transform. Ghi rect cắt, điểm chân nhân vật, điểm tiếp cận, điểm tay tương tác và lớp trước/sau. Không tự sinh lại một vật thể centered với perspective mới rồi ghép vào.
5. Tạo animation nghề với ảnh nhân vật + đạo cụ đã duyệt + composite vị trí đứng. Unit tự tới workAnchor và chạy clip; chạm chỉ xem thông tin. Tay/búa/bình tưới/cần phải nối đúng interactionAnchor.

Kích thước nền cuối cùng và tỷ lệ pixels-per-world-unit được chốt từ ảnh thật. Tọa độ 1800×1200 hiện là prototype; không ép một map khác bố cục vào các tọa độ cũ. Map và đạo cụ cùng transform camera để không trượt vị trí khi resize. Mỗi unit có một điểm đứng riêng tại trạm; foreground chỉ che phần cơ thể hợp lý, không che mặt hoặc hành động chính.

Prompt chỉnh cảnh để kiểm tra ghép:

```text
Use the attached clean map as the strict master scene. Add [STATION] only inside the marked target area. Preserve the rest of the map exactly. Match the existing camera angle, perspective, daylight direction, color palette, outline thickness, ground plane and object scale. Use the attached original Beast image at the shown standing position only as a scale and interaction reference; do not redesign the Beast or bake a character into the final prop layer. Leave the marked approach path and work standing space clear. Align the functional surface to the shown hand interaction point. No UI, text, glow or extra buildings. First provide an in-context composition for checking scale and placement; the approved station will then be extracted as transparent layers with the same registration.
```

Prompt clip nghề bổ sung vào prompt tám frame:

```text
Use all three references: the original Beast, the approved station prop, and the approved in-map working composition. Animate the Beast performing [WORK ACTION] facing RIGHT only at that working position; LEFT is obtained by horizontal reflection in the game. Preserve the original side-facing character view even though the map is top-down. No front, rear, up-facing, down-facing or rotating poses. Keep feet registered and character scale consistent with the working composition. Hands and held tools must meet the marked station interaction point at the action frames. Render only the character and held tool on transparent background; the station, foreground occlusion, ground shadow and small effects are separate runtime layers. Do not replace work with generic idle bobbing or a combat attack.
```

Triển khai hiện tại chỉ có tương tác tự động prototype tại owner props cũ; chưa có map mới và sheet nghề đã duyệt. Ăn cà rốt/tắm là hoạt động sinh hoạt, không phải animation nông dân/câu cá hoàn thiện.

## Camera và facing đã chốt theo chủ dự án

Tham chiếu mới: codex-clipboard-1cda1739-eb6e-4ff8-be9b-86c30622c12e.png. Map top-down orthographic, không chân trời/isometric. Ảnh chỉ định bố cục/camera, không tự chuyển game sang pixel art: giữ Beast cartoon hiện có. Unit là sprite hướng ngang, chỉ right/left; đi trên cả hai trục nhưng đi dọc giữ hướng ngang gần nhất. Làm việc ở cạnh trái/phải đạo cụ; không đặt điểm thao tác đòi unit quay lưng/lên/xuống. Sheet chỉ tạo hướng RIGHT, LEFT flip tại runtime; chữ và nhãn không flip. Nếu đạo cụ/động tác bất đối xứng có ảnh hưởng điểm tay, lưu workFacing và anchor theo hướng thay vì flip cả công trình.

## Tọa độ và lớp

World code: 1800×1200; origin góc trên trái. Asset nền yêu cầu 1800×1200 để bám layout; nếu công cụ trả kích thước khác phải ghi kích thước thật, scale một lần và kiểm tra điểm đứng, không mặc định đạt.

| Trạm | Vùng công trình x,y,w,h | Điểm chân làm việc | Điểm tiếp cận |
|---|---|---|---|
| Xưởng | 1250,650,360,240 | 1400,780 | 1240,780 |
| Vườn | 220,650,340,260 | 460,780 | 570,780 |
| Bến cá | 1250,340,350,220 | 1390,510 | 1220,560 |

Nhà chung x500,y160,w570,h330; nước x1320,y160,w440,h290. Sân chung quanh 900,780. Trạm/cư dân/đạo cụ không bake vào nền. Các vị trí là contract prototype; art chưa khớp thì điều chỉnh layout có kiểm tra, không kéo giãn từng phần ảnh tùy ý.

## Prompt nền

```text
Use the supplied cozy village image as atmosphere and composition reference only. Create a clean 2D cartoon animal village background, requested canvas 1800x1200 pixels, top-down orthographic 2D view with no horizon or isometric tilt, warm wooden buildings, soft green foliage, sandy paths, calm turquoise water, bold dark contours and broad simple color shapes. Keep the scene compatible with the supplied Beast game's simple cartoon cutouts.
Place one communal wooden house in the upper middle-left, a small water area in the upper right, and a broad open central square in the lower middle. Connect the square to the left garden area, right workshop area and upper-right fishing area with clear walkable paths. Leave the three activity areas empty for separately rendered interactive props. Keep foreground decoration sparse and only around outer edges. The central paths and standing spaces must remain readable at phone scale.
No characters, no furniture at activity sites, no text, no signs with lettering, no UI, no currency icons, no glow, no baked character shadows. Do not reproduce the reference's exact characters or HUD. Opaque background.
```

## Prompt công trình — tạo từng ảnh riêng

Yêu cầu mỗi ảnh 1024×1024 RGBA nền trong suốt, không sheet nhiều công trình. Cùng góc nhìn và nét với nền, vật thể có padding, không chữ/nhân vật/bóng nền. Điểm neo được đo sau khi nhận ảnh; vùng foreground dưới đây là lớp kỹ thuật cần tách khi tích hợp, không tự nhận rằng một ảnh phẳng đã có lớp che khuất.

**Xưởng:**
```text
Create one cozy animal village toy woodworking and forging workbench, transparent 1024x1024 canvas. Simple warm wood table, compact iron anvil, a small wooden duck toy, a neat tool holder. Bold dark cartoon outlines, broad flat colors, restrained shading, top-down orthographic view matching the approved map. Leave clear access space behind the tabletop for a bear worker; keep the table front readable so it can become an occlusion layer. Keep the working access on the left or right of the anvil for a side-facing worker. No bear, no loose held hammer, no background, no text, no effects, no glow. Entire object visible with padding.
```

**Vườn:**
```text
Create one small interactive carrot garden patch, transparent 1024x1024 canvas, top-down orthographic view. Two short rows of soft brown soil, a few clearly spaced carrot leaves, a low wooden edging. Simple cozy cartoon style matching the supplied village, bold dark contours and large readable shapes. Leave an accessible bare-soil standing gap on the right side for a rabbit gardener. This is a living vegetable plot, not a giant carrot on a picnic table. No rabbit, no watering can, no background, no lettering, no sparkles. Entire garden visible with padding.
```

**Bến cá:**
```text
Create one small wooden fishing dock for a cozy animal village, transparent 1024x1024 canvas, top-down orthographic view. A simple short timber platform, two posts, a small empty bucket on the side, open space on the left for one right-facing raccoon to fish toward water on the right. Match the supplied game's bold dark contours, warm wood colors and simple shape language. No raccoon, no fishing rod, no water background, no fish, no text, no effects. Keep the front dock edge clear for later foreground occlusion. Entire dock visible with padding.
```

## Prompt đạo cụ — mỗi vật một ảnh

Tạo riêng bình tưới, cà rốt có một vết cắn, cần câu, phao, cá nhỏ, giày cũ, vịt gỗ. Canvas yêu cầu 512×512 transparent. Không ghép tất cả thành atlas khi chưa chốt khoảng cách cắt.

```text
Create exactly one [OBJECT] as a game-ready-style candidate for the supplied cozy Beast village. Transparent 512x512 canvas, whole object centered with generous padding, bold dark outline, broad simple cartoon color shapes, minimal shading, same top-down orthographic view as the village props. Easily recognizable at 32-64 pixels. No character, no background, no text, no sparkles, no motion trail, no extra objects. Preserve a clear handle or grip point where applicable.
```

Thay OBJECT bằng từng vật. Cần câu: đường cong và dây mảnh nên vẽ bằng code khi hoạt động để giữ kết nối tay/phao; ảnh chỉ là thân cần. Nước tưới, mẩu gỗ và chuyển động phao là effect code đơn giản.

## Prompt clip nghề — kèm ảnh gốc đúng Beast

Mỗi clip: yêu cầu 2048×1024, 4 cột × 2 hàng, 8 frame 512×512, alpha trong suốt, đọc trái→phải/trên→dưới. Điểm chân (256,440), chiều cao thống nhất trong cả tám frame. Không text/grid/frame numbers/effect bake. Kích thước thật phải đo và lưu metadata như workflow hiện có.

Prompt chung: “Use the supplied character image as the strict identity reference. Preserve species, face, outfit, colors, silhouette and original proportions. Character faces RIGHT in every frame, with LEFT generated by runtime horizontal flip only. No front/back/up/down character poses. Eight sequential animation frames with consistent character scale and fixed foot registration; no frame-by-frame recentering. Keep held props physically attached to the same hands. Transparent background, no camera motion, no scenery, no added costume.” Ghép với yêu cầu sheet ở trên và một chuỗi dưới đây.

- **Ironclad — làm việc:** đứng → nắm búa → nâng búa → chuẩn bị gõ → gõ thấp về trước → giữ impact → nhấc búa → đứng. Workbench ở runtime, không vẽ vào sheet. Dùng chiều cao nhân vật 320px như brief Ironclad hiện có.
- **Windstrider — làm việc:** đứng → lấy bình tưới → nghiêng nhẹ → tưới → giữ → dựng bình → hạ bình → đứng. Khóa chiều cao từ ảnh chuẩn trước khi tạo; không dùng chiều cao Ironclad cho thỏ.
- **Shadowclaw — làm việc:** đứng → đưa cần ra → thả dây → chờ → nhận thấy phao động → kéo cần → nâng nhẹ → đứng. Dây/phao/cá/giày render riêng. Khóa chiều cao từ ảnh chuẩn trước khi tạo.

Clip hài riêng theo cùng contract: gấu giật mình vì vịt gỗ; thỏ cắn cà rốt rồi nhìn quanh; gấu mèo kéo lên giày rồi giấu sau lưng. Có thể bắt đầu bằng pose và đạo cụ code để review timing, nhưng không ghi authored animation hoàn thiện khi chưa có sheet.

## QA nhận asset

Đo kích thước/alpha thực tế; kiểm tra không cắt mũ/tai/búa, tay nối đúng đạo cụ, scale và chân ổn định. Thử nền/props với nhân vật ở mobile trước khi duyệt. Giữ nguyên source owner, ghi crop/anchor/layer metadata; không xóa toàn bộ pixel đen vì đó có thể là outline. Phân biệt owner-supplied/generated, integrated, reviewed và GAME READY.

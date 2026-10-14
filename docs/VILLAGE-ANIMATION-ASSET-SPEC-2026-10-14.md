Cập nhật mới nhất 2026-10-14: Swiftwing vận chuyển vườn; Starcaller bỏ phụ vận chuyển, chèo xuồng bán hàng thành phẩm khi Kho đầy; Snowguard có sheet đi tuần và tuyến thử. Chi tiết trạng thái/code/checklist: [carrier/boat/patrol](VILLAGE-CARRIER-BOAT-PATROL-2026-10-14.md). Các đoạn “chưa triển khai” bên dưới là lịch sử nếu trùng phạm vi này; trạm canh/báo động vẫn chưa làm.

# Làng Thú — Đặc tả asset và prompt animation cư dân, công cụ, trạm

Ngày: 2026-10-14. Trạng thái: **ĐẶC TẢ CHUẨN BỊ ASSET / CHƯA TẠO ẢNH / CHƯA TÍCH HỢP / LIVE QA CHƯA THỰC HIỆN**.

## 1. Phạm vi và nguồn sự thật

Chủ dự án đã đồng ý sáu cư dân Day 1, nghề đề xuất bên dưới, tay nghề làng riêng lâu dài và mở đầu Run → vào làng. Giải cứu theo checkpoint khám phá mở quyền chọn Beast vào Run và kết nạp vào làng; map 3/10/15 là ví dụ, chưa là lịch giải cứu cố định.

Tài liệu này đặc tả hình ảnh cho hoạt động làng, bao gồm nhân vật, đạo cụ, trạm và trạng thái của chúng. Không thay luật Battle Run. Tay nghề không đổi HP/damage/STAR/Signature; không tạo bộ STAR bằng trang phục nghề. Các bậc tay nghề và giảm thời gian 5%/10% là hướng đã được owner đồng ý; ngưỡng tăng bậc chưa chốt, không cần asset riêng cho từng bậc.

Nguồn: `VILLAGE-STORY-DIRECTION-2026-10-09.md`, `FRAME-ANIMATION-AGENT-WORKFLOW.md`, `../ART_AGENT_INSTRUCTIONS.md`, bộ `../art/style/`, `../src/game/run/VillageCatalog.ts`, asset owner hiện có. Repo là nguồn dùng trong công việc này, không gọi Notion.

Hiện runtime có vườn/câu cá/xưởng và animation prototype/fallback. Hướng mới là vận chuyển đi bộ cho Swiftwing/Starcaller, điểm nhận chung và trạm canh/tuần tra; chưa có runtime cho chuỗi đó. Không dùng mô tả prompt làm báo cáo tính năng đã chạy.

Chỉ chuẩn bị prompt cho sáu cư dân; không coi tài liệu là phê duyệt STYLE APPROVED hoặc lệnh mass-generate. Không ghi đè source owner, không tự đổi thiết kế để khớp mô tả loài cũ.

## 2. Danh sách nhân vật và reference bắt buộc

| ID | Nhân vật / loài theo art hiện có | Slug | Công việc |
| --- | --- | --- | --- |
| beast-a | Snowguard / vịt trắng | duck-guardian | Tuần tra, kiểm tra cổng và kho |
| beast-b | Shadowclaw / gấu mèo | raccoon-swordsman | Câu cá |
| beast-c | Windstrider / thỏ | rabbit-archer | Trồng và thu hoạch cà rốt |
| beast-d | Starcaller / lửng mật tím | badger-mage | Phụ vận chuyển đi bộ, cất trượng khi ôm kiện |
| beast-e | Ironclad / gấu nâu | bear-hammer | Chế tác đồ chơi, sửa đồ |
| beast-f | Swiftwing / cáo | fox-archer | Vận chuyển đi bộ chính đến điểm nhận chung |

Đính kèm ảnh toàn thân owner đang dùng cho đúng slug, không dùng icon tròn hoặc ảnh chụp UI làm reference sản xuất. Chọn `base_owner_v01.png` nếu có và đang được dùng; nếu không, kiểm tra `base_v01.png` cùng trang Review/Character Studio. Lưu đường dẫn reference thực tế vào metadata khi bàn giao. Cập nhật prompt chi tiết: đã xem sáu ảnh toàn thân đang được manifest dùng và garden/forge/dock; đường dẫn, identity và trang phục có trong tài liệu prompt chi tiết. Owner vẫn cần đính kèm file thật khi tạo ảnh.

Giữ mặt, loài, tỷ lệ, màu, mũ, áo và phụ kiện nhận diện. Dụng cụ nghề chỉ thay vật cầm tay trong clip nghề được chỉ định; vũ khí chiến đấu được cất ngoài hình, không vừa câu cá vừa cầm kiếm/cung. Đây là biến thể nghề trong làng, không sửa bộ Battle. Ironclad dùng chính búa reference, không thêm búa thứ hai.

## 3. Chuẩn đầu ra và ghép lớp

### 3.1. Nhân vật

- Mỗi clip: một PNG alpha thật, yêu cầu 2048×1024, 4 cột × 2 hàng, đúng 8 frame; ô yêu cầu 512×512. Thứ tự trái sang phải hàng trên rồi hàng dưới.
- Camera 3/4 theo reference, mặt sang phải; walk tại chỗ. Cùng tỷ lệ trong toàn bộ clip của một cư dân; chiều cao trung tính chọn và khóa theo reference, khoảng 320–350 px. Neo đất local (256,440).
- Không tự căn giữa từng pose. Pose cúi/ngồi thấp tự nhiên. Toàn bộ dụng cụ có khoảng trống, không cắt đầu cần câu/búa/tai/đuôi.
- Idle/walk/work loop. Enter/finish/reaction one-shot. Mặc định loop 8 fps, one-shot 8–10 fps, là timing hình ảnh đề xuất; không quyết định thời gian sản xuất.
- Hướng trái chỉ flip cả bộ nhân vật + đạo cụ + socket tương ứng; chữ trên thư/biển không bake. Không mirror riêng từng frame. Chưa yêu cầu 4/8 hướng.

### 3.2. Trạm và công cụ

Tách năm lớp: (1) trạm tĩnh, (2) nhân vật, (3) phần công cụ chuyển động, (4) sản phẩm/đạo cụ đặt xuống, (5) FX và UI trạng thái. Mỗi vật chỉ có một chủ sở hữu hiển thị tại một thời điểm.

- Bình tưới/cần câu/búa cầm tay có thể bake vào clip nghề để giữ grip ổn định; khi đó không vẽ thêm bản công cụ rời trên tay. Vẫn cần ảnh đạo cụ rời cho tư thế đặt nghỉ trên trạm.
- Cần câu và dây có thể đi cùng nhân vật; phao/ripple ở mặt nước là lớp rời theo world socket. Không vẽ sông vào sheet nhân vật.
- Búa thuộc Ironclad; bàn xưởng không chứa thêm búa đang chuyển động. Điểm tiếp xúc búa–phôi phải có mốc đo chung.
- Trạm PNG tĩnh yêu cầu canvas 1024×1024, neo nền (512,880), padding tối thiểu 64 px. Công cụ cầm tay/inventory prop PNG yêu cầu 512×512, pivot phải khai báo theo từng prop, không mặc định dùng neo chân.
- Bộ phận động/FX dùng sheet 2048×1024, 4×2, 8 frame để thống nhất slicing. Chọn tỷ lệ một lần theo trạm reference, không scale lại theo từng trạng thái. Các file layer cùng trạm phải có chung canvas/pivot.
- Giữ map/garden/forge/dock owner hiện có làm reference; không vẽ lại cả map. Bến đã có trên nền thì chỉ làm overlay, không chồng thêm bến thứ hai.
- Nếu output thật khác yêu cầu: giữ source, đo width/height/alpha/frame windows. Chia biên bằng floor(col×width/4), floor(row×height/2); prompt không chứng minh file đúng kích thước.

## 4. Prompt chung và cách sử dụng

Mỗi lần tạo: đính kèm đúng reference, dán nguyên hai block **Immutable Style Lock** và **Immutable Negative Style Lock** trong `../art/style/STYLE_LOCK_PROMPT.md`, sau đó dán block dưới, identity ở mục 2 và đúng một ACTION ở mục 5 hoặc 7. Không sửa/paraphrase style lock theo từng cư dân. Reference owner giữ ưu tiên nhận diện; nếu khác style text cũ, bảo toàn thiết kế owner theo workflow animation, ghi rõ chênh lệch để review.

### 4.1. Prompt nhân vật dùng chung

```text
ASSET: One village profession animation sprite sheet, not a combat animation.
REFERENCE: Use the attached full-body owner character as the exact identity.
Preserve species, face, costume, palette, proportions, camera, outline and shading.
Use the character identity and profession prop specified below. Replace only the
handheld combat weapon with the named work tool for this village variant.
No new costume, armor, jewelry, badge, extra tool or character redesign.
Preserve the role silhouette: grounded tank, agile ranger/assassin, curved mage.
Retain existing identity motifs and palette; no new combat signature effects.

OUTPUT: True transparent PNG, exactly 2048 x 1024 pixels, 4 columns x 2 rows,
exactly 8 frames in reading order, one complete character per 512 x 512 cell.
No text, numbers, grid, scenery, ground shadow, UI or reference checkerboard.
Face RIGHT throughout, consistent 3/4 camera. Animate walking IN PLACE.
Use the agreed neutral height [HEIGHT_PX] and fixed ground anchor (256,440).
Keep the same body scale, planted foot registration and safe tool padding.
Do not independently resize or recenter poses; do not switch gripping hands.
Tools stay rigid and attached to the same grip. No morphing or duplicated tools.
Render only the listed handheld props. Station, products placed on the station,
water, flowers rooted in the ground, particles and UI are separate layers.

CHARACTER: [name, reference identity, retained motifs and role shape]
PROP: [one specified profession tool, fixed grip and rest position]
ACTION: [paste ONE numbered eight-frame sequence]
PLAYBACK: [loop / one-shot], [fps].
For a loop, frame 8 flows into frame 1 without a duplicate pause.
For a one-shot, frame 8 settles into the specified idle or work pose.
AVOID: extra limbs, changing costume, weapon reappearing, object duplication,
clipped ears/tail/tool, motion blur, glow, random particles, camera motion.
```

### 4.2. Clip chung cho cả sáu cư dân

Mỗi dòng dưới là ACTION frame 1→8; tạo một file riêng, không ghép nhiều động tác vào một sheet.

| Clip | 8 pose | Phát |
| --- | --- | --- |
| village-idle | 1 đứng thư giãn; 2 hít nhẹ; 3 nâng ngực; 4 đỉnh hít; 5 thở; 6 hạ ngực; 7 gần trung tính; 8 nối về 1 | Loop 8 fps, chân đứng yên |
| village-walk | 1 chân trái trước; 2 dồn trọng lượng; 3 chân qua giữa; 4 chân phải tiến; 5 chân phải trước; 6 dồn trọng lượng; 7 chân qua giữa; 8 chân trái tiến | Loop 8 fps, tại chỗ |
| village-greet | 1 idle; 2 nhìn người chơi; 3 nâng tay trống; 4 vẫy; 5 vẫy ngược; 6 hạ tay; 7 mỉm cười; 8 idle | One-shot 8 fps |

Idle/walk dùng thiết bị đi đường cố định cho mỗi cư dân. Chuyển vào clip nghề bằng enter, không để công cụ bật hiện giữa vòng walk. Bản giao hàng riêng của Swiftwing ở dưới luôn có kiện hàng.

## 5. Prompt chi tiết nghề cho sáu cư dân

Nguồn pose/prompt chi tiết hiện hành: [VILLAGE-PROFESSION-ANIMATION-PROMPTS-2026-10-14.md](VILLAGE-PROFESSION-ANIMATION-PROMPTS-2026-10-14.md). Các ACTION rút gọn cũ được thay bằng tài liệu này để không giữ hai bộ pose khác nhau. Mỗi clip có một file `.txt` đầy đủ, bao gồm nguyên Style Lock/Negative Lock, identity đã kiểm ảnh và tám frame cụ thể.

Owner chốt hướng mới nhất: **Swiftwing vận chuyển đi bộ chính, Starcaller chèo xuồng bán hàng thành phẩm khi Kho đầy; sản phẩm đặt tại trạm rồi đưa đến giỏ/kệ cạnh nhà chung**. Bỏ phép dịch chuyển và chăm hoa trong bộ hiện hành. **Snowguard tuần tra/trạm canh gần cổng; cư dân trong đội hình vẫn làm nghề, báo động giữ tiến độ và cargo.** Runtime các hướng mới chưa triển khai. Xem [cập nhật transport/guard](VILLAGE-TRANSPORT-GUARD-UPDATE-2026-10-14.md).

| Cư dân | Bộ tối thiểu | Điểm cần khóa |
| --- | --- | --- |
| Snowguard | idle, walk, inspect | Vịt trắng, mũ đỏ, suit/tie, khiên chữ nhật reference |
| Shadowclaw | idle, walk, fishing-enter/work/finish | Gấu mèo, scarf đỏ, một cần; catch/xô rời, hàng để tại bến |
| Windstrider | idle, walk, garden-enter/work/finish | Thỏ hood xanh, bình pickup frame 4/release frame 4; giỏ output rời |
| Starcaller | idle, walk, delivery-pickup, loaded-walk, delivery-finish | Giữ mũ/áo tím; trượng ngoài hình; một kiện, không teleport |
| Ironclad | idle, walk, forge-enter/work/finish | Gấu nâu, mũ đen, hai buckle; một búa; đồ chơi để tại bàn |
| Swiftwing | idle, walk, delivery-pickup, loaded-walk, delivery-finish | Nhặt frame 4/đặt frame 5 ở điểm nhận cạnh nhà chung |

Bộ tối thiểu thực tế 28 clip trước reuse, thêm delivery-greet tùy chọn = 29 prompt. Tọa độ/timing trong prompt là target thiết kế; phải đo lại file thật. Bản `.txt` được xuất từ script, không sửa riêng để tránh lệch với tài liệu.
## 6. Asset công cụ và trạm cần chuẩn bị

| Bộ | Có sẵn / phải giữ | Asset mới dự kiến | Bộ phận động |
| --- | --- | --- | --- |
| Tuần tra | Map/cổng/kho nếu đã có | Điểm kiểm tra nhỏ, chuông treo tùy chọn | Lưỡi chuông + dây, không cần xây cổng mới |
| Câu cá | Bến owner/bến đã bake map | Cần đặt nghỉ, xô rỗng, xô có cá, phao | Phao nhấp nhô, ripple, dây; cần cầm trong clip |
| Vườn | Garden owner | Bình đặt, luống rỗng/cây non/cây trưởng thành, giỏ rỗng/đầy | Nước tưới rời, lá rung nhẹ |
| Phụ vận chuyển | Giữ nhận diện Starcaller | Kiện chung với Swiftwing, giỏ/kệ điểm nhận | Pickup/loaded-walk/place; không vòng phép/fade |
| Xưởng | Forge owner | Phôi gỗ, đồ chơi hoàn tất, vị trí búa nghỉ nếu cần | Phôi phản ứng nhẹ, bụi gỗ rời |
| Vận chuyển chính | Đường làng hiện có | Kiện/giỏ-kệ chung cạnh nhà chung | Một owner hand/world; nhập Kho theo giao dịch |

Phân biệt trạng thái hình ảnh cây/hoa với cơ chế tăng trưởng: chưa thêm thời gian mọc cây, thu hoạch chạm tay hoặc tài nguyên hoa. Xô/giỏ/đồ chơi là hiển thị, không nguồn cộng hàng thứ hai.

### 6.1. Ma trận trạng thái bắt buộc

Tên trạng thái là contract hình ảnh đề xuất, adapter runtime sẽ map từ trạng thái thật. Không tự suy ra mọi nghề đều có recipe hoặc tiêu tiền.

| Trạng thái | Trạm/công cụ thể hiện | Nhân vật | Cách làm asset |
| --- | --- | --- | --- |
| available | Trạm trống, tool đặt đúng socket | Idle hoặc đi tới | PNG nền + prop nghỉ |
| reserved / approaching | Giữ hình trạm, không chạy công cụ trước khi tới | Walk → enter | Không cần sheet trạm mới |
| working | Bộ phận động ở vùng tiếp xúc | Work loop | Sheet layer động, không animate cả map |
| paused / hidden tab | Giữ frame hiện tại và vị trí | Giữ frame | Runtime pause; không tạo sheet pause |
| no-worker | Trạm yên, tool đặt | Không giả có người làm | PNG available + UI lý do |
| missing-input / missing-funds | Công cụ nghỉ, không nước/bụi/động tác làm | Idle | UI icon/lý do; chỉ nghề có điều kiện thật |
| ready / blocked-storage | Sản phẩm chờ tại điểm giao, dừng loop | Dừng làm, giữ/đặt tool theo clip | Prop output chờ + UI đầy kho, không nhấp nháy liên tục |
| completed | Một nhịp phản hồi sau commit lưu thành công | Finish | One-shot, output chuyển kho đúng một lần |
| cancelled / leaving | Ngừng hiệu ứng, trả prop về trạng thái hợp lệ | Thoát nghề → walk | Không cần sheet công cụ hỏng |
| hungry | Trạm theo trạng thái thật | Có thể giảm cadence work theo tốc độ thật | Badge UI; không làm biến dạng hoặc tạo sheet đói riêng |

Không thêm độ bền, cháy máy, sửa hỏng, nhiên liệu hoặc mất công cụ. Các trạng thái đó chưa được chốt. Thiếu nguyên liệu là trạng thái vận hành, không vẽ trạm nứt/vỡ.

### 6.2. Trạng thái đặc thù và asset tối thiểu

| Trạm | Idle | Working | Chờ giao / hoàn tất |
| --- | --- | --- | --- |
| Checkpoint tuần tra | Chuông nghỉ | Inspect; chuông chỉ rung khi có sự kiện được phát thật | Không hàng hóa; nod là hoàn tất lượt |
| Bến cá | Xô rỗng, phao yên | Phao/ripple loop; kéo cần là one-shot | Xô cá overlay khi batch ready; không cho mỗi loop thêm cá |
| Vườn | Luống + bình nghỉ | Nước theo cửa sổ tưới | Giỏ cà rốt khi batch ready, không xóa cây mỗi loop |
| Điểm nhận | Giỏ/kệ trống cạnh nhà chung | Người vận chuyển đi bộ mang hàng tới | Hàng world sau place, nhập Kho chỉ sau commit |
| Xưởng | Bàn trống hoặc phôi đã trả phí | Phôi + bụi ở điểm búa chạm | Một đồ chơi ở socket; giữ nếu kho đầy |
| Trạm canh | Chuông nghỉ, chỗ đứng Snowguard | Tuần tra/inspect, không phải lính đứng yên cả ngày | Báo động thuộc slice sau; giữ job/cargo khi ngắt |

## 7. Prompt asset và animation công cụ

Dán hai style lock nguyên văn trước các prompt dưới. Đính kèm reference trạm thật, reference prop đã duyệt và frame nhân vật có điểm tương tác khi tạo phần động. Tạo base trước, duyệt khớp map rồi mới tạo animation; không dùng các lần sinh độc lập làm trạng thái nếu hình trạm bị đổi.

### 7.1. Prompt prop hoặc trạm tĩnh

```text
ASSET: [one isolated village station overlay / one resting handheld tool].
Match the attached owner village prop reference: same 3/4 camera, outline,
palette, simple flat materials and restrained cel shading. Preserve existing
station construction; add only the named functional prop or overlay.
OBJECT: [object from section 6]. STATE: [available / ready-output].
True transparent PNG. [1024x1024 station / 512x512 tool].
Fixed pivot [measured pivot], consistent scale with the supplied reference.
No character, scenery, ground tile, text, labels, UI, glowing status indicator,
checkerboard or baked shadow. No new fantasy machinery or extra equipment.
If making a state overlay, render ONLY the changed object; omit the base station.
Keep all edges inside the canvas with safe padding.
```

### 7.2. Prompt layer động dùng chung

```text
ASSET: One isolated animated moving-part overlay for [STATION].
Match the attached station and approved prop reference exactly.
Render ONLY [MOVING PART], never redraw the stationary base or the worker.
Transparent PNG, exactly 2048x1024, 4 columns x 2 rows, exactly 8 frames.
Every cell is 512x512; fixed local pivot [PIVOT] and scale across all frames.
No text, grid, scenery, shadows, extra objects or camera movement.
ACTION: [one eight-frame sequence below]. PLAYBACK: [loop / one-shot].
Keep rigid parts rigid. Do not resize the object or shift its attachment point.
```

| Layer / file | ACTION frame 1→8 để dán vào prompt | Phát / gắn |
| --- | --- | --- |
| bell-ring | 1 rest; 2 tilt right slightly; 3 maximum right tilt; 4 return center; 5 tilt left; 6 maximum left tilt; 7 damp toward center; 8 rest. Rotate around the fixed hanging pivot, rope attachment stays fixed. | One-shot 10 fps, chỉ khi event thật |
| fishing-bobber | 1 baseline; 2 rise 1 px; 3 rise 2 px; 4 baseline; 5 dip 1 px; 6 dip 2 px; 7 baseline; 8 approach frame 1. No fish or fishing rod. | Loop 8 fps, tại socket mặt nước |
| water-ripple | 1 tiny open ellipse; 2 expand; 3 expand; 4 widen and soften; 5 widen more; 6 fade; 7 nearly transparent; 8 transparent. Only thin calm water rings. | One-shot lặp cách quãng; không vẽ mảng nước |
| watering-stream | 1 sparse short drops; 2 longer stream; 3 flowing drops; 4 flowing drops shifted downward; 5 same steady flow; 6 fewer drops; 7 last falling drops; 8 transparent. Origin fixed at spout socket. | One-shot theo tilt window; không tự loop khi bình thẳng |
| garden-leaves | 1 rest; 2 bend slightly right; 3 peak right; 4 center; 5 bend slightly left; 6 peak left; 7 recover; 8 approach rest. Preserve plant roots and carrot count. | Loop nhẹ chỉ khi cần |
| flowers-sway | 1 rest; 2 lean right; 3 hold slight right; 4 center; 5 lean left; 6 hold slight left; 7 recover; 8 approach rest. Same flowers and stems in every cell. | Loop 8 fps, biên độ nhỏ |
| forge-wood-dust | 1 transparent; 2 tiny chips emerge at contact socket; 3 chips spread a short distance; 4 chips fall; 5 fewer chips; 6 fade; 7 nearly transparent; 8 transparent. No hammer, sparks or flame. | One-shot tại frame búa chạm, chỉ là FX |
| mailbox-open | 1 closed door; 2 unlatch; 3 quarter open; 4 half open; 5 fully open; 6 hold; 7 hold; 8 fully open stable. Hinge pivot fixed. No mailbox body or text. | One-shot, đóng bằng reverse nếu hình phù hợp |

Trạm có nhiều moving part: tạo từng layer riêng, tránh một sheet chứa cả bình, nước và nhân vật. Chỉ ghép chúng trong preview/runtime.

## 8. Đồng bộ hình ảnh và trạng thái thật

- Loop work không hoàn thành job. Số vòng animation không quyết định sản lượng, tiền hoặc tay nghề.
- Enter chỉ bắt đầu khi worker đã tới trạm được reservation; không phát production FX khi còn đi đường.
- Timeline clip phát cue hình ảnh: pickup, contact, place, release. Tọa độ socket đo trên ảnh sau khi tạo; không đoán từ canvas hoặc đáy pixel.
- Bắt đầu trả phí/tiêu nguyên liệu, batch ready và giao kho dùng state/candidate-save hiện có. Animation không tự gọi trao thưởng vì tới frame cuối.
- Khi kho đầy: output giữ ở socket, trạm ngừng nhận lượt mới; không phát finish/thu hàng lặp. Save fail không diễn cảnh đã nhận thành công; UI giữ trạng thái chờ/thử lại.
- Với cảnh giao hàng chỉ để sinh hoạt, không trừ/cộng lại inventory của batch đã giao. Với vận chuyển vật lý tương lai cần transaction riêng trước khi dùng hoạt cảnh làm logic.
- Khi thoát/ẩn tab/destroy: pause hoặc dispose theo simulation; không tiếp tục chạy FX một mình. Reload đọc job thật, không diễn lại pickup để trừ vật tư lần nữa.
- Định nghĩa fallback: thiếu clip dùng cutout/prototype hiện có; thiếu FX bỏ FX; không chặn nghề vì asset chưa đủ. Đây là mục tiêu tích hợp, chưa có tuyên bố runtime hỗ trợ các clip mới.

## 9. Danh sách bàn giao và thứ tự sản xuất

### Đợt 1 — test một nghề hoàn chỉnh

Windstrider: idle, walk, garden-enter, garden-work, garden-finish; bình đặt, giỏ output, nước tưới. Ghép với garden owner để test scale, grip, foot anchor và trạng thái thiếu đầu vào/kho đầy trước mở rộng. Sau khi review bộ này mới áp dụng cùng contract cho nghề khác; đây không phải thay thế Master Reference/style gate.

### Đợt 2 — ba nghề sản xuất

Shadowclaw: idle, walk, fishing-enter/work/finish; cần nghỉ, xô empty/full, phao/ripple. Ironclad: idle, walk, forge-enter/work/finish; phôi, đồ chơi, bụi gỗ. Tái sử dụng idle/walk owner nếu phù hợp thay vì bắt tạo lại.

### Đợt 3 — sinh hoạt của ba cư dân còn lại

Snowguard: idle, walk, inspect; Starcaller và Swiftwing: idle, walk không hàng, delivery-pickup, loaded-walk, delivery-finish. Hai prop candidate riêng: trạm canh gần cổng, giỏ/kệ nhận hàng cạnh nhà chung; không vẽ trạm vào sheet nhân vật. Bộ tối thiểu 28 clip trước reuse, thêm delivery-greet Swiftwing tùy chọn = 29 prompt. Trạm/chuông và điểm nhận cần owner review vị trí/art.

### Đường dẫn dự kiến và metadata

```text
public/assets/characters/<slug>/village_animation_v01/<clip-id>.png
public/assets/ui/camp/village-professions-v01/<station>/<asset-id>.png
```

Chỉ tạo thư mục khi có asset thật. Metadata đi kèm: assetId, beastId/stationId, reference paths, version, actual width/height, alpha mode, frame count, frame windows, ground pivot hoặc attachment pivot, neutral body height, loop/fps, enter/exit pose, cue frame/socket, prop ownership, layer order và review status. Source gốc giữ riêng; atlas/editor export không ghi đè source. Không đưa source village vào atlas Battle nếu chưa có tích hợp được yêu cầu.

## 10. QA trước nhận asset

- Đúng loài/reference của cả sáu; không gọi Shadowclaw là mèo hoặc Starcaller là mèo pháp sư.
- Đủ 8 frame, alpha thật, đo kích thước thực; không nền caro bake, không crop dụng cụ, không tool mọc thêm/mất giữa clip.
- Frame 1/8 nối mượt khi loop; chân không trượt ở clip đứng; walk tại chỗ; tỷ lệ không phập phồng.
- Ghép nhân vật với trạm: grip, đầu vòi, phao, điểm búa và đặt hàng trùng socket; không double tool/base/dock.
- Ready/full kho giữ một output; pause đứng yên cả worker và tool; hidden/reload không nhận sản phẩm lặp.
- Kiểm tra từng frame và playback ở kích thước làng thực, mobile dọc/ngang; FX không che cư dân hoặc UI.
- Review hình tách khỏi review code. Chưa có ảnh: DRAFT SPEC. Có ảnh chỉ là GENERATED; đạt checklist mới REVIEW; owner duyệt mới STYLE APPROVED; chuẩn kỹ thuật + tích hợp/QA mới xét GAME READY.
- Chỉ khi thay runtime mới chạy checks/build phù hợp; tài liệu này chưa sửa runtime và không có bằng chứng live pass.

## 11. Mẫu giao việc cho agent/công cụ

> Chuẩn bị [cư dân / trạm] theo docs/VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md. Đính kèm reference toàn thân owner và trạm đúng phiên bản. Dùng nguyên style lock + negative lock, prompt chung và đúng một chuỗi 8 frame mỗi sheet. Tạo bộ tối thiểu, ghép preview với trạm và đạo cụ trước khi mở rộng. Giữ source, đo file thật và khai báo pivot/socket/cue. Không thay Battle Run, không phát thưởng từ animation, không gán STYLE APPROVED/GAME READY khi chưa có bằng chứng.

## Cập nhật chu kỳ vườn — 2026-10-14

Owner đồng ý ví dụ 60 giây làm việc / 5 cà rốt / 1 Đồng cho lượt mới. Đã triển khai gieo/cây lớn/trưởng thành/thu hoạch/giỏ chờ lấy với job lưu lâu dài; legacy giữ 30s/3 củ đã trả. Prototype SVG cho luống; chưa clip gieo/thu hoạch thật. Panel có nhận giỏ thủ công tạm, vận chuyển vẫn chưa tích hợp. Nguồn runtime/checklist: [VILLAGE-GARDEN-CYCLE-2026-10-14.md](VILLAGE-GARDEN-CYCLE-2026-10-14.md). Các mô tả garden recipe cũ được supersede riêng cho lượt mới; câu cá/xưởng/Battle không đổi.

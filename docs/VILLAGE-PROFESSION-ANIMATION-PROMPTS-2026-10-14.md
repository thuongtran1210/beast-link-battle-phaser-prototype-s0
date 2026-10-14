# Prompt chi tiết animation nghề — sáu cư dân

Ngày: 2026-10-14. **PROMPT DOCUMENTED / CHƯA TẠO SHEET / OWNER ART REVIEW OPEN**.

Hướng owner chốt mới nhất: làm xong đặt sản phẩm tại trạm; Swiftwing vận chuyển đi bộ chính, Starcaller chèo xuồng đi bán hàng thành phẩm khi Kho đầy, giữ Gỗ. Giao tại giỏ/kệ nhận hàng cạnh nhà chung, chỉ cộng Kho một lần khi giao thành công. Bỏ hướng dịch chuyển phép. Snowguard trực trạm gần cổng và tuần tra; đội hình canh gác vẫn làm nghề thường ngày.

Đây là đặc tả tạo hình, chưa triển khai vận chuyển trong runtime. Hiện job kinh tế vẫn giao hàng trực tiếp. Không tự chốt tốc độ/phí vận chuyển, phân công ca, thiếu người/kho đầy hoặc luật trộm/phòng thủ. Runtime hiện chưa có vận chuyển đi bộ/trạm canh mới.

## Cách dùng

1. Mở file `.txt` của đúng nhân vật/clip ở bảng dưới; copy toàn bộ. File đã chứa nguyên Style Lock + Negative Lock, quy cách, nhận diện và tám frame.
2. Đính kèm Attachment A là ảnh toàn thân đúng đường dẫn. Attachment B là trạm nếu có; Attachment C là sheet/prop cùng variant đã duyệt để giữ tỷ lệ và grip. Tên file trong prompt không thay cho ảnh đính kèm.
3. Tạo một sheet cho mỗi prompt. Bắt đầu Windstrider, review mẫu ghép với vườn trước mở rộng. Việc chuẩn bị đủ prompt không có nghĩa duyệt mass-generate.
4. Tự kiểm tám frame/alpha/foot anchor/công cụ theo checklist cuối tài liệu. Không cần agent chạy browser automation.

Reference đã xem trực tiếp: sáu ảnh toàn thân đang dùng trong manifest và garden/forge/dock owner. Màu, áo, khiên/búa được mô tả theo ảnh, không theo tên loài cũ.

## Brief kỹ thuật chung

```text
Create ONE village profession animation sheet for the exact attached owner character.
Use Attachment A for identity. Use Attachment B only for station scale/camera if listed.
An approved earlier sheet of this same village variant is Attachment C: match its body
size, tool design, gripping hand, foot registration and entrance/exit pose exactly.
Owner identity has priority over generic style wording: preserve the bold black outline,
simple black eyes, flat graphic shapes and reference clothes. Do not make a realistic animal.

OUTPUT: one true RGBA transparent PNG, exactly 2048 x 1024 pixels, four columns
and two rows, exactly EIGHT frames, left-to-right across the top row then bottom row.
Each cell is 512 x 512. No drawn grid, frame numbers, text, checkerboard or white background.
Full body and complete tool inside every cell, at least 32 px clear padding around extremes.
Fixed 3/4 reference camera, face RIGHT in ALL frames. Never flip an individual frame.
Neutral body height target: 330 px from highest identity feature to foot baseline;
lock this once from the accepted first sheet. Do not enlarge crouches or shrink extended poses.
Fixed local ground anchor: (256,440). Standing clips keep both feet registered.
Walking is IN PLACE; alternating contact stays around the same ground anchor.
No camera movement, perspective change, body translation across cells, cropping or motion blur.

Only draw this character and the specifically permitted carried prop. Do not draw the
station, ground, river, crops, storage building, parked tools, dropped products or particles.
Station and product references are for matching only, not objects to paste into the sheet.
Physical products are SEPARATE layers: workers finish and leave output at their station;
Swiftwing is the walking carrier to the receiving shelf beside the common house.
Starcaller is a BOAT TRADER, rowing finished goods to market when inventory is full. No teleportation
or new warehouse building. Only a committed delivery may add stock to inventory.
Animation frames never grant items, spend money or determine production quantity.

Keep each carried object rigid with constant dimensions and consistent grip.
No extra fingers, limbs, tools or parcels. Preserve tail/ears and costume from frame to frame.
For PICKUP/RELEASE, follow the declared ownership frame: the parked world prop and
the carried prop must never be drawn simultaneously. The surrounding scene is composited later.
The frame labels in this prompt are instructions; do not print them in the image.
Use warm, modest village gestures. No combat attacks, threat beams, damage numbers or new armor.
All coordinates are production targets, not measurements of an image that does not yet exist.
For loops, frame 8 transitions to frame 1 without an extra held duplicate frame.
For one-shots, use the stated final pose so the next clip can begin without a jump.
```

## Snowguard — tuần tra

ID: `beast-a`. Attachment A: [ảnh toàn thân](../public/assets/beasts/snowguard/base_owner_v01.png).
Không có trạm mới được duyệt để đính kèm; không tự vẽ thêm nhà kho/cổng/trạm mới trong sheet.

```text
CHARACTER: Snowguard, the WHITE DUCK in Attachment A. Keep the yellow beak and
webbed feet, tall black oval eye, red fedora with black band, black suit/vest,
white shirt area and bright red tie. Preserve the original rectangular dark riot
shield with its pale rectangular viewing panel. This is NOT a paw-shaped shield.
Keep the broad, stable Tanker silhouette and grounded posture; do not add armor.
IDLE/WALK PROP: hold this same single shield on its reference side at relaxed height.
Never switch hands, convert the shield to a round shield, add a spear or put a second
shield on the back. The free hand is available for inspection. No patrol gate is drawn.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/snowguard/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/snowguard/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [inspect.png](prompts/village-professions/snowguard/inspect.txt) | ONE-SHOT, 8 fps, settles into idle |

### inspect.png

```text
PLAYBACK: ONE-SHOT, 8 fps, settles into idle
1. Begin in the exact shield-at-rest idle pose, both feet planted and beak pointing right.
2. Move only the eyes toward an imaginary checkpoint on the right; neck leans forward slightly.
3. Incline the upper body a little while the shield stays rigid and the feet keep their original positions.
4. Raise the empty hand above the eye as a small visor; keep it separate from the red hat brim.
5. Hold a comically serious watchful expression; beak stays its reference shape, no open shouting mouth.
6. Lower the empty hand beside the body; the shield returns to its original relaxed angle.
7. Give one small satisfied nod; hat follows the head without detaching or changing its band.
8. Settle into the exact idle silhouette and grip from frame 1, ready to continue patrol.
Do not draw a checkpoint, fence, bell, enemy, exclamation mark or flashlight. This is a visual inspection, not a raid trigger.
```

## Shadowclaw — câu cá

ID: `beast-b`. Attachment A: [ảnh toàn thân](../public/assets/beasts/shadowclaw/base_owner_v01.png).
Attachment B: [trạm owner](../public/assets/ui/camp/village-owner-v1/dock.png).

```text
CHARACTER: Shadowclaw, the GREY RACCOON in Attachment A, not a cat.
Keep pointed ears with light interiors, the dark eye mask, pale muzzle, small black
nose, black oval eye, red neckerchief with its trailing end, dark tunic, brown belt
with square gold buckle, dark feet and the large striped grey tail.
Replace only the carried sword with ONE compact wooden fishing rod; no sword reappears.
Proposed rod master: warm brown handle, simple dark grip, thin straight shaft and one
fine line directed toward the right. No detailed reel, extra hook or second rod.
The near hand controls the grip and the far hand supports it; never exchange hands.
IDLE/WALK PROP: carry the same rod lowered diagonally beside the body, clear of the tail.
The rod and attached short line may be in the sheet; water, bobber, fish and bucket are separate.
Attachment B is the wooden owner dock: use its camera/scale only, do not draw a dock.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/shadowclaw/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/shadowclaw/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [fishing-enter.png](prompts/village-professions/shadowclaw/fishing-enter.txt) | ONE-SHOT, 8 fps, ends at fishing-work frame 1 |
| [fishing-work.png](prompts/village-professions/shadowclaw/fishing-work.txt) | LOOP, 8 fps, quiet waiting |
| [fishing-finish.png](prompts/village-professions/shadowclaw/fishing-finish.txt) | ONE-SHOT, 10 fps, settles into rod-at-rest idle |

### fishing-enter.png

```text
PLAYBACK: ONE-SHOT, 8 fps, ends at fishing-work frame 1
1. Start in rod-at-rest idle, feet fixed; both hands already hold the single rod.
2. Separate the feet into a stable stance without changing the central ground anchor; raise the hands slightly.
3. Bring the rigid rod backward within the cell; use a small shoulder rotation and keep the tail clear.
4. Sweep the rod smoothly forward to the right; tip and short line remain inside safe padding.
5. Extend the hands toward the imaginary water socket; the line follows one clean direction, no fish or bobber appears.
6. Lower the shoulders into a relaxed waiting posture; reduce the follow-through.
7. Settle the hands and rod at the declared work angle, eyes looking along the line to the right.
8. Match fishing-work frame 1 exactly in body, feet, rod angle and hand placement.
Casting is restrained, not a sword slash. Do not paint river water or duplicate line segments.
```

### fishing-work.png

```text
PLAYBACK: LOOP, 8 fps, quiet waiting
1. Hold the rod diagonally right in the accepted work pose, feet planted; line exits toward the separate water socket.
2. Take a shallow breath, lifting the chest a few pixels while hands stay fixed to the same handle.
3. Raise the whole rod by a few degrees using the wrist and forearm; the shaft stays rigid.
4. Watch the imaginary bobber with a focused eye expression; no yank or visible catch.
5. Exhale gently and relax the shoulders; keep both hands and the tail clear of the rod.
6. Lower the rod back toward the starting angle; the line never becomes a thick ribbon.
7. Blink once briefly, maintaining the grip, feet and original red scarf silhouette.
8. Return smoothly toward frame 1 with the same rod angle and body registration.
No repeated catches during the work loop; fish, splash and bobber motion are separate layers.
```

### fishing-finish.png

```text
PLAYBACK: ONE-SHOT, 10 fps, settles into rod-at-rest idle
1. Begin in the exact fishing-work pose; eye looks along the rod toward the right.
2. Notice a tug and tighten the grip, elbows moving closer to the body; no fish is drawn.
3. Lean backward modestly with knees bent and planted feet; draw the rod upward as one rigid object.
4. Pull the rod with both hands, shoulders rotating together; line endpoint moves to the declared catch socket.
5. Reach the controlled pull peak, then turn the gaze toward an imaginary product placement area on the right.
6. Lower the rod and incline the free/support hand toward that area as if placing the catch down; retain one secure grip.
7. Straighten and check the dropped-output area with a satisfied look; the product stays outside the character sheet.
8. Return to rod-at-rest idle for walking away; the catch remains at the station for shipping.
Catch/product layer can reveal at frame 5 and rest at the station by frame 6; measure sockets after generation. Never draw a fish in the hand or teleport it here.
```

## Windstrider — vườn cà rốt

ID: `beast-c`. Attachment A: [ảnh toàn thân](../public/assets/beasts/windstrider/base_owner_v01.png).
Attachment B: [trạm owner](../public/assets/ui/camp/village-owner-v1/garden.png).

```text
CHARACTER: Windstrider, the WHITE RABBIT in Attachment A. Keep the very long
ears with pink interiors, black oval eye, white muzzle, dark green hood and tunic,
brown belt with square gold buckle, dark feet and reference rear quiver/arrow motif.
The handheld bow is stowed outside the sheet; do not turn it into the watering can.
IDLE/WALK PROP: empty hands, with no carried watering can. The can is parked at the station.
WORK PROP: ONE small mint-green watering can, rounded rectangular reservoir,
arched handle, short rigid right-facing spout; keep its form, size and grip identical
through enter/work/finish. No second can. Use an approved can reference when available.
Attachment B is the owner wooden-fenced carrot garden; it is not part of this character sheet.
Carrot plants, harvested carrots, output basket and watering droplets are separate layers.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/windstrider/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/windstrider/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [garden-enter.png](prompts/village-professions/windstrider/garden-enter.txt) | ONE-SHOT, 8 fps, pickup ownership at frame 4 |
| [garden-work.png](prompts/village-professions/windstrider/garden-work.txt) | LOOP, 8 fps, one gentle watering sweep |
| [garden-finish.png](prompts/village-professions/windstrider/garden-finish.txt) | ONE-SHOT, 8 fps, can release at frame 4 |

### garden-enter.png

```text
PLAYBACK: ONE-SHOT, 8 fps, pickup ownership at frame 4
1. Stand empty-handed in accepted idle, looking toward a parked can socket on the right; do not draw that parked can.
2. Bend knees and hinge the torso slightly toward the right; long ears retain full length and remain within the cell.
3. Reach the controlling hand to the imaginary handle socket; the can is still owned by the world layer, not the character.
4. Lift ONE can into the character layer at the same pickup location; near hand closes around the handle, far hand supports the body.
5. Straighten gently, bringing the can to waist height; no stretching of the handle, spout or reservoir.
6. Turn the rigid can spout toward the right; keep wrists consistent and ears clear of the tool.
7. Lean toward the work area and establish a modest pouring angle with planted feet.
8. Match garden-work frame 1 exactly in foot registration, body angle, grip and can tilt.
World can hides at frame 4 when carried can appears. No water or crops in this sheet.
```

### garden-work.png

```text
PLAYBACK: LOOP, 8 fps, one gentle watering sweep
1. Hold one can at a modest forward tilt, spout toward the right; controlling hand on handle and support hand under reservoir.
2. Increase the can tilt slightly using the same wrist, elbows remaining close and feet fixed.
3. Lean the upper body a little toward the imaginary garden socket; ears follow the torso, not the can.
4. Reach the maximum gentle watering tilt, about 45 degrees; do not draw water leaving the spout.
5. Move the rigid can a small distance across the same work area, keeping hand positions locked to the tool.
6. Ease the torso backward and reduce the tilt; the reservoir never shrinks or changes shape.
7. Recover the initial shoulder height and can angle, eye returning to the work area.
8. Flow into frame 1 with the same contact feet and a small continuing watering motion.
Separate watering FX can align with the spout around frames 3–5. No carrots appear/disappear in the work loop.
```

### garden-finish.png

```text
PLAYBACK: ONE-SHOT, 8 fps, can release at frame 4
1. Begin in garden-work neutral pose with one can held, spout pointing right.
2. Level the can to stop pouring and begin bending toward its parked socket.
3. Lower the rigid can toward the same pickup/parking location; hands remain visibly attached.
4. Release the can: it is absent from the character layer from this frame onward, hands at the handoff socket.
5. Stand upright with empty hands; glance toward the separate harvested-output basket at the station.
6. Wipe the forehead lightly with the empty hand; no carrot is carried or eaten.
7. Give a small pleased nod toward the output area, ears relaxing but retaining their full silhouette.
8. Return to the exact empty-handed idle pose, ready to leave the products at the garden.
Parked can appears at frame 4; output basket/carrots stay in the world layer. This clip does not carry carrots to inventory.
```

## Starcaller — thương nhân chèo xuồng

ID: `beast-d`. Attachment A: [ảnh toàn thân](../public/assets/characters/badger-mage/base_v01.png).
Không có trạm mới được duyệt để đính kèm; không tự vẽ thêm nhà kho/cổng/trạm mới trong sheet.

```text
CHARACTER: Starcaller, the HONEY-BADGER MAGE in Attachment A. Keep the dark
head, pale cheek/muzzle patch, black oval eye/nose, pointed purple wizard hat,
its band and curved brim, purple cape, dark clothing and square gold buckle.
Profession in this village variant: BOAT TRADER, never a village delivery carrier.
Keep the original purple hat/cape. Staff is stowed off-sheet. IDLE/WALK hands empty.
For rowing only: seated low, both hands hold one simple wooden paddle. Character and
paddle form one animation layer; boat, cargo and river are separate world layers.
No box held in the hands, portals or magic. Runtime sells carrot/fish/toy only, no wood.
Animation never grants coins or changes inventory.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/starcaller/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/starcaller/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [boat-row.png](prompts/village-professions/starcaller/boat-row.txt) | LOOP, 8 fps, rowing in place |

### boat-row.png

```text
PLAYBACK: LOOP, 8 fps, rowing in place
1. Sit facing right with knees bent; hold a wooden paddle in both hands, blade forward and low beside the off-sheet boat.
2. Reach the paddle slightly forward with both hands; maintain the fixed seat anchor and stable hat.
3. Lower the blade toward the imaginary water socket; elbows bend naturally, no drawn water.
4. Pull the paddle back halfway; torso leans only slightly, both hands maintain the same grip.
5. Complete the pull near the hip; blade stays rigid and cape remains clear of the hands.
6. Lift the paddle blade for recovery; relax shoulders without changing its size or swapping hands.
7. Move the paddle forward above the imaginary water; head stays steady and seat does not slide.
8. Lower toward the starting pose smoothly for frame 1; fixed seated root, no boat movement baked in.
Seat anchor local (256,350) for all rowing frames. Boat/cargo/water must NOT appear in this sheet. Keep neutral body scale shared with idle, do not enlarge the seated body.
```

## Ironclad — xưởng đồ chơi

ID: `beast-e`. Attachment A: [ảnh toàn thân](../public/assets/beasts/ironclad/base_owner_v01.png).
Attachment B: [trạm owner](../public/assets/ui/camp/village-owner-v1/forge.png).

```text
CHARACTER: Ironclad, the BROWN BEAR in Attachment A. Keep round ears,
black oval eye, cream muzzle, black nose, black bowler-style hat, cream shirt,
black trousers and suspenders with two square gold buckles. Preserve the sturdy body.
Keep the ONE original hammer: dark rectangular metal head and short warm-brown handle.
IDLE/WALK PROP: same hammer at its accepted resting shoulder position, same hand.
Do not add a second hammer, apron, helmet, weapon upgrade or glowing metal.
Attachment B is the owner wooden workbench with an anvil and wooden duck toy;
match its scale/camera but do not paint any bench, anvil or toy into this sheet.
Crafting stock, finished toy, shaving dust and contact effects are separate layers.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/ironclad/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/ironclad/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [forge-enter.png](prompts/village-professions/ironclad/forge-enter.txt) | ONE-SHOT, 8 fps, ends at forge-work frame 1 |
| [forge-work.png](prompts/village-professions/ironclad/forge-work.txt) | LOOP, 8 fps, one modest hammer tap |
| [forge-finish.png](prompts/village-professions/ironclad/forge-finish.txt) | ONE-SHOT, 8 fps, leaves the toy on the bench |

### forge-enter.png

```text
PLAYBACK: ONE-SHOT, 8 fps, ends at forge-work frame 1
1. Start with the single hammer at its reference resting shoulder position, feet planted.
2. Look toward the imaginary workbench on the right; lower the chin slightly under the fixed hat.
3. Brace the legs and lean forward a little, preserving the low stable center of gravity.
4. Move the hammer forward from the shoulder with the controlling hand locked on the handle.
5. Bring the support hand near the handle to stabilize the small crafting movement, no extra hammer appears.
6. Raise the hammer a modest distance over the right-side work-contact socket, keeping the entire head in cell.
7. Settle the shoulders and align the hammer face parallel to the intended contact surface.
8. Match forge-work frame 1 exactly, ready for a gentle crafting strike rather than a battle attack.

```

### forge-work.png

```text
PLAYBACK: LOOP, 8 fps, one modest hammer tap
1. Hold the single reference hammer above the imaginary work-contact area on the right, with a stable grip.
2. Lift the hammer slightly using elbow/shoulder rotation; head and handle remain one rigid shape.
3. Reach a small anticipation peak, feet fixed and body scale unchanged.
4. Bring the hammer down toward the declared contact socket with a short controlled arc.
5. Hold the low contact pose for one frame; hammer face aligned to the invisible workpiece, no material painted in.
6. Lift the hammer with a restrained recoil, without enlarging the head or detaching the hand.
7. Recover the shoulders and support hand toward the initial working pose.
8. Flow into frame 1 with the same foot registration and next-tap momentum.
Measure the hammer-face socket near frame 5 after generation. No anvil, plank, toy, sparks, fire or attack shockwave in the character layer.
```

### forge-finish.png

```text
PLAYBACK: ONE-SHOT, 8 fps, leaves the toy on the bench
1. Start in the accepted working pose with one hammer, gaze at the right-side workpiece socket.
2. Pull the hammer away from the contact area, keeping feet planted.
3. Bring the hammer under control beside the shoulder; look down toward the separate finished-toy layer.
4. Extend the empty/support hand toward the product socket as if settling the toy onto the bench; no toy is drawn in the hand.
5. Withdraw the empty hand and tilt the head to inspect the placed product with a pleased expression.
6. Return the hammer to its original shoulder rest, with the same handle/head dimensions as idle.
7. Give a small satisfied nod, relaxing the suspenders and shoulders without costume changes.
8. Match the exact hammer-at-rest idle; the toy stays on the bench for collection/shipping.
Finished toy is a world layer already aligned with the bench; do not create a new copy on frame 4 or carry it away.
```

## Swiftwing — vận chuyển chính

ID: `beast-f`. Attachment A: [ảnh toàn thân](../public/assets/beasts/swiftwing/base_owner_v01.png).
Không có trạm mới được duyệt để đính kèm; không tự vẽ thêm nhà kho/cổng/trạm mới trong sheet.

```text
CHARACTER: Swiftwing, the ORANGE FOX in Attachment A, not a bird.
Keep the pointed orange ears with pale interiors, white muzzle/chest, black oval eye
and nose, burgundy coat, gold square belt buckle, dark feet and orange tail with white tip.
Preserve the reference rear quiver/arrow motif; stow the handheld bow outside this village sheet.
IDLE/WALK PROP: empty hands. Profession: main walking carrier, Starcaller instead rows goods to market.
Pick up one finished-goods parcel, follow village paths to the shared receiving point
beside the common house, and set it down.
Never teleport a parcel, cast spells, invent a warehouse or make a second parcel.
PARCEL MASTER: one small kraft-brown rectangular box with a plain cream paper band,
no lettering, label, arrows, logo or shiny trim. Width target 100 px at locked 330 px
neutral character height; use the same approved parcel silhouette in every sheet.
Only loaded-walk and the specified pickup/finish frames contain the carried parcel.
World parcel, station and receiving basket/shelf are separate layers. Keep the box below the muzzle
so it never obscures the eyes or clips through the tail.
```

| File prompt đầy đủ | Phát |
| --- | --- |
| [idle.png](prompts/village-professions/swiftwing/idle.txt) | LOOP, 8 fps, 1 second cycle |
| [walk.png](prompts/village-professions/swiftwing/walk.txt) | LOOP, 8 fps, 1 second cycle |
| [delivery-pickup.png](prompts/village-professions/swiftwing/delivery-pickup.txt) | ONE-SHOT, 8 fps, parcel ownership at frame 4 |
| [loaded-walk.png](prompts/village-professions/swiftwing/loaded-walk.txt) | LOOP, 8 fps, carrying in place |
| [delivery-finish.png](prompts/village-professions/swiftwing/delivery-finish.txt) | ONE-SHOT, 8 fps, places parcel at the shared receiving point at frame 5 |
| [delivery-greet.png (tùy chọn)](prompts/village-professions/swiftwing/delivery-greet.txt) | ONE-SHOT, 8 fps, optional helper acknowledgement |

### delivery-pickup.png

```text
PLAYBACK: ONE-SHOT, 8 fps, parcel ownership at frame 4
1. Begin empty-handed beside an imaginary parcel socket on the right, feet in accepted idle.
2. Look down toward that socket, torso leaning only a little and tail held clear.
3. Bend knees and lower both empty hands to the parcel edges; the parcel is still solely in the world layer.
4. Show ONE parcel gripped at the socket: the world copy is hidden now, with the same width and cream band.
5. Lift the parcel close to the lower chest using both hands under its bottom corners.
6. Straighten the legs while holding the box upright; no stretching, spinning or shrinking of the parcel.
7. Settle the elbows and stance, keeping the white muzzle visible above the box.
8. Match the neutral loaded-walk grip and body alignment exactly, ready to carry the box.
Parcel is absent from frames 1–3 and carried from frame 4 onward. Do not draw another box on the floor.
```

### loaded-walk.png

```text
PLAYBACK: LOOP, 8 fps, carrying in place
1. Left foot forward, right behind; hold ONE parcel just below the muzzle, both hands supporting bottom corners.
2. Transfer weight onto the left foot; parcel stays upright with only a tiny shared body bob.
3. Right foot passes under the body; coat and tail follow softly without intersecting the box.
4. Right foot swings forward; elbows remain tucked and fingers/hand shapes do not crawl across the parcel.
5. Right foot forward, left behind; preserve facing RIGHT and the exact cream-band placement.
6. Transfer weight onto the right foot; box dimensions and corner angles remain unchanged.
7. Left foot passes under the body, tail stays behind and clear of hands and box.
8. Left foot swings forward into frame 1; fixed root and continuous gait, no dropped or teleported parcel.
This is a separate loaded variant, not the empty-hand walk. Do not bake road, footprints, dust or a destination into the sheet.
```

### delivery-finish.png

```text
PLAYBACK: ONE-SHOT, 8 fps, places parcel at the shared receiving point at frame 5
1. Begin holding ONE parcel in the same neutral loaded-walk grip, gaze toward the shared receiving-point socket beside the common house on the right.
2. Lower the gaze to the drop location; adjust elbows slightly while keeping the parcel upright.
3. Bend knees and torso to lower the parcel, tail kept clear and box still supported by both hands.
4. Bring the parcel to the declared resting socket; hands remain attached until the next frame.
5. Release: remove the parcel from the character layer now, with hands open at the exact handoff location.
6. Straighten with empty hands; the world parcel remains at shared receiving point; only a committed delivery may add it to inventory.
7. Give a small wave with the free hand toward the off-sheet village partner, no mage or spell drawn.
8. Match empty-handed idle exactly, ready to return for another collection.
World parcel appears at frame 5 and remains until a committed delivery. This animation does not grant inventory.
```

### delivery-greet.png

```text
PLAYBACK: ONE-SHOT, 8 fps, optional helper acknowledgement
1. Start empty-handed in accepted idle, looking right toward an off-sheet shipping partner.
2. Raise the gaze slightly and relax the shoulders, keeping both feet fixed.
3. Lift the near empty hand toward shoulder height, the other hand relaxed beside the coat.
4. Give one small friendly wave; preserve simple hand shape and ear/face identity.
5. Wave gently in the opposite direction without twisting the wrist impossibly.
6. Lower the hand toward the original relaxed position, tail making only a tiny follow-through.
7. Give a modest pleased nod, no text bubble or parcel appearing.
8. Return to the same empty-handed idle stance.
OPTIONAL, not required for the first minimal pack. No signature effect or delivery reward.
```

## Ghép sản phẩm, điểm nhận và trạm canh — layer riêng

- Prompt prop bổ sung: [điểm nhận](prompts/village-professions/stations/receiving-point.txt), [trạm canh](prompts/village-professions/stations/guard-post.txt). Đây là hai candidate tĩnh riêng, không tính vào 27 prompt nhân vật.
- Vườn/cá/xưởng: output nằm tại trạm. Basket/fish/toy là một layer world, giữ nguyên khi chờ shipper; không biến mất sau mỗi vòng work.
- Swiftwing: pickup frame 4 đổi owner world→hand; delivery-finish frame 5 đổi hand→điểm nhận chung. Không vẽ hai kiện cùng lúc; không cộng hàng từ frame animation.
- Điểm nhận cạnh nhà chung dùng giỏ/kệ, chưa xây nhà kho riêng. Runtime ghi giao hàng một lần theo ID hàng/job và save-before-commit; đây là contract cần triển khai, chưa phải tính năng hiện có.
- Trạm canh gần cổng, tuyến đi tránh vật cản. Snowguard dùng idle/walk/inspect; trạm và chuông là asset riêng. Báo động giữ tiến độ và owner hàng đang mang; xếp đội hình không biến cư dân thành lính đứng yên cả ngày.
- Starcaller giữ nhận diện mũ/áo pháp sư; cất trượng ngoài hình để cầm mái chèo bằng hai tay; xuồng và hàng là layer riêng. Không có vòng phép, fade dịch chuyển hay hoạt ảnh teleport trong bộ hiện hành.

## Checklist tự kiểm sau mỗi sheet

- [ ] Đúng nhân vật/trang phục/loài; Snowguard dùng khiên chữ nhật; Ironclad chỉ một búa; Starcaller giữ mũ/áo tím, cất trượng khi chèo xuồng.
- [ ] Đủ tám frame 4×2, alpha thật; không chữ/số/lưới/nền caro bake.
- [ ] Mặt sang phải toàn bộ; tỷ lệ, baseline và tool/grip không nhảy; đủ tai/đuôi/đầu búa/cần câu.
- [ ] Loop nối 8→1; one-shot đầu/cuối khớp clip kế tiếp.
- [ ] Pickup/release đúng frame; sản phẩm chỉ có một chủ sở hữu hình ảnh.
- [ ] Ghép với trạm ở kích thước thật; đo cửa sổ/pivot/socket từ file thực, không coi prompt là bằng chứng số đo.
- [ ] Lưu source nguyên bản; ghi actual width/height, alpha, frame windows, neutral height, grip/socket/cue và trạng thái review.

## Bàn giao

Bộ tối thiểu đếm theo tên clip thật: **26 sheet nhân vật** trước tái sử dụng; thêm một `delivery-greet` tùy chọn, tổng 27 prompt. Giảm từ 28 required + 1 optional của bộ đi bộ cũ: Starcaller dùng một clip chèo thay ba clip phụ vận chuyển. Idle/walk phù hợp có thể tái sử dụng sau review, không ép tạo lại.
Tổng thời gian sheet là timing hình ảnh, không phải thời gian làm việc/vận chuyển trong gameplay.
Nguồn hướng dẫn: [asset spec](VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md), [workflow frame animation](FRAME-ANIMATION-AGENT-WORKFLOW.md), [Style Lock](../art/style/STYLE_LOCK_PROMPT.md).
Các `.txt` được xuất từ `scripts/export-village-profession-prompts.cjs`; Style Lock lấy nguyên từ file nguồn. Sửa nội dung nguồn và chạy exporter để tránh các bản prompt lệch nhau.

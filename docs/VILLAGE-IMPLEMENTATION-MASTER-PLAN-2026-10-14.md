Cập nhật 2026-10-15: vận chuyển Swiftwing đã nối cả vườn/bến cá/xưởng; code implemented, owner UI review open. Xem [đa trạm và checklist](VILLAGE-MULTI-STATION-DELIVERY-2026-10-15.md).

Cập nhật phạm vi owner: đã thêm trạm canh SVG thử và tuyến Snowguard quay về trạm; chỉ nghề tuần tra/quan sát. Bồn tắm chưa thêm job/state; đội hình/báo động để sau. Xem [trạm canh và checklist](VILLAGE-GUARD-POST-2026-10-14.md). Owner review OPEN.

Cập nhật mới nhất 2026-10-14: Swiftwing vận chuyển vườn; Starcaller bỏ phụ vận chuyển, chèo xuồng bán hàng thành phẩm khi Kho đầy; Snowguard có sheet đi tuần và tuyến thử. Chi tiết trạng thái/code/checklist: [carrier/boat/patrol](VILLAGE-CARRIER-BOAT-PATROL-2026-10-14.md). Các đoạn “chưa triển khai” bên dưới là lịch sử nếu trùng phạm vi này; trạm canh/báo động vẫn chưa làm.

# Làng Thú — Kế hoạch thực hiện tổng thể

Ngày: 2026-10-14. Trạng thái: **M0 CODE IMPLEMENTED / CHECK PASS / OWNER UI REVIEW OPEN**. V00 nền code và V01–V05 đã thực hiện; art reference/clip thật chưa được duyệt. Chi tiết: [Village foundation progress](VILLAGE-FOUNDATION-PROGRESS-2026-10-14.md). Owner tự kiểm theo [checklist M0](VILLAGE-M0-OWNER-CHECKLIST-2026-10-14.md); agent không chạy thêm browser automation.

## 1. Mục tiêu và phạm vi đã thống nhất

Sáu cư dân Day 1: Snowguard, Shadowclaw, Windstrider, Starcaller, Ironclad, Swiftwing; được chọn cho Run và tham gia làng. Cư dân mới được giải cứu theo checkpoint khám phá, đồng thời mở quyền chọn Run và định cư. Map 3/10/15 là ví dụ, không phải lịch thưởng đã chốt. Mở đầu: Run → làng. Tay nghề làng riêng, lưu lâu dài và không tác động Battle Run.

Nghề hiện hành: Snowguard tuần tra/trạm canh; Shadowclaw câu cá; Windstrider trồng cà rốt; Ironclad chế tác; Swiftwing vận chuyển đi bộ chính; Starcaller chèo xuồng đi bán cà rốt/cá/đồ chơi khi Kho đầy, giữ Gỗ, giữ nhận diện pháp sư nhưng không dịch chuyển hàng. Hàng làm xong để tại trạm, người mang giao đến giỏ/kệ chung cạnh nhà chung, nhập Kho một lần sau commit. Trạm canh gần cổng; đội hình canh gác vẫn làm nghề thường ngày. Thiết kế mới chưa triển khai; xem VILLAGE-TRANSPORT-GUARD-UPDATE-2026-10-14.md.

Nguồn đọc: `CURRENT_REPO_HANDOFF.md`, `../AI_INSTRUCTIONS.md`, `VILLAGE-STORY-DIRECTION-2026-10-09.md`, `VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md`, `FRAME-ANIMATION-AGENT-WORKFLOW.md`, code/tests hiện hành. Không gọi Notion. Art theo routing repo và reference owner. Không tự gán trạng thái đã triển khai, STYLE APPROVED, GAME READY hoặc adopted.

Kế hoạch không tự mở rộng sang raid/phòng thủ làng, hàng hiếm, nhà riêng có buff, nâng cấp trạm hoặc offline production. Các phần đó có cổng quyết định riêng. Không thay gameplay Battle Run, WebSocket/P2P hoặc luật online.

## 2. Hiện trạng và khoảng cách

| Hạng mục | Nền hiện có | Cần thực hiện |
| --- | --- | --- |
| Simulation | Độc lập DOM; rest/walk/work/return; reservation và hooks | Trạng thái bị chặn rõ, snapshot/event có kiểu, hỗ trợ animation enter/exit bằng presentation |
| Kinh tế | Recipe vườn/cá/xưởng, inventory, bữa ăn/hỏng, job lưu | Tách điều phối khỏi CampView; giữ giao dịch/save; không xây kinh tế mới |
| UI | CampView, controller, manager và dialog đã tách một phần | CampView còn giữ nhiều nghiệp vụ; nhánh theo Beast ID; cleanup manager chưa đầy đủ |
| Animation | Bộ Battle Phaser, clip cố định; làng DOM/cutout/prototype | Player nghề cho DOM, catalog clip, socket/prop ownership và FX riêng |
| Save | Camp v3, residents theo ID, job và kinh tế | Migration Day 1, rescue unlock, tay nghề và checkpoint receipt |
| Progression | Discover cư dân qua tuyển Run, onboarding Run → làng | Tách quyền mở Beast khỏi bản thể tuyển trong trận; bảo toàn save cũ |
| Kiểm chứng | Có checks simulation/economy/life/production | Tests cho contract mới, save fail/reload, animation state; visual/device review riêng |

## 3. Bảng kế hoạch chính

Trạng thái ban đầu của mọi dòng: **CHƯA BẮT ĐẦU THEO KẾ HOẠCH**. Cập nhật 2026-10-14: V00 nền code, V01–V05 IMPLEMENTED / CHECK PASS; owner UI review OPEN; V06–V19 chưa bắt đầu. Nền sẵn có không đồng nghĩa hoàn tất dòng. Vai trò là trách nhiệm công việc, chưa phải người đã được phân công; không tự tạo agent hoặc chat mới.

| ID | Giai đoạn / nhiệm vụ | Đầu ra cụ thể | Phụ thuộc | Vai trò | Điều kiện nghiệm thu |
| --- | --- | --- | --- | --- | --- |
| V00 | Kiểm kê baseline, thay đổi đang có và reference | Danh sách module/tests, asset thật, nợ kỹ thuật và baseline lệnh chạy | — | Code + art | Không ghi đè công việc owner; phân biệt code/check/live |
| V01 | Chốt contract trạng thái và ranh giới | Kiểu nghề/job/worker/station, lý do blocked, event và snapshot | V00 | Code | Không phụ thuộc DOM/Phaser trong domain; ID ổn định; không dùng chuỗi tùy ý cho contract đóng |
| V02 | Tách application service khỏi CampView | Điều phối begin/advance/deliver/life/save qua một service và storage port | V01 | Code | UI gửi lệnh/đọc snapshot; save-before-commit giữ nguyên; không đổi công thức hoặc phí |
| V03 | Dọn lifecycle, độ đọc và kiểm soát mutation | Dispose trước rebind/leave; API đọc state; format vùng sửa; bỏ import/biến thừa liên quan | V02 | Code | Không còn timer/listener mồ côi; rebind không reset job; tránh refactor diện rộng |
| V04 | Catalog nghề và presentation | Mapping Beast→nghề→trạm→clip→prop; tách tên/label khỏi controller | V01–V03 | Code | Thêm cấu hình nghề không phải thêm chuỗi if theo Beast trong renderer chung |
| V05 | Player animation làng + preview | Player DOM, metadata frame/pivot/cue, loop/one-shot/pause/dispose và fallback | V04 | Code | Không ép clip nghề vào union Battle; không trao hàng từ frame; thiếu asset không khóa nghề |
| V06 | Kiểm kê và khóa reference art | Reference toàn thân/trạm, danh sách reuse/new, quy tắc tay cầm và tỷ lệ | V00 | Art + owner review | Đúng loài và art owner; asset gốc giữ nguyên; không coi icon là full-body reference |
| V07 | Tạo bộ mẫu Windstrider + vườn | Idle/walk phù hợp, enter/work/finish, bình nghỉ, giỏ và nước; metadata + preview | V06; preview dùng V05 | Art | Đủ 8 frame/file, alpha thật, grip/neo/scale đúng; owner review mẫu trước mở rộng |
| V08 | Tích hợp nghề mẫu và trạng thái công cụ | Vườn hoạt động với ready/working/blocked/pause/ready-output/completed | V02–V05, V07 | Code + art QA | Thiếu vật tư, đầy kho, save fail, reload đều đúng; output một lần; tool không nhân đôi |
| V09 | Shadowclaw + bến cá | Enter/work/finish, cần nghỉ, xô, phao/ripple và socket | V08 | Art + code | Giữ bến owner, không vẽ bến chồng; fishing-work không tự sinh cá |
| V10 | Ironclad + xưởng | Enter/work/finish, phôi/đồ chơi/bụi và điểm búa | V08 | Art + code | Một búa, phôi/đầu búa đúng contact; hàng chờ không biến mất khi kho đầy |
| V11 | Snowguard/trạm canh/tuyến tuần tra | Trạm gần cổng, route/inspect; đặc tả đội hình canh gác riêng | V08, V04; vị trí được review | Art + code | Cư dân vẫn làm nghề; chưa thêm trộm/trận phòng thủ; giữ tiến độ/cargo khi báo động ở slice sau |
| V12 | Starcaller chèo xuồng đi bán cà rốt/cá/đồ chơi khi Kho đầy, giữ Gỗ | Pickup/loaded-walk/place, route tới điểm nhận chung; cất trượng khi ôm kiện | V08, V04; transport rules được đặc tả | Art + code | Một cargo owner; save-before-commit; không teleport/grant từ cue; giữ hàng khi lỗi |
| V13 | Swiftwing vận chuyển đi bộ chính | Pickup/loaded-walk/place, giỏ/kệ cạnh nhà chung, reservation/receipt | V08, V04; transport rules được đặc tả | Art + code | Không nhặt trùng; delivery nhập Kho một lần; reload/đổi cảnh/báo động không mất hoặc nhân hàng |
| V14 | Tay nghề lâu dài | State/migration, progression service, UI bậc và nghề | V02, V04; ngưỡng được chốt | Code + design | Không đổi Battle; không tăng do đứng chờ; không nhận lặp do reload hoặc finish replay |
| V15 | Quyền Beast và sáu cư dân Day 1 | Một nguồn unlock dùng cho làng/Deck, migration và legacy compatibility | V02; policy legacy được chốt | Code | Sáu cơ bản có quyền từ đầu; giữ unlock/tài sản cũ; roster Run vẫn theo luật tuyển hiện hành |
| V16 | Checkpoint khám phá và giải cứu | Catalog mốc, trigger, receipt, unlock transaction, presentation sự kiện | V15; điều kiện/mốc được chốt | Code + design/art | Mở đồng thời Run+làng một lần; fail save retry được; không mặc định map ví dụ là final |
| V17 | Chương mở đầu Run → làng | Onboarding ngắn, sáu cư dân giới thiệu bằng hoạt động, bữa cơm đầu | V08–V15; đủ fallback cho clip thiếu | Code + content | Thắng/thua Run đầu đều về làng; không tự cộng thưởng; mục tiêu có đường hoàn tất kể cả thua |
| V18 | Kiểm chứng tích hợp và hiệu năng | Báo cáo scenario, check/build, browser/mobile và asset review | V09–V17 | QA + owner review | Đạt acceptance mục 7; phần chưa chạy ghi OPEN, không dùng check thay live |
| V19 | Closeout và bàn giao | Handoff, manifest asset thật, guide, trạng thái và hạn chế | V18 | Code + art | Có bằng chứng theo phiên bản; owner quyết định art/trải nghiệm, không tự tuyên bố adopted |

V09/V10 và chuẩn bị asset V11–V13 có thể thực hiện độc lập sau khi mẫu V08 ổn định. Triển khai V15/V16 không phụ thuộc phải tạo đủ gag hoặc greet. Một người có thể làm tuần tự; bảng không yêu cầu chạy nhiều agent.

## 4. Kiến trúc đích và nguyên tắc Clean Code / SOLID

```text
Village UI / dialogs
        ↓ commands                 ↑ read-only snapshots / events
Village application service ─────→ storage port → Camp save adapter
        ↓
Simulation + production/life rules + progression/unlock rules

Snapshots/events → presentation resolver → resident/tool/station player
                                      ↑ animation/profession asset catalog
```

Các tên là vai trò kiến trúc dự kiến, không bắt buộc tạo một class/interface cho mỗi dòng. Tái dùng domain functions và tests hiện có. Không xây framework DI, event bus toàn cục hoặc hệ thống plugin nghề khi chưa có nhu cầu.

| Nguyên tắc | Áp dụng cụ thể | Bằng chứng cần có |
| --- | --- | --- |
| Một trách nhiệm | UI không điều phối save/production; player không quản kinh tế; unlock không nằm trong sprite callback | Review dependency và tests service/presentation độc lập |
| Mở rộng qua dữ liệu | Catalog nghề và asset mô tả clip/prop/socket; renderer không thêm if Beast cho mỗi nghề | Thêm nghề sinh hoạt bằng cấu hình và handler hẹp khi cần |
| Thay thế implementation | Fallback cutout và sheet cùng contract hình ảnh, không đổi kết quả job | Chạy cùng scenario với asset đủ/thiếu |
| Interface vừa đủ | Port storage, snapshot và animation tách; không interface bắt mọi nghề phải có recipe | Nghề tuần tra không cần implementation sản xuất giả |
| Đảo phụ thuộc | Application nhận storage/clock cần thiết; domain không import UI/Phaser/localStorage | Kiểm tra imports và tests có injected fake storage/clock |
| Dễ đọc | Hàm có tên rõ; union/type cho state; tránh nhiều nghiệp vụ trên một dòng và magic numbers mới | Review vùng thay đổi; không bắt buộc reformat toàn repo |

Hệ thống cần phân biệt trạng thái nghiệp vụ với trạng thái hình ảnh. Missing funds/input, no worker, output waiting và persistence failure phải có lý do riêng; không nhất thiết ép tất cả vào một FSM tuyến tính. Enter/finish animation không kéo dài hay thay đổi job kinh tế; nếu cần chờ pose thì presentation tự xử lý snapshot mới nhất.

Hai nguồn remaining hiện có (simulation worker và production job) cần xác định chủ sở hữu: job production là nguồn tiến độ được lưu; simulation là điều phối di chuyển/đến trạm. Không để hai đồng hồ độc lập tạo completion lệch nhau. Giữ hành vi baseline trước khi thay đổi.

## 5. Các quyết định còn cần chốt và thời điểm

| Quyết định | Hướng đề xuất | Cần chốt trước |
| --- | --- | --- |
| Checkpoint nào cứu ai | Phân bổ Woolkeeper/Hophex/Gadgetduck/Boomhog theo nhịp khám phá; chưa gán vào 3/10/15 | V16 |
| Điều kiện khám phá checkpoint | Xác định chạm mốc, thắng map hay hoàn tất sự kiện; thua/thoát ở mốc giữ gì | V16 |
| Quyền đã có trong save cũ | Giữ cư dân, tài sản và quyền Beast đã mở hợp lệ; ghi receipt migration, không thu hồi | V15 |
| Ngưỡng tay nghề | Ba bậc Mới làm/Quen việc/Lành nghề; 0/5/10% giảm thời gian cơ bản cho nghề sản xuất | V14 |
| Đơn vị tăng tay nghề | Công việc thực hoàn tất, quy đổi theo lượng công việc; nghề sinh hoạt có tiêu chí hoàn tất riêng | V14 |
| Chuỗi giao hàng mới | Output tại trạm → Swiftwing/Starcaller đi bộ mang → điểm nhận cạnh nhà chung → commit Kho; chốt capacity/expiry/vắng người/receipt trước code | V12/V13 |
| Bữa cơm đầu | Mục tiêu onboarding sử dụng cơ chế ăn hiện có; không bắt mua/build mới hoặc thắng Run đầu | V17 |
| Vị trí công trình/điểm nhận | Đề xuất editor bố trí theo world coordinates + local anchors; review vị trí trước chốt tuyến | V11–V13 |

Chỉ hỏi quyết định còn thiếu khi công việc phụ thuộc tới cổng đó; tiếp tục việc độc lập đã có phạm vi. Không suy ra owner duyệt ảnh từ việc duyệt prompt/kế hoạch.

## 6. Kế hoạch asset theo trạng thái

Đặc tả pose, prompt tiếng Anh và định dạng nằm trong `VILLAGE-ANIMATION-ASSET-SPEC-2026-10-14.md`; không nhân bản thành hai nguồn pose khác nhau.

| Bộ | Nhân vật | Công cụ/trạm | Cổng review |
| --- | --- | --- | --- |
| Mẫu vườn | Idle, walk, enter/work/finish | Bình, giỏ, nước; trạm owner | Duyệt identity + clip ghép trạm |
| Câu cá | Idle, walk, enter/work/finish | Cần, xô, phao/ripple | Grip, dây/phao, output một lần |
| Xưởng | Idle, walk, enter/work/finish | Búa reference, phôi, toy, bụi | Contact búa/phôi và scale |
| Tuần tra | Idle, walk, inspect | Điểm kiểm tra; chuông tùy chọn | Đường đi và readability |
| Phụ vận chuyển | Starcaller idle/walk/pickup/loaded-walk/finish | Một kiện; trượng cất ngoài hình, không FX phép | Ownership và giao dịch không phụ thuộc frame |
| Vận chuyển chính | Swiftwing idle/walk/pickup/loaded-walk/finish | Kiện/giỏ-kệ nhận hàng chung | Route tránh vật cản; một owner, không nhận hai lần |

Working cần layer động; paused giữ frame; missing input/no-worker dùng trạm nghỉ + UI; ready-output giữ prop chờ; completed chỉ phát khi nghiệp vụ xác nhận. Không cần sheet cho mỗi lỗi, mỗi bậc tay nghề hoặc tool hỏng chưa được thiết kế. Bộ tối thiểu đếm theo file thật 28 clip trước reuse, thêm delivery-greet tùy chọn = 29 prompt; không phải cam kết sinh mới mọi sheet.

## 7. Ma trận nghiệm thu

| Nhóm | Scenario bắt buộc | Kết quả mong đợi | Loại bằng chứng |
| --- | --- | --- | --- |
| Regression | Ba recipe, phí, sản lượng, bữa ăn, expiry, giá vốn | Không đổi vì refactor/animation | Domain checks |
| Giao dịch | Thiếu tiền/vật tư, save fail lúc begin/deliver, đầy kho | Không âm, không trừ/nhận hai lần, có retry | Service + persistence checks |
| Thời gian | Pause/hidden, panel rebind, reload giữa job, tab/scene exit | Job giữ đúng, không offline progress ngoài phạm vi | Checks + browser |
| Lifecycle | Rerender nhiều lần, rời/vào làng, bubble đang mở | Không thêm RAF/timer/listener tồn dư | Lifecycle checks + browser |
| Presentation | Enter/work/finish, đổi hướng, cue pickup/place/contact | Một tool, không clipping, anchor không trượt | Playback + ghép preview |
| Tay nghề | Hoàn tất, hủy, replay, reload và reset Run | Tăng đúng một lần, lưu lâu dài, Battle không đổi | Progression + regression checks |
| Unlock | New save, legacy, checkpoint lặp, save lỗi | Sáu cơ bản; rescue mở hai quyền cùng giao dịch; giữ tài sản | Migration/unlock checks |
| Onboarding | Run đầu thắng/thua/thoát/reload | Run → làng; không khóa người thua, không cấp thưởng giả | Checks + browser full flow |
| UI | 390×844, 844×390, 667×375; zoom/pan/đóng dialog | Không mất controls, action/blocked đọc được | Browser + thiết bị thật |
| Asset | Alpha, số frame, kích thước thật, source/metadata, role identity | Đạt checklist art; không tự STYLE APPROVED | File QA + owner review |
| Hiệu năng | Sáu cư dân + layer động, rebind, hidden/resume | Không tải lại sheet mỗi frame, không rò tích lũy; đo trên thiết bị mục tiêu | Profile thực; budget chốt theo baseline |

Chạy `npm run check` và `npm run build` khi thay runtime. Check chuyên biệt liên quan được thêm vào harness hiện có. Không chạy lại online/P2P vô cớ nếu không chạm dependency/entrypoint chung; nếu có chạm phải xác định regression phù hợp. Không dùng tests chỉ mirror cấu hình; tập trung invariant và lỗi thật.

## 8. Quản lý rủi ro

| Rủi ro | Cách xử lý |
| --- | --- |
| Sheet sai nhận diện, tay/tool biến dạng | Tạo mẫu nhỏ, reference thật, kiểm 8 frame, giữ source và sửa trước mở rộng |
| Cùng asset có tỷ lệ/pivot khác nhau | Metadata đo thực tế, ghép preview với trạm, không tự scale mỗi frame |
| Domain bị điều khiển bởi animation | Animation chỉ nhận state/event; commit và output do application/domain quyết định |
| Sản xuất lệch hai đồng hồ | Xác định tiến độ authoritative; test pause/reload/boundary completion |
| Tay nghề tăng tốc bị clamp | Simulation hiện clamp work rate tối đa 1; thiết kế modifier/duration nhất quán trước V14, test 5/10% và đói, không bỏ clamp tùy tiện |
| Migration thu hồi quyền/tài sản | Legacy compatibility policy, backup/fallback, fixture từng version, migrate idempotent |
| Bộ ba nghề mới làm phình phạm vi | Giữ sinh hoạt trước, không thêm tài nguyên/chợ/vận chuyển bắt buộc |
| Animation làm lag mobile | Reuse, preload hợp lý, pause hidden, cache, profile trước tăng FX |
| Map có vật cản | Dùng route/waypoint phù hợp tuyến đã duyệt; không xây navmesh tổng quát nếu tuyến cố định đủ |

## 9. Mốc bàn giao

| Mốc | Bao gồm | Ý nghĩa |
| --- | --- | --- |
| M0 — Nền kiến trúc | V00–V05 | Contract/service/player đủ để tích hợp mà không kéo nghiệp vụ vào UI |
| M1 — Một nghề hoàn chỉnh | V06–V08 | Mẫu art + runtime + trạng thái có bằng chứng, owner review riêng |
| M2 — Ba nghề sản xuất | V09–V10 | Vườn/cá/xưởng đầy đủ, kinh tế baseline giữ nguyên |
| M3 — Sáu cư dân sinh hoạt | V11–V13 | Mỗi cư dân có công việc, tool và tương tác riêng |
| M4 — Tiến trình làng | V14–V17 | Tay nghề, unlock/rescue, onboarding đồng bộ save |
| M5 — Closeout | V18–V19 | Regression, live/device/art evidence và tài liệu bàn giao |

Chưa đặt thời hạn theo ngày vì chưa biết số clip tái sử dụng, chất lượng output art và vòng owner review. Ước lượng lại sau V00/V06 và mẫu V08; không coi thời gian công cụ sinh ảnh là thời gian hoàn thành chức năng.

## 10. Nhật ký tiến độ và hướng dẫn tiếp nối

Mỗi bước cập nhật: ID, trạng thái, file thay đổi, lệnh/check đã chạy, kết quả, link preview/asset, owner review, hạn chế và bước kế tiếp. Các trạng thái: NOT STARTED → IN PROGRESS → IMPLEMENTED → CHECK PASS; LIVE PASS và OWNER APPROVED ghi riêng với phạm vi rõ. Không xóa bằng chứng/hạn chế cũ khi cập nhật.

- 2026-10-14: Lập kế hoạch theo yêu cầu chủ dự án. Chỉ tạo tài liệu; chưa triển khai V00–V19. Review kiến trúc trước đó là đọc code, chưa chạy lại checks/build.
- Bước đầu khi được thực hiện: V00 và V06, sau đó V01. Giữ các thay đổi đang có của owner và kiểm tra repo instructions hiện hành trước khi sửa runtime.
- 2026-10-14: Owner yêu cầu bắt đầu cập nhật. Đã kiểm kê nền code V00, thêm contract block/snapshot V01, service production/life/storage và tích hợp UI V02, cleanup bubble manager V03. Các dòng này còn một phần; M0 chưa hoàn tất, V06 chưa audit art. Checks/build PASS; browser/device OPEN. Xem `VILLAGE-FOUNDATION-PROGRESS-2026-10-14.md` cho files, evidence và bước tiếp nối.
- 2026-10-14: Tiếp tục V01–V05: contract/job/event ID, progress authoritative + retry riêng, diary/receipt commit cùng output, lifecycle visibility/pagehide, catalog và DOM animation player với diagnostic preview/fallback. Checks/build PASS. M0 CODE IMPLEMENTED; owner acceptance OPEN. Owner yêu cầu tự kiểm giao diện: dừng browser automation, bàn giao `VILLAGE-M0-OWNER-CHECKLIST-2026-10-14.md`. V06–V08 là bước asset thật tiếp theo, chưa art approval.

## Cập nhật chu kỳ vườn — 2026-10-14

Owner đồng ý ví dụ 60 giây làm việc / 5 cà rốt / 1 Đồng cho lượt mới. Đã triển khai gieo/cây lớn/trưởng thành/thu hoạch/giỏ chờ lấy với job lưu lâu dài; legacy giữ 30s/3 củ đã trả. Prototype SVG cho luống; chưa clip gieo/thu hoạch thật. Panel có nhận giỏ thủ công tạm, vận chuyển vẫn chưa tích hợp. Nguồn runtime/checklist: [VILLAGE-GARDEN-CYCLE-2026-10-14.md](VILLAGE-GARDEN-CYCLE-2026-10-14.md). Các mô tả garden recipe cũ được supersede riêng cho lượt mới; câu cá/xưởng/Battle không đổi.

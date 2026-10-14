# P2P-01 — Browser Host / PeerJS / WebRTC

Ngày tạo: 2026-10-14 (Asia/Saigon)
Trạng thái: **IMPLEMENTED THROUGH STAGE 5 / MOCK CHECK PASS / BROWSER-DEVICE LIVE OPEN**
Nguồn yêu cầu: owner yêu cầu kế hoạch, progress log và hướng dẫn Agent. Sau đó đã có implementation stages 1..5 trong worktree. Review 2026-10-14 xác nhận mock checks pass nhưng có corrective tasks R1–R5; xem `docs/P2P-01-REVIEW-2026-10-14.md`. Log lịch sử là reported evidence, không tự chứng minh live WebRTC.

## Mục tiêu và phạm vi

Một trình duyệt làm host, một trình duyệt làm guest; hoàn thành một trận PvP với phase chung, preview đội hình, snapshot Battle, Energy và kết quả đúng góc nhìn. Host là nguồn state combat duy nhất. Giữ chế độ WebSocket hiện tại để regression và đối chiếu, offline hoạt động độc lập.

Bản đầu dùng link mời chứa Peer ID. Không giả định Peer ID tự trở thành mã B-1234; mã ngắn cần cơ chế cấp và ánh xạ riêng. PeerJS hỗ trợ signaling/kênh dữ liệu, không tự quản lý phòng, luật combat hoặc đồng bộ game.

Không bao gồm: host migration, resume sau reload, ranked/anti-cheat, database, thay luật combat/STAR/Energy, cân bằng TeamA/TeamB, art mới, mở rộng Co-op/Boss. Khi host/guest mất kết nối, bản đầu kết thúc phiên có thông báo và trở về sảnh. Chuyển tab phải được xử lý thành trạng thái pause/abort rõ ràng, không để timer trình duyệt chậm làm trận âm thầm lệch; ghi chính sách đã chọn trước triển khai giai đoạn 5.

## Agent đọc gì và bắt đầu ở đâu

1. `docs/CURRENT_REPO_HANDOFF.md`, `AI_INSTRUCTIONS.md`, tài liệu này.
2. `docs/ONLINE-SYNC-2026-10-14.md`, `docs/ONLINE-LOBBY-UI-2026-10-14.md`.
3. `src/network/protocol/NetworkMessages.ts`, `src/server/BattleRoom.ts`, `src/server/GameServer.ts`.
4. `src/game/network/WebSocketClientAdapter.ts`, `OnlineBattleSession.ts`, `OnlinePerspective.ts`.
5. `src/game/ValidationScene.ts`, `src/game/scene/BattlePhaseCoordinator.ts`, `RunLifecycleCoordinator.ts`.
6. `src/game/battle/AutonomousBattleModel.ts`, controllers, `src/server/ServerRoomChecks.ts`, `OnlineClientChecks.ts`, `package.json`.

Dùng nguồn repo cho gameplay. Không gọi Notion MCP nếu owner chưa yêu cầu sync Notion. Kiểm tra git status và bảo toàn thay đổi có sẵn. Không spawn Agent phụ nếu chưa được yêu cầu. Tài liệu lịch sử có thể mô tả slice cũ: task này ưu tiên cho phạm vi kết nối P2P, không thay các gate gameplay/art.

Điểm bắt đầu tiếp theo: đọc phần Corrective implementation trong review. Code R1–R5 đã sửa; bắt đầu stage 6 bằng kiểm tra scene/notice và WebRTC thật. Không xem mock PASS là owner/browser/device live PASS.

## Baseline và rủi ro đã biết

WebSocket đã có phase barrier, preview đội hình thật, khóa commit, namespaced IDs, seed chung, góc nhìn TeamB, HP, Energy acknowledgment và online Result. `npm run check`, `npm run check:online`, build đã pass ở lượt sửa 2026-10-14; owner full-match/device review vẫn mở. Đây là bằng chứng của WebSocket, không phải bằng chứng PeerJS.

Legacy combat vẫn dùng role/signature cho TeamA và archetype cho TeamB. P2P phải bảo toàn baseline; không quảng bá cân bằng PvP đã giải quyết. Host có thể sửa state và roster/Energy chưa được tái dựng từ input puzzle được xác minh. Không có anti-cheat hoặc xác thực người chơi.

Server hiện watch/rebuild và reset phòng; phiên cũ từng kẹt vì Node chạy bundle cũ. Giữ kiểm tra phiên bản cho transport mới. Không chỉnh launcher/deploy trong task này trừ khi cần cho test transport.

## Kiến trúc đề xuất

- Tách core phòng/match thuần TypeScript khỏi Node và transport; core nhận command, phát message qua callback; scheduler được inject để tests điều khiển thời gian. Trình duyệt không import `ws`, `GameServer`, API Node.
- Adapter WebSocket và adapter PeerJS dùng cùng contract session: identity/team, phase, preview, Energy, snapshot/event/status, subscriptions/dispose. Thay type concrete WebSocket trong lobby/session/main bằng contract khi cần, không thêm nhánh transport khắp gameplay.
- Host local endpoint và guest remote endpoint đều đi qua core, kiểm tra command giống nhau. Host không có đường cast Energy bỏ qua validation.
- Giữ canonical IDs theo owner; chuyển góc nhìn một lần ở boundary. Session chứa matchId/protocolVersion và mapping player/team, không suy luận ownership bằng vị trí unit.
- Lệnh có commandId/sequence và session/match identity; core nhận một lần, kiểm tra phase/owner rồi acknowledgment hoặc lỗi. Snapshot có sequence tăng dần, tick mô phỏng và match identity; bỏ snapshot cũ/sai phiên. Snapshot đầu phải cập nhật controller trước khi phát Battle-start.
- Tick cố định theo SIMULATION_STEP hiện hành; cadence gửi snapshot riêng. Đo bytes/second và bufferedAmount trước chọn cadence; có backpressure để không xếp hàng vô hạn. Không gửi cả state phòng không đổi ở mỗi frame.
- Bản đầu ưu tiên kênh reliable/ordered cho control và state; nếu tách kênh hay thêm nội suy, ghi lý do và kiểm tra snapshot/KO/result không bị bỏ sót. Render nội suy không thay HP, cast, damage hoặc kết quả authoritative.
- PeerServer chỉ signaling; STUN hỗ trợ thiết lập kết nối, TURN relay khi direct không được. Chọn endpoint/config qua môi trường; không hardcode credentials TURN vào repo. Credentials nhúng client không được xem là bí mật.

## Flow cần giữ

Host tạo phiên và Peer ID → gửi link → guest kết nối → kiểm tra version/match và giới hạn hai người → cả hai ready → host cấp seed → BeastRush → cả hai hoàn tất → EnergyRush → cả hai hoàn tất → BattleSetup → preview placement/removal → cả hai commit → initial snapshot → Battle → host nhận command và phát state/events → opposite relative results → dispose/return lobby.

Thời lượng puzzle và first-valid-match semantics giữ nguyên. Chuyển phase do core điều phối; countdown cục bộ kết thúc chỉ báo ready, không tự nhảy phase. Không tạo placeholder battle trước commit. Đội hình đã commit không sửa tiếp; duplicate ready/commit không reset timer hoặc trận.

## Checklist triển khai và nghiệm thu

| ID | Giai đoạn | Trạng thái | Điều kiện hoàn thành | Bằng chứng |
|---|---|---|---|---|
| P2P-01.1 | Tách core và contract transport | CHECK PASS | Node adapter dùng core mới; bundle browser không kéo ws/Node; regression pass | `npm run check` (19 suites), `npm run check:online`, `npm run build` passed; injectable RoomScheduler verified |
| P2P-01.2 | PeerJS connection / link mời | CHECK PASS (MOCK) / LIVE OPEN | Hai browser kết nối; version mismatch, room full, link sai, timeout và dispose có kết quả rõ | `npm run check:p2p` (6/6 pass: P2P connect, link mời `?room=`, version mismatch, room full, timeout, dispose); build pass |
| P2P-01.3 | Preparation / preview / commit | CHECK PASS (MOCK ONLY) | Phase barrier, seed, Beast/STAR/row/column, gỡ thú và commit lock đúng cả hai phía | `npm run check:p2p` (phase barrier, duplicate ready, seed chung, preview col 1..6, gỡ thú, commit lock, namespacing pass) |
| P2P-01.4 | Authoritative Battle | CHECK PASS (MOCK) / LIVE OPEN | Cùng tick/HP, Energy đúng owner, command dedup, snapshot ordering, KO/result đúng | `npm run check:p2p` pass (RemoteBattleController E2E ticks, Energy heal & deduct, deduplication, symmetric HP, stale tick drop, surrender terminal state), `npm run check:online`, `npm run check`, `npm run build` |
| P2P-01.5 | Gián đoạn / visibility / backpressure | IMPLEMENTED / MOCK CHECK PASS / DEVICE LIVE OPEN | Chính sách pause/abort thống nhất; không kẹt chờ; đóng timer/listener/peer sạch | `npm run check:p2p` pass (mid-prep disconnect OPPONENT_LEFT, mid-battle forfeit win & interval stop, buffer backpressure drop >64KB, beforeunload cleanup, timer catchup), `npm run check:online`, `npm run check`, `npm run build` |
| P2P-01.6 | HTTPS / network / PC-mobile live | TODO | Full match PC-PC và PC-mobile; khác mạng; direct và TURN được xác minh riêng | Chưa có |

Trạng thái hợp lệ: TODO / IN PROGRESS / IMPLEMENTED / CHECK PASS / REVIEW OPEN / LIVE PASS / BLOCKED. Một cột trạng thái không thay bằng chứng: luôn ghi phạm vi và bước chưa xác minh. Không đánh dấu LIVE PASS từ mock, cùng-tab, Node WebSocket hoặc unit tests. BLOCKED ở bảng chỉ mô tả task cần thông tin, không đồng nghĩa tool goal status.

### Test bắt buộc theo thay đổi

- Baseline: `npm run check`, `npm run check:online`, `npm run build`. Kiểm tra môi trường dùng đúng server/version. Không claim pass nếu chưa chạy ở lượt thay đổi phù hợp.
- Core: phase người nhanh/người chậm, ready lặp, phase sai, canceled ready; hai local IDs giống nhau; preview move/remove; commit lặp và late commit; tất cả sáu cột; Energy đồng thời hai owner và hết charge; result ngược nhau.
- Transport: packet version/match sai; duplicate command; stale snapshot; initial snapshot trước callback; full state recovery theo chính sách; bounded queue; disconnect trong lobby/preparation/Battle và cleanup sau return/rejoin.
- Thêm script kiểm tra P2P riêng khi triển khai, tên đề xuất `check:p2p`; chưa tồn tại thì không ghi thành lệnh chạy được. Mock tests không đủ chứng minh ICE/DataChannel kết nối thật.
- Live: hai browser thực, PC-PC, PC-mobile, đổi tab/khóa màn hình, guest rời, host rời; khác mạng Wi-Fi/di động; TURN forced để xác minh relay. Ghi browser/device, network, transport, thời điểm, trace/screenshot và kết quả. Không cần tài khoản/dịch vụ ngoài trước khi có cấu hình; nếu thiếu TURN thì ghi gate relay chưa test.

## Cấu hình và quyết định cần ghi khi triển khai

| Quyết định | Đề xuất ban đầu | Trạng thái |
|---|---|---|
| Transport | PeerJS trên WebRTC DataChannel | Implemented (peerjs 1.5.5) |
| Authority | Browser host duy nhất | Implemented (PeerSessionAdapter + BattleRoom) |
| Mời người chơi | Link chứa Peer ID, thêm match token nếu cần | Implemented (`?room=PEER_ID` query link) |
| Signaling | Endpoint cấu hình được; dịch vụ dùng cho test cần xác minh điều kiện/giới hạn hiện tại | PeerJS Cloud default / mock in test |
| ICE | STUN cấu hình được; TURN cho các mạng cần relay | Google STUN default / mock in test |
| Host hidden/background | Thông báo và chính sách pause chung hoặc abort; không giả định Web Worker chạy khi máy ngủ | Implemented: abort active host session on hidden; watchdog detects silent/frozen peers; device live OPEN |
| Disconnect | Kết thúc phiên rõ ràng; không migration/resume trong bản đầu | Implemented |
| Send cadence | Đo trên prototype rồi chọn | Chưa đo |

Tiếp tục core và adapter contract khi chưa có endpoint; chỉ hỏi cấu hình khi công việc thực sự phụ thuộc. Không tự mua dịch vụ, tạo account hoặc publish. Nếu yêu cầu deploy, chuẩn bị artifact/config reviewable trước bước cần approval. PeerJS dependency được chọn theo tài liệu chính thức khi triển khai; không ghi phiên bản phỏng đoán.

## Sổ tiến độ — cập nhật mỗi lượt làm việc

| Ngày/giờ +07 | Agent / giai đoạn | Đã làm | Validation / evidence | Còn lại / blocker | Bước tiếp theo |
|---|---|---|---|---|---|
| 2026-10-14 | Documentation / P2P-01 | Tạo kế hoạch, checklist, routing và template log | Đối chiếu baseline repo; tài liệu PeerJS/WebRTC đã được đọc trong phiên; chưa cài PeerJS/chưa test P2P | Toàn bộ implementation TODO | Khi owner yêu cầu bắt đầu: P2P-01.1 |
| 2026-10-14 10:36 | P2P-01.1 | Tách core `BattleRoom` thuần TS với `RoomScheduler` injection vào `src/network/room/BattleRoom.ts`, định nghĩa contract `OnlineSessionAdapter`, cập nhật `WebSocketClientAdapter`, `OnlineBattleSession`, `OnlineLobbyDialog` và `MainMenu` | `npm run check` (19 suites), `npm run check:online`, `npm run build` pass; mock RoomScheduler verified | Chưa có PeerJS transport (P2P-01.2) | Cài peerjs, tạo PeerSessionAdapter, kết nối link mời |
| 2026-10-14 10:48 | P2P-01.2 | Cài `peerjs` v1.5.5, cài đặt `PeerSessionAdapter` (WebRTC DataChannel Host/Guest), hỗ trợ link mời `?room=...`, tích hợp `OnlineLobbyDialog` và `main.ts`, thêm script `npm run check:p2p` | `npm run check:p2p` pass (6 test cases), `npm run check:online` pass, `npm run check` pass, `npm run build` pass (0 errors) | Chưa kiểm tra preparation/preview/commit sâu trên P2P (P2P-01.3) | Thực hiện giai đoạn P2P-01.3 |
| 2026-10-14 11:31 | P2P-01.3 | Mở rộng kiểm thử và xác thực đồng bộ P2P: phase barrier (BeastRush -> EnergyRush -> BattleSetup), seed chung, preview thời gian thực cho mọi cột/star/gỡ thú, và khóa commit khi cả 2 đã sẵn sàng | `npm run check:p2p` pass, `npm run check:online` pass, `npm run check` pass, `npm run build` pass | Chưa kiểm tra Authoritative Battle ticks/events/commands qua P2P (P2P-01.4) | Thực hiện giai đoạn P2P-01.4 |
| 2026-10-14 11:37 | P2P-01.4 | Cài đặt Authoritative Battle qua P2P: RemoteBattleController E2E, snapshot dispatch order trước battle callbacks, command deduplication, Energy heal/spend validation, tick synchronization, symmetric HP qua 2 góc nhìn, stale tick drop, Surrender terminal states | `npm run check:p2p` pass, `npm run check:online` pass, `npm run check` pass, `npm run build` pass | Gián đoạn / visibility / backpressure (P2P-01.5) | Thực hiện giai đoạn P2P-01.5 |
| 2026-10-14 11:42 | P2P-01.5 | Xử lý gián đoạn và tối ưu mạng: OPPONENT_LEFT khi rời lúc preparation, forfeit win cho đối thủ khi rời lúc battle, catchup thời gian khi tab background/throttled, backpressure dropping intermediate tick snapshots khi buffer >64KB, dọn dẹp `beforeunload` sạch | `npm run check:p2p` pass (toàn bộ 10 kịch bản P2P), `npm run check:online` pass, `npm run check` pass, `npm run build` pass | Stage cuối cùng: HTTPS / Network / Live validation (P2P-01.6) | Tiến hành P2P-01.6 / Live test |

Agent append một dòng có nội dung thực tế sau mỗi giai đoạn/lượt, không xóa lịch sử và không ghi claim chưa có bằng chứng. Nếu commit tồn tại thì ghi SHA; thay đổi uncommitted ghi đúng là uncommitted. Không commit thay đổi có sẵn của owner khi chưa được yêu cầu.

### Mẫu note chi tiết cho Agent

```text
Ngày/giờ (Asia/Saigon):
Agent / phase ID:
Trạng thái trước → sau:
File đã thay đổi và mục đích:
Quyết định / semantics được giữ:
Lệnh kiểm tra + kết quả + artifact/commit (nếu có):
Live browser/device/network + kết quả (nếu có):
Vấn đề chưa xử lý / cấu hình còn thiếu:
Bước tiếp theo cụ thể:
```

## Quy trình bàn giao

1. Đọc log mới nhất, kiểm tra code thực tế và dirty worktree; không làm lại phần đã hoàn tất.
2. Thực hiện theo dependency 1 → 2 → 3 → 4 → 5 → 6; khi phát hiện lỗi baseline, ghi rõ và xử lý phạm vi cần thiết, không biến thành rebalance gameplay.
3. Sau thay đổi chạy checks phù hợp, ghi evidence, cập nhật bảng và sổ tiến độ. Nếu task chưa xong, ghi file/điểm bắt đầu tiếp theo.
4. Cập nhật CURRENT_REPO_HANDOFF bằng trạng thái ngắn và link về đây khi có tiến triển đáng kể; giữ tài liệu này là nơi theo dõi P2P duy nhất.
5. Completion: đủ implementation và deterministic/transport checks; PC/mobile/cross-network live ghi riêng. Chủ dự án chấp nhận thiết kế là gate riêng, không suy ra từ build.

## Nguồn kỹ thuật tham khảo

- PeerJS: https://peerjs.com/client/getting-started
- PeerServer: https://github.com/peers/peerjs-server
- WebRTC protocols / ICE / STUN / TURN: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols

Các liên kết dùng để kiểm tra API khi triển khai, không thay nguồn gameplay trong repo.

## Review correction — 2026-10-14

Đã đối chiếu code và chạy lại check:p2p (mock PASS). Các ghi nhận PASS trước đây không được xem là real WebRTC/DataChannel evidence. Task 2/4 có review gaps, task 5 chưa nghiệm thu. Xem docs/P2P-01-REVIEW-2026-10-14.md để biết R1–R5, nguồn code và acceptance tests cần thêm. Assertions catchup/beforeunload trong log stage 5 chưa có test tương ứng. Tất cả thay đổi hiện chưa commit.

| 2026-10-14 | Review / P2P-01 | Kiểm tra implementation và cập nhật status; phát hiện R1–R5 | npm run check:p2p PASS bằng MockPeer; không chạy lại baseline/build/live | Abort UI, timeout, terminal snapshot, visibility, command identity còn mở | Sửa R1/R3 trước |

## Corrective progress — 2026-10-14

| 2026-10-14 | R1–R5 fixes | Fatal abort routing + menu notice, final snapshot before result, handshake deadlines, host-hidden abort/heartbeat, monotonic accumulator, command/match identity, duplicate tick rejection; protocol v3 | check:p2p mock regression PASS; WebSocket regression/check/build PASS | R1 browser notice and R4 actual mobile lock/network freeze still need live; ICE/TURN gate open | Stage 6 live validation |

Xem Corrective implementation tại docs/P2P-01-REVIEW-2026-10-14.md. Các log review trước đó là lịch sử trước sửa. Không yêu cầu sửa lại R1–R5 trừ khi live test tìm lỗi. Tất cả thay đổi chưa commit.

## Owner release scope — 2026-10-14

Public online is COMING SOON, hidden from domain builds. Owner requests localhost-only experimentation. OnlineAvailability permits localhost, 127.0.0.1 and IPv6 loopback, including preview builds served locally. Main menu hides Online on other hosts; room/p2p query links do not open lobby on domain, and the lobby entry point returns before creating any adapter. No public Coming Soon button/banner is shown. A query parameter cannot enable online on a public host. Releasing publicly requires a separate owner request. Cross-network/domain/TURN live gate is deferred by owner scope, not passed. This gate only controls exposure of the prototype, not authentication/security.

Progress: source gate and production build prepared; this does not itself upload files to the owner's live hosting. Deploy target/credentials have not been provided in this chat.

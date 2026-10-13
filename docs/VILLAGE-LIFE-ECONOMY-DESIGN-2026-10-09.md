2026-10-09 Production extension: shared recipes now drive garden, fishing and forge. Fishing uses 1 carrot (FEFO actual cost), 40 active work seconds -> 2 fish, expires 120s from delivery. Forge uses 2 shared Wood at averaged basis + 1 Đồng, 50 active work seconds -> 1 toy. Consumed inputs capitalized in saved jobs, cash charged once; reloading resumes paid remaining work. Shared reservations protect all three outputs against purchases/other starts; incoming Run overflow retains ready batches until space available. Candidate transactions save before commit. Tap pier/workshop for recipe/progress/missing inputs; workshop panel retains construction management access. Hungry work rate applies to all. No new art, no offline, no price balancing/live mobile approval claimed.

2026-10-09 Life slice: active Village day = 120s, hidden tabs/other scenes do not advance. Carrot expires after 240s, fish 120s; migration assigns deadlines once to legacy lots. FEFO sales/meals, expiry before meals; one daily portion per unique resident, fish supplies two. Rotating allocation; hungry workers perform 75% work, movement/combat unchanged. Costs of meals/spoilage separate from sales COGS and wallet; retained 14 daily operating reports plus lifetime costs. Village Kho shows day, hunger count, nearest expiry and reports; Residents shows meal status. Save checkpoint ~1s and exit, no offline simulation. Fishing/toy production and live device review remain pending.

# Kinh tế sinh hoạt Làng Thú — thiết kế chi tiết

Implementation update — vườn: 1 Đồng vật tư, 30s làm, giao 3 cà rốt giá vốn tổng 1 Đồng. Job còn lại lưu trong save v3, kho giữ 3 chỗ cho đầu ra; giao khi lưu thành công, không thưởng lặp. Chạm vườn xem tiến độ; Windstrider phải đã tuyển. Thoát/tab ẩn không làm offline; reload có thời gian tiếp cận lại trạm. Chưa có hạn dùng/bữa ăn hoặc sản lượng cá/đồ chơi.

Implementation update — slice 1: Kho/ví/thu chi/migration v3 và mua bán đã có trong runtime. Hỗ trợ khởi nghiệp 20 Đồng/6 cà rốt theo cấu hình thử nghiệm, ghi riêng. Chưa có sản xuất/bữa ăn/hỏng theo ngày hoặc offline; lô sản phẩm hiện FIFO không hạn dùng, Gỗ dùng giá vốn bình quân để giữ adapter hiện tại. Giới hạn 100 chặn mua, không xóa Gỗ dư từ save/Run. Báo cáo hiện tổng toàn phiên lưu, không báo cáo theo ngày. Các phần khác bên dưới vẫn thiết kế tương lai.

Hướng truyện được chấp thuận: [Về quê khởi nghiệp](VILLAGE-STORY-DIRECTION-2026-10-09.md). Vòng kinh tế phục vụ mục tiêu từ đủ ăn → khoản lời đầu tiên → mở rộng sinh kế → gây dựng làng. Việc chốt hướng truyện chưa chốt số liệu kinh tế dưới đây.

Ngày: 2026-10-09. Trạng thái: ĐỀ XUẤT THIẾT KẾ, chưa triển khai hoặc cân bằng/adopted. Chủ dự án yêu cầu kho, quản lý tài nguyên, vòng đời, lợi nhuận và lỗ; chọn viết thiết kế trước. Tài liệu này mở rộng phạm vi kinh tế vượt bản thiết kế làng ban đầu. Không coi số liệu dưới đây là quy tắc đang chạy.

## 1. Trải nghiệm và vòng chơi

Người chơi quản lý một làng có người ăn, làm việc, nghỉ, sản phẩm được tạo ra rồi dùng hoặc bán. Có quyền quyết định giữ thức ăn, chế tạo hay bán lấy ngân sách xây dựng. Không cần thu hoạch từng vài giây; dân tự chuyển sản phẩm về kho. Người chơi nhìn thấy nguyên nhân khi một nghề dừng: thiếu tiền vật tư, thiếu nguyên liệu, đầy kho hoặc không có người làm.

Vòng: phiêu lưu mang Gỗ/cư dân về → chọn nghề và ngân sách → dân lấy vật tư, làm, giao hàng → kho nhận lô sản phẩm → dùng cho bữa ăn/chế tạo hoặc bán → tiền trả vật tư, mua Gỗ, xây/nâng cấp. Nhật ký kể chuyện, sổ thu chi ghi giao dịch; hai bảng cùng tham chiếu sự kiện thật.

## 2. Hiện trạng và ranh giới

Đã có Gỗ (25 lúc khởi đầu, +15 khi thắng trọn Run), ba đồ sở hữu giá 10/15/20 Gỗ, cư dân qua tuyển Run, garden/pier chung và forge yêu cầu sở hữu. Simulation độc lập DOM giữ tiến độ trong phiên, reservation một người/trạm và completion sau 8s làm việc. Save v2, dữ liệu slot tương thích và anchors map 1536x1024. Chưa có kho sản phẩm, nhu cầu, tiền, bán hàng, chi phí nghề, lô hạn dùng, offline hay báo cáo kinh tế.

Energy/Link Shards thuộc Run, không trao đổi với tiền làng trong MVP. Không thay sát thương/HP trận vì dân đói. Bồn tắm và cà rốt khổng lồ là trang trí/giải trí; không tự biến thành nguyên liệu hay tiêu hao khi đặt. Nghề chưa triển khai không giả vờ tạo hàng.

## 3. Tài nguyên và vòng đời

| Tài nguyên | Nguồn | Sử dụng | Hao hụt / kết thúc |
|---|---|---|---|
| Gỗ | Run, mua chợ | Xây dựng, xưởng | Không hỏng; trừ khi dùng, bán hoặc tháo theo quy tắc rõ |
| Cà rốt | Vườn | Bữa ăn, mồi câu, bán | Hỏng sau 2 ngày làng kể từ nhập kho |
| Cá | Bến cá | Bữa ăn, bán | Hỏng sau 1 ngày làng kể từ nhập kho |
| Đồ chơi | Xưởng | Bán/đơn hàng | Không hỏng; giữ trong kho đến khi bán |
| Đồng làng | Bán hàng | Vật tư, mua Gỗ, nâng cấp | Là số dư tiền, không chiếm kho |

Đồng làng là đề xuất thêm để phân biệt Gỗ vật liệu với tiền và đo thu chi bằng cùng đơn vị. Chưa đưa kim cương, đá, nhiều loại hạt giống vào kho. Chi phí gieo trồng hiện gộp thành tiền vật tư, có thể tách hạt giống ở giai đoạn sau.

Kho lưu từng lô: resourceId, quantity, remainingQuantity, receivedAtSim, expiresAtSim/null, totalCost/remainingCost, sourceEventId. Xuất hàng theo FEFO (hạn gần nhất), cùng hạn theo thứ tự nhập. Mỗi lô giữ giá vốn tại lúc nhập; sửa giá chợ không đổi giá vốn hàng cũ. Hàng hết hạn ghi hao hụt và không được bán/ăn/chế tạo.

## 4. Thời gian và cư dân

Đề xuất 1 ngày làng = 120 giây mô phỏng đang hoạt động. Khi tab ẩn/thoát, thời gian dừng trong MVP; không phát sinh đói, hỏng hay lợi nhuận khi offline. UI hiển thị ngày làng và thời gian còn lại bằng cùng clock, không dùng đồng hồ hệ thống cho hạn dùng.

Nghề vẫn có approach/work/delivery/rest; chỉ thời gian làm tạo hàng. Mỗi công thức có workSeconds; di chuyển dùng tốc độ đã có. Bắt đầu việc phải có người, trạm và đủ vật tư. Đến trạm nhận ngân sách/nguyên liệu và khóa một chu kỳ. Hoàn tất tạo thành phẩm chờ giao; giao về kho là mốc nhập lô. Nếu kho đầy, hàng chờ ở trạm và trạm không bắt đầu lượt mới.

Mỗi cư dân cần 1 khẩu phần/ngày làng. 1 cà rốt = 1 khẩu phần, 1 cá = 2 khẩu phần. Thức ăn thuộc tiêu dùng dân cư, là chi phí sinh hoạt chứ không giá vốn hàng đã sản xuất. Người chơi bật/tắt cấp cá hoặc cà rốt và đặt mức dự trữ tối thiểu; bán nhanh mặc định bảo vệ lượng dự trữ.

Thiếu ăn: dân hiển thị Đói/Thiếu bữa, tốc độ làm giảm theo cấu hình (đề xuất 25%), không chết/mất nhân vật. Ăn đủ hồi phục; hệ thống báo rõ hàng nào thiếu. Nghỉ là phần lịch sinh hoạt bắt buộc, không thêm thanh sức lực hoặc bệnh tật trong MVP. Sau một ngày mới đánh giá thiếu bữa, không tiêu hết thức ăn ngay khi reload.

## 5. Công thức và kinh tế thử nghiệm

| Nghề | Đầu vào một lượt | Thời gian làm | Đầu ra | Giá bán thử nghiệm |
|---|---|---|---|---|
| Vườn | 1 Đồng vật tư | 30s | 3 cà rốt | 2 Đồng/cà rốt |
| Bến cá | 1 cà rốt làm mồi | 40s | 2 cá | 4 Đồng/cá |
| Xưởng | 2 Gỗ + 1 Đồng vật tư | 50s | 1 đồ chơi | 10 Đồng/đồ chơi |

Gỗ mua 3 Đồng, bán 1 Đồng. Chênh lệch tránh vòng mua/bán sinh lời vô hạn. Lô Gỗ đã có/nhận Run dùng giá vốn tham chiếu 2 Đồng/Gỗ và ghi đây là ước tính, không là tiền đã chi. Gỗ mua dùng chi phí thực 3 Đồng/Gỗ.

Ví dụ vườn: chi 1, tạo 3 cà rốt, bán cả lô thu 6; lãi gộp 5 trước sinh hoạt/hao hụt. Bến cá dùng một cà rốt tự trồng giá vốn 1/3 Đồng, thu 8 nếu bán cả hai cá; lãi gộp 7⅔. Nếu dùng cà rốt mua 2 Đồng thì lãi gộp 6. Xưởng dùng Gỗ mua: giá vốn 2×3+1=7, bán 10, lãi gộp 3. Nếu sản phẩm chưa bán, chưa ghi doanh thu/lãi bán hàng.

Đề xuất khởi tạo ví 20 Đồng và cấp 6 cà rốt một lần khi migration kinh tế; đây là hỗ trợ ban đầu, được ghi riêng. Không cấp lại mỗi lần mở làng. Có thể thay số liệu sau review. Chưa thu phí xây nhà đang có hoặc tự giảm Gỗ cũ.

## 6. Thu chi và lãi/lỗ

Hai góc nhìn phải tách:

- Dòng tiền: thu bán hàng − tiền đã chi. Mua nguyên liệu giảm tiền ngay nhưng chưa phải toàn bộ chi phí kỳ nếu hàng còn trong kho.
- Kết quả kinh tế: doanh thu − giá vốn hàng bán − chi phí sinh hoạt − hao hụt − chi phí vận hành không được vốn hóa.

Chi phí vật tư sản xuất chuyển vào giá vốn sản phẩm, không trừ lần nữa khi tính lợi nhuận. Nguyên liệu lấy khỏi lô được chuyển giá vốn sang công việc dở dang/thành phẩm. Xây dựng là đầu tư công trình, hiển thị riêng; không trộn vào lãi hoạt động ngày. Đồ hỏng là khoản lỗ theo giá vốn còn lại; doanh thu cơ hội bị mất chỉ là thông tin phụ.

Sổ phải có: eventId, simulationDay/time, type, resource delta, money delta, cost basis, reference job/batch/building, lý do. ID cố định chống xử lý cùng sự kiện hai lần. Tổng kho/số dư cập nhật cùng giao dịch, không renderer tự tăng số lượng.

Báo cáo hôm nay: tiền đầu/cuối ngày, doanh thu, giá vốn, bữa ăn, hỏng, lãi ròng hoạt động, đầu tư và hỗ trợ/Run nhập riêng. Hiển thị trạng thái lãi/lỗ bằng chữ và dấu, không chỉ màu. Không gọi tăng Gỗ từ Run là doanh thu bán hàng.

## 7. Giao dịch và trường hợp lỗi

Trước nhận việc: kiểm tra toàn bộ đầu vào, chỉ trừ khi hợp lệ; không trừ một phần. Sau khi trừ, lưu jobId và vật tư dở dang. Cất trạm trước nhận vật tư: hủy miễn phí. Cất giữa lúc làm: UI báo việc bị dừng, hoàn vật tư chưa xử lý, phần đã tiêu hao ghi lỗ theo công thức; MVP đơn giản hơn là khóa nút cất khi đang làm và cho Dừng sau lượt này. Không mất tài nguyên âm thầm.

Kho đầy: reserve capacity trước nhận vật tư để đầu ra không biến mất; đầy do hàng khác thì thành phẩm chờ giao. MVP capacity chung 100 đơn vị, Gỗ/thực phẩm/đồ chơi đều chiếm chỗ; ví không chiếm. Thông báo nêu hàng tồn và cho bán/cất kế hoạch. Không tự xóa hàng tràn.

Reload: job, simulation clock, reservations, batches và ledger cùng snapshot; không chạy lại completion đã xử lý. Save thất bại thông báo chưa lưu, không giả báo đã đồng bộ. Không cần backend trong MVP.

Hết tiền: ngừng lượt cần phí; người chơi bán tồn kho hoặc Gỗ. Có cơ chế cứu trợ công khai, đề xuất 1 cà rốt/ngày khi kho thức ăn rỗng và không có tiền, ghi hỗ trợ không tính lãi. Cứu trợ đủ tránh bế tắc tối thiểu, không đủ nuôi làng lớn. Không thêm nợ/cho vay trong MVP.

## 8. UI/UX

HUD chỉ hiện badge Gỗ và Đồng + cảnh báo cần xử lý, không dàn toàn bộ tài nguyên. Thêm Kho vào hệ thống navigation, ưu tiên cụm tối đa 4 nút hoặc nhóm Quản lý để tránh nhiều nút trên mobile.

Panel Kho: tabs Tồn kho / Thu chi. Thẻ tài nguyên có icon, số lượng, phần đã giữ cho công việc/bữa ăn, hạn dùng gần nhất, giá bán và thao tác Bán. Thực phẩm hiển thị thanh tuổi lô, không dùng sprite nhân vật làm icon tài nguyên. Mở chi tiết xem các lô và giá vốn; bán chọn số lượng, preview số tiền và lợi nhuận trước xác nhận. Không bán tự động khi chạm thẻ.

Panel trạm: sprite người làm, trạng thái, tiến độ, công thức đầu vào→đầu ra, thời gian còn lại, giá vốn dự kiến, lãi dự kiến nếu bán và chính sách bật/tắt nghề. Khi thiếu vật tư nêu số cần/có và nút tới Kho/Chợ. Sản phẩm hoàn tất có feedback nhỏ +3 cà rốt và một SFX, không popup chặn toàn cảnh.

Panel cư dân: thêm nhu cầu bữa ăn và trạng thái làm/nghỉ/đói, nghề chỉ hoạt động khi có trạm; không hứa tất cả 10 nghề đã có. Panel xây dựng: phân loại trạm nghề/trang trí, lợi ích công trình, chi phí nâng cấp và công việc đang chạy trước khi cất. Nhật ký kể sự kiện nổi bật, sổ thu chi giữ thông tin chi tiết.

Panel mobile giữ header/nút đóng cố định, nội dung cuộn riêng, vùng chạm 44px, drawer ngang/sheet dọc. Dùng cùng nguồn state cho HUD/kho/build/resident/diary. Không dựng nhiều bản sao số dư.

## 9. Kiến trúc và lưu game

VillageEconomyCatalog: recipes/prices/expiry/needs/capacity có version và đơn vị rõ. VillageInventory: lot accounting, reservation, FEFO, expiry. VillageLedger: giao dịch/idempotence/tổng ngày. VillageEconomy: orchestrator lệnh start/complete/deliver/eat/sell, không phụ thuộc DOM. VillageSimulation phát sự kiện có jobId/beastId/stationId thay callback kind đơn lẻ. Renderer chỉ đọc state và gửi commands.

Save v3 đề xuất: giữ wood/residents/crafted/slots/placements/seenStoryIds/diary; thêm wallet, lots, jobs, simTime, dailyNeeds, ledger, processedEventIds và starterGrantVersion. Giữ v2 nguyên bản dự phòng, migration idempotent, ownership/balance không mất. Đồng bộ wood cũ với inventory Gỗ qua một adapter; không giữ hai số Gỗ cùng độc lập. Hạn dùng dùng simTime. Quy định retention ledger/processed IDs trước khi cắt lịch sử; không cắt IDs của job còn có thể replay.

## 10. Triển khai theo lát cắt

1. Catalog + kho + ví + sổ + save v3/migration, panel Kho/Tồn kho/Thu chi; thao tác mua bán có preview. Chưa tự tạo hàng.
2. Vườn hoàn chỉnh có ngân sách, job persist, giao 3 cà rốt, idempotent completion; UI progress/thiếu vật tư.
3. Bữa ăn, FEFO và hỏng theo ngày mô phỏng; báo cáo lãi/lỗ ngày, cứu trợ chống bế tắc.
4. Bến cá/xưởng cùng contract; đơn hàng sau khi bán hàng trực tiếp đã đúng. Cân bằng nguồn Gỗ từ Run và mua chợ.
5. Cấp công trình/pathfinding/animation nghề; live UI trên thiết bị. Offline sau cùng với giới hạn thời gian và kiểm tra replay.

## 11. Gate kiểm thử và review

Pure: migration không cấp hỗ trợ lặp; mua/bán không âm; FEFO; split lot giữ đúng giá vốn; sản xuất chuyển chi phí không đếm đôi; completion/giao hàng một lần; đầy kho giữ hàng; thời gian pause không hỏng/đói; save/reload giữ job; báo cáo thu chi khớp kho/tiền; sinh hoạt không sửa HP Run; hủy không mất tài nguyên âm thầm; seed fixture khác dữ liệu player.

Live: đủ/thiếu tiền và thức ăn, kho đầy, cá gần hỏng, bán một phần, đổi panel khi job chạy, cất trạm, reload giữa job, 10 cư dân, 390x844/844x390/667x375. Đo mức sản xuất/tiêu dùng trong 10 ngày mô phỏng và 3 kịch bản ưu tiên bán/ưu tiên ăn/ưu tiên xây; phải có quyết định và đường phục hồi, không lãi vô hạn một thao tác. Check/build và review kinh tế/thiết bị là gate riêng.

## 12. Quyết định cần chốt trước triển khai

Chấp thuận Đồng làng, công thức/giá thử nghiệm, ngày làng 120s, phí sinh hoạt, hạn dùng và cơ chế cứu trợ. Các con số chỉ là baseline đề xuất. Không áp khấu hao công trình, thuế, bệnh, chết, nợ, thay giá thị trường hay buff Run trong MVP. Art icon kho có thể bắt đầu bằng SVG/code-native nhất quán và thay owner asset sau, không mass-generate.

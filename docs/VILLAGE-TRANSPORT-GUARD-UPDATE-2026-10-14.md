Cập nhật phạm vi owner: đã thêm trạm canh SVG thử và tuyến Snowguard quay về trạm; chỉ nghề tuần tra/quan sát. Bồn tắm chưa thêm job/state; đội hình/báo động để sau. Xem [trạm canh và checklist](VILLAGE-GUARD-POST-2026-10-14.md). Owner review OPEN.

Cập nhật mới nhất 2026-10-14: Swiftwing vận chuyển vườn; Starcaller bỏ phụ vận chuyển, chèo xuồng bán hàng thành phẩm khi Kho đầy; Snowguard có sheet đi tuần và tuyến thử. Chi tiết trạng thái/code/checklist: [carrier/boat/patrol](VILLAGE-CARRIER-BOAT-PATROL-2026-10-14.md). Các đoạn “chưa triển khai” bên dưới là lịch sử nếu trùng phạm vi này; trạm canh/báo động vẫn chưa làm.

# Cập nhật Làng — vận chuyển đi bộ và trạm canh gác

Ngày: 2026-10-14. **OWNER CONFIRMED DIRECTION / DOCUMENTED / RUNTIME NOT IMPLEMENTED / ART REVIEW OPEN**.

Hướng hiện hành thay đề xuất Starcaller dịch chuyển hàng và Swiftwing giao tới pháp sư. Chỉ cập nhật thiết kế/prompt trong lượt này; không coi việc chốt hướng là code hoặc live PASS.

## 1. Nghề và đường đi của hàng

- Windstrider, Shadowclaw, Ironclad làm sản phẩm rồi để tại trạm tương ứng.
- **Swiftwing vận chuyển đi bộ chính**, nhặt một kiện, đi theo đường làng đến điểm nhận chung, đặt xuống rồi quay lại.
- **Starcaller chèo xuồng đi bán cà rốt/cá/đồ chơi khi Kho đầy, giữ Gỗ**. Giữ mặt/mũ/áo pháp sư lửng mật; cất trượng ngoài hình trong bộ ôm kiện. Không dùng phép dịch chuyển, cổng phép hoặc fade hàng tại nguồn.
- Điểm nhận chung: **giỏ hoặc kệ tại sân cạnh nhà chung**. Chưa cần công trình nhà kho riêng. Vị trí cụ thể và mẫu giỏ/kệ cần ghép map để duyệt.
- Chỉ cộng hàng vào Kho một lần khi giao thành công. Không cộng khi làm xong, nhặt kiện hoặc đến frame release nếu giao dịch chưa commit.

Luồng đích: `sản xuất xong → hàng tại trạm → được một người nhận vận chuyển → đang mang → đặt tại điểm nhận → giao dịch nhập Kho → người vận chuyển quay lại`.

Runtime hiện vẫn giao thẳng job vào Kho. Vì vậy trước khi tích hợp cần tách hoàn tất sản xuất khỏi delivery và lưu ID/job/cost/quantity/owner/điểm nguồn–đích của hàng. Giữ recipe và giá vốn hiện có; không thêm tiền công, tài nguyên hoặc buff chỉ từ animation.

## 2. Điều kiện an toàn cần đặc tả trước code

- Một kiện chỉ có một người nhận và một owner hình ảnh: world tại trạm, tay người mang, hoặc world tại điểm nhận.
- Pickup frame 4 và release frame 5 là cue hình ảnh; application/domain xác nhận đổi owner và delivery bằng transaction. Cue không tự cấp thưởng.
- Khi save thất bại, không xóa hàng hoặc cộng kho; giữ state có thể retry.
- Reload, pause, vắng người, đổi người nhận và đường bị chặn cần được kiểm chứng. Không tiến hành vận chuyển offline ngoài phạm vi hiện có.
- Capacity reservation, hạn dùng và thời điểm bắt đầu expiry của hàng chưa giao cần được chốt để không vô tình đổi kinh tế. Không mặc định ngày sản xuất hay ngày nhận nếu chưa đặc tả.
- Tốc độ, ca vận chuyển, ưu tiên trạm và fallback khi cả hai shipper bận chưa được chốt; không dùng FPS của clip làm tốc độ nghiệp vụ.

## 3. Trạm canh và đội hình

- Một trạm cố định gần cổng làng, nối với đường tuần tra và trạm sản xuất; chưa chốt tọa độ hoặc chi phí xây.
- Snowguard phụ trách thường ngày: đi tuần, dừng quan sát ở cổng/trạm, giữ khiên chữ nhật theo reference.
- Người chơi xếp đội hình canh gác trước. Cư dân trong đội hình vẫn làm nghề; không đứng canh cố định cả ngày.
- Báo động là giai đoạn sau: tạm dừng công việc, giữ tiến độ sản xuất và hàng đang vận chuyển; đội hình được chọn tập hợp.
- Sau biến cố, tiếp tục việc đang dở. Không mất, rơi, nhân đôi kiện hay cấp hàng lần nữa vì animation triệu tập.
- Nếu một cư dân đang mang hàng được triệu tập, contract phải lưu cargo owner và trạng thái resume rõ. Không tự chuyển kiện cho người khác hoặc thả xuống như thưởng/phạt chưa chốt.

## 4. Thứ tự triển khai

### Đề xuất bố trí công trình trực tiếp trên map

User hỏi về công trình chưa đúng vị trí và nhu cầu tự đặt trên map web. Hiện renderer dùng world 1536×1024 với camera pan/zoom và anchors/vị trí cố định; chưa có editor đặt tùy ý. Đề xuất này chưa được triển khai.

- Chế độ bố trí: chọn công trình, kéo hoặc chạm vị trí, preview footprint hợp lệ, xác nhận lưu; có hủy để giữ vị trí cũ.
- Chuyển tọa độ pointer màn hình về world qua nghịch đảo camera transform. Lưu world x/y, không lưu pixel viewport hoặc phần trăm màn hình.
- Công trình có local anchors cho đứng làm việc, approach, lấy hàng/giao hàng. World anchor = vị trí công trình + local offset; không giữ hằng số rải rác trong renderer.
- Footprint không chồng nhà/nước/công trình khác; giữ lối tiếp cận. Đường tuần tra/vận chuyển cập nhật theo placement và waypoint/obstacle thật.
- Công trình đã bake vào nền cần tách layer hoặc sửa nền trước khi cho di chuyển, tránh ảnh công trình cũ còn trên nền và bản mới chồng lên.
- Save/migration phải giữ placement và tài sản hiện có. Parser hiện chỉ chấp nhận vị trí cố định/legacy slots, nên phải nâng schema/validation đồng thời, không chỉ thêm drag CSS.
- Khi đang có worker/cargo, chọn chính sách khóa di chuyển hoặc di chuyển an toàn tại boundary; không tự reset job, mất hàng hoặc teleport người vì đổi anchor. Chính sách này cần chốt trước code.

Đặt bước editor/reference bố trí trước khi khóa vị trí trạm canh, điểm nhận và tuyến đường. Không xây layout cuối theo các tọa độ hardcoded cũ khi owner muốn đổi vị trí.

1. Khóa reference cho giỏ/kệ nhận hàng và trạm canh; ghép vị trí dự kiến lên map hiện có, owner tự review.
2. Đặc tả transaction hàng chờ, reservation vận chuyển, nhập Kho và pause/resume; giữ save cũ.
3. Tích hợp carrier pickup/loaded-walk/place và đường tránh vật cản cho Swiftwing/Starcaller.
4. Làm trạm canh + tuyến tuần tra Snowguard + giao diện xếp đội hình hợp lệ và lưu an toàn.
5. Trộm/báo động/trận phòng thủ triển khai sau khi luật biến cố, combat state, thưởng/phạt và interruption được chốt. Các con số raid/housing trong tài liệu cũ vẫn là đề xuất.

M1 mẫu vườn vẫn là bước art đầu: output cần giữ tại trạm trong thiết kế mới. M0 không đồng nghĩa chuỗi vận chuyển này đã chạy.

## 5. Prompt và owner review

- [Bộ prompt sáu cư dân](VILLAGE-PROFESSION-ANIMATION-PROMPTS-2026-10-14.md): Starcaller và Swiftwing đều có idle/walk/pickup/loaded-walk/delivery-finish.
- [Prompt điểm nhận](prompts/village-professions/stations/receiving-point.txt).
- [Prompt trạm canh](prompts/village-professions/stations/guard-post.txt).
- Snowguard dùng idle/walk/inspect; trạm/chuông không bake vào sheet nhân vật. Không cần tạo Attack/Skill/Hit/KO cho công việc canh thường ngày.
- Bộ teleport cũ được lưu riêng tại `docs/prompts/village-professions-superseded-teleport/`, không dùng cho asset mới.
- Owner tự kiểm hình và giao diện; agent không chạy browser automation theo yêu cầu đã ghi nhận.

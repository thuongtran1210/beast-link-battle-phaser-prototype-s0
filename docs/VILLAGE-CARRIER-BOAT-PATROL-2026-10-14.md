# Làng: vận chuyển, chuyến xuồng và đi tuần

Ngày 2026-10-14. CODE IMPLEMENTED / OWNER UI REVIEW OPEN. Không chạy browser automation. Không sửa Battle hoặc ảnh owner.

## Hành vi hiện có

- Swiftwing: tự nhận giỏ vườn đã thu hoạch → lấy hàng → đi bộ → đặt tại kệ cạnh nhà chung → nhập Kho một lần → quay về. Chỉ vườn ở bước này; cá/xưởng vẫn dùng luồng cũ. Kệ và đường là hình/tọa độ thử, chưa có editor đặt công trình.
- Giỏ chỉ ẩn sau khi lưu việc lấy thành công. Đặt hàng không tự cộng Kho từ animation. Kho đầy hoặc lỗi lưu giữ hàng để thử lại. Nhận thủ công bị khóa khi Swiftwing đã nhận giỏ; chưa có Swiftwing thì vẫn dùng nút nhận thủ công.
- Starcaller: bỏ nghề phụ vận chuyển. Khi stock + chỗ giữ cho production đạt/vượt 100 và có cư dân beast-d, tự lấy tối đa 10 sản phẩm cà rốt/cá/đồ chơi lên xuồng. Giữ toàn bộ Gỗ. Ưu tiên lô gần hết hạn trước. Nếu toàn Gỗ thì người chơi tự xử lý Kho, không tự bán Gỗ.
- Mức thử do agent chọn và đã thông báo: 30 giây hoạt động/chuyến, tối đa 10 sản phẩm. Xuất phát trừ hàng sau save thành công, chưa có tiền. Hoàn tất ghi tiền/sổ thu–chi/giá vốn trong cùng save và xóa chuyến, chống cộng tiền hai lần.
- Giá bán hiện có: cà rốt 2 Đồng, cá 4 Đồng, đồ chơi 10 Đồng. Hàng trên xuồng giữ hạn dùng; hàng hết hạn ghi chi phí hỏng, không bán lấy tiền. Cargo tách khỏi Kho nên không bị mua bán thủ công hoặc bữa ăn lấy lại.
- Chuyến đang đi lưu cargo/remaining, resume sau reload; không chạy offline, tab ẩn hoặc rời Làng. Lỗi giao dịch retry theo nhịp một giây hoạt động. Vắng Starcaller thì không có bán tự động.
- Xuồng và mái chèo là SVG thử riêng, Starcaller hiện dùng cutout đứng; chưa có animation ngồi/chèo thật. Prompt mới `docs/prompts/village-professions/starcaller/boat-row.txt`; ba prompt phụ vận chuyển cũ chuyển sang `archive-starcaller-walking`.
- Snowguard: sheet owner tám frame đi tuần, loop 8fps; đi tuyến thử cố định 65 world px/s, dừng 2 giây tại mỗi waypoint rồi tiếp tục. Cutout khi dừng. Tuyến tránh khu vườn/xưởng theo tọa độ thử; owner cần kiểm tra vị trí map. Snowguard không còn tự chạy hoạt động bồn tắm trong vòng simulation, tránh hai bộ điều khiển cùng di chuyển nhân vật. Đi tuần chỉ là presentation: không gây combat, không cấp tài nguyên; thời gian tuyến reset khi mở lại Làng. Tick chung, không thêm RAF/timer.
- Chưa có trạm canh, xếp đội hình, báo động, raid hoặc trình chỉnh vị trí. Những phần này vẫn là bước sau.

## Checklist owner tự mở

Mở [Làng thử](http://127.0.0.1:5180/village-foundation-preview.html) rồi reload. Fixture có save riêng theo origin; không reset save chính. Mở [preview frame](http://127.0.0.1:5180/village-animation-preview.html), chọn “Snowguard đi tuần”.

- [ ] Snowguard đủ mũ/khiên/chân, không cắt cạnh; bước chân không nhảy tỷ lệ, flip trái/phải đúng. Bấm từng frame, pause/restart trong preview.
- [ ] Trong Làng có Snowguard: đi theo tuyến, dừng quan sát rồi đi tiếp; không đi xuyên nhà/vườn/xưởng. Báo vị trí chưa hợp để chỉnh waypoint.
- [ ] Đợi vườn đủ một lượt: thỏ chỉ thu hoạch một lần; Swiftwing lấy giỏ, đi tới kệ, đặt xuống và Kho tăng đúng 5 cà rốt. Nút nhận thủ công không lấy trùng giỏ.
- [ ] Reload trong lúc Swiftwing đang đi hoặc đặt hàng: resume, không mất giỏ, không nhập hai lần.
- [ ] Có Starcaller, mua hàng thành phẩm để stock + reservation đầy 100: tối đa 10 hàng rời Kho, Gỗ giữ nguyên, chưa có tiền lúc xuất phát.
- [ ] Chuyến xuồng chạy 30 giây hoạt động, tiền/sổ thu–chi tăng đúng giá hàng còn hạn. Reload giữa chuyến rồi kiểm tra không cộng hai lần.
- [ ] Tab ẩn/rời Làng tạm dừng; quay lại tiếp tục. Khi chuyến xong Starcaller trở về vị trí cũ.
- [ ] Kho chỉ đầy Gỗ: không tự bán Gỗ. Không có Starcaller: không tự xuất chuyến.
- [ ] Xuồng/cutout/kệ và đường đi là mẫu thử; kiểm tra chúng nằm đúng mặt nước/lối làng, chưa coi là art đã duyệt.

## Kiểm tra code

`VillageCarrierChecks`: nhận giỏ, save thất bại, reload các chặng, Kho đầy, giao một lần, thiếu người.
`VillageBoatChecks`: xuất hàng/save thất bại, cargo/reload, cộng tiền một lần, giá vốn, không bán Gỗ, thiếu cư dân, cargo lỗi, hết hạn trên xuồng.
`VillageAnimationChecks`: sheet Snowguard đủ tám cửa sổ hợp lệ, loop không phát cue kinh tế.

Checks/build không thay thế owner live/art review.

Kết quả 2026-10-14: `npm run check` PASS; `npm run build` PASS. Chưa chạy kiểm thử giao diện theo yêu cầu owner.

# Trạm canh và nghề tuần tra Snowguard

Ngày 2026-10-14. CODE IMPLEMENTED / OWNER VISUAL REVIEW OPEN.

Owner yêu cầu tập trung job chính, không mở rộng thêm state sinh hoạt. Phạm vi: trạm canh riêng và tuyến tuần tra quay về trạm. Bồn tắm giữ tương tác/trang trí cũ, không thêm chu kỳ nghỉ, buff hoặc phí. Đội hình bảo vệ/báo động/raid chưa triển khai.

## Bản hiện tại

- Trạm là asset SVG thử riêng `public/assets/ui/camp/guard-post-prototype.svg`, không bake vào map hay sheet nhân vật. Dùng mái gỗ, ghế và chuông tĩnh; chưa phải art được duyệt.
- Vị trí thử world (710,655), kích thước 144×118; điểm đứng quan sát local (-30,85) tính từ trạm, tức world (680,740). Có thể sửa tập trung trong `VillageSceneLayout.ts`; chưa có kéo/thả công trình hoặc pathfinding.
- Snowguard bắt đầu quan sát ở trạm 4 giây → đi vòng qua (500,740), (500,400), (680,400) → quay về trạm. Tốc độ 65 world px/s; dừng 2 giây ở các điểm trên tuyến. Đây là thông số thử, cần owner kiểm tra bố cục.
- Chỉ sử dụng walk/idle: sheet owner đi tuần khi di chuyển, cutout khi quan sát. Không tạo thêm sheet hoặc state tắm/nghỉ. Cùng vòng tick Làng, không thêm timer/RAF.
- Click trạm cho biết Snowguard đang đi tuần hay quan sát. Không có Snowguard thì báo trạm trống, không tự mở khóa cư dân. Không thu phí/xây trạm bằng vật tư trong bước thử này.
- Rerender giữ thời gian tuyến trong phiên; rời/mở lại Làng bắt đầu ở trạm. Tab ẩn tạm dừng cùng vòng hoạt động. Không lưu thêm dữ liệu job, không thay kinh tế/Battle.

## Checklist owner

Reload [Làng](http://127.0.0.1:5180/) hoặc [Làng fixture](http://127.0.0.1:5180/village-foundation-preview.html). Fixture giữ save theo origin riêng.

- [ ] Có mái trạm gỗ riêng phía dưới xưởng, không chồng công trình/lối đi. Đây là vị trí thử; ghi tọa độ mong muốn nếu cần đổi.
- [ ] Có Snowguard: đứng bên trái trạm, quan sát → đi tuần → trở về đúng vị trí. Không xuyên nhà/vườn/xưởng.
- [ ] Sheet đi bộ không cắt khiên/mũ, lật hướng đúng; lúc đứng không tiếp tục bước chân.
- [ ] Chạm trạm khi Snowguard ở trạm và trên tuyến: thông báo đúng trạng thái. Thiếu Snowguard: báo trạm trống.
- [ ] Mở Kho/đổi panel gây rerender: tuyến không reset. Ẩn tab rồi quay lại: không chạy bù thời gian ẩn.
- [ ] Bồn tắm không tạo thêm chu kỳ tự động cho Snowguard. Swiftwing, vườn và chuyến xuồng vẫn hoạt động như trước.

Agent không kiểm thử giao diện theo yêu cầu owner. Build/check là bằng chứng code, không phải xác nhận vị trí map hoặc art approval.

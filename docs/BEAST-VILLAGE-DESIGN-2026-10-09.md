# Làng Thú — cuộc sống bên ngoài chiến đấu

Ngày: 2026-10-09. Trạng thái: thiết kế đề xuất theo yêu cầu chủ dự án; chưa triển khai, chưa live PASS hay adopted.
Kế hoạch: [BEAST-VILLAGE-IMPLEMENTATION-PLAN-2026-10-09.md](BEAST-VILLAGE-IMPLEMENTATION-PLAN-2026-10-09.md).

## Mục tiêu trải nghiệm

Phát triển Doanh trại từ nơi đặt ba món đồ thành một ngôi làng có cư dân, nghề nghiệp và những câu chuyện nhỏ. Người chơi trở về sau Run để quan sát thú làm việc, trò chuyện, xây nơi làm việc và khám phá tình huống mới. Trong khoảng 15 giây quan sát, phải nhận ra ít nhất một thú đang làm gì và điều gì vui vừa xảy ra.

Ảnh chủ dự án cung cấp `codex-clipboard-f9a2cfa9-71f8-4a95-84fe-dcba20a18f79.png` là tham chiếu về cuộc sống và bố cục: nhà chung, vườn, bến nước, xưởng/chợ, đường đi và nhân vật thực hiện công việc. Không coi chữ, chỉ số, tiền tệ hoặc nhân vật trong ảnh là yêu cầu gameplay. Giữ nhận diện mười Beast hiện có; không thay toàn bộ roster thành cư dân của ảnh.

## Hiện trạng được xác minh

`CampState.ts` lưu cục bộ dưới khóa `beast-link-camp-v1`: Gỗ, cư dân, đồ đã chế tạo, ba vị trí và Nhật ký. Quà đầu là 25 Gỗ; thắng trọn Run nhận 15 Gỗ, có chặn thưởng lặp tại vòng đời Run. Cư dân được khám phá khi thực sự tuyển thú; test harness không ghi Camp. Bồn tắm 10, cà rốt 15, xưởng đồ chơi 20 Gỗ. `CampView.ts` dùng ảnh cutout, dao động và tương tác ngắn khi chạm, chưa có lịch trình nghề tự động. Snowguard/Ironclad có sheet chiến đấu; chúng không phải animation làm nghề.

## Vòng chơi

Run → đưa thú đã tuyển về làng và nhận Gỗ khi thắng → xây hoặc đặt nơi làm việc → thú phù hợp tự đến làm → mở một mẩu chuyện trong Nhật ký → người chơi trang trí và quay lại Run.

Làng không đòi hỏi thu hoạch đúng giờ. Bản đầu không tạo tài nguyên thụ động, không thưởng khi offline, không thêm tiền tệ và không áp buff lên Run. Những hệ thống đó cần thiết kế riêng sau khi vòng sống trong làng đủ hấp dẫn.

## Nghề nghiệp và cá tính

| Beast | Nghề | Nơi làm việc | Tình huống nhận diện |
|---|---|---|---|
| Snowguard | Bảo vệ kiêm giao hàng | Cổng / bàn nhận hàng | Kiểm tra giấy tờ vịt cao su |
| Shadowclaw | Người câu cá | Bến cá | Câu được giày rồi giấu sau lưng |
| Windstrider | Nông dân | Vườn cà rốt | Tưới rau, lén cắn sản phẩm |
| Starcaller | Nhà thiên văn | Góc kính thiên văn / bàn trà | Cốc trà biến thành vịt |
| Ironclad | Thợ rèn, thợ mộc | Xưởng | Đóng đồ, giật mình vì tiếng búa |
| Swiftwing | Người đưa thư | Hòm thư | Chạy qua làm thư bay khỏi túi |
| Woolkeeper | Thợ may, chăm sóc thú | Bàn đan | Khăn quá dài mắc vào ghế |
| Hophex | Người làm vườn | Góc hoa | Tưới bằng bóng, mắc trong bóng |
| Gadgetduck | Thợ sáng chế | Bàn máy | Robot đuổi lá thay vì quét |
| Boomhog | Đầu bếp | Bếp ngoài trời | Bánh phồng quá cỡ, mặt dính bột |

Đây là danh mục định hướng, không phải mười nghề đều thuộc bản đầu. MVP có Ironclad, Windstrider, Shadowclaw. Các cư dân khác vẫn xuất hiện, đi dạo/nghỉ và có thoại, không bị gắn animation nghề giả.

## Không gian và mobile

Camera đã chốt theo phản hồi chủ dự án: top-down orthographic như ảnh codex-clipboard-1cda1739-eb6e-4ff8-be9b-86c30622c12e.png. Unit giữ sprite ngang và chỉ facing right/left, không sản xuất bốn/tám hướng. Đi dọc giữ hướng ngang gần nhất; đến trạm quay về đạo cụ rồi làm việc. Work anchor nằm bên trái/phải vật thể, không yêu cầu pose quay lưng. Dùng ảnh để tham chiếu camera/bố cục, không mặc định đổi phong cách cartoon sang pixel art. Hướng này thay cho các mô tả camera three-quarter trước đó.

Một bản đồ liền mạch: nhà chung phía trên, vườn bên trái, xưởng bên phải, hồ/bến cá ở một góc; đường đi và sân chung nối các khu. Dùng tọa độ thế giới cố định, camera kéo để xem thay vì ép toàn bộ làng vào màn hình. Hỗ trợ portrait và landscape; HUD và bảng điều khiển bám viewport, không kéo theo bản đồ.

Thanh trên: quay lại, tên làng, Gỗ. Thanh dưới: Xây dựng, Cư dân, Nhật ký. Chạm thú mở thẻ nhỏ có tên, nghề, việc đang làm và một câu thoại. Chạm công trình xem cư dân phù hợp, trạng thái và thao tác đặt. Bảng mở từ đáy, có nút đóng và không che thú đang được chọn; camera đưa thú vào vùng trống khi cần.

Vùng tương tác tối thiểu 44 CSS px; phân biệt chạm với kéo bằng ngưỡng dịch chuyển. Không dùng viền neon. Chi tiết trang trí nằm ngoài lối đi; silhouette nhân vật và đạo cụ chính phải nổi trên nền. Lớp vẽ theo chân: nền → đạo cụ phía sau → thú → phần đạo cụ phía trước → phản hồi ngắn → UI. Công trình có vùng đứng, vùng tương tác và vùng che khuất riêng.

## Hành vi cư dân

Chu trình: Nghỉ → Đi đến trạm → Làm việc → tình huống vui tùy lượt → Nghỉ / ghé sân chung. Nghề thuộc hồ sơ Beast, không yêu cầu người chơi phân công thủ công trong MVP. Chỉ cư dân đã khám phá và có trạm phù hợp mới làm nghề. Thiếu trạm thì đi dạo/nghỉ; chạm giải thích cần xây gì.

Mỗi trạm có một chỗ làm; cơ chế giữ chỗ ngăn hai thú đè lên nhau. Không xuyên công trình, không dồn cư dân tại tâm. Tình huống hài xen kẽ lượt làm bình thường; tối đa một tình huống nổi bật và một câu thoại trên màn hình cùng lúc. Tạm dừng cập nhật khi Camp bị đóng hoặc tab ẩn; không bắt kịp thời gian nghỉ bằng hàng loạt animation khi quay lại.

Thời gian thử nghiệm: làm việc 4–8 giây, nghỉ 3–6 giây, khoảng cách giữa tình huống vui ít nhất 15 giây toàn làng. Tham số cần điều chỉnh sau live review, chưa là cân bằng được chốt. RNG có seed cho kiểm thử. Reduced motion bỏ bob/particle, giữ pose, đạo cụ và trạng thái công việc.

## Ba nghề MVP

**Ironclad:** tới xưởng, đứng đúng điểm chân, nâng búa rồi gõ. Đạo cụ gỗ nhích một lần; một mẩu gỗ bật nhẹ. Tình huống vui: đồ chơi vịt rung lên làm gấu giật mình. Không nổ sáng hay rung toàn màn hình.

**Windstrider:** tới luống, tưới một cụm rau, cúi kiểm tra cà rốt. Tình huống vui: cắn một miếng rồi nhìn quanh. Cà rốt/bình tưới là đạo cụ tách lớp; không dùng lại ảnh bàn cà rốt như một luống rau.

**Shadowclaw:** tới bến, thả cần, phao nhấp một lần, kéo lên. Lượt thường hiện cá nhỏ; tình huống vui hiện giày. Cần/dây/phao phải nhìn rõ và không đâm qua mặt hoặc mất liên kết tay.

## Asset cần bổ sung

Theo phản hồi chủ dự án: đạo cụ phải được tạo/duyệt trong bối cảnh Master Scene trước khi tách lớp, bám camera/scale/ánh sáng và điểm tương tác tay-chân của Beast. Không coi tạo từng ảnh centered riêng là đủ. Unit tự đến và làm việc khi trạm hợp lệ; thao tác chạm chỉ đọc thông tin. Animation nghề cần reference nhân vật + đạo cụ + composite đứng làm việc, không thay bằng idle dao động. Xem quy trình/prompt cập nhật trong BEAST-VILLAGE-ASSET-BRIEF-2026-10-09.md.

Nền làng sạch, không nhân vật, chữ, HUD hoặc điểm làm việc bị bake vào ảnh. Xưởng, vườn, bến cá tách nền trong suốt; mỗi trạm có phần trước/sau khi cần che chân. Đạo cụ nghề và vật gây cười tách riêng. Tái sử dụng atlas đồ hiện có khi đúng chức năng; nền Camp hiện tại là fallback, chưa mặc định phù hợp bản đồ có camera kéo.

Ba clip nghề mới phải bám ảnh gốc từng Beast, điểm chân ổn định, cùng kích thước sheet/số frame đã chọn theo workflow [FRAME-ANIMATION-AGENT-WORKFLOW.md](FRAME-ANIMATION-AGENT-WORKFLOW.md). Không lấy Attack chiến đấu thay cho động tác làm nghề rồi coi là hoàn thiện. Tách hiệu ứng khỏi sheet. Chủ dự án có thể cung cấp ảnh; yêu cầu hiện tại chỉ ghi thiết kế/kế hoạch, không tự tạo asset hàng loạt.

## Lưu trữ và chuyển đổi

Đề xuất save v2 có version, Gỗ, residents, crafted, placements theo trạm, diary và các ID câu chuyện đã xem. Trạng thái đang đi/làm và timer không lưu. Nghề nằm trong catalog code, không sao chép vào save. ID công trình hợp lệ, tọa độ trong vùng đặt, ownership và số Gỗ phải được sanitize.

Chuyển v1: giữ Gỗ/cư dân/đồ/nhật ký; bath/carrot/anvil vẫn sở hữu. Anvil dùng được tại xưởng; carrot vẫn là đồ nghỉ/ăn vặt, không tự biến thành vườn; bath vẫn trang trí tương tác. Đồ chưa có vị trí hợp lệ đưa vào kho, không mất đồ. Chi phí vườn/bến mới còn mở; MVP kiểm thử dùng fixture, không tự chốt giá khi chưa duyệt kinh tế.

## Tiêu chí hoàn thành MVP

- Vào từ menu, quay lại không tác động Run; dữ liệu Camp v1 còn nguyên sau nâng cấp.
- Ba cư dân có nghề khác nhau, hành vi tự chạy khi trạm tồn tại, đúng đạo cụ và điểm chân.
- Một chu trình bình thường và một tình huống vui cho mỗi nghề; Nhật ký chỉ ghi lần đầu theo event ID.
- Kéo bản đồ và chạm thú hoạt động ở portrait/landscape, UI không che phản hồi chính; không chồng cư dân tại trạm.
- Đóng/mở liên tục, tab ẩn, reduced motion, save lỗi không gây timer trùng hoặc mất Gỗ.
- Checks/build đạt là evidence kỹ thuật; live mobile và đánh giá thú vị của chủ dự án là gate riêng.

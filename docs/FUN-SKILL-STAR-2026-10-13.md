# Fun skill từ 2★, hiệu ứng đặc biệt ở 3★

Chủ dự án yêu cầu hiệu ứng fun xuất hiện sớm hơn. Phạm vi: Windstrider / Focus Shot và Starcaller / Arcane Bloom; các unit hỗ trợ khác giữ kỹ năng hiện có.

| Beast | 1★ | 2★ | 3★ |
| --- | --- | --- | --- |
| Windstrider | Focus thường, chưa nhử | Focus đầu tiên nhử một địch còn sống bằng cà rốt 1s | Focus đầu tiên nhử một địch 2s; marker lớn hơn và điểm sáng nhỏ |
| Starcaller | Bloom thường, chưa vịt hóa | Bloom đầu tiên vịt hóa tối đa một địch sống trong vùng 1s | Bloom đầu tiên vịt hóa tối đa ba địch sống trong vùng 1,5s; marker lớn hơn và vương miện |

Mỗi Beast kích hoạt phần fun một lần/Battle. Tăng STAR không đổi các quy tắc damage/pierce/Echo hiện có. Windstrider không gắn control lên mục tiêu đã chết sau hit. VFX code-drawn, không thêm asset bitmap. UI mô tả bậc STAR có tiếng Việt tương ứng.

Kiểm thử kiểm tra 1★ không kích hoạt, 2★/3★ có control, thời lượng/giới hạn mục tiêu, nguồn STAR, ngăn windup, hết hiệu lực và không kích hoạt lại. Build đạt; không suy ra owner-live mobile PASS hoặc cân bằng đã áp dụng.

Đối chiếu 3264 kịch bản: cập nhật đúng 33 fingerprint thuộc rules v13a — classic-4 (8), Windstrider 2★ (12), Starcaller 2★ (9), Windstrider 3★ (4: không đặt control lên mục tiêu đã chết). Các kịch bản khác giữ baseline. Metadata funControlStar chỉ phục vụ hình ảnh được loại khỏi fingerprint gameplay; kiểm thử riêng xác nhận nguồn STAR.

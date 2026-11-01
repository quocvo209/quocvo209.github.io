# Hướng dẫn nhanh – Quốc Võ Production

## Đăng nội dung qua Pages CMS
| Muốn làm | Vào mục CMS |
|---|---|
| Đổi chữ đầu trang, ảnh Hero, link Showreel, giới thiệu, kỹ năng, Zalo/Facebook/SĐT/Email | **Thông tin website** |
| Thêm nhiều video YouTube | **Video dự án** → dán mỗi dòng 1 link (hỗ trợ cả Shorts) |
| Thêm album hậu trường | **Hậu trường (BTS)** → mỗi album chọn nhiều ảnh cùng lúc |
| Ảnh nền mờ trang trí | **Ảnh nền trang trí** |
| Bảng dịch vụ / giá | **Dịch vụ & báo giá** (xoá hết = ẩn mục) |
| Lời nhận xét của khách | **Nhận xét khách hàng** (để trống = ẩn mục) |

## Mẹo upload ảnh không lỗi
- Mỗi ảnh nên **dưới 4MB**, định dạng JPG / PNG / WEBP (không dùng HEIC của iPhone – hãy xuất sang JPG).
- Web tự đổi tên file thành không dấu, không khoảng trắng (cấu hình `rename: safe`).
- Sau khi bạn upload, GitHub tự nén ảnh lớn (workflow `.github/workflows/optimize-images.yml`), mất ~1 phút.

## Chỉnh vị trí / kích thước ảnh trực tiếp
Mở `https://quocvo209.github.io/?edit` → kéo ảnh, chỉnh zoom, sắp xếp ảnh nền → **Lưu lên web**.

## Sửa giao diện (nâng cao)
Code nằm ở `src/app.jsx`. Sau khi sửa chạy `./build.sh` để tạo lại `app.js`.

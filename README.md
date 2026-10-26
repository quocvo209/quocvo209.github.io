# QUOCVO® — Video Editor & Videographer

Redesign portfolio dùng GitHub Pages + Pages CMS, tông ivory / charcoal / mustard, responsive cho mobile.

## Có gì trong bản này
- Hero/showreel tự lấy dự án đầu tiên hoặc dự án có `featured: true`.
- Portfolio đọc từ `content/projects.json`, lọc MV/TVC, Ads, Social, Reel/TikTok.
- Gallery Behind the Scenes đọc từ `content/bts.json`.
- `.pages.yml` giữ mục Projects hiện tại và bổ sung mục quản lý ảnh hậu trường.
- Modal xem video YouTube/Vimeo và lightbox ảnh BTS.

## Cách cập nhật website an toàn
1. Giữ một bản backup repository hiện tại.
2. Giải nén ZIP này.
3. Trong repository GitHub đang dùng cho GitHub Pages, cập nhật `index.html`, `style.css`, `script.js`, `.pages.yml`, `content/projects.json`; thêm `content/bts.json`.
4. Không xóa thư mục `uploads/` hoặc các ảnh/video riêng của bạn.
5. Commit lên đúng branch mà GitHub Pages đang publish.
6. Chờ Actions/Pages hoàn tất, sau đó mở website và nhấn Ctrl+F5.

## Pages CMS
- Projects: tạo/sửa dự án trong `content/projects.json`.
- Behind the Scenes: thêm ảnh trong `content/bts.json`, trường ảnh dùng CMS image field; media được cấu hình lưu trong `uploads/`.
- Chọn `featured` cho dự án muốn làm nổi bật ở hero.
- Danh mục phải đúng một trong: `MV/TVC`, `Ads`, `Social`, `Reel/TikTok`.

## Lưu ý
- Video dài nên dùng YouTube/Vimeo và dán URL vào `video_url`; tránh commit MP4 dung lượng lớn vào GitHub.
- Kiểm tra CMS sau khi cập nhật `.pages.yml`. Nếu CMS có cấu hình riêng khác với bản này, hãy so sánh trước khi ghi đè.
- Link quản trị CMS: https://app.pagescms.org/
- Thông tin liên hệ trong trang đang dùng email/Facebook/điện thoại có sẵn trong bản nguồn; hãy kiểm tra trước khi public.

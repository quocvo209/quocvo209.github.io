# Portfolio - Võ Tuấn Quốc

## 🎬 Video & Design Portfolio

Portfolio website của **Võ Tuấn Quốc** - Video Editor & Designer

### 📸 Các Tính Năng

- ✅ **Responsive Design** - Đẹp trên mọi thiết bị (desktop, tablet, mobile)
- ✅ **Dark Mode** - Giao diện tối hiện đại
- ✅ **Màu Vàng Be & Nâu** - Thiết kế trendy
- ✅ **Video Gallery** - Hiển thị 30+ videos
- ✅ **Design Gallery** - Hiển thị thiết kế
- ✅ **Smooth Navigation** - Cuộn mượt mà
- ✅ **Contact Form** - Email liên hệ

### 📁 Cấu Trúc Thư Mục

```
quocvo209.github.io/
├── index.html          # Trang chính
├── style.css           # Styling
├── script.js           # JavaScript
├── README.md           # File này
├── videos/             # Thư mục chứa videos (tạo thư mục này)
│   ├── video1.mp4
│   ├── video2.mp4
│   └── ...
└── designs/            # Thư mục chứa thiết kế (tạo thư mục này)
    ├── design1.jpg
    ├── design2.jpg
    └── ...
```

### 🚀 Hướng Dẫn Sử Dụng

#### 1. **Thêm Videos**

1. Tạo thư mục `videos` trong repository
2. Upload 30 videos của bạn vào thư mục này
3. Cập nhật tên files trong `script.js` (dòng 2-31)

Ví dụ:
```javascript
{ id: 1, title: 'Video 1', description: 'Mô tả của bạn', file: 'videos/video1.mp4' },
```

#### 2. **Thêm Thiết Kế**

1. Tạo thư mục `designs` trong repository
2. Upload ảnh thiết kế của bạn vào thư mục này
3. Cập nhật tên files trong `script.js` (dòng 33-38)

Ví dụ:
```javascript
{ id: 1, title: 'Design 1', description: 'Mô tả của bạn', image: 'designs/design1.jpg' },
```

#### 3. **Cập Nhật Thông Tin**

- **Tên**: Tìm và thay thế "Võ Tuấn Quốc" nếu cần
- **Email**: Đã được cấu hình là `quoctuanvo209@gmail.com`
- **Mô tả**: Cập nhật trong `script.js`

### 🎨 Customization

#### Thay Đổi Màu Sắc

Mở `style.css` và tìm `:root { }`:

```css
:root {
    --primary-color: #D4A574;      /* Màu vàng be */
    --secondary-color: #8B6F47;    /* Màu nâu */
    --accent-color: #F5DEB3;       /* Màu nhạt */
}
```

#### Thay Đổi Font

Tìm `font-family` trong `style.css` và thay đổi.

### 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

### 🌐 Deployment

Website sẽ tự động deploy tại: **https://quocvo209.github.io**

Sau khi bạn push code, GitHub sẽ tự động build và deploy.

### 📧 Liên Hệ

- **Email**: quoctuanvo209@gmail.com

### 📄 License

© 2026 Võ Tuấn Quốc. All rights reserved.

---

**Chúc bạn thành công! 🚀**

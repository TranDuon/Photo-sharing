# Ứng Dụng Chia Sẻ Ảnh

Ứng dụng web chia sẻ ảnh xây dựng trên nền tảng MERN Stack (MongoDB, Express, React, Node.js).

## Tính Năng

- Đăng ký / Đăng nhập (JWT)
- Xem danh sách người dùng
- Xem hồ sơ chi tiết người dùng
- Xem ảnh và bình luận của người dùng
- Upload ảnh kèm caption
- Chỉnh sửa / Xóa ảnh (chỉ chủ ảnh)
- Thêm bình luận vào ảnh
- Giao diện Hand-Drawn Design (Times New Roman, hard-shadow, wobbly border)

## Yêu Cầu Hệ Thống

- Node.js ≥ 18
- MongoDB Atlas (hoặc MongoDB local)

## Cài Đặt & Chạy

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Cài đặt Backend

```bash
cd server
npm install
```

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Điền thông tin vào `server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@...
JWT_SECRET=<chuỗi bí mật tùy ý>
PORT=5000
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### 4. Nạp Dữ Liệu Mẫu (tuỳ chọn)

```bash
cd server
npm run seed
```

### 5. Chạy Ứng Dụng

Mở 2 terminal:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Truy cập: [http://localhost:5173](http://localhost:5173)

## Tài Khoản Demo (sau khi seed)

| Tên đăng nhập | Mật khẩu |
|---------------|----------|
| ian           | 123456   |
| cry           | 123456   |
| dok           | 123456   |

## Cấu Trúc Thư Mục

```
final project/
├── frontend/          # React + MUI (Vite)
│   └── src/
│       ├── components/
│       ├── lib/
│       ├── theme.js
│       └── designTokens.js
├── server/            # Express + Mongoose
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── images/        # Ảnh upload (không commit)
└── requirement/       # Tài liệu báo cáo
```

## Tài Liệu

Xem chi tiết workflow tại [`requirement/WORKFLOW_REPORT.md`](requirement/WORKFLOW_REPORT.md).

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | React 19, MUI v9, React Router v5, Vite |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Upload | Multer |
| Icons | lucide-react |

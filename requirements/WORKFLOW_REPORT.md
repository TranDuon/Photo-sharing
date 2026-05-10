# Báo Cáo Workflow — Ứng Dụng Chia Sẻ Ảnh (Photo Sharing App)

> **Ngày báo cáo:** 10/05/2026  
> **Tech stack:** React 19 + MUI v9 (Frontend) · Express + Mongoose (Backend) · MongoDB  
> **Tác giả:** Trần Đăng Dương

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu Trúc Thư Mục](#2-cấu-trúc-thư-mục)
3. [Luồng Xác Thực (Authentication)](#3-luồng-xác-thực-authentication)
4. [Các Routes Frontend](#4-các-routes-frontend)
5. [Các API Backend](#5-các-api-backend)
6. [Mô Hình Dữ Liệu (Data Models)](#6-mô-hình-dữ-liệu-data-models)
7. [Luồng Upload Ảnh](#7-luồng-upload-ảnh)
8. [Luồng Bình Luận](#8-luồng-bình-luận)
9. [Luồng Chỉnh Sửa / Xóa Ảnh](#9-luồng-chỉnh-sửa--xóa-ảnh)
10. [Mô Tả Các Component Chính](#10-mô-tả-các-component-chính)
11. [Giao Tiếp Component ↔ API](#11-giao-tiếp-component--api)
12. [Hệ Thống Theme & Design Tokens](#12-hệ-thống-theme--design-tokens)
13. [Vấn Đề Đã Biết & Ghi Chú Kỹ Thuật](#13-vấn-đề-đã-biết--ghi-chú-kỹ-thuật)

---

## 1. Tổng Quan Kiến Trúc

```
┌──────────────────────────────────────────┐
│              TRÌNH DUYỆT                 │
│                                          │
│  React 19 + MUI v9 + React Router v5     │
│  HashRouter (#/...)                      │
│  Axios (apiClient) + JWT Bearer token    │
└──────────────┬───────────────────────────┘
               │  HTTP / REST API
               ▼
┌──────────────────────────────────────────┐
│         BACKEND (Node / Express)         │
│                                          │
│  PORT 5000                               │
│  Middleware: CORS, JSON, JWT auth        │
│  Multer: upload ảnh → server/images/     │
│  Routes: /admin, /user, /photos,         │
│          /photosOfUser, /commentsOfPhoto │
└──────────────┬───────────────────────────┘
               │  Mongoose ODM
               ▼
┌──────────────────────────────────────────┐
│              MongoDB Atlas               │
│  Collections: users, photos, schemainfos│
└──────────────────────────────────────────┘
```

**Vite** được dùng làm build tool cho frontend (dev server proxy `/api` → `:5000`).  
Ảnh tải lên được lưu tại `server/images/` và được phục vụ qua `GET /images/<filename>`.

---

## 2. Cấu Trúc Thư Mục

```
final project/
├── frontend/
│   ├── index.html                  ← entry HTML
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                ← mount App, ThemeProvider, CssBaseline
│       ├── App.jsx                 ← routing, layout, global state
│       ├── theme.js                ← MUI createTheme (Times New Roman, design tokens)
│       ├── designTokens.js         ← COLORS, RADIUS, SHADOWS constants
│       ├── index.css
│       ├── lib/
│       │   └── fetchModelData.js   ← axios apiClient, setAuthToken, fetchModel
│       └── components/
│           ├── TopBar/index.jsx    ← AppBar, upload dialog, auth buttons
│           ├── UserList/index.jsx  ← danh sách người dùng (drawer + trang /users)
│           ├── UserDetail/index.jsx← thông tin chi tiết 1 user
│           ├── UserPhotos/index.jsx← ảnh + bình luận của 1 user
│           └── LoginRegister/index.jsx ← landing, form đăng nhập, form đăng ký
│
├── server/
│   ├── index.js                    ← express app, route mount, static /images
│   ├── .env                        ← MONGO_URI, JWT_SECRET, PORT
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js                 ← requireAuth JWT middleware
│   ├── routes/
│   │   ├── admin.js                ← POST /admin/login, POST /admin/logout
│   │   ├── user.js                 ← GET /user/list, GET /user/:id, POST /user
│   │   ├── photo.js                ← CRUD ảnh (upload, list, patch, delete)
│   │   └── comment.js              ← POST /commentsOfPhoto/:photo_id
│   ├── db/
│   │   ├── userModel.js            ← Mongoose User schema
│   │   ├── photoModel.js           ← Mongoose Photo schema (comments nhúng)
│   │   ├── schemaInfo.js           ← Mongoose SchemaInfo schema
│   │   └── dbLoad.js               ← seed script (npm run seed)
│   └── images/                     ← file ảnh đã upload & seed images
│
└── requirement/
    └── WORKFLOW_REPORT.md          ← file này
```

---

## 3. Luồng Xác Thực (Authentication)

### 3.1 Đăng Nhập

```
[LoginForm] ──POST /admin/login──► [admin.js]
  body: { login_name, password }
                                    1. Tìm user theo login_name
                                    2. bcrypt.compare(password, user.password)
                                    3. jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
                                    4. Trả về { token, user: { _id, first_name, last_name, login_name } }

[LoginForm] ◄── 200 { token, user } ──
    │
    ▼
[App.handleLoginSuccess]
    1. Tách userObj = payload.user ?? payload
    2. setLoggedInUser(userObj)           ← React state
    3. setAuthToken(token)                ← apiClient.defaults.headers["Authorization"] = "Bearer <token>"
    4. history.push(`/users/${userId}`)   ← chuyển về trang hồ sơ
```

### 3.2 Sử Dụng JWT

- Mọi request từ `apiClient` (trong `fetchModelData.js`) đều tự động gửi header `Authorization: Bearer <token>`.
- Middleware `requireAuth` trên server đọc header, gọi `jwt.verify()`, đặt `req.userId`.

### 3.3 Đăng Ký

```
[RegisterForm] ──POST /user──► [user.js]
  body: { first_name, last_name, login_name, password, ... }
                                    1. Kiểm tra login_name chưa tồn tại
                                    2. Validate password ≥ 6 ký tự
                                    3. bcrypt.hash(password, 10)
                                    4. User.create(...)
                                    5. Trả về 201 { login_name }

⚠️  Đăng ký KHÔNG tự động đăng nhập. User phải đăng nhập thủ công sau đó.
```

### 3.4 Đăng Xuất

```
[TopBar: nút "Đăng xuất"]
    1. setUploadOpen(false)
    2. onLogout() → App.handleLogout:
         setLoggedInUser(null)
         setTopBarText("")
         setAuthToken(null)    ← xóa Authorization header khỏi apiClient
    3. history.push("/login")  ← về trang landing

⚠️  Frontend KHÔNG gọi POST /admin/logout.
    JWT là stateless — server không có blacklist token.
```

### 3.5 Bảo Vệ Route Frontend

| Route | Chưa đăng nhập | Đã đăng nhập |
|-------|----------------|--------------|
| `/login` | Hiện LoginRegister | Redirect → `/users` |
| `/users` | Welcome + nút đăng nhập | Gợi ý + UserList inline |
| `/users/:userId` | Redirect → `/login?openLogin=1` | UserDetail |
| `/photos/:userId` | Redirect → `/login?openLogin=1` | UserPhotos |

### 3.6 Mở Dialog Đăng Nhập Tự Động

Khi điều hướng đến `/login?openLogin=1` (từ các nút Đăng nhập hoặc redirect bảo vệ route):

```
[LoginRegister useEffect]
    1. Đọc location.search → params.get("openLogin") === "1"
    2. setLoginOpen(true)   ← mở dialog đăng nhập
    3. history.replace("/login")  ← xóa query param khỏi URL
```

---

## 4. Các Routes Frontend

Dùng `HashRouter` → URL có dạng `http://localhost:5173/#/users/...`

| Path | Component | Ghi chú |
|------|-----------|---------|
| `/` | — | Redirect về `/users` |
| `/login` | `<LoginRegister>` | Hiển thị landing + dialog khi `?openLogin=1` |
| `/users` | `<UserList>` inline | Sidebar (Drawer) cũng hiện UserList khi đã đăng nhập |
| `/users/:userId` | `<UserDetail>` | Xem thông tin người dùng |
| `/photos/:userId` | `<UserPhotos>` | Xem ảnh + bình luận |
| `*` (catch-all) | — | Redirect về `/users` |

**Layout tổng thể:**

```
┌─────────────────────────────────────────────────────┐
│  TopBar (fixed, height: 60px)                       │
├──────────────┬──────────────────────────────────────┤
│ Drawer       │  <main>                              │
│ (230px)      │                                      │
│ [UserList]   │  Switch → Route components           │
│              │                                      │
│ (chỉ hiện   │                                      │
│  khi đăng   │                                      │
│  nhập)       │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

## 5. Các API Backend

Base URL: `http://localhost:5000`

### 5.1 Public (không cần JWT)

| Method | Path | Body | Response | Mô tả |
|--------|------|------|----------|-------|
| `POST` | `/admin/login` | `{ login_name, password }` | `{ token, user }` | Đăng nhập, trả JWT 7 ngày |
| `POST` | `/admin/logout` | — | `"Logged out successfully"` | Stateless, không hủy token thực sự |
| `POST` | `/user` | `{ first_name, last_name, login_name, password, ... }` | `201 { login_name }` | Đăng ký tài khoản mới |
| `GET` | `/images/:filename` | — | File ảnh | Serve ảnh tĩnh từ `server/images/` |

### 5.2 Protected (yêu cầu `Authorization: Bearer <token>`)

| Method | Path | Body | Response | Mô tả |
|--------|------|------|----------|-------|
| `GET` | `/user/list` | — | `[{ _id, first_name, last_name }]` | Danh sách tất cả user |
| `GET` | `/user/:id` | — | `{ _id, first_name, last_name, location, description, occupation }` | Thông tin chi tiết 1 user |
| `GET` | `/photosOfUser/:id` | — | `[Photo]` | Danh sách ảnh của user (comments populated) |
| `POST` | `/photos/new` | `FormData { photo, caption }` | `201 Photo` | Upload ảnh mới |
| `PATCH` | `/photos/:photoId` | `{ caption }` | `Photo` cập nhật | Sửa caption (chỉ chủ ảnh) |
| `DELETE` | `/photos/:photoId` | — | `204` | Xóa ảnh + file (chỉ chủ ảnh) |
| `POST` | `/commentsOfPhoto/:photo_id` | `{ comment }` | `Photo` + populated comments | Thêm bình luận vào ảnh |

### 5.3 Middleware `requireAuth`

```js
// server/middleware/auth.js
const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
next();
```

Lỗi → `401 { message: "..." }`.

---

## 6. Mô Hình Dữ Liệu (Data Models)

### 6.1 `User`

```
users collection
─────────────────────────────────────
_id          ObjectId (auto)
first_name   String (required)
last_name    String (required)
location     String
description  String
occupation   String
login_name   String (required, unique)
password     String (required, bcrypt hash)
__v          Number
```

### 6.2 `Photo` (với embedded comments)

```
photos collection
─────────────────────────────────────
_id          ObjectId (auto)
user_id      ObjectId → ref: "User" (required)
file_name    String (required)     ← tên file UUID trên disk
caption      String (default: "")
date_time    Date (default: Date.now)
comments     [CommentSchema]       ← mảng nhúng
__v          Number

CommentSchema (subdocument):
  _id        ObjectId (auto)
  comment    String (required)
  date_time  Date (default: Date.now)
  user_id    ObjectId → ref: "User" (required)
```

> **Không có collection Comment riêng** — comment được nhúng trực tiếp trong Photo.

### 6.3 `SchemaInfo`

```
schemainfos collection
─────────────────────────────────────
_id              ObjectId (auto)
__v              Number
load_date_time   String
```

---

## 7. Luồng Upload Ảnh

```
Người dùng (đã đăng nhập)
    │
    ▼
[TopBar] → Nút "Thêm ảnh"
    │
    ├─ Chưa đăng nhập → Dialog "Đăng nhập để tiếp tục"
    │       └─ Nút "Đăng nhập" → history.push("/login?openLogin=1")
    │
    └─ Đã đăng nhập → Mở <UploadPhotoDialog>

[UploadPhotoDialog] (3 bước)
    │
    ├─ Bước 1: Chọn file ảnh (input[type=file], accept: jpg/png/gif)
    │       → tạo object URL để preview
    │
    ├─ Bước 2: Xem trước ảnh + nhập caption (max 2000 ký tự)
    │
    └─ Bước 3: Nhấn "Đăng" hoặc "Huỷ"

Khi nhấn "Đăng":
    │
    ▼
apiClient.post("/photos/new", FormData{ photo, caption })
    │
    ▼ [server: routes/photo.js]
    1. requireAuth → xác định req.userId
    2. Multer: validate MIME + extension, max 10MB
    3. Lưu file: server/images/<uuid>.<ext>
    4. Photo.create({ user_id, file_name, caption, date_time })
    5. Response 201
    │
    ▼
[UploadPhotoDialog] onUploaded()
    → setUploadOpen(false)
    → App.handlePhotoUploaded()
       → setPhotoRefreshKey(k + 1)
           → UserPhotos refetch (nếu đang xem trang ảnh của user đó)
```

**Quy tắc Multer:**

| Thuộc tính | Giá trị |
|-----------|---------|
| Định dạng cho phép | `.jpg`, `.jpeg`, `.png`, `.gif` |
| MIME cho phép | `image/jpeg`, `image/png`, `image/gif` |
| Kích thước tối đa | 10 MB |
| Thư mục lưu | `server/images/` |
| Tên file | `uuid() + ext gốc` |

---

## 8. Luồng Bình Luận

```
[UserPhotos → PhotoCard → AddCommentForm]
    │
    ├─ Chưa đăng nhập: form ẩn (loggedInUser = null)
    │
    └─ Đã đăng nhập:
           Nhập text → Nhấn "Gửi" (hoặc Ctrl+Enter)
               │
               ▼
           apiClient.post(`/commentsOfPhoto/${photoId}`, { comment })
               │
               ▼ [server: routes/comment.js]
               1. requireAuth
               2. Validate comment không rỗng, photoId hợp lệ
               3. Tìm photo, push comment subdoc: { comment, date_time, user_id: req.userId }
               4. photo.save()
               5. Populate comments.user_id → { _id, first_name, last_name }
               6. Response 201: toàn bộ Photo object
               │
               ▼
           Frontend: lấy comments[comments.length - 1]
               → Nếu thiếu user → dùng loggedInUser để tổng hợp local
               → setLocalComments([...prev, newComment])
               → UI cập nhật ngay (không refetch toàn trang)
```

---

## 9. Luồng Chỉnh Sửa / Xóa Ảnh

### 9.1 Sửa Caption

```
[PhotoCard] (chủ ảnh)
    │
    ▼
Nút ✏️ (Edit) → editing = true → hiện TextField với editDraft

Nhấn "Lưu":
    │
    ▼
apiClient.patch(`/photos/${photo._id}`, { caption: editDraft })
    │
    ▼ [server: routes/photo.js PATCH]
    1. requireAuth, kiểm tra chủ ảnh (photo.user_id === req.userId)
    2. Validate caption: string, max 2000 ký tự
    3. photo.caption = caption.trim(); photo.save()
    4. Response: photo object đã cập nhật
    │
    ▼
onPhotoUpdated(updatedPhoto)
    → setPhotos(prev.map(p => p._id === updated._id ? updated : p))
    → UI cập nhật ngay, không reload trang
```

### 9.2 Xóa Ảnh

```
[PhotoCard] (chủ ảnh)
    │
    ▼
Nút 🗑️ (Delete) → Mở Dialog xác nhận

Nhấn "Xóa":
    │
    ▼
apiClient.delete(`/photos/${photo._id}`)
    │
    ▼ [server: routes/photo.js DELETE]
    1. requireAuth, kiểm tra chủ ảnh
    2. Photo.findByIdAndDelete(photoId)
    3. fs.unlink("server/images/" + photo.file_name)
       (bỏ qua lỗi ENOENT nếu file đã bị xóa)
    4. Response 204 No Content
    │
    ▼
onPhotoDeleted(photo._id)
    → setPhotos(prev.filter(p => p._id !== photoId))
    → Card biến mất khỏi danh sách
```

---

## 10. Mô Tả Các Component Chính

### `App.jsx`
- **Vai trò:** Root component, quản lý state toàn cục.
- **State:** `loggedInUser`, `topBarText`, `photoRefreshKey`.
- **Handlers:** `handleLoginSuccess` (set user + JWT), `handleLogout` (clear user + JWT), `handlePhotoUploaded` (tăng refreshKey), `handleContextChange` (cập nhật TopBar text).

### `TopBar/index.jsx`
- **Vai trò:** Thanh điều hướng cố định ở đầu trang.
- **Hiển thị:** Logo, tên màn hình hiện tại, lời chào, nút "Thêm ảnh", nút "Đăng xuất" / "Đăng nhập".
- **Sub-components:** `UploadPhotoDialog` (dialog upload ảnh 3 bước).

### `UserList/index.jsx`
- **Vai trò:** Danh sách tất cả người dùng. Xuất hiện ở 2 nơi: Drawer trái (khi đăng nhập) và trang `/users`.
- **Tính năng:** Tài khoản đang đăng nhập luôn ở đầu; sort còn lại theo tên; highlight active route.

### `UserDetail/index.jsx`
- **Vai trò:** Hiển thị thông tin hồ sơ một user (tên, địa điểm, nghề nghiệp, giới thiệu).
- **Tính năng:** Link "Xem ảnh" → `/photos/:userId`.

### `UserPhotos/index.jsx`
- **Vai trò:** Hiển thị toàn bộ ảnh của một user với bình luận.
- **Sub-components:**
  - `PhotoCard` — Hiển thị 1 ảnh, caption, actions sửa/xóa (chủ ảnh), danh sách comment.
  - `CommentItem` — Hiển thị 1 bình luận.
  - `AddCommentForm` — Form thêm bình luận (chỉ khi đăng nhập).
  - `PhotoSkeleton` — Loading placeholder.

### `LoginRegister/index.jsx`
- **Vai trò:** Trang landing + dialogs đăng nhập / đăng ký.
- **Sub-components:** `LoginForm`, `RegisterPasswordField`, `RegisterForm`.
- **Tính năng:** Tự động mở dialog khi URL có `?openLogin=1`.

---

## 11. Giao Tiếp Component ↔ API

```
Component               API Call                          Kết quả
─────────────────────────────────────────────────────────────────────
LoginForm               POST /admin/login                 JWT + user
RegisterForm            POST /user                        201 created
UserList                GET /user/list                    [users]
UserDetail              GET /user/:id                     user object
UserPhotos              GET /user/:id                     user name
                        GET /photosOfUser/:id             [photos]
AddCommentForm          POST /commentsOfPhoto/:id         updated photo
PhotoCard (edit)        PATCH /photos/:id                 updated photo
PhotoCard (delete)      DELETE /photos/:id                204
UploadPhotoDialog       POST /photos/new (multipart)      201 photo
```

**`fetchModel(path)`** — dùng cho GET, trả về `data` hoặc throw Error.  
**`apiClient`** — axios instance dùng cho POST/PATCH/DELETE (mang JWT header).

---

## 12. Hệ Thống Theme & Design Tokens

### Design Tokens (`src/designTokens.js`)

| Token | Giá trị | Ý nghĩa |
|-------|---------|--------|
| `COLORS.background` | `#fdfbf7` | Warm Paper (nền trang) |
| `COLORS.foreground` | `#2d2d2d` | Soft Pencil Black (chữ) |
| `COLORS.muted` | `#e5e0d8` | Old Paper (viền phụ, divider) |
| `COLORS.accent` | `#ff4d4d` | Red Marker (hover, CTA) |
| `COLORS.secondaryAccent` | `#2d5da1` | Blue Pen (primary action) |
| `COLORS.postit` | `#fff9c4` | Post-it Yellow (icon bg) |
| `RADIUS.wobbly` | ellipse CSS (các góc không đều) | Button, chip |
| `RADIUS.wobblyMd` | ellipse CSS (vừa) | Card, dialog, paper |
| `SHADOWS.standard` | `4px 4px 0px 0px #2d2d2d` | Hard offset shadow |
| `SHADOWS.emphasized` | `8px 8px 0px 0px #2d2d2d` | Đậm hơn |
| `SHADOWS.hover` | `2px 2px 0px 0px #2d2d2d` | Khi hover (nút "nhấn xuống") |
| `SHADOWS.card` | `3px 3px 0px 0px rgba(...)` | Card subtotal shadow |

### Typography

| Biến thể | Font | Weight |
|---------|------|--------|
| Tất cả (body, button, label…) | `"Times New Roman", Times, serif` | 400 |
| h1–h6 | `"Times New Roman", Times, serif` | 700 |

### Pattern Nền Trang

```css
background-image: radial-gradient(#e5e0d8 1px, transparent 1px);
background-size: 24px 24px;
```

---

## 13. Vấn Đề Đã Biết & Ghi Chú Kỹ Thuật

### 1. JWT không có blacklist (logout phía server)
**Mô tả:** Server dùng JWT stateless. `POST /admin/logout` không vô hiệu hóa token thực sự.  
**Hệ quả:** Nếu token bị lộ, kẻ tấn công có thể dùng đến khi hết hạn (7 ngày).  
**Khuyến nghị:** Implement token blacklist (Redis) hoặc dùng refresh token ngắn hạn.

### 2. Đăng ký không tự đăng nhập
**Mô tả:** Sau `POST /user` thành công, user phải đăng nhập lại thủ công.  
**Khuyến nghị:** Server trả về JWT sau đăng ký, hoặc tự động mở LoginForm.

### 3. GET /photosOfUser/:id yêu cầu JWT (không public)
**Mô tả:** Code trong `photo.js` có comment "public", nhưng `index.js` mount router sau `requireAuth` → thực tế cần JWT.  
**Hệ quả:** Guest không xem được ảnh dù UI có nút "Thêm ảnh" công khai.  
**Khuyến nghị:** Thống nhất: hoặc bỏ `requireAuth` cho GET photos, hoặc sửa comment trong code.

### 4. Refresh token sau khi reload trang
**Mô tả:** JWT lưu trong React state (RAM) — reload trang → mất đăng nhập.  
**Khuyến nghị:** Lưu token vào `localStorage` hoặc `sessionStorage`, đọc lại khi mount `App`.

### 5. Frontend không gọi POST /admin/logout
**Mô tả:** Nút đăng xuất chỉ clear client state, không thông báo server.  
**Khuyến nghị:** Gọi `POST /admin/logout` trước khi clear state (nếu sau này có blacklist).

### 6. File ảnh seed không cùng UUID
**Mô tả:** `dbLoad.js` tạo Photo với `file_name` cứng (`tree.jpg`, `lake.jpg`, ...) trong khi uploaded photos dùng UUID. Ảnh seed cần được copy vào `server/images/`.

---

*Báo cáo được tạo tự động từ phân tích mã nguồn. Cập nhật lần cuối: 10/05/2026.*

# FSchool Attend

Web app điểm danh đầu giờ và theo dõi trạng thái nộp điện thoại cho FPT Schools.

## Chức năng hiện có

- Đăng nhập bằng tài khoản do nhà trường cấp.
- Phiên đăng nhập được ký phía máy chủ và lưu trong cookie `HttpOnly`.
- Bốn vai trò: quản trị viên, giáo viên chủ nhiệm, giáo viên bộ môn và đại diện lớp.
- Chỉ quản trị viên nhìn thấy khu vực quản trị hệ thống.
- Giao diện điểm danh, theo dõi lớp, quản lý tài khoản và phân quyền.
- Dữ liệu lớp và học sinh khởi tạo trống để nhà trường bổ sung sau.
- Responsive cho máy tính, máy tính bảng và điện thoại.

## Chạy trên máy

```bash
npm install
cp .env.example .env.local
npm run dev
```

Trong môi trường development, nếu chưa tạo `.env.local`, có thể dùng tài khoản `admin` / `admin123`.

## Triển khai Vercel

1. Import repository này trong Vercel.
2. Thêm hai biến môi trường:

   - `SESSION_SECRET`: chuỗi ngẫu nhiên dài, nên có ít nhất 32 ký tự.
   - `APP_USERS_JSON`: danh sách tài khoản ở dạng JSON.

Ví dụ `APP_USERS_JSON`:

```json
[
  {
    "username": "admin",
    "password": "mat-khau-manh",
    "name": "Quản trị hệ thống",
    "role": "admin"
  }
]
```

Các giá trị vai trò hợp lệ: `admin`, `homeroom`, `subject`, `representative`.

3. Chọn **Deploy**. Tệp `vercel.json` đã cấu hình lệnh build Next.js.

## Lưu ý bảo mật

Không commit `.env.local` hoặc mật khẩu thật lên GitHub. Trước khi dùng chính thức, hãy đặt mật khẩu riêng cho từng tài khoản qua biến môi trường của Vercel.

# FSchool Attend

Web app điểm danh đầu giờ và theo dõi trạng thái nộp điện thoại cho FPT Schools.

## Chức năng hiện có

- Đăng nhập bằng tài khoản do nhà trường cấp.
- Phiên đăng nhập được ký phía máy chủ và lưu trong cookie `HttpOnly`.
- Bốn vai trò: quản trị viên, giáo viên chủ nhiệm, giáo viên bộ môn và đại diện lớp.
- Chỉ quản trị viên nhìn thấy khu vực quản trị hệ thống.
- Giao diện điểm danh, theo dõi lớp, quản lý tài khoản và phân quyền.
- Dữ liệu lớp và học sinh khởi tạo trống để nhà trường bổ sung sau.
- Admin có thể tạo tài khoản, lớp, học sinh, nhập danh sách và cấp quyền trực tiếp trong app.
- Dữ liệu được lưu dùng chung trong PostgreSQL.
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
   - `DATABASE_URL`: chuỗi kết nối PostgreSQL từ nhà cung cấp cơ sở dữ liệu.

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

3. Chọn **Deploy**. Lệnh `npm run build` và tệp `vercel.json` đều đã được cấu hình cho Next.js trên Vercel.

Khi kết nối lần đầu, ứng dụng tự tạo các bảng tài khoản, lớp, học sinh và phân quyền. Tài khoản admin trong `APP_USERS_JSON` được dùng để đăng nhập ban đầu; sau đó admin có thể tạo thêm tài khoản ngay trong ứng dụng.

Nếu dùng OpenAI Sites thay cho Vercel, chạy `npm run build:sites`.

## Lưu ý bảo mật

Không commit `.env.local` hoặc mật khẩu thật lên GitHub. Trước khi dùng chính thức, hãy đặt mật khẩu riêng cho từng tài khoản qua biến môi trường của Vercel.

# ONLINE EXAM 3.0

Bản này chạy **GitHub Pages + Supabase**, không dùng `google.script.run`.

## Upload
Giữ nguyên cấu trúc:
- `index.html`
- `css/style.css`
- `js/config.js`
- `js/api.js`
- `js/app.js`
- `sql/schema.sql`
- `manifest.webmanifest`
- `sw.js`
- `assets/icon.svg`

## Trước khi mở GitHub Pages
1. Tạo project Supabase.
2. Supabase → SQL Editor → chạy toàn bộ `sql/schema.sql`.
3. Tạo tài khoản trong Authentication → Users hoặc từ màn hình đăng ký.
4. Mở `js/config.js`, điền `SUPABASE_URL` và **Publishable/anon key**.
5. Upload toàn bộ thư mục lên repository.
6. GitHub → Settings → Pages → Deploy from branch → `main` → `/ (root)`.

## Cấp học phần
Sau khi tạo user, lấy UUID user rồi chạy:
```sql
insert into public.teacher_courses(teacher_id,course_id)
select 'UUID_USER',id from public.courses where course_code='HP001';
```

Hoặc đặt user thành admin:
```sql
update public.profiles set role='admin' where id='UUID_USER';
```

## Dữ liệu cũ
`EXAMS`, `QUESTIONS`, `EXAM_QUESTIONS` từ Google Sheets có thể import sang các bảng Supabase tương ứng. `exam_code` giữ dạng `EX001`, `EX002`...

## Bảo mật
Chỉ đưa Publishable/anon key lên frontend. **Không đưa service_role key vào GitHub.**

Phiên bản này phân trang câu hỏi 20 câu/lần, cache danh sách học phần ở trình duyệt, thêm câu hỏi theo batch và khi tạo đề trả về luôn đề vừa tạo — không có chuỗi `create → gọi lại → tìm EXxxx` gây lỗi cũ.

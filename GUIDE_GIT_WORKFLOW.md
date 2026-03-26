# Hướng dẫn quy trình Git cho các thành viên trong nhóm

Tài liệu này hướng dẫn cách các thành viên trong nhóm thiết lập và làm việc với
kho lưu trữ GitHub của dự án `real-estate-project`.

## 1. Cài đặt ban đầu (Clone)

Nếu bạn chưa có mã nguồn trên máy, hãy chạy lệnh sau:

```bash
git clone https://github.com/vhuy0201/real-estate-project.git
cd real-estate-project
```

## 2. Thiết lập môi trường và làm việc

Sau khi clone, bạn cần cài đặt các thư viện cho từng phần (mobile/backend):

```bash
# Đối với Mobile
cd mobile
npm install  # hoặc yarn install

# Đối với Backend
cd ..
cd backend
npm install
```

### Lưu ý về thư mục làm việc:

- Bạn có thể làm việc và chạy lệnh `git` (add, commit, push) ngay tại thư mục
  `mobile` hoặc `backend`. Git sẽ tự động nhận diện vì nó được thiết lập từ thư
  mục gốc của dự án.
- **Xác nhận**: Đúng như bạn nói, bạn cứ vào thư mục `mobile` làm việc bình
  thường, sau đó `git push origin feature/your-feature-name` ngay tại đó là
  được.

## 3. Làm việc với các nhánh (Branches)

Dự án sử dụng nhánh `develop` làm nhánh chính để tích hợp mã nguồn. **Không
commit trực tiếp vào `develop` hoặc `main`.**

### Bước 1: Cập nhật nhánh chính

Trước khi bắt đầu làm tính năng mới, hãy luôn cập nhật mã nguồn mới nhất:

```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo nhánh làm việc mới

Tạo một nhánh con từ `develop` để làm việc:

```bash
# Cấu trúc đặt tên: feature/ten-tinh-nang hoặc fix/ten-loi
git checkout -b feature/your-feature-name
```

## 3. Quá trình làm việc (Commit & Push)

Trong khi làm việc, hãy thực hiện commit thường xuyên:

```bash
# Kiểm tra file thay đổi
git status

# Thêm file vào vùng chờ (staging)
git add .

# Ghi chú nội dung thay đổi (commit)
git commit -m "feat: mô tả ngắn gọn tính năng vừa làm"
```

## 4. Đẩy mã nguồn và tạo Pull Request (PR)

Sau khi hoàn thành công việc trên nhánh con:

### Bước 1: Đẩy nhánh lên GitHub

```bash
git push origin feature/your-feature-name
```

### Bước 2: Tạo Pull Request

1.  Truy cập vào [GitHub](https://github.com/vhuy0201/real-estate-project).
2.  Bạn sẽ thấy thông báo "Compare & pull request" cho nhánh vừa đẩy lên.
3.  Chọn **base: develop** <- **compare: feature/your-feature-name**.
4.  Viết mô tả ngắn gọn và nhờ team lead review.

---

## Lưu ý quan trọng

- **Luôn pull trước khi tạo nhánh mới.**
- **Commit rõ ràng**: Tránh commit với nội dung chung chung như "update", "fix
  bug". Hãy dùng [Conventional Commits](https://www.conventionalcommits.org/)
  nếu có thể (ví dụ: `feat:`, `fix:`, `docs:`, `style:`).
- **Giải quyết conflict**: Nếu có xung đột khi merge, hãy nhờ sự trợ giúp của
  team lead nếu không tự tin giải quyết.

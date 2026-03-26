# 🚀 BÁO CÁO CÔNG VIỆC TRƯỚC ĐÓ (WORK DONE YESTERDAY)

> **LƯU Ý DÀNH CHO TRỢ LÝ AI TRONG PHIÊN LÀM VIỆC TIẾP THEO**: Đọc kỹ file này và kết hợp tham chiếu với `readme.md` ở thư mục gốc để nắm lại kiến trúc, tính năng đã xong và định hướng cần code hôm nay. App được làm hoàn toàn bằng **Tiếng Việt**. Khi gọi APIs, luôn check `Router -> Controller -> Services -> Model` ở thư mục Backend để biết chắc thuộc tính thật.

---

## 🛠️ Kiến Trúc Hệ Thống (Architecture Setup)
- **Tạo nền móng chuẩn**: Thiết lập dự án React Native (Expo) có hệ thống Routing xịn xò (Auth Stack, Buyer/Seller Tabs). 
- **Styling**: Cài đặt thành công `NativeWind` và `Tailwind CSS`.
- **API Client**: Cài `Axios` custom, thiết lập Interceptors hỗ trợ gửi kèm token vào header cho request được bảo mật.
- **State Management**:
  - `Redux Toolkit`: Cấu hình file store và slice (`authSlice`) lưu trạng thái Đăng nhập, thông tin User (Role).
  - `React Query`: Tích hợp với `App.tsx` giúp fetch dữ liệu, handle Loading/Error/Cache dữ liệu từ Server (điển hình `useProperties`).
- **Lưu trữ bảo mật**: Cài đặt `expo-secure-store` để lưu JWT Token lấy từ Backend.

## 🔐 Authentication & Phân Quyền (Sprint 1)
- Xây dựng hoàn chỉnh các màn Đăng nhập (`LoginScreen`), Đăng ký (`RegisterScreen`), Xác thực Mã OTP (`VerifyEmailScreen`) gắn kèm Validate form logic bằng `Formik` và `Yup`. Nối API Gọi thẳng vô NodeJS.
- Bỏ logic Google Login vì yêu cầu dự án chỉ sử dụng Mail nội bộ.
- **Role-Based Access Control (RBAC)**: Viết thuật toán bắt rẽ nhánh tại `RootNavigator.tsx` để render đúng điều hướng Tabs dựa trên `user.role` (Buyer/User thì ra `BuyerTabNavigator`, Seller/Agent thì ra `SellerAgentTabNavigator`).

## 🏡 Danh sách Bất Động Sản (Sprint 2 - U004)
- Viết custom Component Card đẹp: `PropertyCard.tsx`.
- Giao diện `HomeScreen.tsx` đã hiển thị được FlatList bốc dữ liệu thật từ Controller Nodejs (`/api/public/properties`). Hỗ trợ Pull-to-refresh.
- Check kĩ kiến trúc `backend/src/models/property.model.ts` để gỡ lỗi và mapping UI chính xác các trường Đa Ngôn Ngữ `property.title.vi`, `property.address.vi` và các thuộc tính phẳng `bedrooms`, `bathrooms`, `area`.

## ⚙️ Sửa Lỗi Hệ Thống
- Fixed Android Gradle (8.10.2) timeout & Foojay issue, lấy được SHA-1 Fingerprint (nếu cần tương lai).

---

## 📅 Bước Tiếp Theo (Next Steps)
Căn cứ theo File Kế Hoạch (`readme.md`), hãy tiến hành:
1. **(U005)** Xem chi tiết 1 Bất Động Sản (Từ HomeScreen bấm vào) - *Đã hoàn thiện cơ bản, cần tối ưu UI thêm*.
2. **(U009)** Dành cho Seller/Agent: Chức năng Tạo Mới/Đăng Bất Động Sản - *Đã hoàn thiện và fix lỗi crash, tọa độ*.
3. Luôn sử dụng Tiếng Việt cho các Text component hiển thị UI ra ngoài và rà soát file backend API cho kĩ trước khi code.

---

## ✅ CẬP NHẬT CÔNG VIỆC NGÀY 19/03/2026 (WORK DONE TODAY)

### 🚀 Tính năng & Tối ưu HomeScreen
- **Phân trang (Pagination)**: Triển khai Infinite Scroll sử dụng `useInfiniteQuery` (React Query) cho danh sách BĐS, giúp app load mượt mà hơn khi có nhiều dữ liệu.
- **Search & Header**: Tách `HomeHeader` thành component riêng để giải quyết triệt để lỗi mất focus ô Tìm kiếm.
- **Sửa lỗi Phân quyền**: Fix logic trong `useAuth.ts` để đảm bảo tài khoản `seller` được nhận diện đúng vai trò thay vì bị gán nhầm là `buyer`.

### 🛠️ Hoàn thiện màn hình Đăng tin (CreatePropertyScreen)
- **Sửa lỗi Crash**: Thêm optional chaining (`?.`) cho toàn bộ dữ liệu Taxonomy (Danh mục, Tỉnh thành, Tiện ích) để chặn đứng các lỗi runtime khi dữ liệu chưa tải xong.
- **Ổn định tính năng Đăng tin**:
    - **Backend**: Cấu hình lại Model để tọa độ (`coordinates`) là optional (tránh lỗi khi Geocoding thất bại). Ép kiểu `Number` tự động cho Giá, Diện tích, Số phòng trong Service.
    - **Mobile**: Thêm hàm `resetForm()` dọn sạch dữ liệu sau khi đăng tin thành công. Đảm bảo giữ lại dữ liệu nếu quá trình đăng gặp lỗi.
- **Tối ưu UI/UX**:
    - Gộp hai mục chọn "Bán/Thuê" trùng lặp thành một mục "Hình thức" duy nhất lấy trực tiếp từ Database.
    - Sửa lỗi hiển thị Placeholder bị lệch trong ô Mô tả (chỉnh sửa `CustomTextInput.tsx`).

### 🐞 Fix bug màn hình Chi tiết (PropertyDetailScreen)
- Cập nhật Mapping dữ liệu từ Backend gửi về, hỗ trợ hiển thị địa chỉ đầy đủ (Full Address) và dọn dẹp các lỗi truy cập thuộc tính của `undefined`.

---

## ✅ CẬP NHẬT CÔNG VIỆC NGÀY 21/03/2026 (WORK DONE TODAY)

### 🚀 Tính năng Quản lý Yêu cầu (U008) - Đã sửa lỗi Logic
- **Phân loại Đã nhận/Đã gửi**: 
    - **Backend**: Thêm trường `createdBy` vào model `Assignment` để xác định chính xác ai là người khởi tạo yêu cầu (Seller gửi hay Agent gửi).
    - **Mobile**: Cập nhật logic lọc tại `AssignmentListScreen.tsx`. Hiện tại Agent không còn thấy các yêu cầu mình tự gửi trong tab "Đã nhận", tránh tình trạng "tự gửi tự duyệt".
- **Hỗ trợ hình ảnh**: Bổ sung `images` vào lệnh `populate` ở Backend và thêm hàm `getImageUrl` ở Mobile để hiển thị đúng ảnh thumbnail của Bất Động Sản trong danh sách yêu cầu.

### 🛠️ Cải thiện UI/UX & Thông tin chi tiết
- **Thông tin chủ sở hữu (Owner Info)**: Bổ sung mục hiển thị Avatar, Tên và nút Gọi điện/Nhắn tin trực tiếp cho chủ nhà trong `PropertyDetailScreen.tsx`.
- **Sửa lỗi Render Agent List**: Thay thế các tag `div` (dành cho Web) bằng `View` trong `AgentListScreen.tsx` để khắc phục lỗi "Render Error" trên thiết bị thật và giả lập Android.

### 🐞 Fix bug & Assets
- **Đường dẫn Asset**: Sửa lỗi sai đường dẫn `../../../assets/default-avatar.png` trong các màn hình Seller thành `../../assets/` để Metro Bundler có thể resolve chính xác.
- **Dữ liệu Chi tiết Agent**: Cập nhật TypeScript interface `Property` để hỗ trợ hiển thị thông tin Agent/Owner đã được populate đầy đủ từ Backend.

---

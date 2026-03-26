## Product Backlog
STT	Code	User Story	Priority	Sprint	Epic
--- SPRINT 1: AUTHENTICATION & BASIC PROPERTY APIs ---					
1	U001	Là người dùng (buyer/agent/seller), tôi muốn đăng ký tài khoản.	High	Sprint 1	Auth & Users
2	U002	Là người dùng, tôi muốn đăng nhập và đăng xuất khỏi hệ thống.	High	Sprint 1	Auth & Users
3	U003	Là người dùng, tôi muốn xem và cập nhật thông tin cá nhân. Thay đổi mật khẩu	Medium	Sprint 1	Auth & Users
4	U004	Là người dùng, tôi muốn xem danh sách property có phân trang, tìm kiếm, lọc theo giá, loại, thành phố.	High	Sprint 1	Property
5	U005	Là người dùng, tôi muốn xem chi tiết property.	High	Sprint 1	Property
6	U006	Là admin, tôi muốn xem danh sách người dùng, lọc theo role.	High	Sprint 1	Admin & Users
7	U007	Là admin, tôi muốn khóa hoặc cập nhật tài khoản người dùng.	Medium	Sprint 1	Admin & Users
--- SPRINT 2: PROPERTY MANAGEMENT & ADMIN CONTROL ---					
8	U008	Là seller, tôi muốn gửi yêu cầu quản lý property cho agent và ngược lại agent gửi yêu cầu tham gia bất động sản cho seller 	Medium	Sprint 2	Property
9	U009	Là agent/seller, tôi muốn tạo tin đăng bất động sản gồm tiêu đề, mô tả, giá, hình ảnh, thành phố, loại, đặc điểm,...	High	Sprint 2	Property CRUD
10	U010	Là seller/agent, tôi muốn xem list property của mình (nếu là agent thì xem được property được seller chỉ định)	Mdium	Sprint 2	Property
11	U011	Là admin, tôi muốn kiểm duyệt và phê duyệt bài đăng trước khi công khai.	High	Sprint 2	Admin & Property
12	U012	Là agent/seller, tôi muốn chỉnh sửa hoặc xóa property của mình.	High	Sprint 2	Property CRUD
13	U013	Là admin, tôi muốn quản lý danh mục (types, features, cities) để hệ thống có bộ dữ liệu chuẩn cho việc tạo và tìm kiếm bất động sản.	Medium	Sprint 2	Taxonomy
14	U014	Là admin, tôi muốn quản lý bài đăng property (xem tất cả bài đăng, có thể ẩn bài vi phạm).	Medium	Sprint 2	Admin & Property
--- SPRINT 3: USER INTERACTIONS & NOTIFICATIONS, DEALS, CONTRACTS, REVIEW ---					
15	U015	Là buyer, tôi muốn chat tư vấn với AI để hỏi thêm thông tin.	Medium	Sprint 3	Interaction
16	U016	Là buyer, tôi muốn đặt lịch hẹn để xem nhà.	Medium	Sprint 3	Interaction
17	U017	Là agent, tôi muốn quản lý appointments (chấp nhận, hủy, cập nhật).	Medium	Sprint 3	Appointment
18	U018	Là buyer, tôi muốn tạo offer cho property.	Medium	Sprint 3	Appointment
19	U019	Là agent/seller, tôi muốn xử lý offer (chấp nhận/từ chối). (Agent xem xét offer sau đó gửi cho seller để quyết định có accept hay reject)	Medium	Sprint 3	Offer
20	U020	Là người dùng, tôi muốn nhận thông báo khi có sự kiện quan trọng.	Medium	Sprint 3	Offer
21	U021	Là buyer, tôi muốn thêm (hoặc xóa) property vào danh sách yêu thích.	Medium	Sprint 3	Favorite
22	U022	Là Seller/Agent, tôi muốn upload hợp đồng khi deal thành công [Agent, Seller]	Medium	Sprint 3	Notification
23	U023	Là Buyer, tôi muốn xem hoặc upload hợp đồng khi deal thành công[Buyer]	Medium	Sprint 3	Contracts
24	U024	Là Admin, tôi muốn quản lý hợp đồng, deals, payments [Admin]	Medium	Sprint 3	Deals, Contracts
25	U025	Là Buyer, tôi muốn viết review về agent hoặc property[Buyer]	Medium	Sprint 3	Reviews
26	U026	Là Admin, tôi muốn quản lý review của buyer [Admin]	Medium	Sprint 3	Admin Reviews
27	U027	Là buyer, tôi muốn thanh toán tiền property sau khi chấp nhận hợp động.	Medium	Sprint 4	Payments
--- SPRINT 4: ANALYTICS, PROFILE & SYSTEM FINALIZATION---					
28	U028	Là buyer, tôi muốn xem tổng quan về agent	Medium	Sprint 4	Reviews
29	U029	Là admin, tôi muốn xem biểu đồ hiệu suất của từng Agent/Seller trên dashboard (số leads, giao dịch, doanh thu).	Medium	Sprint 4	Reports

## Sử dụng skills
- sử dụng các skills trong folder .agents/skills để áp dụng vào làm cho hiệu quả

## Quy trình làm việc để chuẩn xác việc lấy dữ liệu và hiểu đúng các thuộc tính của model:
 -Khi làm api nào thì bạn phải coi folder router --> controller --> services --> model(tìm các model tương ứng) trong folder backend để biết rõ các thuộc tính trong folder model.
 -Khi làm các User story thì nên để ý thử tính năng đó có cần thông báo hay không để tạo thông báo bằng cách đọc file ở folder backend/src/utils/notificationHelper.ts để thực hiện tính năng thông báo.


## API Sprint 1
| Code | Method | API | Mô tả | PIC |
|------|--------|-----|------|-----|
| U001 | POST | http://localhost:3000/api/client/auth/register | Đăng ký | Viết Huy |
| U002 | POST | http://localhost:3000/api/client/auth/login | Đăng nhập | Viết Huy |
| U003 | GET | http://localhost:3000/api/client/profile | Xem thông tin profile | Huy |
|      | PUT | http://localhost:3000/api/client/profile | Cập nhật profile | Tiến |
|      | PATCH | http://localhost:3000/api/client/profile/change-password | Đổi mật khẩu | |
| U004 | GET | http://localhost:3000/api/public/properties | Xem danh sách bất động sản | Nhật |
| U005 | GET | http://localhost:3000/api/public/properties/:id | Xem chi tiết 1 bất động sản | Vũ |
| U006 | GET | http://localhost:3000/api/admin/users | Xem danh sách người dùng | Đạt |
|      | GET | http://localhost:3000/api/admin/users/:id | Xem chi tiết người dùng | |
| U007 | PATCH | http://localhost:3000/api/admin/users/:id/status | Cập nhật trạng thái người dùng | Vũ |
|      | PATCH | http://localhost:3000/api/admin/users/:id | Cập nhật thông tin người dùng |  |
API Sprint 1
| API | Method | Body | Mô tả | PIC |
|-----|--------|------|------|-----|
| /api/client/auth/register | POST | { "fullName": "Tong Viet Huy", "email": "huybabytong.vn@gmail.com", "password": "123456", "role": "buyer" } | Đăng ký | Huy |
| /api/client/auth/verify-email | POST | { "userId": "...", "otp": "..." } | Xác thực email | |
| /api/client/auth/resend-verification | POST | { "userId": "...", "email": "..." } | Gửi lại OTP | |
| /api/client/auth/forgot-password | POST | { "email": "..." } | Quên mật khẩu | |
| /api/client/auth/reset-password | POST | { "token": "...", "newPassword": "..." } | Reset mật khẩu | |
API Sprint 1
| API | Method | Mô tả | PIC |
|-----|--------|------|-----|
| /api/public/taxonomy/cities | GET | Lấy tỉnh/thành phố | Huy |
| /api/public/taxonomy/cities/:cityId/districts | GET | Lấy quận/huyện theo thành phố | |
| /api/public/taxonomy/districts/:districtId/wards | GET | Lấy xã/phường theo quận/huyện | |
| /api/public/taxonomy/all | GET | Lấy toàn bộ location | |

## API Sprint 2
| Code | Method | API | Mô tả | PIC |
|------|--------|-----|------|-----|
| U008 | GET | http://localhost:3000/api/client/seller/agents | Lấy danh sách agent | Huy |
|      | POST | http://localhost:3000/api/client/seller/properties/:id/assign-agent | Gửi yêu cầu chỉ định agent cho property | |
|      | PATCH | http://localhost:3000/api/client/seller/assignments/:id/cancel | Hủy yêu cầu đã gửi (seller) | |
|      | GET | http://localhost:3000/api/client/agent/assignments | Agent xem danh sách yêu cầu từ seller | |
|      | PATCH | http://localhost:3000/api/client/agent/assignments/:id/accept | Agent chấp nhận yêu cầu | |
|      | PATCH | http://localhost:3000/api/client/agent/assignments/:id/reject | Agent từ chối yêu cầu | |
|      | PATCH | http://localhost:3000/api/client/seller/properties/:id/remove-agent | Xóa agent khỏi property | |
|      | POST | http://localhost:3000/api/client/agent/properties/:id/request-manage | Agent gửi yêu cầu quản lý property | |
|      | PATCH | http://localhost:3000/api/client/agent/assignments/:id/cancel | Agent hủy yêu cầu đã gửi | |
|      | GET | http://localhost:3000/api/client/seller/assignments | Seller xem yêu cầu từ agent | |
|      | PATCH | http://localhost:3000/api/client/seller/assignments/:id/accept | Seller chấp nhận yêu cầu | |
|      | PATCH | http://localhost:3000/api/client/seller/assignments/:id/reject | Seller từ chối yêu cầu | |
|      | GET | http://localhost:3000/api/client/agent/properties/no-agent | Property chưa có agent | |
| U009 | POST | http://localhost:3000/api/client/seller/properties/create | Tạo bất động sản | |
|      | GET | http://localhost:3000/api/client/seller/taxonomies | Lấy taxonomy (city, type, category, features) | |
| U010 | GET | http://localhost:3000/api/client/properties | Lấy danh sách properties phân loại theo role Seller/Agent (về properties của seller cũng như properties mà agent đã tham gia vào) | |
| U011 | GET | http://localhost:3000/api/public/properties | Public xem danh sách property | Đạt |
|      | PATCH | http://localhost:3000/api/admin/properties/:id/status | Admin duyệt property | |
| U012 | PATCH | http://localhost:3000/api/client/properties/:id | Update property | |
|      | DELETE | http://localhost:3000/api/client/properties/:id | Xóa property | |

| Module | Method | API | Mô tả | PIC |
|--------|--------|-----|------|-----|
| Category | GET | http://localhost:3000/api/admin/categories | Xem danh mục | Vũ |
|          | POST | http://localhost:3000/api/admin/categories | Thêm danh mục | |
|          | PATCH | http://localhost:3000/api/admin/categories/:id | Sửa danh mục | |
|          | DELETE | http://localhost:3000/api/admin/categories/:id | Xóa danh mục | |
| Type | GET | http://localhost:3000/api/admin/types | Xem loại BDS | |
|      | POST | http://localhost:3000/api/admin/types | Thêm loại BDS | |
|      | PATCH | http://localhost:3000/api/admin/types/:id | Sửa loại BDS | |
|      | DELETE | http://localhost:3000/api/admin/types/:id | Xóa loại BDS | |
| Feature | GET | http://localhost:3000/api/admin/features | Xem tiện ích | |
|         | POST | http://localhost:3000/api/admin/features | Thêm tiện ích | |
|         | PATCH | http://localhost:3000/api/admin/features/:id | Sửa tiện ích | |
|         | DELETE | http://localhost:3000/api/admin/features/:id | Xóa tiện ích | |

| Code | Method | API | Mô tả | PIC |
|------|--------|-----|------|-----|
| U014 | PATCH | http://localhost:3000/api/admin/properties/:id/hide | Ẩn property vi phạm | Khánh |
|      | PATCH | http://localhost:3000/api/admin/properties/:id/restore | Khôi phục property | |

## API Sprint 3

| Code | Method | Endpoint | Mô tả |
|------|--------|----------|------|
| U020 | GET | /api/client/notifications | Lấy danh sách notifications |
| U020 | GET | /api/client/notifications/unread-count | Lấy số lượng chưa đọc |
| U020 | PATCH | /api/client/notifications/:id/read | Đánh dấu đã đọc |
| U020 | PATCH | /api/client/notifications/read-all | Đánh dấu tất cả đã đọc |

| U015 | POST | /api/client/chat/ai-search | Tìm property theo yêu cầu của buyer |
| U015 | POST | /api/client/seller/properties/generate-description | Generate mô tả property |

| U022 | POST | /api/client/agent/contracts/deals/:id | Upload hợp đồng (agent) |
| U022 | POST | /api/client/seller/contracts/deals/:id | Upload hợp đồng (seller) |
| U022 | GET | /api/client/agent/contracts/deals/:id | Lấy hợp đồng theo deal |
| U022 | GET | /api/client/seller/contracts/deals/:id | Lấy hợp đồng theo deal |
| U022 | PUT | /api/client/agent/contracts/deals/:id | Update hợp đồng |
| U022 | PUT | /api/client/seller/contracts/deals/:id | Update hợp đồng |
| U022 | PATCH | /api/client/agent/contracts/deals/:id/contracts/:contractId | Xóa hợp đồng |
| U022 | PATCH | /api/client/seller/contracts/deals/:id/contracts/:contractId | Xóa hợp đồng |
| U022 | GET | /api/client/seller/deals/:id | Lấy deal by id |
| U022 | GET | /api/client/agent/deals/:id | Lấy deal by id |
| U022 | GET | /api/client/seller/deals | Danh sách deals |
| U022 | GET | /api/client/agent/deals | Danh sách deals |
| U022 | GET | /api/client/agent/contracts/deals/:id/list | Danh sách hợp đồng |

| U018 | POST | /api/client/buyer/offers | Tạo offer |
| U018 | GET | /api/client/buyer/offers | Lấy danh sách offer |
| U018 | PATCH | /api/client/buyer/:id/cancel | Hủy offer |

| U019 | GET | /api/client/agent/offers | Agent lấy offers |
| U019 | PATCH | /api/client/agent/offers/:id/forward | Forward offer |
| U019 | GET | /api/client/seller/offers | Seller lấy offers |
| U019 | PATCH | /api/client/seller/offers/:id/accept | Accept offer |
| U019 | PATCH | /api/client/seller/offers/:id/reject | Reject offer |

| U016 | GET | /api/client/buyer/appointments | Lấy lịch hẹn buyer |
| U016 | POST | /api/client/buyer/appointments | Tạo lịch hẹn |
| U016 | PATCH | /api/client/buyer/appointments/:id/cancel | Hủy lịch hẹn |

| U021 | POST | /api/client/buyer/favorites | Thêm vào favorites |
| U021 | DELETE | /api/client/buyer/favorites/:propertyId | Xóa khỏi favorites |
| U021 | GET | /api/client/buyer/favorites | Danh sách favorites |
| U021 | GET | /api/client/buyer/favorites/:propertyId/check | Check favorite |

| U017 | GET | /api/client/agent/appointments | Agent lấy lịch hẹn |
| U017 | PATCH | /api/client/agent/appointments/:id/reject | Từ chối lịch |
| U017 | PATCH | /api/client/agent/appointments/:id/accept | Chấp nhận lịch |
| U017 | PATCH | /api/client/agent/appointments/:id/complete | Hoàn thành lịch |

| U024 | GET | /api/admin/deals | Admin lấy deals |
| U024 | GET | /api/admin/deals/:id | Admin lấy deal by id |
| U024 | PATCH | /api/admin/deals/:id/status | Update status deal |
| U024 | GET | /api/admin/contracts | Admin lấy contracts |
| U024 | GET | /api/admin/contracts/:id | Admin lấy contract detail |
| U024 | GET | /api/admin/payments | Admin lấy payments |
| U024 | POST | /api/admin/payments | Tạo payment |
| U024 | GET | /api/admin/payments/:id | Chi tiết payment |
| U024 | PATCH | /api/admin/payments/:id | Update payment |
| U024 | DELETE | /api/admin/payments/:id | Xóa payment |

| U023 | GET | /api/client/buyer/deals/:dealId/contract | Lấy contract theo deal |
| U023 | GET | /api/client/buyer/deals/:dealId/contract/download | Download contract |
| U023 | POST | /api/client/buyer/deals/:dealId/contract | Upload contract |
| U023 | GET | /api/client/buyer/contracts | Danh sách contract |
| U023 | PATCH | /api/client/buyer/deals/:id/contracts/:id/accept | Accept contract |
| U023 | PATCH | /api/client/buyer/deals/:id/contracts/:id/reject | Reject contract |
| U023 | GET | /api/client/buyer/deals | Danh sách deals |

| U025 | POST | /api/client/buyer/reviews | Tạo review |
| U025 | GET | /api/client/buyer/reviews | Lấy reviews |
| U025 | PATCH | /api/client/buyer/reviews/:reviewId | Update review |
| U025 | DELETE | /api/client/buyer/reviews/:reviewId | Xóa review |

| U027 | GET | /api/client/buyer/payments | Lấy payments |
| U027 | POST | /api/client/buyer/payments/create | Tạo payment |
| U027 | POST | /api/public/webhook/payos | Fake thanh toán |
| U027 | POST | /api/admin/payments/:id/release | Release payment |

| U026 | GET | /api/admin/reviews | Admin lấy reviews |
| U026 | GET | /api/admin/reviews/:id | Chi tiết review |
| U026 | PATCH | /api/admin/reviews/:id/unhide | Unhide review |
| U026 | PATCH | /api/admin/reviews/:id/hide | Hide review |
| U026 | DELETE | /api/admin/reviews/:id | Xóa review |

| Bổ sung | GET | /api/client/buyer/properties | Danh sách property đã mua/thuê |

## API Sprint 4
| Code | Method | Endpoint | Mô tả |
|------|--------|----------|------|
| U027 | GET | /api/public/agents | Lấy danh sách agent (public, không cần token) |
| U027 | GET | /api/public/agents/:id | Lấy chi tiết agent (bao gồm số lượng đã bán & đang tham gia property) |
| U027 | GET | /api/public/agents/:id/properties | Danh sách bất động sản agent đã bán/cho thuê thành công |
| U027 | GET | /api/public/agents/:id/reviews | Danh sách review của agent |

| U028 | GET | /api/admin/reports/summary | Thống kê tổng quan (users, properties, deals, revenue, leads) |
| U028 | GET | /api/admin/reports/top-agents | Danh sách top agents theo số deal & hoa hồng |
| U028 | GET | /api/admin/reports/revenue-chart | Dữ liệu biểu đồ doanh thu & số deal theo tháng |
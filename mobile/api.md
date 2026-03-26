	
API	Mô tả
POST http://localhost:3000/api/client/auth/register	Đăng ký
POST http://localhost:3000/api/client/auth/login	Đăng nhập
GET http://localhost:3000/api/client/profile	Xem thông tin profile
PUT http://localhost:3000/api/client/profile	Cập nhật profile
PATCH http://localhost:3000/api/client/profile/change-password	Đổi mật khẩu
GET http://localhost:3000/api/public/properties	Xem danh sách bất động sản
GET http://localhost:3000/api/public/properties/:id	xem chi tiết 1 bất động sản
GET http://localhost:3000/api/admin/users	xem danh sách người dùng
GET http://localhost:3000/api/admin/users/:id	xem chi tiết người dùng
PATCH http://localhost:3000/api/admin/users/:id/status	cập nhật trạng thái hoạt động của người dùng
PATCH http://localhost:3000/api/admin/users/:id	cập nhật thông tin người dùng
POST http://localhost:3000/api/client/auth/register	"body: 
{
""fullName"": ""Tong Viet Huy"",
""email"": ""huybabytong.vn@gmail.com"",
""password"": ""123456""
""role"": ""buyer""
}"
POST http://localhost:3000/api/client/auth/verify-email	"body:
{
  ""userId"": ""69255f6c1958059c3f865c50"", 
  ""otp"": ""689637"" // mã OTP nhận được trong email
}
lấy id user từ bước register trên và opt trong mail"
POST http://localhost:3000/api/client/auth/resend-verification	"body:
{
  ""userId"": ""<id của user>"",
  ""email"": ""....""
}
gửi lại otp về email"
POST http://localhost:3000/api/client/auth/forgot-password	"gửi lên body:
{
  ""email"": ""huybabytong.vn@gmail.com""
}"
POST http://localhost:3000/api/client/auth/reset-password	"gửi lên body:
{
  ""token"": ""xxxxxxxxxxxxxxxxxxxxxxxxxx"",
  ""newPassword"": ""12345678""
}
"
GET http://localhost:3000/api/public/taxonomy/cities	Lấy tỉnh/ thành phố
GET http://localhost:3000/api/public/taxonomy/cities/:citiId/districts	Lấy quận/huyện theo id của thành phố
GET http://localhost:3000/api/public/taxonomy/districts/:districtId/wards	Lấy xã/phường theo id của quận/huyện
GET http://localhost:3000/api/public/taxonomy/all	Lấy tất cả location
	
	
	
API	Mô tả
"GET  http://localhost:3000/api/client/seller/agents
"	Lấy ra danh sách agent
POST  http://localhost:3000/api/client/seller/properties/:id/assign-agent 	Gửi yêu cầu chỉ định quản lí  bđs cho agent (:id : là property ID), gửi lên agent_id
PATCH  http://localhost:3000/api/client/seller/assignments/:id/cancel 	Hủy yêu cầu đã gửi (:id : là assignments id)
GET  http://localhost:3000/api/client/agent/assignments 	Lấy ra danh sách các yêu cầu chỉ định mà seller đã gửi cho agent
PATCH  http://localhost:3000/api/client/agent/assignments/:id/accept 	chấp nhận  yêu cầu chỉ định mà seller đã gửi cho agent (:id : là assignments id),
PATCH  http://localhost:3000/api/client/agent/assignments/:id/reject 	Từ chối  yêu cầu chỉ định mà seller đã gửi cho agent (:id : là assignments id)
PATCH http://localhost:3000/api/client/seller/properties/:id/remove-agent	Xóa agent khỏi property sau khi gán (:id : là property ID)
POST  http://localhost:3000/api/client/agent/properties/:id/request-manage	"Gửi yêu cầu tham gia quản lí property cho seller (:id : là property ID), gửi lên body
ví dụ: {
  ""owner_id"": ""690c2596e6191a33d07ea416""
}
"
PATCH  http://localhost:3000/api/client/agent/assignments/:id/cancel 	Hủy yêu cầu đã gửi (:id : là assignments id)
GET  http://localhost:3000/api/client/seller/assignments	Lấy ra danh sách các yêu cầu mà agent đã gửi cho seller
PATCH  http://localhost:3000/api/client/seller/assignments/:id/accept	chấp nhận yêu cầu mà agent đã gửi cho seller (:id : là assignments id
PATCH  http://localhost:3000/api/client/seller/assignments/:id/reject 	Từ chối yêu cầu chỉ định mà agent đã gửi cho seller(:id : là assignments id)
GET http://localhost:3000/api/client/agent/properties/no-agent	Lấy danh sách property không có agent quản lý
POST  http://localhost:3000/api/client/seller/properties/create	Tạo 1 bất động sản
GET  http://localhost:3000/api/client/seller/taxonomies	Lấy ra list các thành phố, loại bán hay thuê, category và features
GET http://localhost:3000/api/client/properties	Lấy danh sách properties phân loại theo role Seller/Agent (về properties của seller cũng như properties mà agent đã tham gia vào)
GET  http://localhost:3000/api/public/properties	Lấy danh sách property 
PATCH   http://localhost:3000/api/admin/properties/:id/status	Phê duyệt property 
PATCH http://localhost:3000/api/client/properties/ID	update property chính chủ
DELETE http://localhost:3000/api/client/properties/ID	xóa property chính chủ
GET http://localhost:3000/api/admin/categories	xem các danh mục
POST http://localhost:3000/api/admin/categories	thêm mới
PATCH http://localhost:3000/api/admin/categories/:id	sửa danh mục(id là category_name: Villa)
DELETE http://localhost:3000/api/admin/categories/:id	xóa danh mục
GET http://localhost:3000/api/admin/types	xem tất cả các loại BDS
POST http://localhost:3000/api/admin/types	Thêm loại BDS mới
PATCH http://localhost:3000/api/admin/types/:id	Sửa loại BDS(id là type_name :  for sale, for rent)
DELETE http://localhost:3000/api/admin/types/:id	xóa BDS
GET http://localhost:3000/api/admin/features	xem tất cả các tiện ích
POST http://localhost:3000/api/admin/features	thêm tiện ích mới
PATCH http://localhost:3000/api/admin/features/:id	sửa tiện ích(id là feature_name)
DELETE http://localhost:3000/api/admin/features/:id	xxóa tiện ích
PATCH http://localhost:3000/api/admin/properties/:id/hide	Admin ẩn property nếu vi phạm
PATCH http://localhost:3000/api/admin/properties/:id/restore	Admin bỏ ẩn property
	
	
	
	
	
	
API	Mô tả
GET http://localhost:3000/api/client/notifications	Lấy danh sách notifications
GET http://localhost:3000/api/client/notifications/unread-count	Lấy số lượng chưa đọc
PATCH http://localhost:3000/api/client/notifications/:id/read	Đánh dấu đã đọc
PATCH http://localhost:3000/api/client/notifications/read-all	Đánh dấu tất cả đã đọc
POST  http://localhost:3000/api/client/chat/ai-search	Tìm property theo yêu cầu của buyer
POST http://localhost:3000/api/client/seller/properties/generate-description	Gen  mô tả khi tạo property
"POST http://localhost:3000/api/client/agent/contracts/deals/:id
http://localhost:3000/api/client/seller/contracts/deals/:id"	"Headers:
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
Body (form-data):
Key: file (type File) → chọn file PDF/DOCX
Optional keys: contract_type = initial|buyer_signed|final, 
status = draft|submitted, 
notes = ""Ghi chú"""
"GET http://localhost:3000/api/client/agent/contracts/deals/:id
http://localhost:3000/api/client/seller/contracts/deals/:id"	"Lấy hợp đồng theo id
Query optional:
history=true để xem toàn bộ phiên bản (mặc định trả “latest only”)"
"PUT http://localhost:3000/api/client/agent/contracts/deals/:id
http://localhost:3000/api/client/seller/contracts/deals/:id"	"Body (multipart/form-data):
file (File), optional: contract_type, status, notes"
"PATCH http://localhost:3000/api/client/agent/contracts/deals/:id/contracts/:contractId
 http://localhost:3000/api/client/seller/contracts/deals/:id/contracts/:contractId"	Xóa hợp đồng
"GET http://localhost:3000 /api/client/seller/deals/:id 
http://localhost:3000 /api/client/agent/deals/:id "	lấy deal by id (cả agent và seller đều có)
"GET http://localhost:3000 /api/client/seller/deals
http://localhost:3000 /api/client/agent/deals"	danh sách deal (cả agent và seller đều có)
GET http://localhost:3000/api/client/agent/contracts/deals/:id/list	Danh sách hợp đồng
POST http://localhost:3000/api/client/buyer/offers	"Body ví dụ:
    {
      ""propertyId"": ""6916ee8105909f73fa603a9f"",
      ""amount"": 2500000000,
      ""note"": ""Quan tâm biệt thự, đề xuất thương lượng."",
      ""currency"": ""VND"",
      ""expiresAt"": ""2025-12-31T00:00:00.000Z"",
      ""attachments"": [""https://example.com/proof.pdf""],
      ""meta"": { ""preferredMoveIn"": ""Q1/2026"" }
    }"
GET  http://localhost:3000/api/client/buyer/offers	"Lấy danh sách tất cả các offer mà buyer đã gửi.
"
PATCH http://localhost:3000/api/client/buyer/:id/cancel	Cho phép buyer hủy một offer cụ thể bằng cách dùng ID.
GET http://localhost:3000/api/client/agent/offers	Lấy danh sách offers của role agent
PATCH http://localhost:3000/api/client/agent/offers/:id/forward	Gửi offer cho owner (truyền offer_id)
GET http://localhost:3000/api/client/seller/offers	Lấy danh sách offers của role seller
PATCH http://localhost:3000/api/client/seller/offers/:id/accept	Chấp nhận offer (role seller)
PATCH http://localhost:3000/api/client/seller/offers/:id/reject	Từ chối offer (role seller)
GET http://localhost:3000/api/client/buyer/appointments	lấy danh sách các lịch hẹn của buyer(lịch hẹn xem nhà)
POST http://localhost:3000/api/client/buyer/appointments	"time max = 3, quá khứ không được, note vs location có thể có hoặc không
{
    ""propertyId"": ""65b0981d3d62..."",
    ""location"": ""Địa chỉ xem chi tiết"",
    ""times"": [
        {
            ""time"": ""2025-12-05T10:00:00.000Z"",
            ""note"": ""Sáng thứ Sáu, tiện đường đi làm""
        },
        {
            ""time"": ""2025-12-06T14:30:00.000Z""
        }
    ]
}

"
PATCH http://localhost:3000/api/client/buyer/appointments/:id/cancel	lấy id của appointment truyền vào để hủy cuộc hẹn
POST http://localhost:3000/api/client/buyer/favorites	"Thêm 1 bất động sản vào danh sách yêu thích của buyer

Headers:
Authorization: Bearer <token>

Body:
{
  ""property_id"": ""6919bcef2e855d021288b67a""
}
"
DELETE http://localhost:3000/api/client/buyer/favorites/:propertyId	Xóa 1 bất động sản vào danh sách yêu thích của buyer. Truyền vào id bất động sản
GET http://localhost:3000/api/client/buyer/favorites	Lấy tất cả danh sách bất động sản mà buyer đã yêu thích.
GET http://localhost:3000/api/client/buyer/favorites/:propertyId/check	Kiểm tra xem buyer đã yêu thích property này chưa.
GET  http://localhost:3000/api/client/agent/appointments	Agent lấy tất cả lịch hẹn, phải đăng nhập role agent
PATCH http://localhost:3000/api/client/agent/appointments/:id/reject	"từ chối lịch hẹn, status sẽ chuyển sang ""reject"" , lấy ID cuộc hẹn truyền vào

http://localhost:3000/api/client/agent/appointments/6916f3f88d826fc498bc903e/reject

"
PATCH http://localhost:3000/api/client/agent/appointments/:id/accept	"Chấp nhận lịch hẹn,  status sẽ chuyển sang ""accept"" , lấy ID cuộc hẹn truyền vào 
 cần truyền vào thời gian chọn để accept gửi thông báo thời gian cụ thể cho buyer
{
    ""selectedTime"": ""2025-12-06T14:30:00.000Z"" 
}"
PATCH http://localhost:3000/api/client/agent/appointments/:id/complete	sau khi đi xem nhà về thì agent cập nhật lại trạng thái hoàn thành cuộc hẹn và gửi thông báo về cho buyer
GET http://localhost:3000/api/admin/deals	Lấy danh sách deal
GET http://localhost:3000/api/admin/deals/:id	lấy deal by id (cả agent và seller đều có)
PATCH http://localhost:3000/api/admin/deals/:id/status	thay đổi trạng thái deal status
GET http://localhost:3000/api/admin/contracts	Lấy hợp đồng
GET http://localhost:3000/api/admin/contracts/:id	"Lấy hợp đồng theo id
Query optional:
history=true để xem toàn bộ phiên bản (mặc định trả “latest only”)"
GET http://localhost:3000/api/admin/payments	Lấy danh sách payments
POST http://localhost:3000/api/admin/payments (Admin tạo payment thủ công)	(chưa có)
GET http://localhost:3000/api/admin/payments/:id	Lấy chi tiết payments
PATCH http://localhost:3000/api/admin/payments/:id	(chưa có)
DELETE http://localhost:3000/api/admin/payments/:id	(chưa có)
GET /api/client/buyer/deals/:dealId/contract	Lấy hợp đồng theo dealId (Buyer phải là chủ deal)
GET /api/client/buyer/deals/:dealId/contract/download	Lấy thông tin download hợp đồng (URL, filename, mime_type)
POST /api/client/buyer/deals/:dealId/contract	Upload hợp đồng đã ký (Buyer signed contract)
GET /api/client/buyer/contracts	
PATCH http://localhost:3000/api/client/buyer/deals/:id/contracts/:id/accept	deal_id và contract_id 
PATCH http://localhost:3000/api/client/buyer/deals/:id/contracts/:id/reject	
GET http://localhost:3000/api/client/buyer/deals	lấy ds deals
POST http://localhost:3000/api/client/buyer/reviews	1. Tạo review cho Property
POST http://localhost:3000/api/client/buyer/reviews	2. Tạo review cho Agent
GET http://localhost:3000/api/client/buyer/reviews?page=1&limit=10	3. Lấy danh sách reviews của tôi
GET http://localhost:3000/api/client/buyer/reviews?target_type=property&page=1&limit=10	4. Lấy reviews chỉ cho Property
GET http://localhost:3000/api/client/buyer/reviews?target_type=agent&page=1&limit=10	5. Lấy reviews chỉ cho Agent
PATCH http://localhost:3000/api/client/buyer/reviews/reviewId	6. Cập nhật review
DELETE http://localhost:3000/api/client/buyer/reviews/reviewId	7. Xóa review
GET http://localhost:3000/api/client/buyer/payments	Lấy danh sách payments (buyer)
POST http://localhost:3000/api/client/buyer/payments/create	Tạo thanh toán Escrow từ buyer (sẽ tạo ra id payment) (gửi lên body là deal_Id)
POST http://localhost:3000/api/public/webhook/payos	"fake thanh toán thành công
Simulate thanh toán thành công (Webhook)(gửi lên body là {
  ""paymentId"": ""id"",
  ""status"": ""success""
})"
POST http://localhost:3000/api/admin/payments/:id/release	admin sẽ giải ngân tiền qua :id deals (role admin)
GET http://localhost:3000/api/admin/reviews	Lấy danh sách tất cả reviews
GET http://localhost:3000/api/admin/reviews/:id	Lấy chi tiết review
PATCH http://localhost:3000/api/admin/reviews/:id/unhide	Bỏ ẩn
PATCH http://localhost:3000/api/admin/reviews/:id/hide	Ẩn review
DELETE http://localhost:3000/api/admin/reviews/:id	Xoá review
GET  http://localhost:3000/api/client/buyer/properties	Danh sách properties mà buyer đã mua hoặc đã thuê
	
	
API	Mô tả
GET http://localhost:3000/api/public/agents	Lấy danh sách agent (public không cần token)
GET http://localhost:3000/api/public/agents/:id	Lấy chi tiết agent, có trả về số lượng bán được và số lượng đang tham gia vào bất động sản. (public không cần token)
GET http://localhost:3000/api/public/agents/:id/properties	Lấy danh sách bất động sản mà agent đã bán hoặc cho thuê thành công. (public không cần token)
GET http://localhost:3000/api/public/agents/:id/reviews	Lấy danh sách review mà agent đã được đánh giá. (public không cần token)
GET http://localhost:3000/api/admin/reports/summary	"{
  ""success"": true,
  ""message"": ""Lấy thống kê tổng quan thành công"",
  ""data"": {
    ""totalUsers"": 120,
    ""totalProperties"": 350,
    ""totalDealsCompleted"": 42,
    ""totalRevenue"": 98500000,
    ""totalLeads"": 113
  }
}"
GET http://localhost:3000/api/admin/reports/top-agents	"{
  ""success"": true,
  ""message"": ""Get top agents successfully"",
  ""data"": [
    {
      ""agent_id"": ""66f2839282bd08"",
      ""fullName"": ""Nguyễn Văn A"",
      ""email"": ""agentA@gmail.com"",
      ""totalDeals"": 12,
      ""totalAgentFee"": 47000000
    },
    {
      ""agent_id"": ""66f283937349aa"",
      ""fullName"": ""Trần B"",
      ""email"": ""agentB@gmail.com"",
      ""totalDeals"": 9,
      ""totalAgentFee"": 31000000
    }
  ]
}
"
GET http://localhost:3000/api/admin/reports/revenue-chart	"{
  ""success"": true,
  ""message"": ""Lấy biểu đồ doanh thu thành công"",
  ""data"": {
    ""year"": 2024,
    ""revenueByMonth"": [
      { ""_id"": { ""month"": 1 }, ""revenue"": 20000000 },
      { ""_id"": { ""month"": 4 }, ""revenue"": 35000000 }
    ],
    ""dealsByMonth"": [
      { ""_id"": { ""month"": 1 }, ""totalDeals"": 5 },
      { ""_id"": { ""month"": 4 }, ""totalDeals"": 8 }
    ]
  }
}
"
import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";

const router = express.Router();

// Buyer xem danh sách property
router.get("/properties", verifyToken, roleCheck("buyer"), (req, res) => {
  res.json({ message: "Danh sách bất động sản cho buyer" });
});

// Buyer xem chi tiết property
router.get("/properties/:id", verifyToken, roleCheck("buyer"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Chi tiết property ID: ${id}` });
});

// Buyer gửi enquiry hỏi thông tin
router.post("/enquiries", verifyToken, roleCheck("buyer"), (req, res) => {
  res.json({ message: "Tạo enquiry thành công" });
});

// Buyer đặt lịch hẹn
router.post("/appointments", verifyToken, roleCheck("buyer"), (req, res) => {
  res.json({ message: "Đặt lịch hẹn thành công" });
});

export default router;

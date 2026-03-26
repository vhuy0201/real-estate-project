import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";

const router = express.Router();

// Seller tạo property mới
router.post("/properties", verifyToken, roleCheck("seller"), (req, res) => {
  res.json({ message: "Property mới đã được tạo" });
});

// Seller chỉnh sửa property
router.put("/properties/:id", verifyToken, roleCheck("seller"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Property ${id} đã được cập nhật` });
});

// Seller xóa property
router.delete("/properties/:id", verifyToken, roleCheck("seller"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Property ${id} đã được xóa` });
});

// Seller gán agent
router.put("/properties/:id/assign-agent", verifyToken, roleCheck("seller"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Đã gán agent cho property ${id}` });
});

export default router;

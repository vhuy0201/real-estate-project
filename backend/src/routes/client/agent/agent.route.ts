import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";

const router = express.Router();

// Agent xem danh sách enquiries
router.get("/enquiries", verifyToken, roleCheck("agent"), (req, res) => {
  res.json({ message: "Danh sách enquiries của agent" });
});

// Agent xem/duyệt appointments
router.get("/appointments", verifyToken, roleCheck("agent"), (req, res) => {
  res.json({ message: "Danh sách appointments của agent" });
});

router.put("/appointments/:id", verifyToken, roleCheck("agent"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Cập nhật appointment ${id}` });
});

// Agent xử lý offer
router.put("/offers/:id/status", verifyToken, roleCheck("agent"), (req, res) => {
  const { id } = req.params;
  res.json({ message: `Offer ${id} đã được xử lý` });
});

export default router;

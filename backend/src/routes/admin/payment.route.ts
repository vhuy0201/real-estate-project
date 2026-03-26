import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware"; // Giả định đường dẫn
import { roleCheck } from "../../middlewares/roleCheck.middleware"; // Giả định đường dẫn
import {
  getPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../../controllers/admin/payment.controller";
import { releaseEscrowController } from "../../controllers/client/buyer/payment.controller";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

// GET /api/admin/payments
router.get("/", getPayments);

// POST /api/admin/payments (Admin tạo payment thủ công)
router.post("/", createPayment);

// GET /api/admin/payments/:id
router.get("/:id", getPaymentById);

// PATCH /api/admin/payments/:id
router.patch("/:id", updatePayment);

// DELETE /api/admin/payments/:id
router.delete("/:id", deletePayment);

// admin release
router.post("/:dealId/release", verifyToken, roleCheck("admin"), releaseEscrowController);

export default router;
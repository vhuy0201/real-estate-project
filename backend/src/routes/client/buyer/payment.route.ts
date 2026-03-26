import { Router } from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { createEscrowPayment, getBuyerPayments, getPaymentsByDealId, payosWebhook } from "../../../controllers/client/buyer/payment.controller";

const router = Router();

router.get("/", verifyToken, roleCheck("buyer"), getBuyerPayments);

router.get("/deal/:dealId", verifyToken, roleCheck("buyer"), getPaymentsByDealId);

// Buyer creates QR/payment
router.post("/create", verifyToken, roleCheck("buyer"), createEscrowPayment);

// webhook (public)
router.post("/webhook/payos", payosWebhook);


export default router;

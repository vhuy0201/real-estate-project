import { Router } from "express";
import { payosWebhook } from "../../controllers/client/buyer/payment.controller";

const router = Router();

// webhook (public)
router.post("/payos", payosWebhook);

export default router;

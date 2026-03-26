import { Router } from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getSellerPayments } from "../../../controllers/client/seller/payments.controller";

const router = Router();

router.get("/", verifyToken, roleCheck("seller"), getSellerPayments);

export default router;

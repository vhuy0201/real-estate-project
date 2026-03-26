import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getMyDealById, getMyDeals } from "../../../controllers/client/seller/deal.controller";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  roleCheck("seller"),
  getMyDeals
);

router.get(
  "/:dealId",
  verifyToken,
  roleCheck("seller"),
  getMyDealById
);

export default router;
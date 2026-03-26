import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getMyDealById, getMyDeals } from "../../../controllers/client/agent/deal.controller";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  roleCheck("agent"),
  getMyDeals
);

router.get(
  "/:dealId",
  verifyToken,
  roleCheck("agent"),
  getMyDealById
);

export default router;
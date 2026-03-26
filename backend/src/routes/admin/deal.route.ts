import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware"; // Giả định đường dẫn
import { roleCheck } from "../../middlewares/roleCheck.middleware"; // Giả định đường dẫn
import {
  getDeals,
  getDealById,
  updateDealStatus,
} from "../../controllers/admin/deal.controller";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

// GET /api/admin/deals
router.get("/", getDeals);

// GET /api/admin/deals/:id
router.get("/:id", getDealById);

// PATCH /api/admin/deals/:id/status
router.patch("/:id/status", updateDealStatus);

export default router;
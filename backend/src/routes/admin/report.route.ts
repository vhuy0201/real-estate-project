import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";
import {
  getAdminSummary,
  getRevenueChart,
  getTopAgents,
  getTopSellers,
  getUserRolesSummary,
} from "../../controllers/admin/report.controller";

const router = Router();

router.get(
  "/user-roles-summary",
  verifyToken,
  roleCheck("admin"),
  getUserRolesSummary
);

// Summary
router.get(
  "/summary",
  verifyToken,
  roleCheck("admin"),
  getAdminSummary
);

// Revenue chart
router.get(
  "/revenue-chart",
  verifyToken,
  roleCheck("admin"),
  getRevenueChart
);

// Top agents
router.get(
  "/top-agents",
  verifyToken,
  roleCheck("admin"),
  getTopAgents
);

router.get(
  "/top-sellers",
  verifyToken,
  roleCheck("admin"),
  getTopSellers
);

export default router;

import express from "express";
import {
  approveOrRejectProperty,
  adminListProperties,
  hideProperty,
  restoreProperty,
  getPropertyById,
} from "../../controllers/admin/property.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

// [GET] Danh sách cho admin — chỉ admin (JWT)
router.get(
  "",
  verifyToken,
  roleCheck("admin"),
  adminListProperties
);

router.get("/:id", verifyToken, roleCheck("admin"), getPropertyById);

// [PATCH] U011 - phê duyệt hoặc từ chối
router.patch(
  "/:id/status",
  verifyToken,
  roleCheck("admin"),
  approveOrRejectProperty
);

// [PATCH] U014 - ẩn bài (hide) và khôi phục (restore)
router.patch("/:id/hide", verifyToken, roleCheck("admin"), hideProperty);

router.patch("/:id/restore", verifyToken, roleCheck("admin"), restoreProperty);

export default router;

import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserInfo,
  updateUserStatus,
} from "../../controllers/admin/user.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

router.get("/users/:id", verifyToken, roleCheck("admin"), getUserById);
router.patch("/users/:id", verifyToken, roleCheck("admin"), updateUserInfo);
router.get("/users", verifyToken, roleCheck("admin"), getAllUsers);
router.patch("/users/:id/status", verifyToken, roleCheck("admin"), updateUserStatus);

export default router;

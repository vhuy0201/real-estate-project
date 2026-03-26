import express from "express";
import { dashboardController } from "../../../controllers/client/common/dashboard.controller";
import { verifyToken } from "../../../middlewares/auth.middleware";

const router = express.Router();

router.get("/stats", verifyToken, dashboardController.getStats);

export default router;

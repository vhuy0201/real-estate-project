// src/routes/client/agent/assignment.route.ts
import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { acceptRequest, cancelAssignmentByAgent, listMyRequests, rejectRequest } from "../../../controllers/client/agent/assignment.controller";

const router = express.Router();

// Lấy danh sách yêu cầu gán (GET /agent/assignments?status=pending)
router.get("/", verifyToken, roleCheck("agent"), listMyRequests);

// Agent chấp nhận yêu cầu (PATCH /agent/assignments/:id/accept)
router.patch("/:id/accept", verifyToken, roleCheck("agent"), acceptRequest);

// Agent từ chối yêu cầu (PATCH /agent/assignments/:id/reject)
router.patch("/:id/reject", verifyToken, roleCheck("agent"), rejectRequest);

// agent hủy yêu cầu đã gửi
router.patch(
  "/:id/cancel",
  verifyToken,
  roleCheck("agent"),
  cancelAssignmentByAgent
);

export default router;

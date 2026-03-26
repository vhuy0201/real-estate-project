// src/routes/client/seller/assignment.route.ts
import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { cancelAssignmentRequest, listRequestsForSeller, sellerAcceptRequest, sellerRejectRequest } from "../../../controllers/client/seller/assignment.controller";

const router = express.Router();

// Lấy danh sách yêu cầu agent gửi cho seller
router.get("/", verifyToken, roleCheck("seller"), listRequestsForSeller);

// Seller chấp nhận yêu cầu
router.patch("/:id/accept", verifyToken, roleCheck("seller"), sellerAcceptRequest);

// Seller từ chối yêu cầu
router.patch("/:id/reject", verifyToken, roleCheck("seller"), sellerRejectRequest);

//  Hủy yêu cầu khi đã gửi cho agent
router.patch("/:id/cancel", verifyToken, roleCheck("seller"), cancelAssignmentRequest);

export default router;

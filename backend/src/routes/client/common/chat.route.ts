// src/routes/client/chat.route.ts
import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { handleAiSearch } from "../../../controllers/client/common/chat.controller";

const router = express.Router();

// [POST] /api/client/chat/ai-search
// Người dùng gửi tin nhắn để AI tìm kiếm
router.post(
  "/ai-search",
  verifyToken, 
  handleAiSearch
);

export default router;
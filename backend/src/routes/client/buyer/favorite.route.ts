import express from "express";
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
} from "../../../controllers/client/buyer/favorite.controller";

import { verifyToken } from "../../../middlewares/auth.middleware";

const router = express.Router();

// POST /api/client/buyer/favorites
router.post("/", verifyToken, addFavorite);
// GET /api/client/buyer/favorites/:propertyId/check
router.get("/:propertyId/check", verifyToken, checkFavorite);
// DELETE /api/client/buyer/favorites/:propertyId
router.delete("/:propertyId", verifyToken, removeFavorite);

// GET /api/client/buyer/favorites
router.get("/", verifyToken, getMyFavorites);

export default router;

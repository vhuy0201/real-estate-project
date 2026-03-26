import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getMyOffers, getOfferById, forwardOffer } from "../../../controllers/client/agent/offer.controller";

const router = express.Router();

router.get("/", verifyToken, roleCheck("agent"), getMyOffers);
router.patch("/:id/forward", verifyToken, roleCheck("agent"), forwardOffer);
//Xem chi tiết offer
router.get("/:id", verifyToken, roleCheck("agent"), getOfferById);

export default router;
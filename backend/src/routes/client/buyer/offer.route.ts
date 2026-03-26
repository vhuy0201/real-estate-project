import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { createOffer, getMyOffers, cancelOffer } from "../../../controllers/client/buyer/offer.controller";

const router = express.Router();

router.post("/", verifyToken, roleCheck("buyer"), createOffer);
router.get("/", verifyToken, roleCheck("buyer"), getMyOffers);
router.patch("/:id/cancel", verifyToken, roleCheck("buyer"), cancelOffer);

export default router;


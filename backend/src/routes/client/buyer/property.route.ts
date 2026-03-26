import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { listBuyerPurchasedProperties } from "../../../controllers/client/buyer/properties.controller";
import { getPropertiesByIds } from "../../../controllers/client/buyer/getPropertiesByIds.controller";
const router = express.Router();

router.get("/", verifyToken, roleCheck("buyer"), listBuyerPurchasedProperties);
router.get("/by-ids", getPropertiesByIds);
export default router;

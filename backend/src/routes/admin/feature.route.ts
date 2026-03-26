import express from "express";
import * as featureController from "../../controllers/admin/feature.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

router.get("/", featureController.getAllFeatures);
router.post("/", featureController.createFeature);
router.patch("/:id", featureController.updateFeature);
router.delete("/:id", featureController.deleteFeature);

export default router;

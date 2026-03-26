import express from "express";
import * as typeController from "../../controllers/admin/type.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

router.get("/", typeController.getAllTypes);
router.post("/", typeController.createType);
router.patch("/:id", typeController.updateType);
router.delete("/:id", typeController.deleteType);

export default router;

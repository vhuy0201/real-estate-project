import express from "express";
import * as categoryController from "../../controllers/admin/category.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;

import express from "express";
import multer from "multer";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { uploadMultipleToCloudinary } from "../../../middlewares/uploadMultipleToCloudinary.middleware";
import { getMyProperties, updateProperty, deleteProperty } from "../../../controllers/client/common/property.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/client/properties - Lấy danh sách bất động sản của user
router.get("", verifyToken, roleCheck("seller","agent"), getMyProperties);

// PATCH /api/client/properties/:id (multipart nếu chỉnh ảnh)
router.patch(
	"/:id",
	verifyToken,
	roleCheck("seller", "agent"),
	upload.array("images", 10),
	uploadMultipleToCloudinary,
	updateProperty
);

// DELETE /api/client/properties/:id -> soft-delete
router.delete(
	"/:id",
	verifyToken,
	roleCheck("seller", "agent"),
	deleteProperty
);


export default router;

import express from "express";
import multer from "multer";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import {
  createProperty,
  generatePropertyDescription,
  getMyProperties,
  removeAgentFromProperty,
} from "../../../controllers/client/seller/property.controller";
import { createAssignmentRequest } from "../../../controllers/client/seller/assignment.controller";
import { uploadMultipleToCloudinary } from "../../../middlewares/uploadMultipleToCloudinary.middleware";



const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// Lấy danh sách property cá nhân (owner hoặc agent)
router.get(
  "/",
  verifyToken,
  roleCheck("seller", "agent"),
  getMyProperties
);


// Seller gui yêu cầu quan li propety cho agent
router.post(
  "/:id/assign-agent",
  verifyToken,
  roleCheck("seller"),
  createAssignmentRequest
);

// Seller huỷ gán agent khỏi property
router.patch(
  "/:id/remove-agent",
  verifyToken,
  roleCheck("seller"),
  removeAgentFromProperty
);

// Seller tạo bất động sản mới
router.post(
  "/create",
  verifyToken,
  roleCheck("seller", "agent"),
  upload.array("images", 10), 
  uploadMultipleToCloudinary, 
  createProperty
);

//POST /api/client/seller/properties/generate-description
router.post(
  "/generate-description",
  verifyToken,
  roleCheck("seller", "agent"),
  generatePropertyDescription
);


export default router;
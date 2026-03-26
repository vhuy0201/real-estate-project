import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware"; // Giả định đường dẫn
import { roleCheck } from "../../middlewares/roleCheck.middleware"; // Giả định đường dẫn
import {
  getContracts,
  getContractById,
  approveContract,
  rejectContract,
  deleteContract,
} from "../../controllers/admin/contract.controller";

const router = express.Router();

router.use(verifyToken, roleCheck("admin"));

// GET /api/admin/contracts
router.get("/", getContracts);

// GET /api/admin/contracts/:id
router.get("/:id", getContractById);

// PATCH /api/admin/contracts/:id/approve
router.patch("/:id/approve", approveContract);

// PATCH /api/admin/contracts/:id/reject
router.patch("/:id/reject", rejectContract);

// DELETE /api/admin/contracts/:id
router.delete("/:id", deleteContract);

export default router;
import express from "express";
import multer from "multer";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { upload as uploadToCloudinary } from "../../../middlewares/uploadContact.middlewares";
import {
  getContractByDeal,
  downloadContract,
  uploadContract,
  listContracts,
  acceptContract,
  rejectContract,
  getAllDealsForBuyer,
} from "../../../controllers/client/buyer/contract.controller";

const router = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

router.get("/deals", verifyToken, roleCheck("buyer"), getAllDealsForBuyer);

router.get("/contracts", verifyToken, roleCheck("buyer"), listContracts);
router.get("/deals/:dealId/contract", verifyToken, roleCheck("buyer"), getContractByDeal);

router.get(
  "/deals/:dealId/contract/download",
  verifyToken,
  roleCheck("buyer"),
  downloadContract
);

router.post(
  "/deals/:dealId/contract",
  verifyToken,
  roleCheck("buyer"),
  multerUpload.single("file"),
  uploadToCloudinary,
  uploadContract
);

// API Accept: PATCH /deals/:dealId/contracts/:contractId/accept
router.patch(
  "/deals/:dealId/contracts/:contractId/accept",
  verifyToken,
  roleCheck("buyer"),
  acceptContract
);

// API Reject: PATCH /deals/:dealId/contracts/:contractId/reject
router.patch(
  "/deals/:dealId/contracts/:contractId/reject",
  verifyToken,
  roleCheck("buyer"),
  rejectContract
);

export default router;



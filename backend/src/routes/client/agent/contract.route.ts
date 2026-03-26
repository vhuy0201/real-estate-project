import express from "express";
import multer from "multer";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { upload as uploadToCloudinary } from "../../../middlewares/uploadContact.middlewares";
import {
  uploadContract,
  replaceContract,
  getContractByDeal,
  deleteContract,
  getAllContracts,
} from "../../../controllers/client/agent/contract.controller";

const router = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

router.get(
  "/deals/:dealId/list",
  verifyToken,
  roleCheck("agent"),
  getAllContracts
);

router.get(
  "/deals/:dealId",
  verifyToken,
  roleCheck("agent"),
  getContractByDeal
);

router.post(
  "/deals/:dealId",
  verifyToken,
  roleCheck("agent"),
  multerUpload.single("file"),
  uploadToCloudinary,
  uploadContract
);

router.put(
  "/deals/:dealId",
  verifyToken,
  roleCheck("agent"),
  multerUpload.single("file"),
  uploadToCloudinary,
  replaceContract
);

router.delete(
  "/deals/:dealId/contracts/:contractId",
  verifyToken,
  roleCheck("agent"),
  deleteContract
);

export default router;


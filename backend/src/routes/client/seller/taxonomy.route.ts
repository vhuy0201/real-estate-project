import express from "express";
import { getTaxonomies } from "../../../controllers/client/seller/taxonomy.controller";


const router = express.Router();

// GET /api/taxonomies
router.get("/", getTaxonomies);

export default router;

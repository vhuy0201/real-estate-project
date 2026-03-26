import express from "express";
import { getAllLocations, getCities, getDistricts, getWards } from "../../controllers/public/taxonomy.controller";

const router = express.Router();

router.get("/cities", getCities); // Lấy tất cả city
router.get("/cities/:cityId/districts", getDistricts); // Lấy districts theo city
router.get("/districts/:districtId/wards", getWards); // Lấy wards theo district
router.get("/all", getAllLocations); // Lấy toàn bộ hierarchy City → District → Ward

export default router;

import express from "express";
import { getAllCoordinates, getAllProperties, getPropertyById } from "../../controllers/public/property.controller";

const router = express.Router();

router.get("/properties/coordinates", getAllCoordinates);
router.get("/properties", getAllProperties);
router.get("/properties/:id", getPropertyById);


export default router;

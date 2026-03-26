import express from "express";
import userRoutes from "./user.route";
import propertyRoutes from "./property.route";
import cityRoutes from "./city.route";
import typeRoutes from "./type.route";
import categoryRoutes from "./category.route";
import featureRoutes from "./feature.route";
import dealRoutes from "./deal.route";
import contractRoutes from "./contract.route";
import paymentRoutes from "./payment.route";
import reportRoutes from "./report.route";

const router = express.Router();

router.use("/", userRoutes);
router.use("/cities", cityRoutes);
router.use("/types", typeRoutes);
router.use("/categories", categoryRoutes);
router.use("/features", featureRoutes);
router.use("/properties", propertyRoutes);
router.use("/deals", dealRoutes);
router.use("/contracts", contractRoutes);
router.use("/payments", paymentRoutes);
router.use("/reports", reportRoutes); 

export default router;

import express from "express";
import * as cityController from "../../controllers/admin/city.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { roleCheck } from "../../middlewares/roleCheck.middleware";

const router = express.Router();

// Áp dụng middleware xác thực và kiểm tra quyền admin
router.use(verifyToken, roleCheck("admin"));

// CRUD cho City
router.get("/", cityController.getAllCities);          // Lấy danh sách thành phố
router.post("/", cityController.createCity);           // Tạo thành phố mới
router.patch("/:id", cityController.updateCity);       // Cập nhật thành phố
router.delete("/:id", cityController.deleteCity);      // Xóa thành phố

export default router;

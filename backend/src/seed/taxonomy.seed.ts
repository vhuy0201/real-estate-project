// npx ts-node src/seed/taxonomy.seed.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import PropertyType from "../models/propertyType.model";
import Category from "../models/category.model";
import Feature from "../models/feature.model";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URL as string;

if (!MONGODB_URI) {
  console.error("❌ Thiếu biến môi trường MONGO_URL trong .env");
  process.exit(1);
}

const seedTaxonomies = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB!");

        // --- CITIES ---
    const cities = [
      { city_name: { vi: "Cần Thơ", en: "Can Tho" } },
      { city_name: { vi: "Hải Phòng", en: "Hai Phong" } },
      { city_name: { vi: "Nha Trang", en: "Nha Trang" } },
    ];

    

    // // --- CATEGORIES ---
    // const categories = [
    //   // Thêm mới
    //   { category_name: "Townhouse" },
    //   { category_name: "Land" },
    //   { category_name: "Office" },
    // ];

    // // --- FEATURES ---
    // const features = [
    //   // Thêm mới
    //   { feature_name: "Security 24/7" },
    //   { feature_name: "Playground" },
    //   { feature_name: "BBQ Area" },
    //   { feature_name: "Pet Friendly" },
    // ];

    // Ghi dữ liệu mới
    await Promise.all([
      // Category.insertMany(categories),
      // Feature.insertMany(features),
      City.insertMany(cities),
    ]);

    console.log("🌱 Seed taxonomy thành công!");
    // console.log("🏘 Categories:", categories.length);
    // console.log("✨ Features:", features.length);

    await mongoose.disconnect();
    console.log("🔌 Ngắt kết nối MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seeding taxonomy:", err);
    process.exit(1);
  }
};

seedTaxonomies();

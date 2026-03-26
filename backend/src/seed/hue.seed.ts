import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedHue = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Huế
    let city = await City.findOne({ "city_name.vi": "Thành phố Huế" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Thành phố Huế", en: "Hue City" },
        deleted: false,
      });
      console.log("Created city Huế");
    }

    // Xóa districts và wards cũ nếu có
    const oldDistricts = await District.find({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: oldDistricts.map(d => d._id) } });
    await District.deleteMany({ city_id: city._id });

    // 5 districts
    const districtsData = [
      { district_name: { vi: "Phú Nhuận", en: "Phu Nhuan" }, city_id: city._id },
      { district_name: { vi: "An Cựu", en: "An Cuu" }, city_id: city._id },
      { district_name: { vi: "Thủy Biều", en: "Thuy Bieu" }, city_id: city._id },
      { district_name: { vi: "Vỹ Dạ", en: "Vy Da" }, city_id: city._id },
      { district_name: { vi: "Phú Hòa", en: "Phu Hoa" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 5 wards
    const wardsData = [
      { ward_name: { vi: "Phường Phú Nhuận 1", en: "Phu Nhuan 1 Ward" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Phường An Cựu 1", en: "An Cuu 1 Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Phường Thủy Biều 1", en: "Thuy Bieu 1 Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Phường Vỹ Dạ 1", en: "Vy Da 1 Ward" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Phường Phú Hòa 1", en: "Phu Hoa 1 Ward" }, district_id: createdDistricts[4]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed TP. Huế completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedHue();

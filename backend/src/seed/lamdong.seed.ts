import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedLamDong = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Lâm Đồng
    let city = await City.findOne({ "city_name.vi": "Tỉnh Lâm Đồng" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Tỉnh Lâm Đồng", en: "Lam Dong Province" },
        deleted: false,
      });
      console.log("Created city Lâm Đồng");
    }

    // Xóa districts và wards cũ nếu có
    const oldDistricts = await District.find({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: oldDistricts.map(d => d._id) } });
    await District.deleteMany({ city_id: city._id });

    // 5 districts
    const districtsData = [
      { district_name: { vi: "Thành phố Đà Lạt", en: "Da Lat City" }, city_id: city._id },
      { district_name: { vi: "Huyện Lâm Hà", en: "Lam Ha" }, city_id: city._id },
      { district_name: { vi: "Huyện Đơn Dương", en: "Don Duong" }, city_id: city._id },
      { district_name: { vi: "Huyện Đức Trọng", en: "Duc Trong" }, city_id: city._id },
      { district_name: { vi: "Huyện Bảo Lâm", en: "Bao Lam" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 5 wards
    const wardsData = [
      { ward_name: { vi: "Phường 1", en: "Ward 1" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Xã Tân Thanh", en: "Tan Thanh Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Xã Quảng Lập", en: "Quang Lap Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Xã Hiệp Thạnh", en: "Hiep Thanh Ward" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Xã Lộc Ngãi", en: "Loc Ngai Ward" }, district_id: createdDistricts[4]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed Tỉnh Lâm Đồng completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedLamDong();

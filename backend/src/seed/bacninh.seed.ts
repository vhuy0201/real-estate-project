import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedBacNinh = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Bắc Ninh
    let city = await City.findOne({ "city_name.vi": "Tỉnh Bắc Ninh" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Tỉnh Bắc Ninh", en: "Bac Ninh Province" },
        deleted: false,
      });
      console.log("Created city Bắc Ninh");
    }

    // Xóa districts và wards cũ nếu có
    const oldDistricts = await District.find({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: oldDistricts.map(d => d._id) } });
    await District.deleteMany({ city_id: city._id });

    // 5 districts
    const districtsData = [
      { district_name: { vi: "Thành phố Bắc Ninh", en: "Bac Ninh City" }, city_id: city._id },
      { district_name: { vi: "Huyện Tiên Du", en: "Tien Du" }, city_id: city._id },
      { district_name: { vi: "Huyện Yên Phong", en: "Yen Phong" }, city_id: city._id },
      { district_name: { vi: "Huyện Quế Võ", en: "Que Vo" }, city_id: city._id },
      { district_name: { vi: "Huyện Thuận Thành", en: "Thuan Thanh" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 5 wards
    const wardsData = [
      { ward_name: { vi: "Phường Suối Hoa", en: "Suoi Hoa Ward" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Xã Việt Hùng", en: "Viet Hung Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Xã Đông Phong", en: "Dong Phong Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Xã Bích Sơn", en: "Bich Son Ward" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Xã Ninh Xá", en: "Ninh Xa Ward" }, district_id: createdDistricts[4]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed Tỉnh Bắc Ninh completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedBacNinh();

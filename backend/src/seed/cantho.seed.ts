import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedCanTho = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Cần Thơ
    let city = await City.findOne({ "city_name.vi": "Thành phố Cần Thơ" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Thành phố Cần Thơ", en: "Can Tho City" },
        deleted: false,
      });
      console.log("Created city Cần Thơ");
    }

    // Xóa districts và wards cũ nếu có
    const oldDistricts = await District.find({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: oldDistricts.map(d => d._id) } });
    await District.deleteMany({ city_id: city._id });

    // 5 districts
    const districtsData = [
      { district_name: { vi: "Ninh Kiều", en: "Ninh Kieu" }, city_id: city._id },
      { district_name: { vi: "Cái Răng", en: "Cai Rang" }, city_id: city._id },
      { district_name: { vi: "Bình Thủy", en: "Binh Thuy" }, city_id: city._id },
      { district_name: { vi: "Ô Môn", en: "O Mon" }, city_id: city._id },
      { district_name: { vi: "Cờ Đỏ", en: "Co Do" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 5 wards
    const wardsData = [
      { ward_name: { vi: "Phường An Hòa", en: "An Hoa Ward" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Phường Hưng Phú", en: "Hung Phu Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Phường Thới An Đông", en: "Thoi An Dong Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Phường Châu Văn Liêm", en: "Chau Van Liem Ward" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Thị trấn Cờ Đỏ", en: "Co Do Town" }, district_id: createdDistricts[4]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed TP. Cần Thơ completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedCanTho();

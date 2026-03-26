import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedHaiPhong = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Hải Phòng
    let city = await City.findOne({ "city_name.vi": "Thành phố Hải Phòng" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Thành phố Hải Phòng", en: "Hai Phong City" },
        deleted: false,
      });
      console.log("Created city Hải Phòng");
    }

    // Xóa districts và wards cũ nếu có
    const oldDistricts = await District.find({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: oldDistricts.map(d => d._id) } });
    await District.deleteMany({ city_id: city._id });

    // 5 districts
    const districtsData = [
      { district_name: { vi: "Hồng Bàng", en: "Hong Bang" }, city_id: city._id },
      { district_name: { vi: "Ngô Quyền", en: "Ngo Quyen" }, city_id: city._id },
      { district_name: { vi: "Lê Chân", en: "Le Chan" }, city_id: city._id },
      { district_name: { vi: "Kiến An", en: "Kien An" }, city_id: city._id },
      { district_name: { vi: "Dương Kinh", en: "Duong Kinh" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 5 wards
    const wardsData = [
      { ward_name: { vi: "Phường Hồng Bàng 1", en: "Hong Bang 1 Ward" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Phường Ngô Quyền 1", en: "Ngo Quyen 1 Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Phường Lê Chân 1", en: "Le Chan 1 Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Phường Kiến An 1", en: "Kien An 1 Ward" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Phường Dương Kinh 1", en: "Duong Kinh 1 Ward" }, district_id: createdDistricts[4]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed TP. Hải Phòng completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedHaiPhong();

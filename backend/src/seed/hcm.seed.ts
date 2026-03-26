import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedHCM = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Tìm city Hồ Chí Minh
    let city = await City.findOne({ "city_name.vi": "Thành phố Hồ Chí Minh" });
    if (!city) {
      city = await City.create({
        city_name: { vi: "Thành phố Hồ Chí Minh", en: "Ho Chi Minh City" },
        deleted: false,
      });
      console.log("Created city Hồ Chí Minh");
    }

    // Xóa districts cũ nếu có
    await District.deleteMany({ city_id: city._id });
    await Ward.deleteMany({ district_id: { $in: (await District.find({ city_id: city._id })).map(d => d._id) } });

    // 10 districts
    const districtsData = [
      { district_name: { vi: "Quận 1", en: "District 1" }, city_id: city._id },
      { district_name: { vi: "Quận 2", en: "District 2" }, city_id: city._id },
      { district_name: { vi: "Quận 3", en: "District 3" }, city_id: city._id },
      { district_name: { vi: "Quận 4", en: "District 4" }, city_id: city._id },
      { district_name: { vi: "Quận 5", en: "District 5" }, city_id: city._id },
      { district_name: { vi: "Quận 6", en: "District 6" }, city_id: city._id },
      { district_name: { vi: "Quận 7", en: "District 7" }, city_id: city._id },
      { district_name: { vi: "Quận 8", en: "District 8" }, city_id: city._id },
      { district_name: { vi: "Quận 9", en: "District 9" }, city_id: city._id },
      { district_name: { vi: "Quận 10", en: "District 10" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // 10 wards, mỗi ward gán cho 1 district
    const wardsData = [
      { ward_name: { vi: "Phường Bến Nghé", en: "Ben Nghe Ward" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Phường Thảo Điền", en: "Thao Dien Ward" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Phường Võ Thị Sáu", en: "Vo Thi Sau Ward" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Phường 1", en: "Ward 1" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Phường 2", en: "Ward 2" }, district_id: createdDistricts[4]._id },
      { ward_name: { vi: "Phường 3", en: "Ward 3" }, district_id: createdDistricts[5]._id },
      { ward_name: { vi: "Phường Tân Phong", en: "Tan Phong Ward" }, district_id: createdDistricts[6]._id },
      { ward_name: { vi: "Phường 9", en: "Ward 9" }, district_id: createdDistricts[7]._id },
      { ward_name: { vi: "Phường Hiệp Phú", en: "Hiep Phu Ward" }, district_id: createdDistricts[8]._id },
      { ward_name: { vi: "Phường 11", en: "Ward 11" }, district_id: createdDistricts[9]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed TP. Hồ Chí Minh completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedHCM();

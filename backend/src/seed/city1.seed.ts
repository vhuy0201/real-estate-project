import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();
const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seedDaNang = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const city = await City.findOne({ "city_name.vi": "Thành phố Đà Nẵng" });
    if (!city) throw new Error("Không tìm thấy Đà Nẵng trong DB");

    // Tạo 10 districts
    const districtsData = [
      { district_name: { vi: "Hải Châu", en: "Hai Chau" }, city_id: city._id },
      { district_name: { vi: "Thanh Khê", en: "Thanh Khe" }, city_id: city._id },
      { district_name: { vi: "Sơn Trà", en: "Son Tra" }, city_id: city._id },
      { district_name: { vi: "Ngũ Hành Sơn", en: "Ngu Hanh Son" }, city_id: city._id },
      { district_name: { vi: "Liên Chiểu", en: "Lien Chieu" }, city_id: city._id },
      { district_name: { vi: "Cẩm Lệ", en: "Cam Le" }, city_id: city._id },
      { district_name: { vi: "Hòa Vang", en: "Hoa Vang" }, city_id: city._id },
      { district_name: { vi: "Hoà Xuân", en: "Hoa Xuan" }, city_id: city._id },
      { district_name: { vi: "Thọ Quang", en: "Tho Quang" }, city_id: city._id },
      { district_name: { vi: "An Hải Tây", en: "An Hai Tay" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // Tạo 10 wards, gắn district tương ứng
    const wardsData = [
      { ward_name: { vi: "Phường Thạch Thang", en: "Thach Thang" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Phường Thanh Khê Tây", en: "Thanh Khe Tay" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Phường An Hải Bắc", en: "An Hai Bac" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Phường Mỹ An", en: "My An" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Phường Hòa Khánh Bắc", en: "Hoa Khanh Bac" }, district_id: createdDistricts[4]._id },
      { ward_name: { vi: "Phường Khuê Trung", en: "Khue Trung" }, district_id: createdDistricts[5]._id },
      { ward_name: { vi: "Phường Hòa Thọ Đông", en: "Hoa Tho Dong" }, district_id: createdDistricts[6]._id },
      { ward_name: { vi: "Phường Hòa Xuân", en: "Hoa Xuan" }, district_id: createdDistricts[7]._id },
      { ward_name: { vi: "Phường Thọ Quang", en: "Tho Quang" }, district_id: createdDistricts[8]._id },
      { ward_name: { vi: "Phường An Hải Tây", en: "An Hai Tay" }, district_id: createdDistricts[9]._id },
    ];

    const createdWards = await Ward.insertMany(wardsData);
    console.log("Created wards:", createdWards.map(w => w.ward_name.vi));

    console.log("Seed completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedDaNang();

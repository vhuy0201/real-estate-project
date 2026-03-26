import mongoose from "mongoose";
import dotenv from "dotenv";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Lấy một city bất kỳ (ví dụ Hà Nội)
    const city = await City.findOne({ "city_name.vi": "Thành phố Hà Nội" });
    if (!city) {
      console.log("Không tìm thấy thành phố Hà Nội trong DB");
      process.exit(1);
    }

    // Tạo 8 districts
    const districtsData = [
      { district_name: { vi: "Ba Đình", en: "Ba Dinh" }, city_id: city._id },
      { district_name: { vi: "Hoàn Kiếm", en: "Hoan Kiem" }, city_id: city._id },
      { district_name: { vi: "Tây Hồ", en: "Tay Ho" }, city_id: city._id },
      { district_name: { vi: "Long Biên", en: "Long Bien" }, city_id: city._id },
      { district_name: { vi: "Cầu Giấy", en: "Cau Giay" }, city_id: city._id },
      { district_name: { vi: "Đống Đa", en: "Dong Da" }, city_id: city._id },
      { district_name: { vi: "Hai Bà Trưng", en: "Hai Ba Trung" }, city_id: city._id },
      { district_name: { vi: "Hoàng Mai", en: "Hoang Mai" }, city_id: city._id },
    ];

    const createdDistricts = await District.insertMany(districtsData);
    console.log("Created districts:", createdDistricts.map(d => d.district_name.vi));

    // Tạo 8 wards (mỗi ward thuộc 1 district khác nhau)
    const wardsData = [
      { ward_name: { vi: "Phúc Xá", en: "Phuc Xa" }, district_id: createdDistricts[0]._id },
      { ward_name: { vi: "Trúc Bạch", en: "Truc Bach" }, district_id: createdDistricts[1]._id },
      { ward_name: { vi: "Vĩnh Phúc", en: "Vinh Phuc" }, district_id: createdDistricts[2]._id },
      { ward_name: { vi: "Điện Biên", en: "Dien Bien" }, district_id: createdDistricts[3]._id },
      { ward_name: { vi: "Dịch Vọng", en: "Dich Vong" }, district_id: createdDistricts[4]._id },
      { ward_name: { vi: "Kim Liên", en: "Kim Lien" }, district_id: createdDistricts[5]._id },
      { ward_name: { vi: "Nguyễn Du", en: "Nguyen Du" }, district_id: createdDistricts[6]._id },
      { ward_name: { vi: "Hoàng Liệt", en: "Hoang Liet" }, district_id: createdDistricts[7]._id },
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

seed();

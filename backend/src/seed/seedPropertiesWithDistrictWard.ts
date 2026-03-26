// src/seed/seedPropertiesWithDistrictWard.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

// 🧩 Models
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";
import Category from "../models/category.model";
import PropertyType from "../models/propertyType.model";
import Feature from "../models/feature.model";
import User from "../models/user.model";
import Property from "../models/property.model";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URL || "mongodb://localhost:27017/real_estate_db";

// Hàm lấy ngẫu nhiên 1 phần tử từ array
const getRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// === HÀM HELPER MỚI (ĐỂ SỬA LỖI) ===
// Hàm này tìm 1 document, nếu không thấy sẽ báo lỗi rõ ràng
function findOrFail(
  collection: any[],
  name: string,
  field: string,
  lang: "vi" | "en" = "vi"
) {
  const item = collection.find((doc) => doc[field]?.[lang] === name);
  if (!item) {
    throw new Error(
      `❌ LỖI SEED: Không thể tìm thấy "${name}" trong collection. Hãy kiểm tra lại data seed của bạn.`
    );
  }
  return item;
}
// === KẾT THÚC HÀM HELPER ===

async function seed() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully!");

    // === 1. Lấy dữ liệu cần thiết ===
    const cities = await City.find();
    const districts = await District.find();
    const wards = await Ward.find();
    const categories = await Category.find();
    const types = await PropertyType.find();
    const features = await Feature.find();
    const owner = await User.findOne({ role: "seller" });
    const agent = await User.findOne({ role: "agent" });

    if (!owner || !agent) {
      throw new Error("Owner or Agent not found in DB!");
    }
    console.log("Owner:", owner.email, "Agent:", agent.email);

    if (
      !cities.length ||
      !districts.length ||
      !wards.length ||
      !categories.length ||
      !types.length
    ) {
      throw new Error("Collections or users not seeded properly!");
    }

    // === 2. Tạo biến helper cho ID (an toàn) ===
    const hcmCityId = findOrFail(
      cities,
      "Thành phố Hồ Chí Minh",
      "city_name",
      "vi"
    )._id;
    const hnCityId = findOrFail(
      cities,
      "Thành phố Hà Nội",
      "city_name",
      "vi"
    )._id;
    const dnCityId = findOrFail(cities, "Thành phố Đà Nẵng", "city_name", "vi")._id;

    const forSaleId = findOrFail(types, "For Sale", "type_name", "en")._id;
    const forRentId = findOrFail(types, "For Rent", "type_name", "en")._id;

    const apartmentCatId = findOrFail(
      categories,
      "Apartment",
      "category_name",
      "en"
    )._id;
    const houseCatId = findOrFail(
      categories,
      "House",
      "category_name",
      "en"
    )._id;
    const villaCatId = findOrFail(
      categories,
      "Villa",
      "category_name",
      "en"
    )._id;

    console.log("✅ Dependencies fetched and IDs mapped.");

    const now = new Date();

    // === 3. Định nghĩa Dữ liệu Properties (Đã sửa) ===
    const propertiesData = [
      {
        // 1
        title: {
          vi: "Căn hộ cao cấp ở Quận 1",
          en: "Luxury Apartment in District 1",
        },
        description: {
          vi: "Căn hộ hiện đại đẹp mắt với view thành phố và đầy đủ tiện ích.",
          en: "A beautiful modern apartment with city view and full amenities.",
        },
        price: 250000,
        address: { vi: "123 Nguyễn Huệ", en: "123 Nguyen Hue" },
        bedrooms: 2,
        bathrooms: 2,
        area: 75,
        unit: "m2",
        yearBuilt: 2020,
        floors: 15,
        coordinates: {
          type: "Point",
          coordinates: [106.7009, 10.7769], // [lng, lat]
        },
        city_id: hcmCityId,
        type_id: forSaleId,
        category_id: apartmentCatId,
        owner_id: owner._id,
        agent_id: agent._id,
        features: features.slice(0, 3).map((f) => f._id),
        images: [
          "https://cf.bstatic.com/xdata/images/hotel/max1024x768/518308113.jpg?k=134060b34af97004d911560301b891d9882b02f31eab9645fb6fe0dd07b084bc&o=&hp=1",
          "https.cf.bstatic.com/xdata/images/hotel/max1024x768/525593268.jpg?k=615de8dd83adca84bd9ac794b80bb7b10ff6c468542c7e4b451ac6ad3e0a193b&o=&hp=1",
          "https.pix10.agoda.net/hotelImages/4567921/0/7deeafc57df289800ebb70b70126e90f.jpg?ca=7&ce=1&s=414x232",
        ],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 2
        title: {
          vi: "Ngôi nhà ấm cúng gần Hồ Tây",
          en: "Cozy House near West Lake",
        },
        description: {
          vi: "Ngôi nhà gia đình ấm cúng nằm gần khu vực Hồ Tây với khu vườn rộng lớn.",
          en: "A cozy family home located near the West Lake area with a large garden.",
        },
        price: 180000,
        address: { vi: "45 Trích Sài", en: "45 Trich Sai" },
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        unit: "m2",
        yearBuilt: 2018,
        floors: 2,
        coordinates: {
          type: "Point",
          coordinates: [105.8188, 21.0501], // [lng, lat]
        },
        city_id: hnCityId,
        type_id: forRentId,
        category_id: houseCatId,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[1]._id, features[3]._id],
        images: [
          "https.houseinhanoi.vn/wp-content/uploads/2022/12/cozy-house-for-rent-on-to-ngoc-van-near-west-lake-16-835x467.jpg",
          "https.encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRma1501-CdXLYmZkltgSVtC_wMD1dbNLq8pA&s",
          "https.houseinhanoi.vn/wp-content/uploads/2022/12/cozy-house-for-rent-on-to-ngoc-van-near-west-lake-38-835x467.jpg",
        ],
        status: "approved",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 3
        title: { vi: "Biệt thự ven biển", en: "Beachfront Villa" },
        description: {
          vi: "Biệt thự sang trọng với view biển, hồ bơi và đường riêng ra bãi biển.",
          en: "Luxury villa with sea view, swimming pool and private access to the beach.",
        },
        price: 450000,
        address: { vi: "123 abc", en: "123 abc" },
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [108.2477, 16.0921], // [lng, lat]
        },
        city_id: dnCityId,
        type_id: forSaleId,
        category_id: villaCatId,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[1]._id, features[2]._id],
        images: [
          "https.encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWSdBDQ3QfTiw8v4lC0v9Aa2UQI-YCfSvB2w&s",
          "https.fusionresorts.com/danang/wp-content/uploads/2024/07/Thumnail-5bedroom-1024x662.webp",
          "https.cf.bstatic.com/xdata/images/hotel/max1024x768/569598891.jpg?k=a73db8f9c1d3f432c56778c38ac220972aac6b8ee16036c86d772c040f8a9e1f&o=&hp=1",
        ],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 4
        title: {
          vi: "Studio hiện đại ở Quận 3",
          en: "Modern Studio in District 3",
        },
        description: {
          vi: "Studio nhỏ gọn lý tưởng cho các chuyên gia độc thân, gần các quán cà phê và không gian làm việc chung.",
          en: "Compact studio ideal for single professionals, close to cafés and coworking spaces.",
        },
        price: 85000,
        address: { vi: "78 Pasteur, Quận 3", en: "78 Pasteur, District 3" },
        bedrooms: 1,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [106.69, 10.776], // [lng, lat]
        },
        city_id: hcmCityId,
        type_id: forRentId,
        category_id: apartmentCatId,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[0]._id, features[4]._id],
        images: [
          "https.jhouse.vn/wp-content/uploads/2025/08/Modern-studio-apartment-at-The-Urban-Studio-Apartment-District-3-HCM-2.jpeg",
          "https.jhouse.vn/wp-content/uploads/2025/08/Modern-studio-apartment-at-The-Urban-Studio-Apartment-District-3-HCM-6.jpeg",
          "https.jhouse.vn/wp-content/uploads/2025/08/New-studio-apartment-for-rent-at-The-Urban-Studio-District-3-5.jpeg",
        ],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 5
        title: { vi: "Nhà gia đình ở Quận 9", en: "Family House in District 9" },
        description: {
          vi: "Ngôi nhà gia đình rộng rãi với nhà để xe và vườn, hoàn hảo cho các gia đình đang phát triển.",
          en: "Spacious family house with garage and garden, perfect for growing families.",
        },
        price: 200000,
        address: { vi: "12 Long Trường, Quận 9", en: "12 Long Truong, District 9" },
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [106.7634, 10.825], // [lng, lat]
        },
        city_id: hcmCityId,
        type_id: forSaleId,
        category_id: houseCatId,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[2]._id, features[3]._id],
        images: ["https://picsum.photos/seed/p5a/800/600"],
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 6
        title: {
          vi: "Penthouse với view thành phố",
          en: "Penthouse with City View",
        },
        description: {
          vi: "Penthouse tầng cao với view 360 độ ra thành phố, nội thất thiết kế sang trọng.",
          en: "High-floor penthouse offering 360° views of the city, designer finishes.",
        },
        price: 1200000,
        address: { vi: "50 Lê Lợi, Quận 1", en: "50 Le Loi, District 1" },
        bedrooms: 4,
        bathrooms: 4,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [106.7034, 10.7775], // [lng, lat]
        },
        city_id: hcmCityId, // Sửa lại
        type_id: forSaleId, // Sửa lại
        category_id: apartmentCatId, // Sửa lại
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[0]._id, features[4]._id, features[5]._id],
        images: ["https://picsum.photos/seed/p6a/800/600"],
        status: "approved",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 7
        title: {
          vi: "Căn hộ ven sông ở Thảo Điền",
          en: "Riverside Condo in Thao Dien",
        },
        description: {
          vi: "Căn hộ hiện đại với đường ra sông và hồ bơi chung. Tuyệt vời cho các gia đình nước ngoài.",
          en: "Modern condo with river access and communal pool. Great for expat families.",
        },
        price: 320000,
        address: { vi: "Thảo Điền", en: "Thao Dien" },
        bedrooms: 3,
        bathrooms: 2,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [106.7375, 10.801],
        },
        city_id: hcmCityId, // Sửa lại
        type_id: forRentId, // Sửa lại
        category_id: apartmentCatId, // Sửa lại
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[1]._id, features[5]._id],
        images: ["https://picsum.photos/seed/p7a/800/600"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 8
        title: {
          vi: "Nhà phố đầy nắng gần Ngũ Hành Sơn",
          en: "Sunny Townhouse near Marble Mountain",
        },
        description: {
          vi: "Nhà phố thoải mái với sân thượng và hai ban công, gần các bãi biển.",
          en: "Comfortable townhouse with terrace and two balconies, close to beaches.",
        },
        price: 150000,
        address: { vi: "Gần Ngũ Hành Sơn", en: "Near Marble Mountain" },
        bedrooms: 3,
        bathrooms: 3,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [108.219, 16.0425],
        },
        city_id: dnCityId, // Sửa lại
        type_id: forSaleId, // Sửa lại
        category_id: houseCatId, // Sửa lại
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[3]._id, features[4]._id],
        images: ["https://picsum.photos/seed/p8a/800/600"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 9
        title: {
          vi: "Studio nhỏ gọn gần Đại học",
          en: "Compact Studio near University",
        },
        description: {
          vi: "Studio giá cả phải chăng gần khuôn viên trường đại học, lý tưởng cho sinh viên.",
          en: "Affordable studio near university campus, ideal for students.",
        },
        price: 35000,
        address: { vi: "Khu vực Đại học", en: "University area" },
        bedrooms: 1,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [108.2232, 16.0678], //
        },
        city_id: dnCityId, // Sửa lại
        type_id: forRentId, // Sửa lại
        category_id: apartmentCatId, // Sửa lại
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[0]._id],
        images: ["https://picsum.photos/seed/p9a/800/600"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 10
        title: { vi: "Bungalow ven biển", en: "Seaside Bungalow" },
        description: {
          vi: "Bungalow nhỏ hoàn hảo cho các kỳ nghỉ cuối tuần, có vườn riêng.",
          en: "Small bungalow perfect for weekend getaways, private garden included.",
        },
        price: 90000,
        address: { vi: "Đường ven biển", en: "Coastal road" },
        bedrooms: 2,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: {
          type: "Point",
          coordinates: [108.22, 16.0545], //
        },
        city_id: dnCityId, // Sửa lại
        type_id: forSaleId, // Sửa lại
        category_id: villaCatId, // Sửa lại
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[3]._id],
        images: ["https://picsum.photos/seed/p10a/800/600"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Định nghĩa một kiểu tạm thời cho vòng lặp (để TypeScript không báo lỗi)
    type SeedProperty = (typeof propertiesData)[0] & {
      district_id?: mongoose.Types.ObjectId;
      ward_id?: mongoose.Types.ObjectId;
    };

    const props: SeedProperty[] = propertiesData;

    // === 4. Cải thiện Logic gán District/Ward ===
    for (let prop of props) {
      const cityId = prop.city_id;

      // Lấy các quận thuộc thành phố này
      const cityDistricts = districts.filter((d) =>
        (d.city_id as mongoose.Types.ObjectId).equals(String(cityId))
      );
      if (!cityDistricts.length) {
        throw new Error(`Không tìm thấy district cho city_id: ${cityId}`);
      }

      // Chọn ngẫu nhiên 1 quận
      const district = getRandom(cityDistricts);
      prop.district_id = district._id as mongoose.Types.ObjectId;

      // Lấy các phường CHỈ thuộc quận này
      const districtWards = wards.filter((w) =>
        (w.district_id as mongoose.Types.ObjectId).equals(String(district._id))
      );
      if (!districtWards.length) {
        // Một số quận có thể chưa có phường, log warning thay vì crash
        console.warn(`⚠️ Không tìm thấy ward cho district_id: ${district._id} (Quận ${district.district_name.vi}). Bỏ qua gán phường.`);
      } else {
        // Chọn ngẫu nhiên 1 phường
        const ward = getRandom(districtWards);
        prop.ward_id = ward._id as mongoose.Types.ObjectId;
      }
    }

    console.log("✅ Random districts and wards assigned.");

    // === 5. Chèn vào DB ===
    await Property.insertMany(props);
    console.log(`🏡 ${props.length} Properties seeded successfully!`);
  } catch (err) {
    console.error("❌ Error seeding properties:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seed();
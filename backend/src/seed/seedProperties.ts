// src/scripts/seedProperties.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// 🧩 Models
import City from "../models/city.model";
import Category from "../models/category.model";
import PropertyType from "../models/propertyType.model";
import Feature from "../models/feature.model";
import User from "../models/user.model";
import Property from "../models/property.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "your_mongodb_atlas_url_here";

async function seed() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully!");

    // 🧹 Clear old data
    await Promise.all([
      City.deleteMany({}),
      Category.deleteMany({}),
      PropertyType.deleteMany({}),
      Feature.deleteMany({}),
      User.deleteMany({}),
      Property.deleteMany({}),
    ]);
    console.log("🧼 Old collections cleared!");

    // 🏙️ Cities
    await City.insertMany([
      { city_name: { vi: "Thành phố Hồ Chí Minh", en: "Ho Chi Minh City" } },
      { city_name: { vi: "Hà Nội", en: "Hanoi" } },
      { city_name: { vi: "Đà Nẵng", en: "Da Nang" } },
    ]);
    const cities = await City.find();
    console.log("🏙️ Cities seeded!");

    // 🏷️ Categories
    await Category.insertMany([
      { category_name: { vi: "Căn hộ", en: "Apartment" } },
      { category_name: { vi: "Nhà", en: "House" } },
      { category_name: { vi: "Biệt thự", en: "Villa" } },
    ]);
    const categories = await Category.find();
    console.log("🏷️ Categories seeded!");

    // 🏠 Property Types
    await PropertyType.insertMany([
      { type_name: { vi: "Cho thuê", en: "For Rent" } },
      { type_name: { vi: "Bán", en: "For Sale" } },
    ]);
    const types = await PropertyType.find();
    console.log("🏠 Property types seeded!");

    // ✨ Features
    await Feature.insertMany([
      { feature_name: { vi: "Ban công", en: "Balcony" } },
      { feature_name: { vi: "Hồ bơi", en: "Swimming Pool" } },
      { feature_name: { vi: "Nhà để xe", en: "Garage" } },
      { feature_name: { vi: "Vườn", en: "Garden" } },
      { feature_name: { vi: "Phòng gym", en: "Gym" } },
      { feature_name: { vi: "Thang máy", en: "Elevator" } },
    ]);
    const features = await Feature.find();
    console.log("✨ Features seeded!");

    // 👤 Users
    // const hashedPassword = await bcrypt.hash("123456", 10); // hash mật khẩu mẫu

    const users = await User.create([
      {
        fullName: "Nguyen Van A",
        email: "owner@example.com",
        password: "123456",
        role: "seller",
        phone: "0901234567",
        isActive: true
      },
      {
        fullName: "Le Thi B",
        email: "agent@example.com",
        password: "123456",
        role: "agent",
        phone: "0907654321",
        isActive: true
      },
    ]);
    console.log("👤 Users seeded!");

    const owner = users.find((u) => u.role === "seller");
    const agent = users.find((u) => u.role === "agent");

    if (!cities.length || !categories.length || !types.length || !owner || !agent) {
      throw new Error("Collections or users not seeded properly!");
    }
    // 🏡 Properties
    const now = new Date();
    await Property.insertMany([
      {
        // 1
        title: { vi: "Căn hộ cao cấp ở Quận 1", en: "Luxury Apartment in District 1" },
        description: { vi: "Căn hộ hiện đại đẹp mắt với view thành phố và đầy đủ tiện ích.", en: "A beautiful modern apartment with city view and full amenities." },
        price: 250000,
        address: { vi: "123 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh", en: "123 Nguyen Hue, District 1, Ho Chi Minh City" },
        bedrooms: 2,
        bathrooms: 2,
        area: 75,
        unit: "m2",
        yearBuilt: 2020,
        floors: 15,
        coordinates: { lat: 10.7769, lng: 106.7009 },
        listingType: "sale",
        city_id: cities[0]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "Apartment")?._id || categories[0]._id,
        owner_id: owner._id,
        agent_id: agent._id,
        features: features.slice(0, 3).map((f) => f._id),
        images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/518308113.jpg?k=134060b34af97004d911560301b891d9882b02f31eab9645fb6fe0dd07b084bc&o=&hp=1", "https://cf.bstatic.com/xdata/images/hotel/max1024x768/525593268.jpg?k=615de8dd83adca84bd9ac794b80bb7b10ff6c468542c7e4b451ac6ad3e0a193b&o=&hp=1", "https://pix10.agoda.net/hotelImages/4567921/0/7deeafc57df289800ebb70b70126e90f.jpg?ca=7&ce=1&s=414x232"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 2
        title: { vi: "Ngôi nhà ấm cúng gần Hồ Tây", en: "Cozy House near West Lake" },
        description: { vi: "Ngôi nhà gia đình ấm cúng nằm gần khu vực Hồ Tây với khu vườn rộng lớn.", en: "A cozy family home located near the West Lake area with a large garden." },
        price: 180000,
        address: { vi: "45 Trích Sài, Tây Hồ, Hà Nội", en: "45 Trich Sai, Tay Ho, Hanoi" },
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        unit: "m2",
        yearBuilt: 2018,
        floors: 2,
        coordinates: { lat: 21.0501, lng: 105.8188 },
        listingType: "rent",
        city_id: cities[1]._id,
        type_id: types.find(t => t.type_name?.en === "For Rent")?._id || types[0]._id,
        category_id: categories.find(c => c.category_name?.en === "House")?._id || categories[1]._id,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[1]._id, features[3]._id],
        images: ["https://houseinhanoi.vn/wp-content/uploads/2022/12/cozy-house-for-rent-on-to-ngoc-van-near-west-lake-16-835x467.jpg", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRma1501-CdXLYmZkltgSVtC_wMD1dbNLq8pA&s", "https://houseinhanoi.vn/wp-content/uploads/2022/12/cozy-house-for-rent-on-to-ngoc-van-near-west-lake-38-835x467.jpg"],
        status: "approved",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 3
        title: { vi: "Biệt thự ven biển tại Đà Nẵng", en: "Beachfront Villa in Da Nang" },
        description: { vi: "Biệt thự sang trọng với view biển, hồ bơi và đường riêng ra bãi biển.", en: "Luxury villa with sea view, swimming pool and private access to the beach." },
        price: 450000,
        address: { vi: "Bán đảo Sơn Trà, Đà Nẵng", en: "Son Tra Peninsula, Da Nang" },
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 16.0921, lng: 108.2477 },
        listingType: "sale",
        city_id: cities[2]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "Villa")?._id || categories[2]._id,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[1]._id, features[2]._id],
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWSdBDQ3QfTiw8v4lC0v9Aa2UQI-YCfSvB2w&s", "https://fusionresorts.com/danang/wp-content/uploads/2024/07/Thumnail-5bedroom-1024x662.webp", "https://cf.bstatic.com/xdata/images/hotel/max1024x768/569598891.jpg?k=a73db8f9c1d3f432c56778c38ac220972aac6b8ee16036c86d772c040f8a9e1f&o=&hp=1"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 4
        title: { vi: "Studio hiện đại ở Quận 3", en: "Modern Studio in District 3" },
        description: { vi: "Studio nhỏ gọn lý tưởng cho các chuyên gia độc thân, gần các quán cà phê và không gian làm việc chung.", en: "Compact studio ideal for single professionals, close to cafés and coworking spaces." },
        price: 85000,
        address: { vi: "78 Pasteur, Quận 3, Thành phố Hồ Chí Minh", en: "78 Pasteur, District 3, Ho Chi Minh City" },
        bedrooms: 1,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 10.7760, lng: 106.6900 },
        listingType: "rent",
        city_id: cities[0]._id,
        type_id: types.find(t => t.type_name?.en === "For Rent")?._id || types[0]._id,
        category_id: categories.find(c => c.category_name?.en === "Apartment")?._id || categories[0]._id,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[0]._id, features[4]._id],
        images: ["https://jhouse.vn/wp-content/uploads/2025/08/Modern-studio-apartment-at-The-Urban-Studio-Apartment-District-3-HCM-2.jpeg", "https://jhouse.vn/wp-content/uploads/2025/08/Modern-studio-apartment-at-The-Urban-Studio-Apartment-District-3-HCM-6.jpeg", "https://jhouse.vn/wp-content/uploads/2025/08/New-studio-apartment-for-rent-at-The-Urban-Studio-District-3-5.jpeg"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
      {
        // 5
        title: { vi: "Nhà gia đình ở Quận 9", en: "Family House in District 9" },
        description: { vi: "Ngôi nhà gia đình rộng rãi với nhà để xe và vườn, hoàn hảo cho các gia đình đang phát triển.", en: "Spacious family house with garage and garden, perfect for growing families." },
        price: 200000,
        address: { vi: "12 Long Trường, Quận 9, Thành phố Hồ Chí Minh", en: "12 Long Truong, District 9, Ho Chi Minh City" },
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 10.8250, lng: 106.7634 },
        listingType: "sale",
        city_id: cities[0]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "House")?._id || categories[1]._id,
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
        title: { vi: "Penthouse với view thành phố", en: "Penthouse with City View" },
        description: { vi: "Penthouse tầng cao với view 360 độ ra thành phố, nội thất thiết kế sang trọng.", en: "High-floor penthouse offering 360° views of the city, designer finishes." },
        price: 1200000,
        address: { vi: "50 Lê Lợi, Quận 1, Thành phố Hồ Chí Minh", en: "50 Le Loi, District 1, Ho Chi Minh City" },
        bedrooms: 4,
        bathrooms: 4,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 10.7750, lng: 106.7020 },
        listingType: "sale",
        city_id: cities[0]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "Apartment")?._id || categories[0]._id,
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
        title: { vi: "Căn hộ ven sông ở Thảo Điền", en: "Riverside Condo in Thao Dien" },
        description: { vi: "Căn hộ hiện đại với đường ra sông và hồ bơi chung. Tuyệt vời cho các gia đình nước ngoài.", en: "Modern condo with river access and communal pool. Great for expat families." },
        price: 320000,
        address: { vi: "Thảo Điền, Quận 2, Thành phố Hồ Chí Minh", en: "Thao Dien, District 2, Ho Chi Minh City" },
        bedrooms: 3,
        bathrooms: 2,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 10.8010, lng: 106.7375 },
        listingType: "rent",
        city_id: cities[0]._id,
        type_id: types.find(t => t.type_name?.en === "For Rent")?._id || types[0]._id,
        category_id: categories.find(c => c.category_name?.en === "Apartment")?._id || categories[0]._id,
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
        title: { vi: "Nhà phố đầy nắng gần Ngũ Hành Sơn", en: "Sunny Townhouse near Marble Mountain" },
        description: { vi: "Nhà phố thoải mái với sân thượng và hai ban công, gần các bãi biển.", en: "Comfortable townhouse with terrace and two balconies, close to beaches." },
        price: 150000,
        address: { vi: "Gần Ngũ Hành Sơn, Đà Nẵng", en: "Near Marble Mountain, Da Nang" },
        bedrooms: 3,
        bathrooms: 3,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 16.0425, lng: 108.2190 },
        listingType: "sale",
        city_id: cities[2]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "House")?._id || categories[1]._id,
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
        title: { vi: "Studio nhỏ gọn gần Đại học", en: "Compact Studio near University" },
        description: { vi: "Studio giá cả phải chăng gần khuôn viên trường đại học, lý tưởng cho sinh viên.", en: "Affordable studio near university campus, ideal for students." },
        price: 35000,
        address: { vi: "Khu vực Đại học, Đà Nẵng", en: "University area, Da Nang" },
        bedrooms: 1,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 16.0678, lng: 108.2232 },
        listingType: "rent",
        city_id: cities[2]._id,
        type_id: types.find(t => t.type_name?.en === "For Rent")?._id || types[0]._id,
        category_id: categories.find(c => c.category_name?.en === "Apartment")?._id || categories[0]._id,
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
        description: { vi: "Bungalow nhỏ hoàn hảo cho các kỳ nghỉ cuối tuần, có vườn riêng.", en: "Small bungalow perfect for weekend getaways, private garden included." },
        price: 90000,
        address: { vi: "Đường ven biển, Đà Nẵng", en: "Coastal road, Da Nang" },
        bedrooms: 2,
        bathrooms: 1,
        area: 350,
        unit: "m2",
        yearBuilt: 2022,
        floors: 3,
        coordinates: { lat: 16.0530, lng: 108.2300 },
        listingType: "sale",
        city_id: cities[2]._id,
        type_id: types.find(t => t.type_name?.en === "For Sale")?._id || types[1]._id,
        category_id: categories.find(c => c.category_name?.en === "Villa")?._id || categories[2]._id,
        owner_id: owner._id,
        agent_id: agent._id,
        features: [features[3]._id],
        images: ["https://picsum.photos/seed/p10a/800/600"],
        status: "available",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log("🏡 Property seeded!");

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error while seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seed();

import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import City from "../models/city.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";
import { createMultilangText } from "../utils/translateHelper";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("MONGO_URL chưa được khai báo trong .env");
  process.exit(1);
}

// Cache để tránh translate trùng
const translationCache = new Map<string, { vi: string; en: string }>();

async function translateCached(text: string) {
  if (translationCache.has(text)) return translationCache.get(text)!;
  const translated = await createMultilangText(text);
  translationCache.set(text, translated);
  return translated;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // 1. Fetch provinces API (depth=3: city -> district -> ward)
    const { data } = await axios.get(
      "https://provinces.open-api.vn/api/?depth=3"
    );

    for (const cityData of data) {
      // 2. Seed City
      const cityName = await translateCached(cityData.name);
      const city = await City.findOneAndUpdate(
        { "city_name.vi": cityName.vi },
        { city_name: cityName, deleted: false },
        { upsert: true, new: true }
      );

      console.log(`🌆 City: ${cityName.vi} (${cityName.en})`);

      // 3. Seed Districts
      for (const districtData of cityData.districts) {
        const districtName = await translateCached(districtData.name);
        const district = await District.findOneAndUpdate(
          { "district_name.vi": districtName.vi, city_id: city._id },
          { district_name: districtName, city_id: city._id, deleted: false },
          { upsert: true, new: true }
        );

        console.log(`  🏘️ District: ${districtName.vi} (${districtName.en})`);

        // 4. Seed Wards
        for (const wardData of districtData.wards) {
          const wardName = await translateCached(wardData.name);
          await Ward.findOneAndUpdate(
            { "ward_name.vi": wardName.vi, district_id: district._id },
            { ward_name: wardName, district_id: district._id, deleted: false },
            { upsert: true, new: true }
          );
          console.log(
            `    🏠 Ward: ${wardName.vi} (${wardName.en})`
          );
        }
      }
    }

    console.log("🎉 Seed locations completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();

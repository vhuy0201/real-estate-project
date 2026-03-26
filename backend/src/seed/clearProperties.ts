import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("❌ MONGO_URL is not defined in .env");
  process.exit(1);
}

async function clearPropertiesCollection() {
  try {
    await mongoose.connect(MONGO_URI || "");
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    const collection = db.collection("properties");
    console.log("Targeting 'properties' collection...");

    // === 1. Xóa Index cũ ===
    try {
      await collection.dropIndex("coordinates_2dsphere");
      console.log("✅ Dropped old 'coordinates_2dsphere' index.");
    } catch (error: any) {
      // Bỏ qua lỗi nếu index không tồn tại (vì đã xóa rồi)
      if (error.code === 27 || error.message.includes("index not found")) {
        console.warn(
          "⚠️ 'coordinates_2dsphere' index not found (This is OK)."
        );
      } else {
        // Nếu là lỗi khác, báo cho chúng ta biết
        throw error;
      }
    }

    // === 2. Xóa tất cả Dữ liệu ===
    const result = await collection.deleteMany({});
    console.log(
      `✅ Deleted ${result.deletedCount} document(s) from 'properties'.`
    );

    console.log("\n✨ Database cleanup complete! ✨");
    console.log(
      "Bạn có thể khởi động lại (restart) server của mình bây giờ."
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

clearPropertiesCollection();
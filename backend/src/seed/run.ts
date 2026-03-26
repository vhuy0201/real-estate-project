import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedReport2024 } from "./report2024.seed";
dotenv.config();
(async () => {
  await mongoose.connect(process.env.MONGO_URL || "");
  await seedReport2024();
  mongoose.disconnect();
})();

import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
const streamifier = require("streamifier");


// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
// End Cấu hình Cloudinary

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      console.log("⚠️ Không có file upload, bỏ qua upload Cloudinary");
      return next();
    }

    console.log("📤 Bắt đầu upload lên Cloudinary...");

    const uploadFromBuffer = (fileBuffer: Buffer) => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "avatars" }, // folder trên Cloudinary
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);

    if (result) {
      console.log("✅ Upload thành công!");
      console.log("🌐 URL:", result.url);
      console.log("🔒 Secure URL:", result.secure_url);
      // Gán URL avatar mới vào body để controller xử lý
      (req.body as any)[req.file.fieldname] = result.secure_url;
    }

    next();
  } catch (error) {
    console.error("❌ Lỗi upload Cloudinary:", error);
    res.status(500).json({ message: "Upload thất bại" });
  }
};

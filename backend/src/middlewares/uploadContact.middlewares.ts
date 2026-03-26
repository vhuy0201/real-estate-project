import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
const streamifier = require("streamifier");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      console.log("⚠️ Không có file upload");
      return next();
    }

    console.log("📤 Upload PDF lên Cloudinary...");

    const ext = req.file.originalname.split(".").pop(); // lấy đuôi file
    const publicId =
      Date.now() +
      "_" +
      req.file.originalname.replace(/\.[^/.]+$/, ""); // tránh ghi đè

    const uploadFromBuffer = (fileBuffer: Buffer) => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "contracts",
            resource_type: "auto",
            public_id: publicId,
            format: ext,
          },
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
      console.log("✅ Upload thành công! URL:", result.secure_url);

      // Gắn vào body (fieldname = 'file')
      req.body.file = result.secure_url;
    }

    next();
  } catch (error) {
    console.error("❌ Lỗi upload Cloudinary:", error);
    res.status(500).json({ message: "Upload thất bại" });
  }
};

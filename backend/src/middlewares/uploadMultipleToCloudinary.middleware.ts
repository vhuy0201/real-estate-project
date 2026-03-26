// src/middlewares/uploadMultipleToCloudinary.middleware.ts
import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

/**
 * Middleware upload nhiều file (từ req.files) lên Cloudinary.
 * - Hỗ trợ multer().array('images') (req.files là Array) và multer().fields(...) (req.files là object).
 * - Gán kết quả vào req.body[fieldname] = string[] (mảng URLs).
 */
export const uploadMultipleToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawFiles = (req as any).files;

    if (!rawFiles) {
      return next();
    }

    let filesArray: Express.Multer.File[] = [];

    if (Array.isArray(rawFiles)) {
      // multer().array(...)
      filesArray = rawFiles as Express.Multer.File[];
    } else if (rawFiles && typeof rawFiles === "object") {
      // multer().fields(...) -> object key -> array
      filesArray = Object.keys(rawFiles).reduce<Express.Multer.File[]>(
        (acc, key) => {
          const value = (rawFiles as any)[key];
          if (Array.isArray(value)) {
            acc.push(...(value as Express.Multer.File[]));
          } else if (value) {
            // trường hợp single file under a field
            acc.push(value as Express.Multer.File);
          }
          return acc;
        },
        []
      );
    }

    if (!filesArray.length) return next();

    const uploadFromBuffer = (fileBuffer: Buffer, folder = "properties") => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error: any, result: any) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    // Map fieldname -> array urls
    const resultMap: Record<string, string[]> = {};

    const defaultFolder = process.env.CLOUDINARY_FOLDER || "properties";

    for (const file of filesArray) {
      const folder = defaultFolder;
      const uploadResult = await uploadFromBuffer(file.buffer, folder);

      const url = uploadResult?.secure_url || uploadResult?.url;
      const field = file.fieldname || "files";

      // Log success for each uploaded file
      console.log(`✅ Cloudinary upload success: field=${field}, file=${file.originalname || file.filename || '<unknown>'}, url=${url}, public_id=${uploadResult?.public_id}`);

      if (!resultMap[field]) resultMap[field] = [];
      resultMap[field].push(url);
    }

    // Gán vào req.body:
    // Nếu chỉ có một field (thường là 'images'), gán req.body.images = [...]
    // Nếu nhiều field, gán từng field tương ứng
    const fields = Object.keys(resultMap);
    if (fields.length === 1) {
      (req.body as any)[fields[0]] = resultMap[fields[0]];
    } else {
      for (const f of fields) {
        (req.body as any)[f] = resultMap[f];
      }
    }

    // Log summary after assigning URLs to req.body
    console.log(`📤 Uploaded files summary: ${fields.map(f => `${f}(${resultMap[f].length})`).join(', ')}`);

    return next();
  } catch (error) {
    console.error("uploadMultipleToCloudinary error:", error);
    return res.status(500).json({ message: "Upload thất bại" });
  }
};

export default uploadMultipleToCloudinary;
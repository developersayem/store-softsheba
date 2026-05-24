import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

// Define the absolute path for the base uploads directory
const BASE_UPLOADS_DIR = path.join(process.cwd(), "src", "uploads");

// We use memory storage to intercept the file buffer and calculate its hash
const storage = multer.memoryStorage();

// Export the multer instance to be used in routes
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

/**
 * Middleware factory to process files uploaded via multer memoryStorage.
 * @param folderName The subfolder inside src/uploads where the files should be saved (e.g., "products")
 */
export const processUploads = (folderName: string = "") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetDir = path.join(BASE_UPLOADS_DIR, folderName);

      // Ensure the specific target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const processFile = async (file: Express.Multer.File) => {
        let bufferToSave = file.buffer;
        let ext = path.extname(file.originalname).toLowerCase();
        
        // Optimize if the file is an image (excluding SVGs)
        if (file.mimetype.startsWith("image/") && !file.mimetype.includes("svg")) {
          // Convert to highly optimized WebP format with 80% quality
          bufferToSave = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
          ext = ".webp";
        }

        // Calculate MD5 hash of the final buffer to ensure uniqueness
        const hash = crypto.createHash("md5").update(bufferToSave).digest("hex");
        const filename = `${hash}${ext}`;
        const filepath = path.join(targetDir, filename);

        // Check if file already exists on disk
        if (!fs.existsSync(filepath)) {
          // If not, write it to disk
          await fs.promises.writeFile(filepath, bufferToSave);
        }

        // Mutate the file object to behave like diskStorage for downstream controllers
        file.destination = targetDir;
        file.filename = filename;
        file.path = filepath;
        // Optionally update mimetype if we converted to webp
        if (ext === ".webp") {
          file.mimetype = "image/webp";
        }
      };

      if (req.file) {
        await processFile(req.file);
      } else if (req.files) {
        if (Array.isArray(req.files)) {
          await Promise.all(req.files.map(processFile));
        } else {
          const promises: Promise<void>[] = [];
          for (const key in req.files) {
            promises.push(...req.files[key].map(processFile));
          }
          await Promise.all(promises);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

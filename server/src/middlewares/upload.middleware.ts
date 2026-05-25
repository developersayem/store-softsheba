import multer from "multer";
import fs from "fs";
import path from "path";

// helper to create folder if not exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// factory function to create multer instance for memory storage
export const uploadTo = (_folderName: string) => {
  const storage = multer.memoryStorage();

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB for high-res images before optimization
  });
};

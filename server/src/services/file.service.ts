import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError";

// Define the absolute path for the base uploads directory
const BASE_UPLOADS_DIR = path.join(process.cwd(), "src", "uploads");

/**
 * Deletes a file from the uploads directory.
 * @param filename The name of the file to delete (e.g., "d41d8cd98f00b204e9800998ecf8427e.png")
 * @param folder Optional subfolder name (e.g., "products")
 * @returns true if deleted, false if the file didn't exist
 */
export const deleteFile = async (filename: string, folder: string = ""): Promise<boolean> => {
  try {
    const filepath = path.join(BASE_UPLOADS_DIR, folder, filename);
    await fs.unlink(filepath);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File doesn't exist, which is fine since we wanted it gone anyway
      return false;
    }
    throw new ApiError(500, `Failed to delete file: ${error.message}`);
  }
};

/**
 * Checks if a specific file exists in the uploads directory.
 * @param filename The name of the file
 * @param folder Optional subfolder name (e.g., "products")
 * @returns boolean
 */
export const fileExists = async (filename: string, folder: string = ""): Promise<boolean> => {
  try {
    const filepath = path.join(BASE_UPLOADS_DIR, folder, filename);
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the absolute system path for a file.
 * @param filename The name of the file
 * @param folder Optional subfolder name (e.g., "products")
 * @returns Absolute string path
 */
export const getFilePath = (filename: string, folder: string = ""): string => {
  return path.join(BASE_UPLOADS_DIR, folder, filename);
};

/**
 * Gets the public URL path for a file (assuming Express is serving /src/uploads statically).
 * @param filename The name of the file
 * @param folder Optional subfolder name (e.g., "products")
 * @returns Public URL path
 */
export const getFileUrl = (filename: string, folder: string = ""): string => {
  // Normalize the URL path properly by removing any leading/trailing slashes on folder
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return cleanFolder ? `/uploads/${cleanFolder}/${filename}` : `/uploads/${filename}`;
};

import fs from "fs";
import path from "path";
import mime from "mime-types";
import sharp from "sharp";
import { storageConfig } from "../../config/storage.config";

/**
 * Professional File & Image Service for ShopXet
 * Handles storage on Local Disk.
 * Includes automatic image optimization (WebP, Resize, Compress, Stripe Metadata).
 */
class FileService {
  private uploadRoot = path.resolve(process.cwd(), "uploads");

  constructor() {
    this.ensureDirSync(this.uploadRoot);
  }

  /**
   * Check if a filename represents a processable image
   */
  private isImage(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".gif"].includes(ext);
  }

  /**
   * Sync directory creation for local storage initialization
   */
  private ensureDirSync(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Async directory creation
   */
  private async ensureDir(folder: string) {
    try {
      await fs.promises.access(folder);
    } catch {
      await fs.promises.mkdir(folder, { recursive: true });
    }
  }

  /**
   * Generate a path for storage
   */
  private getObjectKey(folder: string, filename: string): string {
    return `${folder}/${filename}`;
  }

  /**
   * Generate custom file name with forced .webp if optimized
   */
  generateFileName(originalName: string, customBaseName?: string): string {
    let ext = path.extname(originalName);
    
    if (storageConfig.optimization.enabled && this.isImage(originalName)) {
      ext = `.${storageConfig.optimization.format}`;
    }

    const timestamp = Date.now();
    const safeBase = (customBaseName || path.basename(originalName, path.extname(originalName)))
      .replace(/\s+/g, "-")
      .toLowerCase();

    return `${safeBase}-${timestamp}${ext}`;
  }

  /**
   * Construct the public URL for the file
   */
  getFileUrl(folder: string, filename: string): string {
    const key = this.getObjectKey(folder, filename);
    // Always local uploads path
    return `/uploads/${key}`;
  }

  /**
   * Optimize image buffer before storage
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    const { maxWidth, quality, format } = storageConfig.optimization;
    
    let pipeline = sharp(buffer, { animated: true });

    // Auto-resize to standard max width while maintaining aspect ratio
    pipeline = pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside"
    });

    // Format & Compression
    if (format === "webp") {
      pipeline = pipeline.webp({ 
        quality, 
        effort: 6,
        lossless: false,
        smartSubsample: true
      });
    }

    return await pipeline.toBuffer();
  }

  /**
   * Main upload handler for images and files
   * Accepts both File objects (from disk) and memory buffers (from multer)
   */
  async uploadFile(
    fileInput: Express.Multer.File | string, // Buffer from memory or path from disk (legacy)
    folder: string,
    filename: string
  ): Promise<string> {
    const objectKey = this.getObjectKey(folder, filename).startsWith("/") 
      ? this.getObjectKey(folder, filename).substring(1) 
      : this.getObjectKey(folder, filename);
    
    console.log(`🚀 Starting optimized local upload: ${objectKey}`);
    
    let buffer: Buffer;
    let contentType: string;

    // 1. Resolve Input
    if (typeof fileInput === "string") {
      buffer = await fs.promises.readFile(fileInput);
      contentType = mime.lookup(fileInput) || "application/octet-stream";
    } else {
      buffer = fileInput.buffer;
      contentType = fileInput.mimetype;
    }

    // 2. Optimization Pipeline
    if (storageConfig.optimization.enabled && this.isImage(filename)) {
      console.log(`✨ Optimizing image: ${filename}`);
      const optimizedBuffer = await this.optimizeImage(buffer);
      
      // ONLY use optimized buffer if it actually saves space
      if (optimizedBuffer.length < buffer.length) {
        console.log(`✅ Pre-optimization: ${buffer.length} bytes | Post-optimization: ${optimizedBuffer.length} bytes (Saved ${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}%)`);
        buffer = optimizedBuffer;
        contentType = `image/${storageConfig.optimization.format}`;
      } else {
        console.log(`ℹ️ Optimized version was larger (${optimizedBuffer.length} bytes) than original (${buffer.length} bytes). Keeping original for efficiency.`);
      }
    }

    // 3. Store to Local
    const targetFolder = path.join(this.uploadRoot, path.dirname(objectKey));
    await this.ensureDir(targetFolder);
    const targetPath = path.join(this.uploadRoot, objectKey);

    await fs.promises.writeFile(targetPath, buffer);

    // Cleanup legacy temp path
    if (typeof fileInput === "string") {
      try { await fs.promises.unlink(fileInput); } catch {}
    }

    console.log(`📂 Saved: ${objectKey} (${buffer.length} bytes)`);
    return objectKey; // Return relative path for database consistency
  }

  /**
   * Legacy method support purely to prevent breaking imports immediately
   */
  async moveFile(fileInput: Express.Multer.File | string, folder: string, filename: string): Promise<string> {
    return this.uploadFile(fileInput, folder, filename);
  }

  /**
   * Delete file from disk
   */
  async deleteFile(folder: string, filename: string): Promise<void> {
    if (!filename || filename === "null" || filename === "undefined") return;

    // Extract filename if a path or URL was passed accidentally
    const cleanFilename = filename.includes("/") ? filename.split("/").pop()! : filename;
    
    let objectKey = this.getObjectKey(folder, cleanFilename);
    if (objectKey.startsWith("/")) objectKey = objectKey.substring(1);

    const localPath = path.join(this.uploadRoot, objectKey);
    try {
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
        console.log(`🗑️ Deleted: ${objectKey}`);
      }
    } catch (err: any) {
      if (err.code !== "ENOENT") console.error(`❌ Delete failed [${objectKey}]:`, err.message);
    }
  }

  /**
   * Recursive folder deletion
   */
  async deleteFolder(folder: string): Promise<void> {
    if (!folder) return;
    const localPath = path.join(this.uploadRoot, folder);
    try {
      if (fs.existsSync(localPath)) {
        await fs.promises.rm(localPath, { recursive: true, force: true });
        console.log(`📁 Deleted folder: ${folder}`);
      }
    } catch (err: any) {
      if (err.code !== "ENOENT") console.error(`❌ Folder delete failed [${folder}]:`, err.message);
    }
  }
}

export const fileService = new FileService();


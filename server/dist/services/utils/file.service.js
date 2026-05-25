"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const sharp_1 = __importDefault(require("sharp"));
const storage_config_1 = require("../../config/storage.config");
/**
 * Professional File & Image Service for ShopXet
 * Handles storage on Local Disk.
 * Includes automatic image optimization (WebP, Resize, Compress, Stripe Metadata).
 */
class FileService {
    constructor() {
        this.uploadRoot = path_1.default.resolve(process.cwd(), "uploads");
        this.ensureDirSync(this.uploadRoot);
    }
    /**
     * Check if a filename represents a processable image
     */
    isImage(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".gif"].includes(ext);
    }
    /**
     * Sync directory creation for local storage initialization
     */
    ensureDirSync(dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    /**
     * Async directory creation
     */
    async ensureDir(folder) {
        try {
            await fs_1.default.promises.access(folder);
        }
        catch {
            await fs_1.default.promises.mkdir(folder, { recursive: true });
        }
    }
    /**
     * Generate a path for storage
     */
    getObjectKey(folder, filename) {
        return `${folder}/${filename}`;
    }
    /**
     * Generate custom file name with forced .webp if optimized
     */
    generateFileName(originalName, customBaseName) {
        let ext = path_1.default.extname(originalName);
        if (storage_config_1.storageConfig.optimization.enabled && this.isImage(originalName)) {
            ext = `.${storage_config_1.storageConfig.optimization.format}`;
        }
        const timestamp = Date.now();
        const safeBase = (customBaseName || path_1.default.basename(originalName, path_1.default.extname(originalName)))
            .replace(/\s+/g, "-")
            .toLowerCase();
        return `${safeBase}-${timestamp}${ext}`;
    }
    /**
     * Construct the public URL for the file
     */
    getFileUrl(folder, filename) {
        const key = this.getObjectKey(folder, filename);
        // Always local uploads path
        return `/uploads/${key}`;
    }
    /**
     * Optimize image buffer before storage
     */
    async optimizeImage(buffer) {
        const { maxWidth, quality, format } = storage_config_1.storageConfig.optimization;
        let pipeline = (0, sharp_1.default)(buffer, { animated: true });
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
    async uploadFile(fileInput, // Buffer from memory or path from disk (legacy)
    folder, filename) {
        const objectKey = this.getObjectKey(folder, filename).startsWith("/")
            ? this.getObjectKey(folder, filename).substring(1)
            : this.getObjectKey(folder, filename);
        console.log(`🚀 Starting optimized local upload: ${objectKey}`);
        let buffer;
        let contentType;
        // 1. Resolve Input
        if (typeof fileInput === "string") {
            buffer = await fs_1.default.promises.readFile(fileInput);
            contentType = mime_types_1.default.lookup(fileInput) || "application/octet-stream";
        }
        else {
            buffer = fileInput.buffer;
            contentType = fileInput.mimetype;
        }
        // 2. Optimization Pipeline
        if (storage_config_1.storageConfig.optimization.enabled && this.isImage(filename)) {
            console.log(`✨ Optimizing image: ${filename}`);
            const optimizedBuffer = await this.optimizeImage(buffer);
            // ONLY use optimized buffer if it actually saves space
            if (optimizedBuffer.length < buffer.length) {
                console.log(`✅ Pre-optimization: ${buffer.length} bytes | Post-optimization: ${optimizedBuffer.length} bytes (Saved ${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}%)`);
                buffer = optimizedBuffer;
                contentType = `image/${storage_config_1.storageConfig.optimization.format}`;
            }
            else {
                console.log(`ℹ️ Optimized version was larger (${optimizedBuffer.length} bytes) than original (${buffer.length} bytes). Keeping original for efficiency.`);
            }
        }
        // 3. Store to Local
        const targetFolder = path_1.default.join(this.uploadRoot, path_1.default.dirname(objectKey));
        await this.ensureDir(targetFolder);
        const targetPath = path_1.default.join(this.uploadRoot, objectKey);
        await fs_1.default.promises.writeFile(targetPath, buffer);
        // Cleanup legacy temp path
        if (typeof fileInput === "string") {
            try {
                await fs_1.default.promises.unlink(fileInput);
            }
            catch { }
        }
        console.log(`📂 Saved: ${objectKey} (${buffer.length} bytes)`);
        return objectKey; // Return relative path for database consistency
    }
    /**
     * Legacy method support purely to prevent breaking imports immediately
     */
    async moveFile(fileInput, folder, filename) {
        return this.uploadFile(fileInput, folder, filename);
    }
    /**
     * Delete file from disk
     */
    async deleteFile(folder, filename) {
        if (!filename || filename === "null" || filename === "undefined")
            return;
        // Extract filename if a path or URL was passed accidentally
        const cleanFilename = filename.includes("/") ? filename.split("/").pop() : filename;
        let objectKey = this.getObjectKey(folder, cleanFilename);
        if (objectKey.startsWith("/"))
            objectKey = objectKey.substring(1);
        const localPath = path_1.default.join(this.uploadRoot, objectKey);
        try {
            if (fs_1.default.existsSync(localPath)) {
                await fs_1.default.promises.unlink(localPath);
                console.log(`🗑️ Deleted: ${objectKey}`);
            }
        }
        catch (err) {
            if (err.code !== "ENOENT")
                console.error(`❌ Delete failed [${objectKey}]:`, err.message);
        }
    }
    /**
     * Recursive folder deletion
     */
    async deleteFolder(folder) {
        if (!folder)
            return;
        const localPath = path_1.default.join(this.uploadRoot, folder);
        try {
            if (fs_1.default.existsSync(localPath)) {
                await fs_1.default.promises.rm(localPath, { recursive: true, force: true });
                console.log(`📁 Deleted folder: ${folder}`);
            }
        }
        catch (err) {
            if (err.code !== "ENOENT")
                console.error(`❌ Folder delete failed [${folder}]:`, err.message);
        }
    }
}
exports.fileService = new FileService();

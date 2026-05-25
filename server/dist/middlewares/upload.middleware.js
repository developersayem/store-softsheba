"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTo = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
// helper to create folder if not exists
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// factory function to create multer instance for memory storage
const uploadTo = (_folderName) => {
    const storage = multer_1.default.memoryStorage();
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB for high-res images before optimization
    });
};
exports.uploadTo = uploadTo;

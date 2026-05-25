"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUrl = void 0;
const toPublicUrl = (filePath) => {
    if (!filePath)
        return "";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    return `${backendUrl}/${filePath.replace(/\\/g, "/")}`; // normalize slashes
};
exports.toPublicUrl = toPublicUrl;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBrands = exports.getAllBrands = exports.toggleMultipleFeatured = exports.toggleMultiplePublished = exports.toggleFeatured = exports.togglePublished = exports.deleteMultipleBrands = exports.deleteBrand = exports.updateBrand = exports.createBrand = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const brand_service_1 = require("../services/brand.service");
const ApiResponse_1 = require("../utils/ApiResponse");
// ------------------ Create ------------------
exports.createBrand = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await brand_service_1.brandService.create(req.body, req.file);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, data, "Brand created"));
});
// ------------------ Update ------------------
exports.updateBrand = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await brand_service_1.brandService.update(req.params.id, req.body, req.file);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Brand updated"));
});
// ------------------ Delete ------------------
exports.deleteBrand = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await brand_service_1.brandService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, data.message));
});
// ------------------ Delete Multiple ------------------
exports.deleteMultipleBrands = (0, asyncHandler_1.default)(async (req, res) => {
    const count = await brand_service_1.brandService.deleteMultiple(req.body.ids);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} brand(s) deleted successfully`));
});
// ------------------ Toggle Published ------------------
exports.togglePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await brand_service_1.brandService.togglePublished(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Brand published" : "Brand unpublished"));
});
// ------------------ Toggle Featured ------------------
exports.toggleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await brand_service_1.brandService.toggleFeatured(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Brand featured" : "Brand unfeatured"));
});
// ------------------ Toggle Multiple Published ------------------
exports.toggleMultiplePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await brand_service_1.brandService.toggleMultiplePublished(req.body.ids, req.body.action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Brands ${status ? "published" : "unpublished"} successfully`));
});
// ------------------ Toggle Multiple Featured ------------------
exports.toggleMultipleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await brand_service_1.brandService.toggleMultipleFeatured(req.body.ids, req.body.action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Brands ${status ? "featured" : "unfeatured"} successfully`));
});
// ------------------ Get All Brands ------------------
exports.getAllBrands = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await brand_service_1.brandService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
// ------------------ Import Brands ------------------
exports.importBrands = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file)
        throw new Error("No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    const count = await brand_service_1.brandService.importBrands(req.file.path, ext);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} brands imported successfully`));
});

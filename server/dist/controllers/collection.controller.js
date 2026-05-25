"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCollections = exports.getProductsByCollection = exports.getAllCollectionsWithProducts = exports.getAllCollections = exports.toggleMultipleFeatured = exports.toggleMultiplePublished = exports.toggleFeatured = exports.togglePublished = exports.deleteMultipleCollections = exports.deleteCollection = exports.updateCollection = exports.collectionReorder = exports.createCollection = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const collection_service_1 = require("../services/collection.service");
const ApiResponse_1 = require("../utils/ApiResponse");
exports.createCollection = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await collection_service_1.collectionService.create(req.body, req.file);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, data, "Collection created"));
});
exports.collectionReorder = (0, asyncHandler_1.default)(async (req, res) => {
    const updates = req.body.updates; // Expecting [{ id: string, order: number }, ...]
    await collection_service_1.collectionService.updateOrder(updates);
    res.json(new ApiResponse_1.ApiResponse(200, null, "Collection order updated successfully"));
});
exports.updateCollection = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await collection_service_1.collectionService.update(req.params.id, req.body, req.file);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Collection updated"));
});
exports.deleteCollection = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await collection_service_1.collectionService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data.message));
});
exports.deleteMultipleCollections = (0, asyncHandler_1.default)(async (req, res) => {
    const count = await collection_service_1.collectionService.deleteMultiple(req.body.ids);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} collection(s) deleted successfully`));
});
exports.togglePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await collection_service_1.collectionService.togglePublished(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Collection published" : "Collection unpublished"));
});
exports.toggleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await collection_service_1.collectionService.toggleFeatured(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Collection featured" : "Collection unfeatured"));
});
exports.toggleMultiplePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await collection_service_1.collectionService.toggleMultiplePublished(req.body.ids, req.body.action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Collections ${status ? "published" : "unpublished"} successfully`));
});
exports.toggleMultipleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await collection_service_1.collectionService.toggleMultipleFeatured(req.body.ids, req.body.action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Collections ${status ? "featured" : "unfeatured"} successfully`));
});
exports.getAllCollections = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await collection_service_1.collectionService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getAllCollectionsWithProducts = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await collection_service_1.collectionService.getAllWithProducts();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getProductsByCollection = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await collection_service_1.collectionService.getBySlug(req.params.slug);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.importCollections = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file)
        throw new Error("No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    const count = await collection_service_1.collectionService.importCollections(req.file.path, ext);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} collections imported successfully`));
});

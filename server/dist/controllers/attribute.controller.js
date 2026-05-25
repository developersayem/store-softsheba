"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importAttributes = exports.toggleMultipleAttributes = exports.toggleAttributeStatus = exports.getAttributes = exports.deleteMultipleAttributes = exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = void 0;
// controllers/attribute.controller.ts
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const attribute_service_1 = require("../services/attribute.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
// ------------------------------------------------------
// CREATE
// ------------------------------------------------------
exports.createAttribute = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await attribute_service_1.attributeService.create(req.body);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, data, "Attribute created"));
});
// ------------------------------------------------------
// UPDATE
// ------------------------------------------------------
exports.updateAttribute = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await attribute_service_1.attributeService.update(req.params.id, req.body);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Attribute updated"));
});
// ------------------------------------------------------
// DELETE SINGLE
// ------------------------------------------------------
exports.deleteAttribute = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await attribute_service_1.attributeService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Attribute deleted"));
});
// ------------------------------------------------------
// DELETE MULTIPLE
// ------------------------------------------------------
exports.deleteMultipleAttributes = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    const deletedCount = await attribute_service_1.attributeService.deleteMultiple(ids);
    res.json(new ApiResponse_1.ApiResponse(200, { deletedCount }, `${deletedCount} attributes deleted`));
});
// ------------------------------------------------------
// GET ALL
// ------------------------------------------------------
exports.getAttributes = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await attribute_service_1.attributeService.getAll(req.query);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
// ------------------------------------------------------
// TOGGLE SINGLE ACTIVE
// ------------------------------------------------------
exports.toggleAttributeStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await attribute_service_1.attributeService.toggleStatus(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Attribute status updated"));
});
// ------------------------------------------------------
// TOGGLE MULTIPLE ACTIVE
// ------------------------------------------------------
exports.toggleMultipleAttributes = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    const isActive = await attribute_service_1.attributeService.toggleMultiple(ids, action);
    res.json(new ApiResponse_1.ApiResponse(200, { isActive }, `Attributes ${isActive ? "activated" : "deactivated"}`));
});
// ------------------------------------------------------
// IMPORT (JSON + CSV)
// ------------------------------------------------------
exports.importAttributes = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "No file uploaded");
    }
    const ext = req.file.originalname.split(".").pop();
    if (!ext)
        throw new ApiError_1.ApiError(400, "File extension missing");
    const count = await attribute_service_1.attributeService.importAttributes(req.file.path, ext);
    res.json(new ApiResponse_1.ApiResponse(200, { count }, `${count} attributes imported`));
});

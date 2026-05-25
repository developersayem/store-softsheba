"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarketing = exports.getMarketing = exports.getSeoConfig = exports.getGoogleConfig = exports.getFacebookPixel = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const marketing_service_1 = require("../services/marketing.service");
exports.getFacebookPixel = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await marketing_service_1.marketingService.getFacebookPixelData();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Facebbok details fetched"));
});
exports.getGoogleConfig = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await marketing_service_1.marketingService.getGoogleData();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "GTM & GA4 details fetched"));
});
exports.getSeoConfig = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await marketing_service_1.marketingService.getSeoData();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "SEO details fetched"));
});
exports.getMarketing = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await marketing_service_1.marketingService.getMarketing();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Marketing details fetched"));
});
exports.updateMarketing = (0, asyncHandler_1.default)(async (req, res) => {
    const courierApi = await marketing_service_1.marketingService.updateMarketing(req.body);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, courierApi, "Marketing details updated"));
});

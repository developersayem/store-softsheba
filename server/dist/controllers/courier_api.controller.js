"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCarrybeeStore = exports.getCarrybeeAddressDetails = exports.getCarrybeeAreaSuggestion = exports.getCarrybeeStores = exports.getCarrybeeAreas = exports.getCarrybeeZones = exports.getCarrybeeCities = exports.updateCourierApi = exports.getCouirerApi = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const courier_api_service_1 = require("../services/courier_api.service");
const carrybee_courier_service_1 = require("../services/carrybee.courier.service");
exports.getCouirerApi = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await courier_api_service_1.courierService.getCouirerApi();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Courier details fetched"));
});
exports.updateCourierApi = (0, asyncHandler_1.default)(async (req, res) => {
    const courierApi = await courier_api_service_1.courierService.updateCourierApi(req.body);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, courierApi, "Courier details updated"));
});
exports.getCarrybeeCities = (0, asyncHandler_1.default)(async (req, res) => {
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const cities = await carrybee_courier_service_1.carrybeeCourier.getCities(carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, cities, "Carrybee cities fetched"));
});
exports.getCarrybeeZones = (0, asyncHandler_1.default)(async (req, res) => {
    const cityId = req.params.cityId;
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const zones = await carrybee_courier_service_1.carrybeeCourier.getZones(cityId, carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, zones, "Carrybee zones fetched"));
});
exports.getCarrybeeAreas = (0, asyncHandler_1.default)(async (req, res) => {
    const cityId = req.params.cityId;
    const zoneId = req.params.zoneId;
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const areas = await carrybee_courier_service_1.carrybeeCourier.getAreas(cityId, zoneId, carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, areas, "Carrybee areas fetched"));
});
exports.getCarrybeeStores = (0, asyncHandler_1.default)(async (req, res) => {
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const stores = await carrybee_courier_service_1.carrybeeCourier.getStores(carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, stores, "Carrybee stores fetched"));
});
exports.getCarrybeeAreaSuggestion = (0, asyncHandler_1.default)(async (req, res) => {
    const { search } = req.query;
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const suggestions = await carrybee_courier_service_1.carrybeeCourier.getAreaSuggestion(search, carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, suggestions, "Carrybee suggestions fetched"));
});
exports.getCarrybeeAddressDetails = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req.body;
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const details = await carrybee_courier_service_1.carrybeeCourier.getAddressDetails(query, carrybee);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, details, "Carrybee address details fetched"));
});
exports.createCarrybeeStore = (0, asyncHandler_1.default)(async (req, res) => {
    const courierData = await courier_api_service_1.courierService.getCouirerApi();
    const carrybee = courierData[0]?.carrybee;
    if (!carrybee?.enabled)
        throw new ApiError_1.ApiError(400, "Carrybee is not enabled");
    const result = await carrybee_courier_service_1.carrybeeCourier.createStore(req.body, carrybee);
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, result, "Carrybee store created"));
});

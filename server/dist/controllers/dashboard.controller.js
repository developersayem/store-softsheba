"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardProfit = exports.getProfitaAndLossOverview = exports.getDashboardOverview = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
const dashboard_service_1 = require("../services/dashboard.service");
exports.getDashboardOverview = (0, asyncHandler_1.default)(async (req, res) => {
    const { statuses, timeframe, frequency } = req.body;
    const data = await (0, dashboard_service_1.getOverviewData)({
        statuses,
        timeframe,
        frequency,
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Dashboard overview fetched"));
});
exports.getProfitaAndLossOverview = (0, asyncHandler_1.default)(async (req, res) => {
    const { timeframe, statuses } = req.body;
    const data = await (0, dashboard_service_1.profitAndLossOverview)(timeframe, statuses);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Profit and loss overview fetched"));
});
exports.getDashboardProfit = (0, asyncHandler_1.default)(async (req, res) => {
    // const { timeframe } = req.body;
    const data = await (0, dashboard_service_1.getProfitandLossDataByProductAndCategory)();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, data, "Dashboard profit data fetched"));
});

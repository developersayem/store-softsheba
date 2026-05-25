"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeSupportMails = exports.getSupportMailById = exports.getSupportMails = void 0;
const notification_service_1 = require("../services/notification.service");
const support_service_1 = require("../services/support.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getSupportMails = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await support_service_1.supportService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getSupportMailById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const data = await support_service_1.supportService.getById(id);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.takeSupportMails = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await support_service_1.supportService.create(req.body);
    const notification = await notification_service_1.notificationService.createNotification({
        title: "New Support Mail Received!",
        message: String(data.message),
        supportId: String(data._id),
        type: "support",
    });
    res.status(200).json("Support Inquery Taken");
});

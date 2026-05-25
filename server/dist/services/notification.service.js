"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const mongoose_1 = require("mongoose");
const notification_model_1 = require("../models/notification.model");
const ApiError_1 = require("../utils/ApiError");
const socket_1 = require("../socket");
const store_context_1 = require("../utils/store-context");
exports.notificationService = {
    async createNotification(payload) {
        //console.log(payload)
        if (!payload.title || !payload.message)
            throw new ApiError_1.ApiError(400, "Title and message are required");
        console.log(payload);
        const notification = await notification_model_1.Notification.create({
            ...payload,
            orderId: payload.orderId
                ? new mongoose_1.Types.ObjectId(payload.orderId)
                : undefined,
            isRead: false,
        });
        // Emit to the store-specific room or admin room
        const storeId = store_context_1.StoreContext.getStoreId();
        (0, socket_1.emitToStore)(storeId?.toString(), "notification:new", notification);
        return notification;
    },
    async listNotifications(customerId) {
        const filter = {};
        if (customerId && mongoose_1.Types.ObjectId.isValid(customerId))
            filter.customerId = customerId;
        return notification_model_1.Notification.find(filter).sort({ created_at: -1 }).lean();
    },
    async markAsRead(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid notification id");
        const notification = await notification_model_1.Notification.findById(id);
        if (!notification)
            throw new ApiError_1.ApiError(404, "Notification not found");
        notification.isRead = true;
        notification.read_at = new Date();
        await notification.save();
        return notification;
    },
    async deleteNotification(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid notification id");
        const deleted = await notification_model_1.Notification.findByIdAndDelete(id);
        if (!deleted)
            throw new ApiError_1.ApiError(404, "Notification not found");
        return deleted;
    },
};

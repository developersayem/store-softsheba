import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { ApiError } from "../utils/ApiError";
import { emitToStore } from "../socket";
import { StoreContext } from "../utils/store-context";

export interface CreateNotificationPayload {
  customerId?: string;
  productId?:string;
  orderId?: string;
  supportId?:string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error"| "support";
}

export const notificationService = {
  async createNotification(payload: CreateNotificationPayload) {
    //console.log(payload)
    if (!payload.title || !payload.message)
      throw new ApiError(400, "Title and message are required");
    console.log(payload)

    const notification = await Notification.create({
      ...payload,
      orderId: payload.orderId
        ? new Types.ObjectId(payload.orderId)
        : undefined,
      isRead: false,
    });

    // Emit to the store-specific room or admin room
    const storeId = StoreContext.getStoreId();
    emitToStore(storeId?.toString(), "notification:new", notification);

    return notification;
  },

  async listNotifications(customerId?: string) {
    const filter: any = {};
    if (customerId && Types.ObjectId.isValid(customerId))
      filter.customerId = customerId;

    return Notification.find(filter).sort({ created_at: -1 }).lean();
  },

  async markAsRead(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid notification id");

    const notification = await Notification.findById(id);
    if (!notification) throw new ApiError(404, "Notification not found");

    notification.isRead = true;
    notification.read_at = new Date();
    await notification.save();

    return notification;
  },

  async deleteNotification(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid notification id");
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Notification not found");
    return deleted;
  },
};

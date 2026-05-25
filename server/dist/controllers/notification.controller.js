"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsRead = exports.listNotifications = exports.createNotification = void 0;
const notification_service_1 = require("../services/notification.service");
const createNotification = async (req, res) => {
    const notification = await notification_service_1.notificationService.createNotification(req.body);
    res.status(201).json(notification);
};
exports.createNotification = createNotification;
const listNotifications = async (req, res) => {
    const notifications = await notification_service_1.notificationService.listNotifications(req.query.customerId);
    res.json(notifications);
};
exports.listNotifications = listNotifications;
const markAsRead = async (req, res) => {
    const notification = await notification_service_1.notificationService.markAsRead(req.params.id);
    res.json(notification);
};
exports.markAsRead = markAsRead;
const deleteNotification = async (req, res) => {
    const deleted = await notification_service_1.notificationService.deleteNotification(req.params.id);
    res.status(204).json(deleted);
};
exports.deleteNotification = deleteNotification;

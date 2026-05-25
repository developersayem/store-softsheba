import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

export const createNotification = async (req: Request, res: Response) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json(notification);
};

export const listNotifications = async (req: Request, res: Response) => {
  const notifications = await notificationService.listNotifications(
    req.query.customerId as string
  );
  res.json(notifications);
};

export const markAsRead = async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(
    req.params.id as string
  );
  res.json(notification);
};

export const deleteNotification = async (req: Request, res: Response) => {
  const deleted = await notificationService.deleteNotification(
    req.params.id as string
  );
  res.status(204).json(deleted);
};

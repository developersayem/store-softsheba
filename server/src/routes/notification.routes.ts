import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyJWT, notificationController.createNotification);
router.get("/", verifyJWT, notificationController.listNotifications);
router.post("/:id/read", verifyJWT, notificationController.markAsRead);
router.delete("/:id", verifyJWT, notificationController.deleteNotification);

export default router;

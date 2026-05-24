import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes (require user to be logged in)
router.use(authenticateJWT);

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.post("/:id/refund", orderController.initiateRefund);

export default router;

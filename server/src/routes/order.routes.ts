import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { blockIPMiddleware } from "../middlewares/block.ip.middleware";
import { storefrontLimiter } from "../middlewares/ratelimit.middleware";
import { checkPermission } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.post("/", blockIPMiddleware, storefrontLimiter, orderController.createOrder);

// User routes
router.get("/me", verifyJWT, orderController.listMyOrders);

// Admin / Shared routes
router.get("/", verifyJWT, checkPermission("orders:view"), orderController.listOrders);
router.get(
  "/incomplete/order",
  verifyJWT,
  checkPermission("orders:view"),
  orderController.listIncompleteOrders,
);
router.post(
  "/incomplete/order",
  blockIPMiddleware,
  orderController.createIncompleteOrder,
);
router.get("/:id", verifyJWT, checkPermission("orders:view"), orderController.getOrder);
router.put("/:id", verifyJWT, checkPermission("orders:manage"), orderController.updateOrder);
router.patch("/:id/status", verifyJWT, checkPermission("orders:manage"), orderController.updateOrder); // Status update reuse updateOrder
router.delete("/:id", verifyJWT, checkPermission("orders:manage"), orderController.deleteOrder);
router.post("/delete-many", verifyJWT, checkPermission("orders:manage"), orderController.deleteMany);
router.post(
  "/:id/send-to-courier",
  verifyJWT,
  checkPermission("orders:manage"),
  orderController.sendOrderToCourier,
);
router.post(
  "/send-to-courier-many",
  verifyJWT,
  checkPermission("orders:manage"),
  orderController.sendOrderToCourierMany,
);
router.post(
  "/refresh-courier-status",
  verifyJWT,
  checkPermission("orders:manage"),
  orderController.getCourierStatus,
);

router.post(
  "/:id/block-ip",
  verifyJWT,
  checkPermission("orders:manage"),
  orderController.blockIPFromOrder,
);



export default router;

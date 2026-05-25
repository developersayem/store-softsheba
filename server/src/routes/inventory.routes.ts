import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getInventory,
  updateStock,
  setStockAlert,
  listInventory,
} from "../controllers/inventory.controller";

const router = Router();

// List all inventory (must be first to avoid conflict)
router.get("/", verifyJWT, listInventory);

// Update stock and set alerts
router.post("/update-stock", verifyJWT, updateStock);
router.post("/set-stock-alert", verifyJWT, setStockAlert);

// Get inventory - specific variant first, then product-level
router.get("/:productId/:variantId", verifyJWT, getInventory);
router.get("/:productId", verifyJWT, getInventory);

export default router;
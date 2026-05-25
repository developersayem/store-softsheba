"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const inventory_controller_1 = require("../controllers/inventory.controller");
const router = (0, express_1.Router)();
// List all inventory (must be first to avoid conflict)
router.get("/", auth_middleware_1.verifyJWT, inventory_controller_1.listInventory);
// Update stock and set alerts
router.post("/update-stock", auth_middleware_1.verifyJWT, inventory_controller_1.updateStock);
router.post("/set-stock-alert", auth_middleware_1.verifyJWT, inventory_controller_1.setStockAlert);
// Get inventory - specific variant first, then product-level
router.get("/:productId/:variantId", auth_middleware_1.verifyJWT, inventory_controller_1.getInventory);
router.get("/:productId", auth_middleware_1.verifyJWT, inventory_controller_1.getInventory);
exports.default = router;

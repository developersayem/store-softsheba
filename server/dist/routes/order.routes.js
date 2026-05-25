"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController = __importStar(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const block_ip_middleware_1 = require("../middlewares/block.ip.middleware");
const ratelimit_middleware_1 = require("../middlewares/ratelimit.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/", block_ip_middleware_1.blockIPMiddleware, ratelimit_middleware_1.storefrontLimiter, orderController.createOrder);
// User routes
router.get("/me", auth_middleware_1.verifyJWT, orderController.listMyOrders);
// Admin / Shared routes
router.get("/", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:view"), orderController.listOrders);
router.get("/incomplete/order", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:view"), orderController.listIncompleteOrders);
router.post("/incomplete/order", block_ip_middleware_1.blockIPMiddleware, orderController.createIncompleteOrder);
router.get("/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:view"), orderController.getOrder);
router.put("/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.updateOrder);
router.patch("/:id/status", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.updateOrder); // Status update reuse updateOrder
router.delete("/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.deleteOrder);
router.post("/delete-many", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.deleteMany);
router.post("/:id/send-to-courier", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.sendOrderToCourier);
router.post("/send-to-courier-many", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.sendOrderToCourierMany);
router.post("/refresh-courier-status", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.getCourierStatus);
router.post("/:id/block-ip", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("orders:manage"), orderController.blockIPFromOrder);
exports.default = router;

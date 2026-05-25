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
const customerController = __importStar(require("../controllers/customer.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", customerController.createCustomer);
router.get("/", auth_middleware_1.verifyJWT, customerController.listCustomers);
router.get("/:id", auth_middleware_1.verifyJWT, customerController.getCustomer);
router.put("/:id", auth_middleware_1.verifyJWT, customerController.updateCustomer);
router.delete("/:id", auth_middleware_1.verifyJWT, customerController.deleteCustomer);
router.post("/:id/block", auth_middleware_1.verifyJWT, customerController.blockCustomer);
router.post("/:id/unblock", auth_middleware_1.verifyJWT, customerController.unblockCustomer);
router.post("/block-many", auth_middleware_1.verifyJWT, customerController.blockMany);
router.patch("/create-group", auth_middleware_1.verifyJWT, customerController.createGroup);
router.patch("/update-group", auth_middleware_1.verifyJWT, customerController.updateGroup);
router.post("/delete-group", auth_middleware_1.verifyJWT, customerController.deleteGroup);
router.get("/groups/list", auth_middleware_1.verifyJWT, customerController.listGroups);
router.get("/suggestions/search", auth_middleware_1.verifyJWT, customerController.getSearchSuggestions);
router.get("/filter-by-purchase/filter", auth_middleware_1.verifyJWT, customerController.getCustomersByPurchase);
exports.default = router;

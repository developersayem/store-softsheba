"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//dashboard.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.post("/overview", auth_middleware_1.verifyJWT, dashboard_controller_1.getDashboardOverview);
router.post("/profit-loss", auth_middleware_1.verifyJWT, dashboard_controller_1.getProfitaAndLossOverview);
router.get("/profit", auth_middleware_1.verifyJWT, dashboard_controller_1.getDashboardProfit);
exports.default = router;

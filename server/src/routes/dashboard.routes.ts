//dashboard.routes.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getDashboardOverview, getDashboardProfit, getProfitaAndLossOverview } from "../controllers/dashboard.controller";
const router = Router();
router.post("/overview", verifyJWT, getDashboardOverview);
router.post("/profit-loss", verifyJWT, getProfitaAndLossOverview);
router.get("/profit", verifyJWT, getDashboardProfit);
export default router;

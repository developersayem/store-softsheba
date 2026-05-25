import { Router } from "express";
import { getCustomerReport, getInventoryReport, getRevenueReport, getSalesReport } from "../controllers/analytics.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get("/sales", verifyJWT, getSalesReport);
router.get("/inventory", verifyJWT, getInventoryReport);
router.get("/revenue", verifyJWT, getRevenueReport);
router.get("/customers", verifyJWT, getCustomerReport);

export default router;

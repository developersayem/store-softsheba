import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticateJWT } from "../middlewares/auth.middleware"; 

const router = Router();

// Public routes
router.get("/", productController.getProducts);

// Protected/Admin routes
router.post("/", authenticateJWT, productController.createProduct);

export default router;

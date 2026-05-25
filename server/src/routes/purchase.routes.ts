import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

import {
  createPurchase,
  updatePurchase,
  deletePurchase,
  getAllPurchases,
  getPurchaseById,
} from "../controllers/purchase.controller";

const router = Router();

router.get("/", verifyJWT, getAllPurchases);
router.get("/:id", verifyJWT, getPurchaseById);
router.post("/", verifyJWT, createPurchase);
router.put("/:id", verifyJWT, updatePurchase);
router.delete("/:id", verifyJWT, deletePurchase);

export default router;

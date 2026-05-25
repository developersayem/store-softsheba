import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierById,
} from "../controllers/supplier.controller";

const router = Router();

router.get("/", verifyJWT, getAllSuppliers);
router.get("/:id", verifyJWT, getSupplierById);
router.post("/", verifyJWT, createSupplier);
router.put("/:id", verifyJWT, updateSupplier);
router.delete("/:id", verifyJWT, deleteSupplier);

export default router;

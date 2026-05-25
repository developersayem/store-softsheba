// routes/admin/attribute.routes.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { uploadTo } from "../middlewares/upload.middleware";
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  deleteMultipleAttributes,
  getAttributes,
  toggleAttributeStatus,
  toggleMultipleAttributes,
  importAttributes,
} from "../controllers/attribute.controller";

const router = Router();

// ---------------------------
// Admin Protected Routes
// ---------------------------


// GET all attributes
router.get("/", verifyJWT, getAttributes);

// CREATE
router.post("/", verifyJWT, createAttribute);

// IMPORT (CSV + JSON)
router.post("/import", verifyJWT, uploadTo("temp").single("file"), importAttributes);

// DELETE multiple
router.post("/delete-many", verifyJWT, deleteMultipleAttributes);

// TOGGLE multiple active
router.patch("/toggle-multiple", verifyJWT, toggleMultipleAttributes);



// * Dynamic routes

// UPDATE
router.patch("/:id", verifyJWT, updateAttribute);

// DELETE single
router.delete("/:id", verifyJWT, deleteAttribute);

// TOGGLE single active
router.patch("/:id/toggle-status", verifyJWT, toggleAttributeStatus);




export default router;

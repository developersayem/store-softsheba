import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { uploadTo } from "../middlewares/upload.middleware";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  deleteMultipleBrands,
  togglePublished,
  toggleFeatured,
  toggleMultiplePublished,
  toggleMultipleFeatured,
  getAllBrands,
  importBrands,
} from "../controllers/brand.controller";


const router = Router();

// Create
router.post("/", verifyJWT, uploadTo("brands").single("image"), createBrand);

// Read
router.get("/", getAllBrands);



// Delete
router.delete("/:id", verifyJWT, deleteBrand);
router.post("/delete-many", verifyJWT, deleteMultipleBrands);
// Toggle multiple
router.patch("/toggle-multiple-published", verifyJWT, toggleMultiplePublished);
router.patch("/toggle-multiple-featured", verifyJWT, toggleMultipleFeatured);

// Toggle
router.patch("/:id/toggle-published", verifyJWT, togglePublished);
router.patch("/:id/toggle-featured", verifyJWT, toggleFeatured);

// Update
router.patch(
  "/:id",
  verifyJWT,
  uploadTo("brands").single("image"),
  updateBrand
);


// Import
router.post("/import", verifyJWT, uploadTo("temp").single("file"), importBrands);

export default router;

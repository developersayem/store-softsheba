import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/role.middleware";
import {
  createLandingPage,
  listLandingPages,
  getLandingPageById,
  getLandingPageBySlug,
  updateLandingPage,
  deleteLandingPage,
  toggleLandingPageActive,
} from "../controllers/landing-page.controller";

import { uploadTo } from "../middlewares/upload.middleware";
const router = Router();

// PUBLIC
router.get("/slug/:slug", getLandingPageBySlug);

// ADMIN
router.get("/", verifyJWT, checkPermission("marketing:view"), listLandingPages);
router.get("/:id", verifyJWT, checkPermission("marketing:view"), getLandingPageById);
router.post("/", verifyJWT, checkPermission("marketing:manage"), uploadTo("landing-pages").any(), createLandingPage);
router.patch("/:id", verifyJWT, checkPermission("marketing:manage"), uploadTo("landing-pages").any(), updateLandingPage);
router.patch("/:id/toggle-active", verifyJWT, checkPermission("marketing:manage"), toggleLandingPageActive);
router.delete("/:id", verifyJWT, checkPermission("marketing:manage"), deleteLandingPage);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { isOwner, checkPermission } from "../middlewares/role.middleware";
import {
  getStaff,
  getSingleStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller";

const router = Router();

// All staff management routes require authentication
router.use(verifyJWT);

// GET routes: accessible by owner OR staff with staff:view permission
router.get("/", checkPermission("staff:view"), getStaff);
router.get("/:id", checkPermission("staff:view"), getSingleStaff);

// Modification routes: RESTRICTED to owners only
router.post("/create", isOwner, createStaff);
router.patch("/:id", isOwner, updateStaff);
router.delete("/:id", isOwner, deleteStaff);

export default router;

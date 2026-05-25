"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const staff_controller_1 = require("../controllers/staff.controller");
const router = (0, express_1.Router)();
// All staff management routes require authentication
router.use(auth_middleware_1.verifyJWT);
// GET routes: accessible by owner OR staff with staff:view permission
router.get("/", (0, role_middleware_1.checkPermission)("staff:view"), staff_controller_1.getStaff);
router.get("/:id", (0, role_middleware_1.checkPermission)("staff:view"), staff_controller_1.getSingleStaff);
// Modification routes: RESTRICTED to owners only
router.post("/create", role_middleware_1.isOwner, staff_controller_1.createStaff);
router.patch("/:id", role_middleware_1.isOwner, staff_controller_1.updateStaff);
router.delete("/:id", role_middleware_1.isOwner, staff_controller_1.deleteStaff);
exports.default = router;

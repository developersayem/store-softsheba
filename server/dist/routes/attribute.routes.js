"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/admin/attribute.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const attribute_controller_1 = require("../controllers/attribute.controller");
const router = (0, express_1.Router)();
// ---------------------------
// Admin Protected Routes
// ---------------------------
// GET all attributes
router.get("/", auth_middleware_1.verifyJWT, attribute_controller_1.getAttributes);
// CREATE
router.post("/", auth_middleware_1.verifyJWT, attribute_controller_1.createAttribute);
// IMPORT (CSV + JSON)
router.post("/import", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("temp").single("file"), attribute_controller_1.importAttributes);
// DELETE multiple
router.post("/delete-many", auth_middleware_1.verifyJWT, attribute_controller_1.deleteMultipleAttributes);
// TOGGLE multiple active
router.patch("/toggle-multiple", auth_middleware_1.verifyJWT, attribute_controller_1.toggleMultipleAttributes);
// * Dynamic routes
// UPDATE
router.patch("/:id", auth_middleware_1.verifyJWT, attribute_controller_1.updateAttribute);
// DELETE single
router.delete("/:id", auth_middleware_1.verifyJWT, attribute_controller_1.deleteAttribute);
// TOGGLE single active
router.patch("/:id/toggle-status", auth_middleware_1.verifyJWT, attribute_controller_1.toggleAttributeStatus);
exports.default = router;

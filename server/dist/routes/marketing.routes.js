"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const marketing_controller_1 = require("../controllers/marketing.controller");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
//public routes
router.get('/get-facebook', marketing_controller_1.getFacebookPixel);
router.get('/get-google', marketing_controller_1.getGoogleConfig);
router.get('/get-seo', marketing_controller_1.getSeoConfig);
//private routes
router.get('/', auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("marketing:view"), marketing_controller_1.getMarketing);
router.patch('/', auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("marketing:manage"), marketing_controller_1.updateMarketing);
exports.default = router;

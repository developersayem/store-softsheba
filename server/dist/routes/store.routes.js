"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const store_controller_1 = require("../controllers/store.controller");
const router = (0, express_1.Router)();
// All store routes require authentication
router.use(auth_middleware_1.verifyJWT);
router.route("/me").get(store_controller_1.getMyStore);
router.route("/custom-domain").patch(store_controller_1.updateCustomDomain);
exports.default = router;

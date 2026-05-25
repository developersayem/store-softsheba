"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/review.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const review_controller_1 = require("../controllers/review.controller");
const router = (0, express_1.Router)();
/**
 * PUBLIC
 */
router.post("/", review_controller_1.createReview);
router.get("/product/:slug", review_controller_1.getProductReviews);
/**
 * ADMIN
 */
router.get("/", review_controller_1.getAllReviews);
router.patch("/:id/approve", auth_middleware_1.verifyJWT, review_controller_1.approveReview);
router.patch("/:id/reject", auth_middleware_1.verifyJWT, review_controller_1.rejectReview);
router.delete("/:id", auth_middleware_1.verifyJWT, review_controller_1.deleteReview);
router.post("/delete-many", auth_middleware_1.verifyJWT, review_controller_1.deleteMultiple);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const reviewSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: true,
        trim: true,
    },
    isApproved: {
        type: Boolean,
        default: false, //! IMPORTANT
        index: true,
    },
}, { timestamps: true });
reviewSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);

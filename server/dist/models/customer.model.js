"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const NoteSchema = new mongoose_1.Schema({
    author: { type: String, required: true },
    content: { type: String, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
const CustomerSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    note: { type: String },
    nextCall: { type: Date },
    postal_code: { type: String },
    isBlocked: { type: Boolean, default: false },
    blocked_reason: { type: String },
    groupNames: { type: [String], default: [] },
    noteHistory: [NoteSchema],
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
CustomerSchema.index({ storeId: 1 });
CustomerSchema.index({ storeId: 1, phone: 1 }, { unique: true });
// Use a partial index for email to allow multiple customers with NO email (null/missing)
// while still ensuring uniqueness when an email IS provided.
CustomerSchema.index({ storeId: 1, email: 1 }, {
    unique: true,
    // Only include in index if email is a non-empty string
    partialFilterExpression: { email: { $gt: "" } }
});
CustomerSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Customer = (0, mongoose_1.model)("Customer", CustomerSchema);

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Variant" },
    name: { type: String, required: true },
    sku: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    selectedAttributes: [
        {
            attributeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Attribute" },
            name: String,
            value: String,
            _id: false,
        },
    ],
});
const ShippingAddressSchema = new mongoose_1.Schema({
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: String,
    state: String,
    postal_code: String,
    note: String,
});
const OrderSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    order_number: { type: String, required: true },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
        required: false,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discount_Type: { type: String },
    shipping_charge: { type: Number, required: true, default: 0 },
    shipping_rule_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "ShippingRule" },
    coupon_code: { type: String },
    coupon_discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment_method: {
        type: String,
        enum: ["cod", "online_payment"],
        default: "cod",
    },
    status: {
        type: String,
        enum: [
            "pending",
            "on hold",
            "approved",
            "processing",
            "ready to ship",
            "in-transit",
            "delivered",
            "flagged",
            "cancelled",
            "incomplete",
            "Pending",
            "On Hold",
            "Approved",
            "Processing",
            "Ready To Ship",
            "In-Transit",
            "Delivered",
            "Flagged",
            "Cancelled",
        ],
        default: "pending",
    },
    shipping_address: { type: ShippingAddressSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    payment: {
        sales: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
        due: { type: Number, default: 0 },
        currency: { type: String, default: "BDT" },
    },
    dates: {
        created: { type: Date, default: Date.now },
        shipping: { type: Date, default: Date.now },
        processing: { type: Date },
        ready_to_ship: { type: Date },
        on_hold: { type: Date },
        approved: { type: Date },
        flagged: { type: Date },
        cancelled: { type: Date },
        in_transit: { type: Date },
        Delivered: { type: Date },
        PendingReturn: { type: Date },
    },
    courier: {
        isCourierAssigned: { type: Boolean, default: false },
        name: {
            type: String,
            enum: ["steadfast", "pathao", "carrybee"],
        },
        invoiceId: {
            type: String,
            index: true,
        },
        consignmentId: {
            type: String,
            index: true,
        },
        trackingCode: {
            type: String,
            index: true,
        },
        tracking_url: String,
        status: {
            type: String,
        },
        sent_at: Date,
    },
    ip: { type: String, required: true },
    isIpBlocked: {
        type: Boolean,
        default: false,
    },
    notes: [{ type: String }],
    additional_notes: [{ type: String }],
    followUpDate: { type: Date, default: null },
    sub_status: { type: String, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
OrderSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
OrderSchema.index({ storeId: 1 });
OrderSchema.index({ storeId: 1, order_number: 1 }, { unique: true });
exports.Order = mongoose_1.default.model("Order", OrderSchema);

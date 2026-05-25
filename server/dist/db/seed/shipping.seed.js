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
exports.seedShippingRules = void 0;
const shipping_rule_model_1 = require("../../models/shipping_rule.model");
const seedShippingRules = async () => {
    const existing = await shipping_rule_model_1.ShippingRule.find().lean();
    if (existing && existing.length > 0) {
        console.log("✔ Shipping rules already exist. Skipping seeding.");
        return;
    }
    const defaultRules = [
        {
            name: "Free Shipping (All Areas)",
            active: true,
            areas: [
                {
                    name: "All Bangladesh",
                    type: "free_shipping",
                },
            ],
        },
        {
            name: "Flat Rate Delivery (All Areas)",
            active: true,
            areas: [
                {
                    name: "All Bangladesh",
                    type: "flat_rate",
                    amount: 100,
                },
            ],
        },
        {
            name: "Rate by Weight (Dhaka vs Outside)",
            active: true,
            areas: [
                {
                    name: "Inside Dhaka",
                    type: "rate_by_weight",
                    weight_ranges: [
                        { min: 0, max: 0.5, charge: 60 },
                        { min: 0.5, max: 1, charge: 70 },
                        { min: 1, max: 2, charge: 90 },
                    ],
                    extra_per_kg: 15,
                },
                {
                    name: "Outside Dhaka",
                    type: "rate_by_weight",
                    weight_ranges: [
                        { min: 0, max: 0.5, charge: 110 },
                        { min: 0.5, max: 1, charge: 130 },
                        { min: 1, max: 2, charge: 170 },
                    ],
                    extra_per_kg: 25,
                },
            ],
        },
        {
            name: "Free in Dhaka, Flat Outside",
            active: false, // Not active by default, but available as example
            areas: [
                {
                    name: "Inside Dhaka",
                    type: "free_shipping",
                },
                {
                    name: "Outside Dhaka",
                    type: "flat_rate",
                    amount: 120,
                },
            ],
        },
        {
            name: "Mixed Strategy (Free/Weight-based)",
            active: false,
            areas: [
                {
                    name: "Dhaka City",
                    type: "free_shipping",
                },
                {
                    name: "Dhaka Suburbs",
                    type: "flat_rate",
                    amount: 60,
                },
                {
                    name: "Other Cities",
                    type: "rate_by_weight",
                    weight_ranges: [
                        { min: 0, max: 1, charge: 100 },
                        { min: 1, max: 3, charge: 150 },
                        { min: 3, max: 5, charge: 200 },
                    ],
                    extra_per_kg: 40,
                },
            ],
        },
    ];
    const { Store } = await Promise.resolve().then(() => __importStar(require("../../models/store.model")));
    const defaultStore = await Store.findOne().sort({ createdAt: 1 });
    if (!defaultStore) {
        console.error("❌ Failed to seed ShippingRules: No default store found!");
        return;
    }
    const rulesWithStoreId = defaultRules.map(rule => ({
        ...rule,
        storeId: defaultStore._id
    }));
    await shipping_rule_model_1.ShippingRule.insertMany(rulesWithStoreId);
    console.log("✅ Default shipping rules seeded successfully!");
};
exports.seedShippingRules = seedShippingRules;

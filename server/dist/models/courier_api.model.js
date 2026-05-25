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
exports.CourierApiIntegration = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const CourierApiSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    // ================= Pathao =================
    pathao: {
        enabled: {
            type: Boolean,
            default: false,
        },
        clientId: {
            type: String,
            trim: true,
        },
        clientSecret: {
            type: String,
            trim: true,
        },
        clientEmail: {
            type: String,
            trim: true,
        },
        clientPassword: {
            type: String,
            trim: true,
        },
        storeId: {
            type: String,
            trim: true,
        },
        storeName: {
            type: String,
            trim: true,
        },
        storeContactNumber: {
            type: String,
            trim: true,
        },
        webhookCallbackUrl: {
            type: String,
            trim: true,
        },
        webhookSecret: {
            type: String,
            trim: true,
        },
    },
    // ================= SteadFast =================
    steadfast: {
        enabled: {
            type: Boolean,
            default: false,
        },
        apiKey: {
            type: String,
            trim: true,
        },
        secretKey: {
            type: String,
            trim: true,
        },
    },
    // ================= Carrybee =================
    carrybee: {
        enabled: {
            type: Boolean,
            default: false,
        },
        clientId: {
            type: String,
            trim: true,
        },
        clientSecret: {
            type: String,
            trim: true,
        },
        clientContext: {
            type: String,
            trim: true,
        },
        isSandbox: {
            type: Boolean,
            default: true,
        },
        storeId: {
            type: String,
            trim: true,
        },
    },
}, { timestamps: true });
CourierApiSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.CourierApiIntegration = mongoose_1.default.model("CourierApiIntegration", CourierApiSchema);

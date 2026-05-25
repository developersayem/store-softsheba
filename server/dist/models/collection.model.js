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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const CollectionSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product" }],
    category: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Category" }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    image: { type: String },
    homeLimit: { type: Number, default: 12 },
    order: { type: Number },
    sortBy: {
        type: String,
        enum: [
            "latest",
            "oldest",
            "flash_sale",
            "big_discount",
            "high_price",
            "low_price",
        ],
        default: "latest",
    },
}, { timestamps: true });
CollectionSchema.index({ storeId: 1 });
CollectionSchema.index({ storeId: 1, name: 1 }, { unique: true });
CollectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });
CollectionSchema.pre("save", async function (next) {
    if (this.isModified("name") || this.isNew) {
        const Collection = mongoose_1.default.model("Collection", CollectionSchema);
        let baseSlug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
        if (!baseSlug)
            baseSlug = `collection-${Date.now()}`;
        let slug = baseSlug;
        let exists = await Collection.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
        while (exists) {
            slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
            exists = await Collection.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
        }
        this.slug = slug;
    }
    next();
});
CollectionSchema.plugin(image_resolver_plugin_1.imageResolver, { fields: ["image"] });
CollectionSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Collection = mongoose_1.default.model("Collection", CollectionSchema);

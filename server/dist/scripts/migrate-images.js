"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const brand_model_1 = require("../models/brand.model");
const product_model_1 = require("../models/product.model");
const category_model_1 = require("../models/category.model");
const collection_model_1 = require("../models/collection.model");
const store_settings_model_1 = require("../models/store_settings.model");
const variant_model_1 = require("../models/variant.model");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shopXet";
const stripUrl = (path) => {
    if (!path)
        return path;
    if (Array.isArray(path))
        return path.map(stripUrl);
    if (typeof path !== "string")
        return path;
    // Find index of /uploads/
    const index = path.indexOf("/uploads/");
    if (index !== -1) {
        return path.substring(index);
    }
    return path;
};
const migrate = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected successfully.");
        // ---- Brands ----
        console.log("Migrating Brands...");
        const brands = await brand_model_1.Brand.find();
        for (const b of brands) {
            b.image = stripUrl(b.image);
            await b.save();
        }
        console.log(`Migrated ${brands.length} brands.`);
        // ---- Categories ----
        console.log("Migrating Categories...");
        const categories = await category_model_1.Category.find();
        for (const c of categories) {
            c.icon = stripUrl(c.icon);
            c.banner = stripUrl(c.banner);
            await c.save();
        }
        console.log(`Migrated ${categories.length} categories.`);
        // ---- Collections ----
        console.log("Migrating Collections...");
        const collections = await collection_model_1.Collection.find();
        for (const cl of collections) {
            cl.image = stripUrl(cl.image);
            await cl.save();
        }
        console.log(`Migrated ${collections.length} collections.`);
        // ---- Variants ----
        console.log("Migrating Variants...");
        const variants = await variant_model_1.Variant.find();
        for (const v of variants) {
            v.image = stripUrl(v.image);
            await v.save();
        }
        console.log(`Migrated ${variants.length} variants.`);
        // ---- Products ----
        console.log("Migrating Products...");
        const products = await product_model_1.Product.find();
        for (const p of products) {
            p.thumbnail = stripUrl(p.thumbnail);
            p.gallery = stripUrl(p.gallery);
            p.file = stripUrl(p.file);
            await p.save();
        }
        console.log(`Migrated ${products.length} products.`);
        // ---- Store Settings ----
        console.log("Migrating Store Settings...");
        const settings = await store_settings_model_1.storeSettings.find();
        for (const s of settings) {
            if (s.fav_icon)
                s.fav_icon = stripUrl(s.fav_icon);
            if (s.header?.site_logo)
                s.header.site_logo = stripUrl(s.header.site_logo);
            if (s.pages?.home?.hero_section?.hero_images) {
                s.pages.home.hero_section.hero_images = s.pages.home.hero_section.hero_images.map(stripUrl);
            }
            if (s.pages?.home?.flash_sale_section?.banner) {
                s.pages.home.flash_sale_section.banner.banner_image = stripUrl(s.pages.home.flash_sale_section.banner.banner_image);
                s.pages.home.flash_sale_section.banner.count_down_image = stripUrl(s.pages.home.flash_sale_section.banner.count_down_image);
            }
            if (s.footer?.top) {
                s.footer.top.left_icon = stripUrl(s.footer.top.left_icon);
                s.footer.top.right_icon = stripUrl(s.footer.top.right_icon);
            }
            if (s.footer?.contact) {
                s.footer.contact.location_icon = stripUrl(s.footer.contact.location_icon);
                s.footer.contact.phone_icon = stripUrl(s.footer.contact.phone_icon);
                s.footer.contact.email_icon = stripUrl(s.footer.contact.email_icon);
            }
            await s.save();
        }
        console.log(`Migrated ${settings.length} store settings entries.`);
        console.log("Migration completed successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};
migrate();

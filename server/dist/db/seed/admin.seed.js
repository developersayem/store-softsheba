"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
const user_model_1 = require("../../models/user.model");
const store_model_1 = require("../../models/store.model");
const seedAdminUser = async () => {
    let user = await user_model_1.User.findOne().lean();
    if (user) {
        console.log("✔ User already exists. Skipping admin seed.");
    }
    else {
        const adminData = {
            fullName: process.env.ADMIN_NAME || "SoftXet Admin",
            email: process.env.ADMIN_EMAIL || "softxet@gmail.com",
            password: process.env.ADMIN_PASSWORD || "Admin@123", // will be hashed by pre-save hook
            isActive: true,
            twoStepEnabled: false,
        };
        user = await user_model_1.User.create(adminData);
        console.log("✅ Admin user seeded successfully!");
    }
    // Ensure default Store exists for license/self-hosted modes
    const existingStore = await store_model_1.Store.findOne().lean();
    if (!existingStore && user) {
        console.log("➤ No Default Store found. Creating one...");
        await store_model_1.Store.create({
            ownerId: user._id,
            name: process.env.STORE_NAME || "Default Store",
            slug: "default",
            status: "active",
            plan: "pro",
        });
        console.log("✅ Default Store seeded successfully!");
    }
};
exports.seedAdminUser = seedAdminUser;

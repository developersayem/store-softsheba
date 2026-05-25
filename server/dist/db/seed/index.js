"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_seed_1 = require("./admin.seed");
const shipping_seed_1 = require("./shipping.seed");
const store_seed_1 = require("./store.seed");
const SowingSeed = async () => {
    try {
        // Seed admin account
        await (0, admin_seed_1.seedAdminUser)();
        //seed store settings
        await (0, store_seed_1.storeSettingsRules)();
        // Seed Shipping Settings
        await (0, shipping_seed_1.seedShippingRules)();
        // others
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = SowingSeed;

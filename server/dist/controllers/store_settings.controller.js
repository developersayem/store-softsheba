"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreSettings = exports.getStoreSettings = void 0;
const store_settings_service_1 = require("../services/store_settings.service");
const node_cache_1 = __importDefault(require("node-cache"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
const myCache = new node_cache_1.default({ stdTTL: 15, checkperiod: 120 });
const CACHE_KEY = "STORE_SETTINGS_DATA";
const getStoreSettings = async (req, res) => {
    try {
        // For single vendor, we use a global cache key
        const STORE_CACHE_KEY = CACHE_KEY;
        // Check if data is already in RAM
        const cachedData = myCache.get(STORE_CACHE_KEY);
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        if (cachedData) {
            // If found, return immediately. No DB query needed.
            return res.status(200).json({
                success: true,
                data: cachedData,
                source: "cache",
            });
        }
        //  If NOT in cache, fetch from Database
        const settings = await (0, store_settings_service_1.getStoreSettingsService)();
        // Save to Cache for next time
        myCache.set(STORE_CACHE_KEY, settings);
        res.status(200).json({
            success: true,
            data: settings,
            source: "database",
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getStoreSettings = getStoreSettings;
/* =====================================================
Update Store Settings
===================================================== */
exports.updateStoreSettings = (0, asyncHandler_1.default)(async (req, res) => {
    const updatedSettings = await (0, store_settings_service_1.updateStoreSettingsService)(req.body, req.files);
    // For single vendor, we use a global cache key
    const STORE_CACHE_KEY = CACHE_KEY;
    myCache.del(STORE_CACHE_KEY);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, updatedSettings, "Store settings updated successfully"));
});

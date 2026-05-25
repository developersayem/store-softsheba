"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketingService = void 0;
const marketing_model_1 = require("../models/marketing.model");
exports.marketingService = {
    async getMarketing() {
        const data = await marketing_model_1.MarketingSettings.find();
        if (!data) {
            throw new Error("Marketing details not Found!");
        }
        return data;
    },
    async updateMarketing(payload) {
        const result = await marketing_model_1.MarketingSettings.findOneAndUpdate({}, { $set: payload }, {
            new: true, // return updated document
            upsert: true, // create if not exists
            runValidators: true,
        });
        return result;
    },
    async getFacebookPixelData() {
        const data = await marketing_model_1.MarketingSettings.find()
            .select("facebook")
            .populate("facebook", "pixelId browserTrackingEnabled serverTrackingEnabled");
        if (!data) {
            throw new Error("Marketing details not Found!");
        }
        return data;
    },
    async getGoogleData() {
        const data = await marketing_model_1.MarketingSettings.find()
            .select("google")
            .populate("google", "measurementId tagId merchant testEventCode analyticsIntegration");
        if (!data) {
            throw new Error("Marketing details not Found!");
        }
        return data;
    },
    async getSeoData() {
        const data = await marketing_model_1.MarketingSettings.find().select("seo");
        if (!data) {
            throw new Error("Marketing details not Found!");
        }
        return data;
    },
};

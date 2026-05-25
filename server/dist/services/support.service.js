"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportService = void 0;
const support_model_1 = require("../models/support.model");
exports.supportService = {
    async getAll() {
        return support_model_1.support.find().sort({ createdAt: -1 });
    },
    async getById(id) {
        return support_model_1.support.findById(id);
    },
    async create(payload) {
        const supplier = await support_model_1.support.create(payload);
        return supplier;
    },
};

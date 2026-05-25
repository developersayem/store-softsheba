"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveShippingRules = exports.toggleShippingRuleStatus = exports.calculateShippingCost = exports.deleteShippingRule = exports.updateShippingRule = exports.createShippingRule = exports.getShippingRuleById = exports.getAllShippingRules = void 0;
const shipping_rule_service_1 = require("../services/shipping_rule.service");
const ApiResponse_1 = require("../utils/ApiResponse");
/** Get all shipping rules */
const getAllShippingRules = async (_req, res, next) => {
    try {
        const rules = await shipping_rule_service_1.shippingRuleService.getAll();
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, rules, "Shipping rules fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getAllShippingRules = getAllShippingRules;
/** Get a single shipping rule by ID */
const getShippingRuleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rule = await shipping_rule_service_1.shippingRuleService.getById(id);
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, rule, "Shipping rule fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getShippingRuleById = getShippingRuleById;
/** Create a new shipping rule */
const createShippingRule = async (req, res, next) => {
    try {
        const payload = req.body;
        const rule = await shipping_rule_service_1.shippingRuleService.create(payload);
        res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(201, rule, "Shipping rule created successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.createShippingRule = createShippingRule;
/** Update a shipping rule by ID */
const updateShippingRule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const updated = await shipping_rule_service_1.shippingRuleService.update(id, payload);
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, updated, "Shipping rule updated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.updateShippingRule = updateShippingRule;
/** Delete a shipping rule by ID */
const deleteShippingRule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await shipping_rule_service_1.shippingRuleService.delete(id);
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, result, "Shipping rule deleted successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteShippingRule = deleteShippingRule;
/** Calculate shipping cost for a specific rule, area, and weight */
const calculateShippingCost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { areaName, weight } = req.body;
        if (!areaName) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponse(400, null, "Area name is required"));
        }
        if (weight === undefined || weight === null || weight < 0) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponse(400, null, "Valid weight is required"));
        }
        const cost = await shipping_rule_service_1.shippingRuleService.calculateShipping(id, areaName, weight);
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, { cost, areaName, weight }, "Shipping cost calculated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.calculateShippingCost = calculateShippingCost;
/** Toggle shipping rule active status */
const toggleShippingRuleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rule = await shipping_rule_service_1.shippingRuleService.getById(id);
        const updated = await shipping_rule_service_1.shippingRuleService.update(id, {
            active: !rule.active,
        });
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, updated, `Shipping rule ${updated.active ? "activated" : "deactivated"} successfully`));
    }
    catch (err) {
        next(err);
    }
};
exports.toggleShippingRuleStatus = toggleShippingRuleStatus;
/** Get all active shipping rules only */
const getActiveShippingRules = async (_req, res, next) => {
    try {
        const allRules = await shipping_rule_service_1.shippingRuleService.getAll();
        const activeRules = allRules.filter((rule) => rule.active);
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, activeRules, "Active shipping rules fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getActiveShippingRules = getActiveShippingRules;

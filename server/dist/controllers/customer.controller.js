"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersByPurchase = exports.getSearchSuggestions = exports.listGroups = exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.blockMany = exports.unblockCustomer = exports.blockCustomer = exports.listCustomers = exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.createCustomer = void 0;
const customer_service_1 = require("../services/customer.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
exports.createCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    const customer = await customer_service_1.customerService.createCustomer(req.body);
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, customer, "Customer created successfully"));
});
exports.getCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    const customer = await customer_service_1.customerService.getCustomerById(req.params.id);
    return res.json(new ApiResponse_1.ApiResponse(200, customer, "Customer fetched successfully"));
});
exports.updateCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    const customer = await customer_service_1.customerService.updateCustomer(req.params.id, req.body);
    return res.json(new ApiResponse_1.ApiResponse(200, customer, "Customer updated successfully"));
});
exports.deleteCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    await customer_service_1.customerService.deleteCustomer(req.params.id);
    return res.json(new ApiResponse_1.ApiResponse(200, {}, "Customer deleted successfully"));
});
exports.listCustomers = (0, asyncHandler_1.default)(async (_req, res) => {
    const customers = await customer_service_1.customerService.listCustomers();
    return res.json(new ApiResponse_1.ApiResponse(200, customers, "Customers listed successfully"));
});
exports.blockCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    const customer = await customer_service_1.customerService.blockCustomer(req.params.id, req.body.reason);
    return res.json(new ApiResponse_1.ApiResponse(200, customer, "Customer blocked successfully"));
});
exports.unblockCustomer = (0, asyncHandler_1.default)(async (req, res) => {
    const customer = await customer_service_1.customerService.unblockCustomer(req.params.id);
    return res.json(new ApiResponse_1.ApiResponse(200, customer, "Customer unblocked successfully"));
});
exports.blockMany = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    const customer = await customer_service_1.customerService.blockManyCustomer(ids);
    return res.json(new ApiResponse_1.ApiResponse(200, customer, "Customers blocked successfully"));
});
exports.createGroup = (0, asyncHandler_1.default)(async (req, res) => {
    const { groupName, customerIds } = req.body;
    const result = await customer_service_1.customerService.createGroup(groupName, customerIds);
    return res.json(new ApiResponse_1.ApiResponse(200, result, "Group created and customers assigned successfully"));
});
exports.updateGroup = (0, asyncHandler_1.default)(async (req, res) => {
    const { oldGroupName, newGroupName, customerIds } = req.body;
    const result = await customer_service_1.customerService.updateGroup(oldGroupName, newGroupName, customerIds);
    return res.json(new ApiResponse_1.ApiResponse(200, result, "Group updated and customers reassigned successfully"));
});
exports.deleteGroup = (0, asyncHandler_1.default)(async (req, res) => {
    const { groupName } = req.body;
    const result = await customer_service_1.customerService.deleteGroup(groupName);
    return res.json(new ApiResponse_1.ApiResponse(200, result, "Group deleted and customers unassigned successfully"));
});
exports.listGroups = (0, asyncHandler_1.default)(async (_req, res) => {
    const groups = await customer_service_1.customerService.listGroups();
    return res.json(new ApiResponse_1.ApiResponse(200, groups, "Groups listed successfully"));
});
exports.getSearchSuggestions = (0, asyncHandler_1.default)(async (req, res) => {
    const query = req.query.q;
    const type = req.query.type;
    const suggestions = await customer_service_1.customerService.getSearchSuggestions(query, type);
    return res.json(new ApiResponse_1.ApiResponse(200, suggestions));
});
exports.getCustomersByPurchase = (0, asyncHandler_1.default)(async (req, res) => {
    const type = req.query.type;
    const id = req.query.value;
    if (!type || !id) {
        return res.status(400).json(new ApiResponse_1.ApiResponse(400, null, "Type and value query parameters are required"));
    }
    const customers = await customer_service_1.customerService.getCustomersByPurchase(type, id);
    return res.json(new ApiResponse_1.ApiResponse(200, customers, "Customers filtered by purchase successfully"));
});

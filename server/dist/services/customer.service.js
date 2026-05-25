"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const mongoose_1 = require("mongoose");
const customer_model_1 = require("../models/customer.model");
const ApiError_1 = require("../utils/ApiError");
const product_model_1 = require("../models/product.model");
const category_model_1 = require("../models/category.model");
const order_model_1 = require("../models/order.model");
exports.customerService = {
    async createCustomer(payload) {
        if (!payload.full_name)
            throw new ApiError_1.ApiError(400, "Customer name is required");
        if (!payload.phone)
            throw new ApiError_1.ApiError(400, "Customer phone is required");
        const doc = await customer_model_1.Customer.create(payload);
        return doc;
    },
    async findOrCreateByPhone(payload) {
        if (!payload.phone)
            throw new ApiError_1.ApiError(400, "Phone number is required");
        let customer = await customer_model_1.Customer.findOne({ phone: payload.phone });
        if (customer) {
            // Update info if it's a guest or if we want to keep it fresh
            customer.full_name = payload.full_name || customer.full_name;
            customer.address = payload.address || customer.address;
            customer.city = payload.city || customer.city;
            await customer.save();
        }
        else {
            customer = await customer_model_1.Customer.create(payload);
        }
        return customer;
    },
    async listCustomers() {
        return customer_model_1.Customer.find().lean();
    },
    async getCustomerById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new ApiError_1.ApiError(400, "Invalid customer id");
        }
        const customer = await customer_model_1.Customer.aggregate([
            {
                $match: { _id: new mongoose_1.Types.ObjectId(id) },
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "orders",
                },
            },
            {
                $addFields: {
                    deliveredOrders: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                // Fix: Use $in and pass an array of acceptable statuses
                                cond: { $in: ["$$o.status", ["Delivered", "delivered"]] },
                            },
                        },
                    },
                    cancelledOrders: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                // Fix: Use $in
                                cond: { $in: ["$$o.status", ["Cancelled", "cancelled"]] },
                            },
                        },
                    },
                    flaggedOrders: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                // Fix: Use $in
                                cond: { $in: ["$$o.status", ["Flagged", "flagged"]] },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalOrders: {
                        $add: ["$deliveredOrders", "$cancelledOrders", "$flaggedOrders"],
                    },
                },
            },
            {
                $project: {
                    password: 0,
                },
            },
        ]);
        if (!customer.length) {
            throw new ApiError_1.ApiError(404, "Customer not found");
        }
        return customer[0];
    },
    async updateCustomer(id, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid customer id");
        const { newNote, ...otherUpdates } = payload;
        //Prepare the update object
        const updateQuery = { $set: otherUpdates };
        // If a new note is provided, push it to history AND update the summary field
        if (newNote && newNote.content.trim()) {
            updateQuery.$push = {
                noteHistory: {
                    author: newNote.author,
                    content: newNote.content,
                },
            };
            // Mirror the latest content to the top-level 'note' for the table view
            updateQuery.$set.note = newNote.content;
        }
        // Execute update
        const customer = await customer_model_1.Customer.findByIdAndUpdate(id, updateQuery, {
            new: true,
            runValidators: true,
        });
        if (!customer)
            throw new ApiError_1.ApiError(404, "Customer not found");
        return customer;
    },
    async deleteCustomer(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid customer id");
        const deleted = await customer_model_1.Customer.findByIdAndDelete(id);
        if (!deleted)
            throw new ApiError_1.ApiError(404, "Customer not found");
        return deleted;
    },
    async blockCustomer(id, reason) {
        console.log(id);
        return this.updateCustomer(id, { isBlocked: true, blocked_reason: reason });
    },
    async unblockCustomer(id) {
        return this.updateCustomer(id, { isBlocked: false, blocked_reason: "" });
    },
    async blockManyCustomer(ids) {
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
        const customers = await customer_model_1.Customer.find({ _id: { $in: ids } });
        if (!customers.length)
            throw new ApiError_1.ApiError(404, "No customers found for the given IDs");
        const customersIds = customers.map((o) => o._id);
        // Delete reviews
        const result = await customer_model_1.Customer.updateMany({
            _id: { $in: customersIds },
        }, { $set: { isBlocked: true } });
        return result;
    },
    async createGroup(groupName, customerIds) {
        const invalidIds = customerIds.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
        const customers = await customer_model_1.Customer.find({ _id: { $in: customerIds } });
        const updatedCustomers = await customer_model_1.Customer.updateMany({ _id: { $in: customerIds } }, 
        //groupNames is an array, so we use $push to add the groupName to the array
        //if groupName already exists in the array, it will not be added again
        { $addToSet: { groupNames: groupName } });
        return updatedCustomers;
    },
    async updateGroup(oldGroupName, newGroupName, customerIds) {
        const invalidIds = customerIds.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length) {
            throw new ApiError_1.ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
        }
        // changing the group name for all customers who have the old group name, we use $set to update the group name in the array
        await customer_model_1.Customer.updateMany({ groupNames: oldGroupName }, { $set: { "groupNames.$": newGroupName } });
        const updatedCustomers = await customer_model_1.Customer.updateMany({ _id: { $in: customerIds } }, { $addToSet: { groupNames: newGroupName } });
        return updatedCustomers;
    },
    async deleteGroup(groupName) {
        const updatedCustomers = await customer_model_1.Customer.updateMany({ groupNames: groupName }, { $pull: { groupNames: groupName } });
        return updatedCustomers;
    },
    async listGroups() {
        const groups = await customer_model_1.Customer.aggregate([
            { $unwind: "$groupNames" },
            { $group: { _id: "$groupNames", count: { $sum: 1 } } },
            { $project: { groupName: "$_id", count: 1, _id: 0 } },
        ]);
        return groups;
    },
    async getCustomersByPurchase(type, id) {
        if (type === "product") {
            const customerbyOrder = await order_model_1.Order.find({ "items.productId": id }, { customerId: 1 }).lean();
            const customerIds = customerbyOrder.map((order) => order.customerId);
            const customers = await customer_model_1.Customer.find({
                _id: { $in: customerIds },
            }).lean();
            return customers;
        }
        if (type === "category") {
            //frist find all the products related to that category from products collection from categories aarray
            //then find all orders with those products
            const products = await product_model_1.Product.find({ categories: id }, { _id: 1 }).lean();
            const productIds = products.map((p) => p._id);
            const customerbyOrder = await order_model_1.Order.find({ "items.productId": { $in: productIds } }, { customerId: 1 }).lean();
            const customerIds = [
                ...new Set(customerbyOrder.map((order) => order.customerId.toString())),
            ];
            const customers = await customer_model_1.Customer.find({
                _id: { $in: customerIds },
            }).lean();
            return customers;
        }
        return [];
    },
    async getSearchSuggestions(query, type) {
        const regex = new RegExp(query, "i");
        if (type === "product") {
            const products = await product_model_1.Product.find({ name: regex }, { name: 1 })
                .limit(5)
                .lean();
            return products.map((p) => ({ productId: p._id, name: p.name }));
        }
        if (type === "category") {
            const categories = await category_model_1.Category.find({ name: regex }, { name: 1 })
                .limit(5)
                .lean();
            return categories.map((c) => ({ categoryId: c._id, name: c.name }));
        }
        return [];
    },
};

import { Types } from "mongoose";
import { Customer } from "../models/customer.model";
import { ApiError } from "../utils/ApiError";
import { Product } from "../models/product.model";
import { Category } from "../models/category.model";
import { Order } from "../models/order.model";
import { update } from "lodash";

export interface CreateCustomerPayload {
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export const customerService = {
  async createCustomer(payload: CreateCustomerPayload) {
    if (!payload.full_name)
      throw new ApiError(400, "Customer name is required");
    if (!payload.phone) throw new ApiError(400, "Customer phone is required");

    const doc = await Customer.create(payload);
    return doc;
  },

  async findOrCreateByPhone(payload: CreateCustomerPayload) {
    if (!payload.phone) throw new ApiError(400, "Phone number is required");

    let customer = await Customer.findOne({ phone: payload.phone });

    if (customer) {
      // Update info if it's a guest or if we want to keep it fresh
      customer.full_name = payload.full_name || customer.full_name;
      customer.address = payload.address || customer.address;
      customer.city = payload.city || customer.city;
      await customer.save();
    } else {
      customer = await Customer.create(payload);
    }

    return customer;
  },

  async listCustomers() {
    return Customer.find().lean();
  },

  async getCustomerById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid customer id");
    }

    const customer = await Customer.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
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
      throw new ApiError(404, "Customer not found");
    }

    return customer[0];
  },

  async updateCustomer(
    id: string,
    payload: Partial<
      CreateCustomerPayload & {
        isBlocked?: boolean;
        blocked_reason?: string;
        newNote?: { author: string; content: string };
      }
    >,
  ) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid customer id");
    const { newNote, ...otherUpdates } = payload;

    //Prepare the update object
    const updateQuery: any = { $set: otherUpdates };

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
    const customer = await Customer.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!customer) throw new ApiError(404, "Customer not found");

    return customer;
  },

  async deleteCustomer(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid customer id");
    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Customer not found");
    return deleted;
  },

  async blockCustomer(id: string, reason: string) {
    console.log(id);
    return this.updateCustomer(id, { isBlocked: true, blocked_reason: reason });
  },

  async unblockCustomer(id: string) {
    return this.updateCustomer(id, { isBlocked: false, blocked_reason: "" });
  },
  async blockManyCustomer(ids: string[]) {
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
    const customers = await Customer.find({ _id: { $in: ids } });
    if (!customers.length)
      throw new ApiError(404, "No customers found for the given IDs");
    const customersIds = customers.map((o) => o._id);
    // Delete reviews
    const result = await Customer.updateMany(
      {
        _id: { $in: customersIds },
      },
      { $set: { isBlocked: true } },
    );
    return result;
  },
  async createGroup(groupName: string, customerIds: string[]) {
    const invalidIds = customerIds.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const updatedCustomers = await Customer.updateMany(
      { _id: { $in: customerIds } },
      //groupNames is an array, so we use $push to add the groupName to the array
      //if groupName already exists in the array, it will not be added again
      { $addToSet: { groupNames: groupName } },
    );
    return updatedCustomers;
  },
  async updateGroup(
    oldGroupName: string,
    newGroupName: string,
    customerIds: string[],
  ) {
    const invalidIds = customerIds.filter((id) => !Types.ObjectId.isValid(id));

    if (invalidIds.length) {
      throw new ApiError(400, `Invalid customer ids: ${invalidIds.join(", ")}`);
    }
    // changing the group name for all customers who have the old group name, we use $set to update the group name in the array
    await Customer.updateMany(
      { groupNames: oldGroupName },
      { $set: { "groupNames.$": newGroupName } },
    );

    const updatedCustomers = await Customer.updateMany(
      { _id: { $in: customerIds } },
      { $addToSet: { groupNames: newGroupName } },
    );

    return updatedCustomers;
  },
  async deleteGroup(groupName: string) {
    const updatedCustomers = await Customer.updateMany(
      { groupNames: groupName },
      { $pull: { groupNames: groupName } },
    );
    return updatedCustomers;
  },
  async listGroups() {
    const groups = await Customer.aggregate([
      { $unwind: "$groupNames" },
      { $group: { _id: "$groupNames", count: { $sum: 1 } } },
      { $project: { groupName: "$_id", count: 1, _id: 0 } },
    ]);
    return groups;
  },
  async getCustomersByPurchase(type: "product" | "category", id: string) {
    if (type === "product") {
      const customerbyOrder = await Order.find(
        { "items.productId": id },
        { customerId: 1 },
      ).lean();
      const customerIds = customerbyOrder.map((order) => order.customerId);
      const customers = await Customer.find({
        _id: { $in: customerIds },
      }).lean();
      return customers;
    }
    if (type === "category") {
      //frist find all the products related to that category from products collection from categories aarray
      //then find all orders with those products
      const products = await Product.find(
        { categories: id },
        { _id: 1 },
      ).lean();
      const productIds = products.map((p) => p._id);
      const customerbyOrder = await Order.find(
        { "items.productId": { $in: productIds } },
        { customerId: 1 },
      ).lean();
      const customerIds = [
        ...new Set(customerbyOrder.map((order) => order.customerId.toString())),
      ];
      const customers = await Customer.find({
        _id: { $in: customerIds },
      }).lean();
      return customers;
    }
    return [];
  },
  async getSearchSuggestions(query: string, type: "product" | "category") {
    const regex = new RegExp(query, "i");

    if (type === "product") {
      const products = await Product.find({ name: regex }, { name: 1 })
        .limit(5)
        .lean();

      return products.map((p) => ({ productId: p._id, name: p.name }));
    }

    if (type === "category") {
      const categories = await Category.find({ name: regex }, { name: 1 })
        .limit(5)
        .lean();

      return categories.map((c) => ({ categoryId: c._id, name: c.name }));
    }
    return [];
  },
};

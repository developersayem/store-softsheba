import { Supplier } from "../models/supplier.model";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";

export const supplierService = {
  async create(payload: any) {
    const existing = await Supplier.findOne({ name: payload.name });
    if (existing) throw new ApiError(400, "Supplier already exists");
    const supplier = await Supplier.create(payload);
    return supplier;
  },

  async update(id: string, payload: any) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid supplier ID");

    const supplier = await Supplier.findById(id);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    Object.assign(supplier, payload);
    await supplier.save();
    return supplier;
  },

  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid supplier ID");

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    return { message: "Supplier deleted" };
  },

  async getAll() {
    return Supplier.find().sort({ createdAt: -1 });
  },

  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid supplier ID");

    const supplier = await Supplier.findById(id);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    return supplier;
  },
};

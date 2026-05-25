import { support } from "../models/support.model";

export const supportService = {
  async getAll() {
    return support.find().sort({ createdAt: -1 });
  },
  async getById(id: string) {
    return support.findById(id);
  },
  async create(payload: any) {
    const supplier = await support.create(payload);
    return supplier;
  },
};

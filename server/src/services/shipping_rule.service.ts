import { ShippingRule, IShippingRule } from "../models/shipping_rule.model";
import { ApiError } from "../utils/ApiError";

export const shippingRuleService = {
  async getAll(): Promise<IShippingRule[]> {
    const rules = await ShippingRule.find();
    if (!rules.length) throw new ApiError(404, "No shipping rules found");
    return rules.map((rule) => rule.toObject());
  },

  async getById(id: string): Promise<IShippingRule> {
    const rule = await ShippingRule.findById(id);
    if (!rule) throw new ApiError(404, "Shipping rule not found");
    return rule.toObject();
  },

  async create(payload: Partial<IShippingRule>): Promise<IShippingRule> {
    // Validate required fields
    if (!payload.name) {
      throw new ApiError(400, "Rule name is required");
    }

    if (!payload.areas || payload.areas.length === 0) {
      throw new ApiError(400, "At least one shipping area is required");
    }

    // Validate each area based on its type
    for (const area of payload.areas) {
      if (!area.name) {
        throw new ApiError(400, "Area name is required");
      }

      if (!area.type) {
        throw new ApiError(400, `Type is required for area: ${area.name}`);
      }

      // Validate flat_rate areas have amount
      if (
        area.type === "flat_rate" &&
        (area.amount === undefined || area.amount === null)
      ) {
        throw new ApiError(
          400,
          `Amount is required for flat_rate area: ${area.name}`
        );
      }

      // Validate rate_by_weight areas have weight_ranges
      if (area.type === "rate_by_weight") {
        if (!area.weight_ranges || area.weight_ranges.length === 0) {
          throw new ApiError(
            400,
            `Weight ranges are required for rate_by_weight area: ${area.name}`
          );
        }

        // Validate weight ranges
        for (const range of area.weight_ranges) {
          if (range.min < 0 || range.max < 0) {
            throw new ApiError(
              400,
              `Weight values cannot be negative in area: ${area.name}`
            );
          }
          if (range.min >= range.max) {
            throw new ApiError(
              400,
              `Min weight must be less than max weight in area: ${area.name}`
            );
          }
          if (range.charge < 0) {
            throw new ApiError(
              400,
              `Charge cannot be negative in area: ${area.name}`
            );
          }
        }
      }
    }

    const created = await ShippingRule.create(payload);
    return created.toObject();
  },

  async update(
    id: string,
    payload: Partial<IShippingRule>
  ): Promise<IShippingRule> {
    const rule = await ShippingRule.findById(id);
    if (!rule) throw new ApiError(404, "Shipping rule not found");

    // If updating areas, validate them
    if (payload.areas) {
      if (payload.areas.length === 0) {
        throw new ApiError(400, "At least one shipping area is required");
      }

      // Validate each area
      for (const area of payload.areas) {
        if (!area.name) {
          throw new ApiError(400, "Area name is required");
        }

        if (!area.type) {
          throw new ApiError(400, `Type is required for area: ${area.name}`);
        }

        if (
          area.type === "flat_rate" &&
          (area.amount === undefined || area.amount === null)
        ) {
          throw new ApiError(
            400,
            `Amount is required for flat_rate area: ${area.name}`
          );
        }

        if (area.type === "rate_by_weight") {
          if (!area.weight_ranges || area.weight_ranges.length === 0) {
            throw new ApiError(
              400,
              `Weight ranges are required for rate_by_weight area: ${area.name}`
            );
          }

          for (const range of area.weight_ranges) {
            if (range.min < 0 || range.max < 0) {
              throw new ApiError(
                400,
                `Weight values cannot be negative in area: ${area.name}`
              );
            }
            if (range.min >= range.max) {
              throw new ApiError(
                400,
                `Min weight must be less than max weight in area: ${area.name}`
              );
            }
            if (range.charge < 0) {
              throw new ApiError(
                400,
                `Charge cannot be negative in area: ${area.name}`
              );
            }
          }
        }
      }
    }

    Object.assign(rule, payload);
    await rule.save();

    return rule.toObject();
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const deleted = await ShippingRule.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Shipping rule not found");
    return { success: true };
  },

  // Helper method to calculate shipping cost
  async calculateShipping(
    ruleId: string,
    areaName: string,
    weightInKg: number
  ): Promise<number> {
    const rule = await ShippingRule.findById(ruleId);
    if (!rule) throw new ApiError(404, "Shipping rule not found");
    if (!rule.active) throw new ApiError(400, "Shipping rule is not active");

    const area = rule.areas.find((a) => a.name === areaName);
    if (!area)
      throw new ApiError(404, `Area '${areaName}' not found in this rule`);

    // Free shipping
    if (area.type === "free_shipping") {
      return 0;
    }

    // Flat rate
    if (area.type === "flat_rate") {
      return area.amount || 0;
    }

    // Rate by weight
    if (area.type === "rate_by_weight") {
      if (!area.weight_ranges || area.weight_ranges.length === 0) {
        throw new ApiError(400, "No weight ranges configured for this area");
      }

      // Find the matching weight range
      const matchingRange = area.weight_ranges.find(
        (range) => weightInKg >= range.min && weightInKg <= range.max
      );

      if (matchingRange) {
        return matchingRange.charge;
      }

      // Weight exceeds all ranges, calculate extra charge
      const maxRange = area.weight_ranges.reduce((max, range) =>
        range.max > max.max ? range : max
      );

      if (weightInKg > maxRange.max) {
        const extraWeight = weightInKg - maxRange.max;
        const extraCharge = extraWeight * (area.extra_per_kg || 0);
        return maxRange.charge + extraCharge;
      }

      throw new ApiError(400, "Weight does not match any range");
    }

    throw new ApiError(400, "Invalid area type");
  },
};

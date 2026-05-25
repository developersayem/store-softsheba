import { Request, Response, NextFunction } from "express";
import { shippingRuleService } from "../services/shipping_rule.service";
import { ApiResponse } from "../utils/ApiResponse";

/** Get all shipping rules */
export const getAllShippingRules = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rules = await shippingRuleService.getAll();
    res
      .status(200)
      .json(new ApiResponse(200, rules, "Shipping rules fetched successfully"));
  } catch (err) {
    next(err);
  }
};

/** Get a single shipping rule by ID */
export const getShippingRuleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const rule = await shippingRuleService.getById(id as string);
    res
      .status(200)
      .json(new ApiResponse(200, rule, "Shipping rule fetched successfully"));
  } catch (err) {
    next(err);
  }
};

/** Create a new shipping rule */
export const createShippingRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const rule = await shippingRuleService.create(payload);
    res
      .status(201)
      .json(new ApiResponse(201, rule, "Shipping rule created successfully"));
  } catch (err) {
    next(err);
  }
};

/** Update a shipping rule by ID */
export const updateShippingRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await shippingRuleService.update(id as string, payload);
    res
      .status(200)
      .json(
        new ApiResponse(200, updated, "Shipping rule updated successfully")
      );
  } catch (err) {
    next(err);
  }
};

/** Delete a shipping rule by ID */
export const deleteShippingRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await shippingRuleService.delete(id as string);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Shipping rule deleted successfully"));
  } catch (err) {
    next(err);
  }
};

/** Calculate shipping cost for a specific rule, area, and weight */
export const calculateShippingCost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { areaName, weight } = req.body;

    if (!areaName) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Area name is required"));
    }

    if (weight === undefined || weight === null || weight < 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Valid weight is required"));
    }

    const cost = await shippingRuleService.calculateShipping(
      id as string,
      areaName,
      weight
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { cost, areaName, weight },
          "Shipping cost calculated successfully"
        )
      );
  } catch (err) {
    next(err);
  }
};

/** Toggle shipping rule active status */
export const toggleShippingRuleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const rule = await shippingRuleService.getById(id as string);

    const updated = await shippingRuleService.update(id as string, {
      active: !rule.active,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updated,
          `Shipping rule ${
            updated.active ? "activated" : "deactivated"
          } successfully`
        )
      );
  } catch (err) {
    next(err);
  }
};

/** Get all active shipping rules only */
export const getActiveShippingRules = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allRules = await shippingRuleService.getAll();
    const activeRules = allRules.filter((rule) => rule.active);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activeRules,
          "Active shipping rules fetched successfully"
        )
      );
  } catch (err) {
    next(err);
  }
};

import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const createCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, customer, "Customer created successfully"));
  },
);

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(
    req.params.id as string,
  );
  return res.json(
    new ApiResponse(200, customer, "Customer fetched successfully"),
  );
});

export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await customerService.updateCustomer(
      req.params.id as string,
      req.body,
    );
    return res.json(
      new ApiResponse(200, customer, "Customer updated successfully"),
    );
  },
);

export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    await customerService.deleteCustomer(req.params.id as string);
    return res.json(new ApiResponse(200, {}, "Customer deleted successfully"));
  },
);

export const listCustomers = asyncHandler(
  async (_req: Request, res: Response) => {
    const customers = await customerService.listCustomers();
    return res.json(
      new ApiResponse(200, customers, "Customers listed successfully"),
    );
  },
);

export const blockCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await customerService.blockCustomer(
      req.params.id as string,
      req.body.reason,
    );
    return res.json(
      new ApiResponse(200, customer, "Customer blocked successfully"),
    );
  },
);

export const unblockCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await customerService.unblockCustomer(
      req.params.id as string,
    );
    return res.json(
      new ApiResponse(200, customer, "Customer unblocked successfully"),
    );
  },
);

export const blockMany = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  const customer = await customerService.blockManyCustomer(ids);
  return res.json(
    new ApiResponse(200, customer, "Customers blocked successfully"),
  );
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { groupName, customerIds } = req.body;
  const result = await customerService.createGroup(groupName, customerIds);
  return res.json(
    new ApiResponse(
      200,
      result,
      "Group created and customers assigned successfully",
    ),
  );
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const { oldGroupName, newGroupName, customerIds } = req.body;
  const result = await customerService.updateGroup(oldGroupName, newGroupName, customerIds);
  return res.json(
    new ApiResponse(
      200,
      result,
      "Group updated and customers reassigned successfully",
    ),
  );
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  const { groupName } = req.body;
  const result = await customerService.deleteGroup(groupName);
  return res.json(
    new ApiResponse(
      200,
      result,
      "Group deleted and customers unassigned successfully",
    ),
  );
});

export const listGroups = asyncHandler(async (_req: Request, res: Response) => {
  const groups = await customerService.listGroups();
  return res.json(new ApiResponse(200, groups, "Groups listed successfully"));
});

export const getSearchSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const type = req.query.type as "product" | "category";

    const suggestions = await customerService.getSearchSuggestions(query, type);

    return res.json(new ApiResponse(200, suggestions));
  },
);

export const getCustomersByPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.query.type as "product" | "category";
    const id = req.query.value as string;
    if(!type || !id) {
      return res.status(400).json(new ApiResponse(400, null, "Type and value query parameters are required"));
    }
    const customers = await customerService.getCustomersByPurchase(type,id);
    return res.json(
      new ApiResponse(
        200,
        customers,
        "Customers filtered by purchase successfully",
      ),
    );
  },
);

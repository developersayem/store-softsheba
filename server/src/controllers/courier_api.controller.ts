import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { courierService } from "../services/courier_api.service";
import { carrybeeCourier } from "../services/carrybee.courier.service";

export const getCouirerApi = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await courierService.getCouirerApi();
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Courier details fetched"));
  }
);

export const updateCourierApi = asyncHandler(
  async (req: Request, res: Response) => {
    const courierApi = await courierService.updateCourierApi(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, courierApi, "Courier details updated"));
  }
);

export const getCarrybeeCities = asyncHandler(
  async (req: Request, res: Response) => {
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const cities = await carrybeeCourier.getCities(carrybee);
    return res.status(200).json(new ApiResponse(200, cities, "Carrybee cities fetched"));
  }
);

export const getCarrybeeZones = asyncHandler(
  async (req: Request, res: Response) => {
    const cityId = req.params.cityId as string;
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const zones = await carrybeeCourier.getZones(cityId, carrybee);
    return res.status(200).json(new ApiResponse(200, zones, "Carrybee zones fetched"));
  }
);

export const getCarrybeeAreas = asyncHandler(
  async (req: Request, res: Response) => {
    const cityId = req.params.cityId as string;
    const zoneId = req.params.zoneId as string;
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const areas = await carrybeeCourier.getAreas(cityId, zoneId, carrybee);
    return res.status(200).json(new ApiResponse(200, areas, "Carrybee areas fetched"));
  }
);

export const getCarrybeeStores = asyncHandler(
  async (req: Request, res: Response) => {
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const stores = await carrybeeCourier.getStores(carrybee);
    return res.status(200).json(new ApiResponse(200, stores, "Carrybee stores fetched"));
  }
);

export const getCarrybeeAreaSuggestion = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const suggestions = await carrybeeCourier.getAreaSuggestion(search as string, carrybee);
    return res.status(200).json(new ApiResponse(200, suggestions, "Carrybee suggestions fetched"));
  }
);

export const getCarrybeeAddressDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { query } = req.body;
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const details = await carrybeeCourier.getAddressDetails(query, carrybee);
    return res.status(200).json(new ApiResponse(200, details, "Carrybee address details fetched"));
  }
);

export const createCarrybeeStore = asyncHandler(
  async (req: Request, res: Response) => {
    const courierData = await courierService.getCouirerApi();
    const carrybee = (courierData[0] as any)?.carrybee;
    if (!carrybee?.enabled) throw new ApiError(400, "Carrybee is not enabled");
    const result = await carrybeeCourier.createStore(req.body, carrybee);
    return res.status(201).json(new ApiResponse(201, result, "Carrybee store created"));
  }
);

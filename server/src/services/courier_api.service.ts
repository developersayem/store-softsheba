import { CourierApiIntegration } from "../models/courier_api.model";
import { ApiError } from "../utils/ApiError";
import { pathaoCourier } from "./pathao.courier.service";
import { steadfastCourier } from "./steadfast.courier.service";
import { carrybeeCourier } from "./carrybee.courier.service";

export const courierService = {
  async getCouirerApi() {
    const result = await CourierApiIntegration.find();
    if (!result) {
      throw new Error("Courier details not Found!");
    }
    return result;
  },
  async updateCourierApi(payload: Partial<any>) {
    //console.log(payload);
    const result = await CourierApiIntegration.findOneAndUpdate(
      {},
      { $set: payload },
      {
        new: true, // return updated document
        upsert: true, // create if not exists
        runValidators: true,
      },
    );

    return result;
  },
  async sendOrder(order: any, courier: string, courierDetails?: any) {
    const courierData = await CourierApiIntegration.findOne({});
    if (!courierData) {
      throw new ApiError(400, "Invalid Courier data");
    }
    const steadfast: any = (courierData as any)?.steadfast;
    const credentials = {
      apiKey: steadfast.apiKey,
      secretKey: steadfast.secretKey,
    };
    //console.log(credentials)
    const pathao: any = (courierData as any)?.pathao;

    //console.log(credentials)
    switch (courier) {
      case "steadfast":
        return steadfastCourier.send(order, credentials);

      case "pathao":
        return pathaoCourier.send(order,pathao);

      case "carrybee":
        return carrybeeCourier.send(order, (courierData as any).carrybee, courierDetails);

      default:
        throw new Error("Unsupported courier service");
    }
  },
  async sendOrderMany(orders: any[], courier: string) {
    const courierData = await CourierApiIntegration.findOne({});
    if (!courierData) {
      throw new ApiError(400, "Invalid Courier data");
    }
    const steadfast: any = (courierData as any)?.steadfast;
    const credentials = {
      apiKey: steadfast.apiKey,
      secretKey: steadfast.secretKey,
    };
    const pathao: any = (courierData as any)?.pathao;
    switch (courier) {
      case "steadfast":
        return steadfastCourier.sendMany(orders, credentials);

      case "pathao":
        return pathaoCourier.sendMany(orders,pathao);

      case "carrybee":
        return carrybeeCourier.sendMany(orders, (courierData as any).carrybee);

      default:
        throw new Error("Unsupported courier");
    }
  },
  async getCourierStatus(trackingCode: string, courier: string) {
        const courierData = await CourierApiIntegration.findOne({});
    if (!courierData) {
      throw new ApiError(400, "Invalid Courier data");
    }
    const steadfast: any = (courierData as any)?.steadfast;
    const credentials = {
      apiKey: steadfast.apiKey,
      secretKey: steadfast.secretKey,
    };
    const pathao: any = (courierData as any)?.pathao;
    switch (courier) {
      case "steadfast":
        return steadfastCourier.getStatus(trackingCode, credentials);

      case "pathao":
        return pathaoCourier.getStatus(trackingCode, pathao);

      case "carrybee":
        return carrybeeCourier.getStatus(trackingCode, (courierData as any).carrybee);

      default:
        throw new Error("Unsupported courier");
    }
  }
};

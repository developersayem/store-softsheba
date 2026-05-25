"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courierService = void 0;
const courier_api_model_1 = require("../models/courier_api.model");
const ApiError_1 = require("../utils/ApiError");
const pathao_courier_service_1 = require("./pathao.courier.service");
const steadfast_courier_service_1 = require("./steadfast.courier.service");
const carrybee_courier_service_1 = require("./carrybee.courier.service");
exports.courierService = {
    async getCouirerApi() {
        const result = await courier_api_model_1.CourierApiIntegration.find();
        if (!result) {
            throw new Error("Courier details not Found!");
        }
        return result;
    },
    async updateCourierApi(payload) {
        //console.log(payload);
        const result = await courier_api_model_1.CourierApiIntegration.findOneAndUpdate({}, { $set: payload }, {
            new: true, // return updated document
            upsert: true, // create if not exists
            runValidators: true,
        });
        return result;
    },
    async sendOrder(order, courier) {
        const courierData = await courier_api_model_1.CourierApiIntegration.findOne({});
        if (!courierData) {
            throw new ApiError_1.ApiError(400, "Invalid Courier data");
        }
        const steadfast = courierData?.steadfast;
        const credentials = {
            apiKey: steadfast.apiKey,
            secretKey: steadfast.secretKey,
        };
        //console.log(credentials)
        const pathao = courierData?.pathao;
        //console.log(credentials)
        switch (courier) {
            case "steadfast":
                return steadfast_courier_service_1.steadfastCourier.send(order, credentials);
            case "pathao":
                return pathao_courier_service_1.pathaoCourier.send(order, pathao);
            case "carrybee":
                return carrybee_courier_service_1.carrybeeCourier.send(order, courierData.carrybee);
            default:
                throw new Error("Unsupported courier service");
        }
    },
    async sendOrderMany(orders, courier) {
        const courierData = await courier_api_model_1.CourierApiIntegration.findOne({});
        if (!courierData) {
            throw new ApiError_1.ApiError(400, "Invalid Courier data");
        }
        const steadfast = courierData?.steadfast;
        const credentials = {
            apiKey: steadfast.apiKey,
            secretKey: steadfast.secretKey,
        };
        const pathao = courierData?.pathao;
        switch (courier) {
            case "steadfast":
                return steadfast_courier_service_1.steadfastCourier.sendMany(orders, credentials);
            case "pathao":
                return pathao_courier_service_1.pathaoCourier.sendMany(orders, pathao);
            case "carrybee":
                return carrybee_courier_service_1.carrybeeCourier.sendMany(orders, courierData.carrybee);
            default:
                throw new Error("Unsupported courier");
        }
    },
    async getCourierStatus(trackingCode, courier) {
        const courierData = await courier_api_model_1.CourierApiIntegration.findOne({});
        if (!courierData) {
            throw new ApiError_1.ApiError(400, "Invalid Courier data");
        }
        const steadfast = courierData?.steadfast;
        const credentials = {
            apiKey: steadfast.apiKey,
            secretKey: steadfast.secretKey,
        };
        const pathao = courierData?.pathao;
        switch (courier) {
            case "steadfast":
                return steadfast_courier_service_1.steadfastCourier.getStatus(trackingCode, credentials);
            case "pathao":
                return pathao_courier_service_1.pathaoCourier.getStatus(trackingCode, pathao);
            case "carrybee":
                return carrybee_courier_service_1.carrybeeCourier.getStatus(trackingCode, courierData.carrybee);
            default:
                throw new Error("Unsupported courier");
        }
    }
};

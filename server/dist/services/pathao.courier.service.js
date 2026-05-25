"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathaoCourier = void 0;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../utils/ApiError");
const BASE_URL = "https://api-hermes.pathao.com";
/**
 * Internal helper: Issue Access Token
 */
async function issueAccessToken(credentials) {
    try {
        const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/issue-token`, {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            grant_type: "password",
            username: credentials.clientEmail,
            password: credentials.clientPassword,
        }, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data.access_token;
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, error?.response?.data?.message || "Pathao token generation failed");
    }
}
/**
 * Order payload mapper (your order → Pathao order)
 */
function mapToPathaoOrder(order, storeId) {
    const amountToCollect = Math.ceil(order.total ?? 0);
    return {
        store_id: storeId,
        merchant_order_id: order.order_number,
        recipient_name: order.shipping_address.full_name,
        recipient_phone: order.shipping_address.phone,
        recipient_address: order.shipping_address.address,
        delivery_type: 48,
        item_type: 2,
        item_quantity: order.items.length ?? 1,
        item_weight: order.weight ?? 0.5,
        item_description: order.items.map((i) => `${i.name} x${i.quantity}`).join(", ") ??
            "N/A",
        amount_to_collect: amountToCollect,
        special_instruction: order.note ?? "",
    };
}
exports.pathaoCourier = {
    /**
     * SINGLE ORDER CREATE
     */
    async send(order, credentials) {
        //console.log(credentials);
        const accessToken = await issueAccessToken(credentials);
        try {
            const payload = mapToPathaoOrder(order, Number(credentials.storeId));
            //console.log("first:", payload);
            const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/orders`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            // console.log("second:", response.data.data);
            return {
                courier: "pathao",
                consignmentId: response.data?.data?.consignment_id,
                status: response.data?.data?.order_status,
                deliveryFee: response.data?.data?.delivery_fee,
                merchent_order_id: response.data?.data?.merchant_order_id,
            };
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, error?.response?.data?.message || "Pathao order creation failed");
        }
    },
    /**
     * BULK ORDER CREATE
     */
    async sendMany(orders, credentials) {
        const accessToken = await issueAccessToken(credentials);
        try {
            const payload = {
                orders: orders.map((order) => mapToPathaoOrder(order, Number(credentials.storeId))),
            };
            // console.log("payload:",payload)
            const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/orders/bulk`, payload, {
                headers: {
                    "Content-Type": "application/json;",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            //console.log("response:",response.data)
            return {
                courier: "pathao",
                accepted: true,
                message: response.data?.message,
                type: response.data?.type,
                data: response.data?.data,
            };
        }
        catch (error) {
            //console.log(error)
            throw new ApiError_1.ApiError(400, error?.response?.data?.message || "Pathao bulk order failed");
        }
    },
    async getStatus(trackingCode, credentials) {
        const accessToken = await issueAccessToken(credentials);
        try {
            const response = await axios_1.default.get(`${BASE_URL}/aladdin/api/v1/orders/${trackingCode}/info`, {
                headers: {
                    "Content-Type": "application/json;",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, error?.response?.data?.message || "Pathao get status failed");
        }
    },
};

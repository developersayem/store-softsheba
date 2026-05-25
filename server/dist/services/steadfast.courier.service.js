"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.steadfastCourier = void 0;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../utils/ApiError");
const BASE_URL = "https://portal.packzy.com/api/v1";
exports.steadfastCourier = {
    async send(order, credentials) {
        if (!credentials?.apiKey || !credentials?.secretKey) {
            throw new ApiError_1.ApiError(400, "Steadfast credentials missing");
        }
        const client = axios_1.default.create({
            baseURL: BASE_URL,
            headers: {
                "Api-Key": credentials.apiKey,
                "Secret-Key": credentials.secretKey,
                "Content-Type": "application/json",
            },
            timeout: 15000,
        });
        const payload = {
            invoice: order.order_number,
            recipient_name: order.shipping_address.full_name,
            recipient_phone: order.shipping_address.phone,
            recipient_address: order.shipping_address.full_address,
            cod_amount: order.payment_method === "cod" ? order.total : 0,
            note: order.note || "",
            item_description: order.items
                .map((i) => `${i.name} x${i.quantity}`)
                .join(", "),
            total_lot: order.items.length,
            delivery_type: 0,
        };
        const { data } = await client.post("/create_order", payload);
        //console.log(data)
        if (data?.status !== 200) {
            //console.log(data)
            throw new Error(data?.message || "Steadfast order failed");
        }
        return {
            courier: "steadfast",
            consignmentId: data.consignment.consignment_id,
            invoiceId: data.consignment.invoice,
            trackingCode: data.consignment.tracking_code,
            status: data.consignment.status,
        };
    },
    /**
     * ✅ BULK SEND (sendMany)
     */
    async sendMany(orders, credentials) {
        if (!credentials?.apiKey || !credentials?.secretKey) {
            throw new ApiError_1.ApiError(400, "Steadfast credentials missing");
        }
        if (!Array.isArray(orders) || orders.length === 0) {
            throw new ApiError_1.ApiError(400, "Orders array is required");
        }
        if (orders.length > 500) {
            throw new ApiError_1.ApiError(400, "Maximum 500 orders allowed per request");
        }
        const payload = orders.map((order) => ({
            invoice: order.order_number,
            recipient_name: order.shipping_address?.full_name || "N/A",
            recipient_phone: order.shipping_address?.phone || "",
            recipient_address: order.shipping_address?.address || "N/A",
            cod_amount: order.payment_method === "cod" ? order.total : 0,
            note: order.note || "",
            item_description: order.items
                .map((i) => `${i.name} x${i.quantity}`)
                .join(", "),
        }));
        console.log(payload);
        const client = axios_1.default.create({
            baseURL: BASE_URL,
            headers: {
                "Api-Key": credentials.apiKey,
                "Secret-Key": credentials.secretKey,
                "Content-Type": "application/json",
            },
            timeout: 20000,
        });
        const data = await client.post("/create_order/bulk-order", payload);
        console.log("second");
        console.log(data.data);
        return data.data;
    },
    async getStatus(trackingCode, credentials) {
        if (!credentials?.apiKey || !credentials?.secretKey) {
            throw new ApiError_1.ApiError(400, "Steadfast credentials missing");
        }
        const client = axios_1.default.create({
            baseURL: BASE_URL,
            headers: {
                "Api-Key": credentials.apiKey,
                "Secret-Key": credentials.secretKey,
                "Content-Type": "application/json",
            },
            timeout: 15000,
        });
        const res = await client.get(`/status_by_trackingcode/${trackingCode}`);
        return res.data;
    }
};

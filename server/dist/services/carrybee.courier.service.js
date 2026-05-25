"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carrybeeCourier = void 0;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../utils/ApiError");
const getBaseUrl = (isSandbox) => isSandbox ? "https://sandbox.carrybee.com" : "https://developers.carrybee.com";
const getHeaders = (credentials) => ({
    "Client-ID": credentials.clientId,
    "Client-Secret": credentials.clientSecret,
    "Client-Context": credentials.clientContext,
    "Content-Type": "application/json",
});
exports.carrybeeCourier = {
    async send(order, credentials) {
        const { clientId, clientSecret, clientContext, storeId, isSandbox } = credentials;
        if (!clientId || !clientSecret || !clientContext) {
            throw new ApiError_1.ApiError(400, "Carrybee credentials missing");
        }
        const client = axios_1.default.create({
            baseURL: getBaseUrl(isSandbox),
            headers: getHeaders(credentials),
            timeout: 15000,
        });
        const payload = {
            store_id: storeId || order.courier?.store_id,
            merchant_order_id: order.order_number,
            delivery_type: order.courier?.delivery_type || 1, // Default Normal
            product_type: order.courier?.product_type || 1, // Default Parcel
            recipient_phone: order.shipping_address.phone,
            recipient_name: order.shipping_address.full_name,
            recipient_address: order.shipping_address.address,
            city_id: parseInt(order.courier?.city_id),
            zone_id: parseInt(order.courier?.zone_id),
            area_id: order.courier?.area_id ? parseInt(order.courier?.area_id) : undefined,
            special_instruction: order.note || "",
            product_description: order.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
            item_weight: order.courier?.weight || 500, // Grams
            item_quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
            collectable_amount: order.payment_method === "cod" ? Math.round(order.total) : 0,
            is_closed: false
        };
        try {
            const { data } = await client.post("/api/v2/orders", payload);
            if (data?.error) {
                throw new Error(data?.message || "Carrybee order failed");
            }
            return {
                courier: "carrybee",
                consignmentId: data.data.order.consignment_id,
                merchantOrderId: data.data.order.merchant_order_id,
                collectableAmount: data.data.order.collectable_amount,
                deliveryFee: data.data.order.delivery_fee,
                status: "Pending", // Initial status
            };
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
        }
    },
    async sendMany(orders, credentials) {
        const { clientId, clientSecret, clientContext, isSandbox } = credentials;
        if (!clientId || !clientSecret || !clientContext) {
            throw new ApiError_1.ApiError(400, "Carrybee credentials missing");
        }
        const client = axios_1.default.create({
            baseURL: getBaseUrl(isSandbox),
            headers: getHeaders(credentials),
            timeout: 20000,
        });
        const carrybeeOrders = orders.map(order => ({
            store_id: credentials.storeId || order.courier?.store_id,
            merchant_order_id: order.order_number,
            delivery_type: order.courier?.delivery_type || 1,
            product_type: order.courier?.product_type || 1,
            recipient_phone: order.shipping_address.phone,
            recipient_name: order.shipping_address.full_name,
            recipient_address: order.shipping_address.address,
            city_id: parseInt(order.courier?.city_id),
            zone_id: parseInt(order.courier?.zone_id),
            area_id: order.courier?.area_id ? parseInt(order.courier?.area_id) : undefined,
            item_weight: order.courier?.weight || 500,
            item_quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
            collectable_amount: order.payment_method === "cod" ? Math.round(order.total) : 0,
        }));
        try {
            const { data } = await client.post("/api/v2/orders-bulk", { orders: carrybeeOrders });
            if (data?.error) {
                throw new Error(data?.message || "Carrybee bulk order failed");
            }
            return data;
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
        }
    },
    async getStatus(consignmentId, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
            timeout: 15000,
        });
        try {
            const { data } = await client.get(`/api/v2/orders/${consignmentId}/details`);
            if (data?.error) {
                throw new Error(data?.message || "Failed to get Carrybee order status");
            }
            return data.data;
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
        }
    },
    // Location APIs
    async getCities(credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.get("/api/v2/cities");
        return data.data.cities;
    },
    async getZones(cityId, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.get(`/api/v2/cities/${cityId}/zones`);
        return data.data.zones;
    },
    async getAreas(cityId, zoneId, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.get(`/api/v2/cities/${cityId}/zones/${zoneId}/areas`);
        return data.data.areas;
    },
    async getAreaSuggestion(search, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.get(`/api/v2/area-suggestion?search=${encodeURIComponent(search)}`);
        return data.data.items;
    },
    async getAddressDetails(query, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.post("/api/v2/address-details", { query });
        return data.data;
    },
    // Store APIs
    async getStores(credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.get("/api/v2/stores");
        return data.data.stores;
    },
    async createStore(storeData, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.post("/api/v2/stores", storeData);
        return data;
    },
    async cancelOrder(consignmentId, reason, credentials) {
        const client = axios_1.default.create({
            baseURL: getBaseUrl(credentials.isSandbox),
            headers: getHeaders(credentials),
        });
        const { data } = await client.post(`/api/v2/orders/${consignmentId}/cancel`, {
            cancellation_reason: reason
        });
        return data;
    }
};

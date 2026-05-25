import axios from "axios";
import { ApiError } from "../utils/ApiError";

export interface CarrybeeCredentials {
  clientId: string;
  clientSecret: string;
  clientContext: string;
  isSandbox?: boolean;
  storeId?: string;
}

const getBaseUrl = (isSandbox?: boolean) => 
  isSandbox ? "https://sandbox.carrybee.com" : "https://developers.carrybee.com";

const getHeaders = (credentials: CarrybeeCredentials) => ({
  "Client-ID": credentials.clientId,
  "Client-Secret": credentials.clientSecret,
  "Client-Context": credentials.clientContext,
  "Content-Type": "application/json",
});

export const carrybeeCourier = {
  async send(order: any, credentials: CarrybeeCredentials, overrides: any = {}) {
    const { clientId, clientSecret, clientContext, storeId, isSandbox } = credentials;
    if (!clientId || !clientSecret || !clientContext) {
      throw new ApiError(400, "Carrybee credentials missing");
    }

    const client = axios.create({
      baseURL: getBaseUrl(isSandbox),
      headers: getHeaders(credentials),
      timeout: 15000,
    });

    const finalStoreId = storeId || overrides.store_id || order.courier?.store_id;
    if (!finalStoreId || finalStoreId === "Carrybee store_id") {
      throw new ApiError(400, "Carrybee Store ID is missing or invalid. Please update it in Courier Settings.");
    }

    // Validation according to API v2.0
    const recipientName = (order.shipping_address.full_name || "").substring(0, 99);
    const recipientAddress = (order.shipping_address.address || "").substring(0, 200);
    const merchantOrderId = (order.order_number || "").substring(0, 50);
    const productDesc = order.items.map((i: any) => `${i.name} x${i.quantity}`).join(", ").substring(0, 254);
    const weight = Math.max(1, Math.min(25000, parseInt(overrides.weight || order.courier?.weight || 500)));

    const payload = {
      store_id: finalStoreId,
      merchant_order_id: merchantOrderId,
      delivery_type: overrides.delivery_type || order.courier?.delivery_type || 1,
      product_type: overrides.product_type || order.courier?.product_type || 1,
      recipient_phone: order.shipping_address.phone,
      recipient_secendary_phone: order.shipping_address.secondary_phone || undefined,
      recipient_name: recipientName,
      recipient_address: recipientAddress,
      city_id: parseInt(overrides.city_id || order.courier?.city_id),
      zone_id: parseInt(overrides.zone_id || order.courier?.zone_id),
      area_id: (overrides.area_id || order.courier?.area_id) ? parseInt(overrides.area_id || order.courier?.area_id) : undefined,
      special_instruction: (order.note || "").substring(0, 254),
      product_description: productDesc,
      item_weight: weight,
      item_quantity: Math.min(200, order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)),
      collectable_amount: order.payment_method === "cod" ? Math.round(order.total) : 0,
      is_closed_box: overrides.is_closed_box ?? order.courier?.is_closed_box ?? false,
      is_exchange: overrides.is_exchange ?? order.courier?.is_exchange ?? false
    };

    try {
      const { data } = await client.post("/api/v2/orders", payload);

      if (data?.error) {
        throw new ApiError(400, data?.message || "Carrybee order failed", data?.causes);
      }

      return {
        courier: "carrybee",
        consignmentId: data.data.order.consignment_id,
        merchantOrderId: data.data.order.merchant_order_id,
        collectableAmount: data.data.order.collectable_amount,
        deliveryFee: data.data.order.delivery_fee,
        status: "Pending",
      };
    } catch (error: any) {
      console.error("Carrybee API Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message;
      const causes = error.response?.data?.causes;
      
      // If validation error (422), format causes for better readability
      let detail = causes;
      if (causes && typeof causes === "object") {
        detail = Object.entries(causes).map(([field, errors]: [string, any]) => {
          return `${field}: ${errors.map((e: any) => e.type).join(", ")}`;
        }).join("; ");
      }

      throw new ApiError(error.response?.status || 500, detail ? `${errorMessage} (${detail})` : errorMessage);
    }
  },

  async sendMany(orders: any[], credentials: CarrybeeCredentials) {
    const { clientId, clientSecret, clientContext, isSandbox } = credentials;
    if (!clientId || !clientSecret || !clientContext) {
      throw new ApiError(400, "Carrybee credentials missing");
    }

    const client = axios.create({
      baseURL: getBaseUrl(isSandbox),
      headers: getHeaders(credentials),
      timeout: 20000,
    });

    const carrybeeOrders = orders.map(order => ({
      store_id: credentials.storeId || order.courier?.store_id,
      merchant_order_id: (order.order_number || "").substring(0, 50),
      delivery_type: order.courier?.delivery_type || 1,
      product_type: order.courier?.product_type || 1,
      recipient_phone: order.shipping_address.phone,
      recipient_secendary_phone: order.shipping_address.secondary_phone || undefined,
      recipient_name: (order.shipping_address.full_name || "").substring(0, 99),
      recipient_address: (order.shipping_address.address || "").substring(0, 200),
      city_id: parseInt(order.courier?.city_id),
      zone_id: parseInt(order.courier?.zone_id),
      area_id: order.courier?.area_id ? parseInt(order.courier?.area_id) : undefined,
      item_weight: Math.max(1, Math.min(25000, order.courier?.weight || 500)),
      item_quantity: Math.min(200, order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)),
      collectable_amount: order.payment_method === "cod" ? Math.round(order.total) : 0,
      is_closed_box: order.courier?.is_closed_box || false,
      is_exchange: order.courier?.is_exchange || false
    }));

    try {
      const { data } = await client.post("/api/v2/orders-bulk", { orders: carrybeeOrders });
      if (data?.error) {
        throw new Error(data?.message || "Carrybee bulk order failed");
      }
      return data;
    } catch (error: any) {
      console.error("Carrybee Bulk Error:", error.response?.data || error.message);
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
    }
  },

  async getStatus(consignmentId: string, credentials: CarrybeeCredentials) {
    const client = axios.create({
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
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
    }
  },

  // Location APIs
  async getCities(credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.get("/api/v2/cities");
    return data.data.cities;
  },

  async getZones(cityId: string | number, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.get(`/api/v2/cities/${cityId}/zones`);
    return data.data.zones;
  },

  async getAreas(cityId: string | number, zoneId: string | number, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.get(`/api/v2/cities/${cityId}/zones/${zoneId}/areas`);
    return data.data.areas;
  },

  async getAreaSuggestion(search: string, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.get(`/api/v2/area-suggestion?search=${encodeURIComponent(search)}`);
    return data.data.items;
  },

  async getAddressDetails(query: string, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    try {
      const { data } = await client.post("/api/v2/address-details", { query });
      return data.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        return null; // Return null if Carrybee can't parse the address
      }
      throw error;
    }
  },

  // Store APIs
  async getStores(credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.get("/api/v2/stores");
    return data.data.stores;
  },

  async createStore(storeData: any, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.post("/api/v2/stores", storeData);
    return data;
  },

  async cancelOrder(consignmentId: string, reason: string, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    const { data } = await client.post(`/api/v2/orders/${consignmentId}/cancel`, {
      cancellation_reason: reason
    });
    return data;
  },

  async createReversePickup(payload: any, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });
    
    // Validate required fields for reverse pickup
    const required = ["customer_phone", "customer_name", "customer_address", "city_id", "zone_id", "item_weight", "item_quantity", "store_id"];
    for (const field of required) {
      if (!payload[field]) {
        throw new ApiError(400, `Missing required field for reverse pickup: ${field}`);
      }
    }

    try {
      const { data } = await client.post("/api/v2/orders/reverse-pickup", payload);
      if (data?.error) {
        throw new ApiError(400, data?.message || "Carrybee reverse pickup failed", data?.causes);
      }
      return data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
    }
  },

  async createExchange(consignmentId: string, payload: any, credentials: CarrybeeCredentials) {
    const client = axios.create({
      baseURL: getBaseUrl(credentials.isSandbox),
      headers: getHeaders(credentials),
    });

    // Validate required fields for exchange
    const required = ["merchant_order_id", "item_weight", "item_quantity", "collectable_amount"];
    for (const field of required) {
      if (payload[field] === undefined) {
        throw new ApiError(400, `Missing required field for exchange: ${field}`);
      }
    }

    try {
      const { data } = await client.post(`/api/v2/orders/${consignmentId}/exchange`, payload);
      if (data?.error) {
        throw new ApiError(400, data?.message || "Carrybee exchange failed", data?.causes);
      }
      return data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || error.message);
    }
  }
};



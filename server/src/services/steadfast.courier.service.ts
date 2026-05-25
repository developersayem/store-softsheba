import axios from "axios";
import { ApiError } from "../utils/ApiError";

const BASE_URL = "https://portal.packzy.com/api/v1";

export const steadfastCourier = {
  async send(order: any, credentials: { apiKey: string; secretKey: string }) {
    if (!credentials?.apiKey || !credentials?.secretKey) {
      throw new ApiError(400, "Steadfast credentials missing");
    }

    const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Api-Key": credentials.apiKey,
        "Secret-Key": credentials.secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const payload = {
      invoice: order.order_number,
      recipient_name: order.shipping_address.full_name,
      recipient_phone: order.shipping_address.phone,
      recipient_address: order.shipping_address.address || order.shipping_address.full_address || "",
      cod_amount: order.payment_method === "cod" ? order.total : 0,
      note: order.note || "",
      item_description: order.items
        .map((i: any) => `${i.name} x${i.quantity}`)
        .join(", "),
      total_lot: order.items.length,
      delivery_type: 0,
    };

    try {
      const { data } = await client.post("/create_order", payload);
      
      if (data?.status !== 200) {
        console.error("Steadfast API Error Response:", data);
        throw new Error(data?.message || "Steadfast order failed");
      }

      return {
        courier: "steadfast",
        consignmentId: data.consignment.consignment_id,
        invoiceId: data.consignment.invoice,
        trackingCode: data.consignment.tracking_code,
        status: data.consignment.status,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("Steadfast 401 Unauthorized. Check API Key and Secret Key.");
        console.error("Headers Sent:", {
          "Api-Key": credentials.apiKey?.substring(0, 4) + "****",
          "Secret-Key": credentials.secretKey?.substring(0, 4) + "****",
        });
      }
      throw error;
    }
  },
  /**
   * ✅ BULK SEND (sendMany)
   */
  async sendMany(
    orders: any[],
    credentials: { apiKey: string; secretKey: string },
  ) {
    if (!credentials?.apiKey || !credentials?.secretKey) {
      throw new ApiError(400, "Steadfast credentials missing");
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      throw new ApiError(400, "Orders array is required");
    }

    if (orders.length > 500) {
      throw new ApiError(400, "Maximum 500 orders allowed per request");
    }

    const payload = orders.map((order) => ({
      invoice: order.order_number,
      recipient_name: order.shipping_address?.full_name || "N/A",
      recipient_phone: order.shipping_address?.phone || "",
      recipient_address: order.shipping_address?.address || "N/A",
      cod_amount: order.payment_method === "cod" ? order.total : 0,
      note: order.note || "",
      item_description: order.items
        .map((i: any) => `${i.name} x${i.quantity}`)
        .join(", "),
      total_lot: order.items.length,
      delivery_type: 0,
    }));

    const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Api-Key": credentials.apiKey,
        "Secret-Key": credentials.secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
    });

    try {
      // Documentation requires wrapping the stringified array in a 'data' field
      const { data } = await client.post("/create_order/bulk-order", {
        data: JSON.stringify(payload),
      });
      
      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("Steadfast Bulk 401 Unauthorized. Check credentials.");
      }
      throw error;
    }
  },
  async getStatus(trackingCode: string, credentials: { apiKey: string; secretKey: string }) {
    if (!credentials?.apiKey || !credentials?.secretKey) {
      throw new ApiError(400, "Steadfast credentials missing");
    }
     const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Api-Key": credentials.apiKey,
        "Secret-Key": credentials.secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });
    
    try {
      const res = await client.get(`/status_by_trackingcode/${trackingCode}`);
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error(`Steadfast Status 401 for tracking code: ${trackingCode}`);
      }
      throw error;
    }
  }
};


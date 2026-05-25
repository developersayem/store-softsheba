import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { notificationService } from "../services/notification.service";
import { sendFacebookEvent } from "../services/facebookCapi.service";
import { MarketingSettings } from "../models/marketing.model";
import { courierService } from "../services/courier_api.service";
import { Order } from "../models/order.model";
import { BlockedIP } from "../models/block.ip.model";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";
  const order = await orderService.createOrder(req.body, ip);
  const notification = await notificationService.createNotification({
    title: "New Order Received",
    message: `Order ${order.order_number} placed. Total ৳ ${order.total}`,
    orderId: order._id.toString(),
    type: "info",
  });

  const marketing = await MarketingSettings.findOne();
  const facebook = marketing?.facebook;

  if (facebook?.serverTrackingEnabled) {
    try {
      const eventId = req.body.eventId;
      console.log(eventId);

      const userData = {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        ua: req.headers["user-agent"],
        email: req.body.customer?.email || "",
        phone: req.body.customer?.phone || "",
      };

      await sendFacebookEvent({
        facebook,
        eventName: "Purchase",
        eventId,
        user: userData,
        customData: {
          value: order.total,
          currency: "BDT",
          content_ids: (order.items as any[]).map((i: any) => i.productId.toString()),
          content_type: "product",
        },
      });
    } catch (err) {
      console.error("Meta Conversion API Error:", err);
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

export const createIncompleteOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";
    const order = await orderService.createOrder(req.body, ip);
    return res
      .status(200)
      .json(
        new ApiResponse(201, order, "Incomplete Order created successfully"),
      );
  },
);

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id as string);
  return res.json(new ApiResponse(200, order, "Order fetched successfully"));
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrder(
    req.params.id as string,
    req.body,
  );
  return res.json(new ApiResponse(200, order, "Order updated successfully"));
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  await orderService.deleteOrder(req.params.id as string);
  return res.json(new ApiResponse(200, {}, "Order deleted successfully"));
});

export const deleteMany = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) throw new ApiError(400, "ids array required");
  const result = await orderService.deleteOrderMany(ids);
  return res.json(
    new ApiResponse(200, result, `${result.deletedCount} order(s) deleted`),
  );
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.listOrders(req.query);
  return res.json(new ApiResponse(200, orders, "Orders listed successfully"));
});
export const listIncompleteOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await orderService.listIncompleteOrders(req.query);
    return res.json(
      new ApiResponse(200, orders, "Incomplete orders listed successfully"),
    );
  },
);

export const listMyOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const customerId =
      typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined;

    if (!customerId) {
      throw new ApiError(400, "customerId is required");
    }

    const orders = await orderService.listMyOrders(customerId);

    return res.json(
      new ApiResponse(200, orders, "My orders listed successfully"),
    );
  },
);

export const sendOrderToCourier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courier, ...courierDetails } = req.body;

  if (!courier) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Courier type is required"));
  }

  // 1. Get order
  const order = await orderService.getOrderById(id as string);
  if (!order) {
    return res.status(404).json(new ApiResponse(404, null, "Order not found"));
  }

  // 2. Prevent duplicate sending
  if (
    order.status === "in-transit" ||
    order.status === "In-Transit" ||
    order.status === "delivered" ||
    order.status === "Delivered"
  ) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "Order already sent to courier"));
  }

  let courierResponse;
  // 3. Send to courier (abstracted)
  try {
    if (!order.courier?.isCourierAssigned) {
      courierResponse = await courierService.sendOrder(order, courier, courierDetails);
    }
    console.log("Courier Response:", courierResponse);
  } catch (error: any) {
    console.error("Courier Service Error:", error.message, error.response?.data);
    throw error;
  }
  // 4. Save courier info in DB
  const response = courierResponse ?? order.courier ?? {};
  const NewOrder = await orderService.updateCourierInfo(id as string, {
    isCourierAssigned: true,
    name: courier,
    consignmentId:
      courierResponse?.consignmentId ?? order.courier?.consignmentId,
    invoiceId:
      courier === "steadfast"
        ?  "invoiceId" in response
          ? response.invoiceId
          : undefined
        :  "merchantOrderId" in response
          ? response.merchantOrderId
          : undefined,
    trackingCode:
       "trackingCode" in response
        ? response.trackingCode
        :  courierResponse?.consignmentId,
    status:
       "status" in response
        ? response.status
        : undefined,

    weight: courierDetails.weight || order.courier?.weight,
    city_id: courierDetails.city_id || order.courier?.city_id,
    zone_id: courierDetails.zone_id || order.courier?.zone_id,
    area_id: courierDetails.area_id || order.courier?.area_id,

    tracking_url:
      courier === "steadfast"
        ? `https://steadfast.com.bd/t/${ "trackingCode" in response ? response.trackingCode : undefined}`
        : courier === "pathao" 
          ? `https://merchant.pathao.com/tracking?consignment_id=${ "consignmentId" in response ? response.consignmentId : undefined}&phone=${order.shipping_address.phone}`
          : `https://www.carrybee.com/tracking/${courierResponse?.consignmentId || order.courier?.consignmentId}`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, NewOrder, "Order sent to courier successfully"));
});

export const sendOrderToCourierMany = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, courier } = req.body;
    if (!Array.isArray(ids)) throw new ApiError(400, "ids array required");
    if (!courier) {
      return res.status(400).json(new ApiError(400, "Courier is required"));
    }
    const orders = await orderService.getOrdersByIds(ids);
    if (orders.length === 0) {
      throw new ApiError(400, "No valid orders found");
    }
    const response = await courierService.sendOrderMany(orders, courier);
    let bulkOps: any[] = [];
    //console.log("first");
    //console.log(response);
    //update courier info many
    if (courier === "pathao") {
      if (response.accepted) {
        bulkOps = orders.map((order: any) => ({
          updateOne: {
            filter: { _id: order._id },
            update: {
              $set: {
                status: "shipped",
                courier: {
                  name: "pathao",
                  sent_at: new Date(),
                  status: "Pending",
                  invoiceId: order.order_number,
                },
              },
            },
          },
        }));
      }
      if (bulkOps.length > 0) {
        await Order.bulkWrite(bulkOps);
      }
      let successCount = 0;
      let failedCount = 0;
      successCount = response.accepted ? orders.length : 0;
      failedCount = response.accepted ? 0 : orders.length;
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            total: orders.length,
            success: successCount,
            failed: failedCount,
            details: response.data || response,
          },
          `Bulk orders sent to ${courier} successfully`,
        ),
      );
    } else {
      const responseArray = Array.isArray(response)
        ? response
        : response.data && Array.isArray(response.data)
          ? response.data
          : [response];

      const bulkOps = responseArray
        ?.map((item: any) => {
          if (item.status !== "success") return null;

          return {
            updateOne: {
              filter: { order_number: item.invoice },
              update: {
                $set: {
                  status: "shipped" as const,
                  courier: {
                    name: courier,
                    consignmentId: item.consignment_id,
                    invoiceId: item.invoice,
                    trackingCode: item.tracking_code,
                    tracking_url: `https://steadfast.com.bd/t/${item.tracking_code}`,
                    status: "in_review",
                    sent_at: new Date(),
                  },
                },
              },
            },
          };
        })
        .filter((op: any): op is NonNullable<typeof op> => op !== null);

      if (bulkOps.length > 0) {
        await Order.bulkWrite(bulkOps);
      }

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            total: orders.length,
            success: responseArray.filter((r: any) => r.status === "success")
              .length,
            failed: responseArray.filter((r: any) => r.status !== "success")
              .length,
            details: responseArray,
          },
          "Bulk orders sent successfully",
        ),
      );

    }
  },
);

export const getCourierStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId, trackingCode, courier } = req.body;
    if (!trackingCode || !orderId || !courier) {
      throw new ApiError(400, "tracking code is required");
    }
    const statusResponse = await courierService.getCourierStatus(
      trackingCode,
      courier,
    );
    const updatedOrder = await orderService.updateCourierstatus(
      orderId,
      statusResponse.delivery_status || statusResponse.data.order_status,
    );
    //console.log(statusResponse, updatedOrder);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedOrder,
          "Updated Courier Status successfully!",
        ),
      );
  },
);

export const blockIPFromOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).lean();
  if (!order) throw new ApiError(404, "Order not found");
  if (!order.ip) throw new ApiError(400, "Order has no IP");

  const blocked = await BlockedIP.findOne({ ip: order.ip });

  // UNBLOCK
  if (blocked) {
    await BlockedIP.deleteOne({ ip: order.ip });
    await Order.updateMany({ ip: order.ip }, { $set: { isIpBlocked: false } });

    return res.json(
      new ApiResponse(200, { blocked: false }, "IP unblocked successfully"),
    );
  }

  // BLOCK
  await BlockedIP.create({
    ip: order.ip,
    reason: "Toggled from admin order panel",
    blockedFromOrder: order._id,
  });

  await Order.updateMany({ ip: order.ip }, { $set: { isIpBlocked: true } });

  return res.json(
    new ApiResponse(200, { blocked: true }, "IP blocked successfully"),
  );
});

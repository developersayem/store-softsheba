"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockIPFromOrder = exports.getCourierStatus = exports.sendOrderToCourierMany = exports.sendOrderToCourier = exports.listMyOrders = exports.listIncompleteOrders = exports.listOrders = exports.deleteMany = exports.deleteOrder = exports.updateOrder = exports.getOrder = exports.createIncompleteOrder = exports.createOrder = void 0;
const order_service_1 = require("../services/order.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const notification_service_1 = require("../services/notification.service");
const facebookCapi_service_1 = require("../services/facebookCapi.service");
const marketing_model_1 = require("../models/marketing.model");
const courier_api_service_1 = require("../services/courier_api.service");
const order_model_1 = require("../models/order.model");
const block_ip_model_1 = require("../models/block.ip.model");
exports.createOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "";
    const order = await order_service_1.orderService.createOrder(req.body, ip);
    const notification = await notification_service_1.notificationService.createNotification({
        title: "New Order Received",
        message: `Order ${order.order_number} placed. Total ৳ ${order.total}`,
        orderId: order._id.toString(),
        type: "info",
    });
    const marketing = await marketing_model_1.MarketingSettings.findOne();
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
            await (0, facebookCapi_service_1.sendFacebookEvent)({
                facebook,
                eventName: "Purchase",
                eventId,
                user: userData,
                customData: {
                    value: order.total,
                    currency: "BDT",
                    content_ids: order.items.map((i) => i.productId.toString()),
                    content_type: "product",
                },
            });
        }
        catch (err) {
            console.error("Meta Conversion API Error:", err);
        }
    }
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, order, "Order placed successfully"));
});
exports.createIncompleteOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "";
    const order = await order_service_1.orderService.createOrder(req.body, ip);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(201, order, "Incomplete Order created successfully"));
});
exports.getOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await order_service_1.orderService.getOrderById(req.params.id);
    return res.json(new ApiResponse_1.ApiResponse(200, order, "Order fetched successfully"));
});
exports.updateOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await order_service_1.orderService.updateOrder(req.params.id, req.body);
    return res.json(new ApiResponse_1.ApiResponse(200, order, "Order updated successfully"));
});
exports.deleteOrder = (0, asyncHandler_1.default)(async (req, res) => {
    await order_service_1.orderService.deleteOrder(req.params.id);
    return res.json(new ApiResponse_1.ApiResponse(200, {}, "Order deleted successfully"));
});
exports.deleteMany = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids))
        throw new ApiError_1.ApiError(400, "ids array required");
    const result = await order_service_1.orderService.deleteOrderMany(ids);
    return res.json(new ApiResponse_1.ApiResponse(200, result, `${result.deletedCount} order(s) deleted`));
});
exports.listOrders = (0, asyncHandler_1.default)(async (req, res) => {
    const orders = await order_service_1.orderService.listOrders(req.query);
    return res.json(new ApiResponse_1.ApiResponse(200, orders, "Orders listed successfully"));
});
exports.listIncompleteOrders = (0, asyncHandler_1.default)(async (req, res) => {
    const orders = await order_service_1.orderService.listIncompleteOrders(req.query);
    return res.json(new ApiResponse_1.ApiResponse(200, orders, "Incomplete orders listed successfully"));
});
exports.listMyOrders = (0, asyncHandler_1.default)(async (req, res) => {
    const customerId = typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined;
    if (!customerId) {
        throw new ApiError_1.ApiError(400, "customerId is required");
    }
    const orders = await order_service_1.orderService.listMyOrders(customerId);
    return res.json(new ApiResponse_1.ApiResponse(200, orders, "My orders listed successfully"));
});
exports.sendOrderToCourier = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { courier } = req.body;
    if (!courier) {
        return res
            .status(400)
            .json(new ApiResponse_1.ApiResponse(400, null, "Courier type is required"));
    }
    // 1. Get order
    const order = await order_service_1.orderService.getOrderById(id);
    if (!order) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, null, "Order not found"));
    }
    // 2. Prevent duplicate sending
    if (order.status === "in-transit" ||
        order.status === "In-Transit" ||
        order.status === "delivered" ||
        order.status === "Delivered") {
        return res
            .status(409)
            .json(new ApiResponse_1.ApiResponse(409, null, "Order already sent to courier"));
    }
    let courierResponse;
    // 3. Send to courier (abstracted)
    if (!order.courier?.isCourierAssigned) {
        courierResponse = await courier_api_service_1.courierService.sendOrder(order, courier);
    }
    //console.log(courierResponse);
    // 4. Save courier info in DB
    const response = courierResponse ?? order.courier ?? {};
    const NewOrder = await order_service_1.orderService.updateCourierInfo(id, {
        isCourierAssigned: true,
        name: courier,
        consignmentId: courierResponse?.consignmentId ?? order.courier?.consignmentId,
        invoiceId: courier === "steadfast"
            ? "invoiceId" in response
                ? response.invoiceId
                : undefined
            : "merchent_order_id" in response
                ? response.merchent_order_id
                : undefined,
        trackingCode: "trackingCode" in response
            ? response.trackingCode
            : courierResponse?.consignmentId,
        status: "status" in response
            ? response.status
            : undefined,
        tracking_url: courier === "steadfast"
            ? `https://steadfast.com.bd/t/${"trackingCode" in response ? response.trackingCode : undefined}`
            : `https://merchant.pathao.com/tracking?consignment_id=${"consignmentId" in response ? response.consignmentId : undefined}&phone=${order.shipping_address.phone}`,
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, NewOrder, "Order sent to courier successfully"));
});
exports.sendOrderToCourierMany = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, courier } = req.body;
    if (!Array.isArray(ids))
        throw new ApiError_1.ApiError(400, "ids array required");
    if (!courier) {
        return res.status(400).json(new ApiError_1.ApiError(400, "Courier is required"));
    }
    const orders = await order_service_1.orderService.getOrdersByIds(ids);
    if (orders.length === 0) {
        throw new ApiError_1.ApiError(400, "No valid orders found");
    }
    const response = await courier_api_service_1.courierService.sendOrderMany(orders, courier);
    let bulkOps = [];
    //console.log("first");
    //console.log(response);
    //update courier info many
    if (courier === "pathao") {
        if (response.accepted) {
            bulkOps = orders.map((order) => ({
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
            await order_model_1.Order.bulkWrite(bulkOps);
        }
        let successCount = 0;
        let failedCount = 0;
        successCount = response.accepted ? orders.length : 0;
        failedCount = response.accepted ? 0 : orders.length;
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            total: orders.length,
            success: successCount,
            failed: failedCount,
            details: response.data || response,
        }, `Bulk orders sent to ${courier} successfully`));
    }
    else {
        const bulkOps = (Array.isArray(response.data) ? response.data : [])
            ?.map((item) => {
            if (item.status !== "success")
                return null;
            return {
                updateOne: {
                    filter: { order_number: item.invoice },
                    update: {
                        $set: {
                            status: "shipped",
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
            .filter((op) => op !== null);
        if (bulkOps.length > 0) {
            await order_model_1.Order.bulkWrite(bulkOps);
        }
        const responseArray = Array.isArray(response.data)
            ? response.data
            : [response.data];
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            total: orders.length,
            success: responseArray.filter((r) => r.status === "success")
                .length,
            failed: responseArray.filter((r) => r.status !== "success")
                .length,
            details: response.data,
        }, "Bulk orders sent successfully"));
    }
});
exports.getCourierStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const { orderId, trackingCode, courier } = req.body;
    if (!trackingCode || !orderId || !courier) {
        throw new ApiError_1.ApiError(400, "tracking code is required");
    }
    const statusResponse = await courier_api_service_1.courierService.getCourierStatus(trackingCode, courier);
    const updatedOrder = await order_service_1.orderService.updateCourierstatus(orderId, statusResponse.delivery_status || statusResponse.data.order_status);
    //console.log(statusResponse, updatedOrder);
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, updatedOrder, "Updated Courier Status successfully!"));
});
exports.blockIPFromOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const order = await order_model_1.Order.findById(id).lean();
    if (!order)
        throw new ApiError_1.ApiError(404, "Order not found");
    if (!order.ip)
        throw new ApiError_1.ApiError(400, "Order has no IP");
    const blocked = await block_ip_model_1.BlockedIP.findOne({ ip: order.ip });
    // UNBLOCK
    if (blocked) {
        await block_ip_model_1.BlockedIP.deleteOne({ ip: order.ip });
        await order_model_1.Order.updateMany({ ip: order.ip }, { $set: { isIpBlocked: false } });
        return res.json(new ApiResponse_1.ApiResponse(200, { blocked: false }, "IP unblocked successfully"));
    }
    // BLOCK
    await block_ip_model_1.BlockedIP.create({
        ip: order.ip,
        reason: "Toggled from admin order panel",
        blockedFromOrder: order._id,
    });
    await order_model_1.Order.updateMany({ ip: order.ip }, { $set: { isIpBlocked: true } });
    return res.json(new ApiResponse_1.ApiResponse(200, { blocked: true }, "IP blocked successfully"));
});

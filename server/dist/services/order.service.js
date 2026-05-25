"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const mongoose_1 = require("mongoose");
const order_model_1 = require("../models/order.model");
const ApiError_1 = require("../utils/ApiError");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const customer_model_1 = require("../models/customer.model");
const product_model_1 = require("../models/product.model");
const variant_model_1 = require("../models/variant.model");
const inventory_service_1 = require("./inventory.service");
const analytics_model_1 = require("../models/analytics.model");
const customer_service_1 = require("./customer.service");
exports.orderService = {
    async createOrder(payload, ip) {
        if (!payload.items || !payload.items.length)
            throw new ApiError_1.ApiError(400, "Order must have items");
        console.log(payload);
        // 1. Handle Customer (Find or Create)
        console.log(payload);
        let customerId = payload?.customerId && typeof payload.customerId === "object"
            ? payload.customerId._id
            : payload.customerId;
        if (customerId && typeof customerId !== "string") {
            customerId = customerId.toString();
        }
        if (!customerId && payload.status !== "incomplete") {
            if (!payload?.shipping_address?.phone) {
                throw new ApiError_1.ApiError(400, "Customer ID or shipping phone number is required");
            }
            const customer = await customer_service_1.customerService.findOrCreateByPhone({
                full_name: payload?.shipping_address?.full_name,
                phone: payload?.shipping_address?.phone,
                address: payload?.shipping_address?.address,
                city: payload?.shipping_address?.city,
            });
            customerId = customer._id.toString();
        }
        if (payload.status !== "incomplete") {
            if (!customerId || !mongoose_1.Types.ObjectId.isValid(customerId))
                throw new ApiError_1.ApiError(400, "Invalid customer id");
            const customer = await customer_model_1.Customer.findById(customerId).lean();
            if (!customer)
                throw new ApiError_1.ApiError(404, "Customer not found");
            if (customer.isBlocked)
                throw new ApiError_1.ApiError(403, "Customer is Blocked!");
        }
        // 2. Pre-validate stock and items
        let calculatedSubtotal = 0;
        const validatedItems = [];
        for (const item of payload.items) {
            if (!mongoose_1.Types.ObjectId.isValid(item.productId))
                throw new ApiError_1.ApiError(400, `Invalid product id: ${item.productId}`);
            // Get real-time stock and product info
            const product = await product_model_1.Product.findById(item.productId).lean();
            if (!product)
                throw new ApiError_1.ApiError(404, `Product not found: ${item.productId}`);
            let unitPrice = product.sale_price ?? product.regular_price ?? 0;
            let sku = product.sku || item.sku;
            let name = product.name;
            let thumbnail = product.thumbnail || "";
            let availableStock = product.stock;
            let selectedVariantId = item.variantId;
            // Handle default variant if missing but product has variants
            if (!selectedVariantId && product.variants?.length > 0) {
                selectedVariantId = product.variants[0].toString();
            }
            if (selectedVariantId) {
                if (!mongoose_1.Types.ObjectId.isValid(selectedVariantId))
                    throw new ApiError_1.ApiError(400, `Invalid variant id: ${selectedVariantId}`);
                const variant = await variant_model_1.Variant.findById(selectedVariantId).lean();
                if (!variant)
                    throw new ApiError_1.ApiError(404, `Variant not found: ${item.variantId}`);
                unitPrice = variant.sale_price ?? variant.regular_price ?? 0;
                // Re-apply discount if it looks like we only have regular_price
                if (unitPrice === variant.regular_price && unitPrice !== 0) {
                    if (variant.discount_type === "percentage") {
                        unitPrice = Math.max(0, unitPrice - (unitPrice * variant.discount) / 100);
                    }
                    else if (variant.discount_type === "flat") {
                        unitPrice = Math.max(0, unitPrice - variant.discount);
                    }
                }
                sku = variant.sku || sku;
                thumbnail = variant.image || thumbnail;
                availableStock = variant.stock;
            }
            else {
                // Already set above: unitPrice = product.sale_price ?? product.regular_price ?? 0;
                if (unitPrice === product.regular_price && unitPrice !== 0) {
                    if (product.discount_type === "percentage") {
                        unitPrice = Math.max(0, unitPrice - (unitPrice * product.discount) / 100);
                    }
                    else if (product.discount_type === "flat") {
                        unitPrice = Math.max(0, unitPrice - product.discount);
                    }
                }
            }
            // Check stock
            if (availableStock < item.quantity) {
                throw new ApiError_1.ApiError(400, `Insufficient stock for ${name}. Available: ${availableStock}`);
            }
            const itemTotal = unitPrice * item.quantity;
            calculatedSubtotal += itemTotal;
            validatedItems.push({
                productId: item.productId,
                variantId: selectedVariantId,
                name,
                sku,
                image: thumbnail,
                quantity: item.quantity,
                price: unitPrice,
                total: itemTotal,
                selectedAttributes: item.selectedAttributes,
            });
        }
        // 3. Final Calculations
        const shippingCharge = Math.max(0, payload.shipping_charge ?? payload.delivery_charge);
        const couponDiscount = Math.max(0, payload.coupon_discount || 0);
        const manualDiscount = Math.max(0, payload.discount || 0);
        const finalTotal = Math.max(0, calculatedSubtotal + shippingCharge - couponDiscount - manualDiscount);
        const orderNumber = payload.order_number || `ORD-${Date.now()}`;
        const order = await order_model_1.Order.create({
            order_number: orderNumber,
            customerId: customerId,
            subtotal: calculatedSubtotal,
            discount: manualDiscount,
            discount_Type: payload.discount_Type,
            shipping_charge: shippingCharge,
            shipping_rule_id: payload.shipping_rule_id,
            coupon_code: payload.coupon_code,
            coupon_discount: couponDiscount,
            total: finalTotal,
            payment_method: payload.payment_method || "cod",
            status: payload.status || "pending",
            shipping_address: payload?.shipping_address,
            items: validatedItems,
            ip: ip,
            payment: payload.payment,
            courier: payload.courier,
            pickupAddress: payload.pickupAddress,
        });
        return (0, image_resolver_plugin_1.resolveImageUrls)(order, ["items.image"]);
    },
    async listOrders(filters = {}) {
        const orders = await order_model_1.Order.find({ ...filters, status: { $ne: "incomplete" } })
            .populate("customerId", "full_name phone email")
            .populate("items.productId", "name slug thumbnail")
            .populate("items.variantId")
            .sort({ created_at: -1 })
            .lean();
        return (0, image_resolver_plugin_1.resolveImageUrls)(orders, ["items.image", "items.productId.thumbnail"]);
    },
    async listIncompleteOrders(filters = {}) {
        const orders = await order_model_1.Order.find({ ...filters, status: "incomplete" })
            .populate("customerId", "full_name phone email")
            .populate("items.productId", "name slug thumbnail")
            .populate("items.variantId")
            .sort({ created_at: -1 })
            .lean();
        return (0, image_resolver_plugin_1.resolveImageUrls)(orders, ["items.image", "items.productId.thumbnail"]);
    },
    async listMyOrders(customerId) {
        if (!mongoose_1.Types.ObjectId.isValid(customerId))
            throw new ApiError_1.ApiError(400, "Invalid customer id");
        const orders = await order_model_1.Order.find({ customerId })
            .populate("items.productId", "name slug thumbnail")
            .sort({ created_at: -1 })
            .lean();
        return (0, image_resolver_plugin_1.resolveImageUrls)(orders, ["items.image", "items.productId.thumbnail"]);
    },
    async getOrderById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid order id");
        const order = await order_model_1.Order.findById(id)
            .populate("customerId", "full_name phone email")
            .populate("items.productId", "name slug thumbnail")
            .populate("items.variantId")
            .lean();
        if (!order)
            throw new ApiError_1.ApiError(404, "Order not found");
        return (0, image_resolver_plugin_1.resolveImageUrls)(order, ["items.image", "items.productId.thumbnail"]);
    },
    async updateOrder(id, payload) {
        console.log(payload);
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid order id");
        const order = await order_model_1.Order.findById(id);
        if (!order)
            throw new ApiError_1.ApiError(404, "Order not found");
        const prevStatus = order.status;
        // Recompute totals if items/financials changed
        if (payload.items ||
            typeof payload.discount !== "undefined" ||
            typeof payload.delivery_charge !== "undefined" ||
            typeof payload.coupon_discount !== "undefined") {
            const items = payload.items || order.toObject().items;
            let subtotal = 0;
            const recomputedItems = [];
            for (const item of items) {
                // Fetch fresh product/variant data for price truth
                const product = await product_model_1.Product.findById(item.productId).lean();
                if (!product)
                    throw new ApiError_1.ApiError(404, `Product not found: ${item.productId}`);
                // Use the price provided in the payload (which comes from the order form),
                // falling back to the existing item price if not provided.
                // We DO NOT fetch the live product price here, because order prices
                // should remain frozen at the time of purchase unless manually edited.
                let price = item.price;
                // Ensure price is valid
                if (typeof price !== 'number' || isNaN(price)) {
                    price = 0;
                }
                const qty = Math.max(1, item.quantity);
                const total = price * qty;
                subtotal += total;
                recomputedItems.push({ ...item, price, total, quantity: qty });
            }
            const shippingCharge = payload.shipping_charge ??
                payload.delivery_charge ??
                order.shipping_charge ??
                0;
            const couponDiscount = payload.coupon_discount ?? order.coupon_discount ?? 0;
            const manualDiscount = payload.discount ?? order.discount ?? 0;
            const finalTotal = Math.max(0, subtotal + shippingCharge - couponDiscount - manualDiscount);
            order.items = recomputedItems;
            order.subtotal = subtotal;
            order.discount = manualDiscount;
            order.shipping_charge = shippingCharge;
            order.coupon_discount = couponDiscount;
            order.total = finalTotal;
            if (order.payment) {
                order.payment.sales = finalTotal;
                order.payment.due = finalTotal - (order.payment.paid || 0);
                order.markModified('payment');
            }
        }
        if (payload.shipping_address)
            order.shipping_address = payload.shipping_address;
        if (payload.payment_method)
            order.payment_method = payload.payment_method;
        if (payload.status)
            order.status = payload.status;
        if (payload.shipping_rule_id)
            order.shipping_rule_id = payload.shipping_rule_id;
        if (payload.coupon_code)
            order.coupon_code = payload.coupon_code;
        if (payload.payment)
            order.payment = payload.payment;
        if (payload.notes)
            order.notes = payload.notes;
        if (payload.discount_Type)
            order.discount_Type = payload.discount_Type;
        if (payload.sub_status !== undefined) {
            if (payload.sub_status === "" || payload.status === "In-Transit") {
                order.sub_status = null;
            }
            else {
                order.sub_status = payload.sub_status;
            }
        }
        if (payload.courier)
            order.courier = payload.courier;
        if (payload.followUpDate !== undefined) {
            if (payload.followUpDate === "") {
                order.followUpDate = null;
            }
            else {
                order.followUpDate = new Date(payload.followUpDate);
            }
        }
        if (payload.dates?.shipping)
            order.dates.shipping = new Date(payload.dates.shipping);
        if (payload.internalNotes) {
            order.notes.push(payload.internalNotes);
        }
        await order.save();
        //  Handle inventory adjustments and sales reporting on status transitions
        const newStatus = order.status;
        if (newStatus !== prevStatus) {
            const now = new Date();
            if (!order.dates) {
                order.dates = {};
            }
            switch (newStatus.toLowerCase()) {
                case "on hold":
                    order.dates.on_hold = now;
                    break;
                case "approved":
                    order.dates.approved = now;
                    break;
                case "processing":
                    order.dates.processing = now;
                    break;
                case "ready to ship":
                    order.dates.ready_to_ship = now;
                    break;
                case "in-transit":
                    order.dates.in_transit = now;
                    break;
                case "delivered":
                    order.dates.Delivered = now;
                    break;
                case "flagged":
                    order.dates.PendingReturn = now;
                    order.dates.flagged = now;
                    break;
                case "cancelled":
                    order.dates.cancelled = now;
                    break;
            }
            await order.save();
            // On confirm: decrement inventory and create sales reports
            if ((newStatus === "in-transit" || newStatus === "delivered") &&
                prevStatus === "pending") {
                for (const item of order.items) {
                    await inventory_service_1.inventoryService.updateStock(item.productId.toString(), item.variantId?.toString() || null, -item.quantity);
                }
                // Write sales report rows
                await analytics_model_1.SalesReport.insertMany(order.items.map((it) => ({
                    orderId: order._id,
                    productId: it.productId,
                    variantId: it.variantId,
                    quantity: it.quantity,
                    total_price: it.total,
                })));
            }
            // On cancel from confirmed/processing: restock
            if (newStatus === "cancelled" &&
                (prevStatus === "in-transit" || prevStatus === "delivered")) {
                for (const item of order.items) {
                    await inventory_service_1.inventoryService.updateStock(item.productId.toString(), item.variantId?.toString() || null, item.quantity);
                }
            }
        }
        return (0, image_resolver_plugin_1.resolveImageUrls)(order, ["items.image"]);
    },
    async deleteOrder(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid order id");
        const deleted = await order_model_1.Order.findByIdAndDelete(id);
        if (!deleted)
            throw new ApiError_1.ApiError(404, "Order not found");
        return deleted;
    },
    async deleteOrderMany(ids) {
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid order ids: ${invalidIds.join(", ")}`);
        const orders = await order_model_1.Order.find({ _id: { $in: ids } });
        if (!orders.length)
            throw new ApiError_1.ApiError(404, "No products found for the given IDs");
        const orderIds = orders.map((o) => o._id);
        // Delete orders
        const result = await order_model_1.Order.deleteMany({ _id: { $in: orderIds } });
        return result;
    },
    async updateCourierInfo(id, courierData) {
        return order_model_1.Order.findByIdAndUpdate(id, {
            courier: courierData,
            status: "In-Transit",
        }, { new: true });
    },
    async updateCourierstatus(id, status) {
        return order_model_1.Order.findByIdAndUpdate(id, {
            "courier.status": status,
        }, { new: true });
    },
    async getOrdersByIds(ids) {
        return order_model_1.Order.find({
            _id: { $in: ids },
            status: { $nin: ["cancelled", "shipped"] },
        });
    },
};

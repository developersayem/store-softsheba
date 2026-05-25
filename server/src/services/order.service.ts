import { Types } from "mongoose";
import { ICourierInfo, Order } from "../models/order.model";
import { ApiError } from "../utils/ApiError";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { Customer } from "../models/customer.model";
import { Product } from "../models/product.model";
import { Variant } from "../models/variant.model";
import { inventoryService } from "./inventory.service";
import { SalesReport } from "../models/analytics.model";
import { customerService } from "./customer.service";
import { Attribute } from "../models/attribute.model";

export interface CreateOrderPayload {
  order_number?: string;
  customerId?: string | { _id: string };
  subtotal: number;
  discount?: number;
  discount_Type?: string;
  shipping_charge: number;
  delivery_charge: number;
  shipping_rule_id?: string;
  coupon_code?: string;
  coupon_discount?: number;
  total: number;
  payment_method?: "cod" | "online_payment";
  status:
    | "pending"
    | "on hold"
    | "approved"
    | "processing"
    | "ready to ship"
    | "in-transit"
    | "delivered"
    | "flagged"
    | "cancelled"
    | "incomplete"
    | "Pending"
    | "On Hold"
    | "Approved"
    | "Processing"
    | "Ready To Ship"
    | "In-Transit"
    | "Delivered"
    | "Flagged"
    | "Cancelled";

  sub_status?: string;

  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    note?: string;
  };
  items: {
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    image?: string;
    quantity: number;
    price: number;
    total: number;
    selectedAttributes?: {
      attributeId: string;
      name?: string;
      slug?: string;
      value: string;
      unit?: string;
    }[];
  }[];
  dates: {
    created: Date;
    shipping: Date;
    processing?: Date;
    ready_to_ship?: Date;
    on_hold?: Date;
    in_transit?: Date;
    approved?: Date;
    cancelled?: Date;
    Delivered?: Date;
    PendingReturn?: Date; //for flagged orders
  };
  payment: {
    sales: number;
    paid: number;
    due: number;
    currency: string;
  };
  notes?: string[];
  followUpDate?: string;
  additional_notes?: string[];
  internalNotes?: string;
  cancelReason?: string;
  courier?: any;
  pickupAddress: any;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload, ip: string) {
    if (!payload.items || !payload.items.length)
      throw new ApiError(400, "Order must have items");
    console.log(payload);
    // 1. Handle Customer (Find or Create)
    console.log(payload);
    let customerId =
      payload?.customerId && typeof payload.customerId === "object"
        ? payload.customerId._id
        : payload.customerId;

    if (customerId && typeof customerId !== "string") {
      customerId = customerId.toString();
    }

    if (!customerId && payload.status !== "incomplete") {
      if (!payload?.shipping_address?.phone) {
        throw new ApiError(
          400,
          "Customer ID or shipping phone number is required",
        );
      }
      const customer = await customerService.findOrCreateByPhone({
        full_name: payload?.shipping_address?.full_name,
        phone: payload?.shipping_address?.phone,
        address: payload?.shipping_address?.address,
        city: payload?.shipping_address?.city,
      });
      customerId = customer._id.toString();
    }
    if (payload.status !== "incomplete") {
      if (!customerId || !Types.ObjectId.isValid(customerId))
        throw new ApiError(400, "Invalid customer id");

      const customer = await Customer.findById(customerId).lean();
      if (!customer) throw new ApiError(404, "Customer not found");

      if (customer.isBlocked) throw new ApiError(403, "Customer is Blocked!");
    }
    // 2. Pre-validate stock and items
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of payload.items) {
      if (!Types.ObjectId.isValid(item.productId))
        throw new ApiError(400, `Invalid product id: ${item.productId}`);

      // Get real-time stock and product info
      const product = await Product.findById(item.productId).lean();
      if (!product)
        throw new ApiError(404, `Product not found: ${item.productId}`);

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
        if (!Types.ObjectId.isValid(selectedVariantId))
          throw new ApiError(400, `Invalid variant id: ${selectedVariantId}`);
        const variant = await Variant.findById(selectedVariantId).lean();
        if (!variant)
          throw new ApiError(404, `Variant not found: ${item.variantId}`);

        unitPrice = variant.sale_price ?? variant.regular_price ?? 0;
        
        // Re-apply discount if it looks like we only have regular_price
        if (unitPrice === variant.regular_price && unitPrice !== 0) {
          if (variant.discount_type === "percentage") {
            unitPrice = Math.max(0, unitPrice - (unitPrice * variant.discount) / 100);
          } else if (variant.discount_type === "flat") {
            unitPrice = Math.max(0, unitPrice - variant.discount);
          }
        }

        sku = variant.sku || sku;
        thumbnail = variant.image || thumbnail;
        availableStock = variant.stock;
      } else {
        // Already set above: unitPrice = product.sale_price ?? product.regular_price ?? 0;
        if (unitPrice === product.regular_price && unitPrice !== 0) {
          if (product.discount_type === "percentage") {
            unitPrice = Math.max(0, unitPrice - (unitPrice * product.discount) / 100);
          } else if (product.discount_type === "flat") {
            unitPrice = Math.max(0, unitPrice - product.discount);
          }
        }
      }

      // Check stock
      if (availableStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${name}. Available: ${availableStock}`,
        );
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      // 3. Handle attributes (ensure names and units are present)
      let selectedAttributes = item.selectedAttributes || [];
      
      // If no selected attributes provided (base product), try to pull from product model
      if ((!selectedAttributes || selectedAttributes.length === 0) && !selectedVariantId) {
        selectedAttributes = (product.productAttributes || []).map((pa: any) => ({
          attributeId: pa.attributeId,
          value: pa.value
        }));
      }

      if (selectedAttributes.length > 0) {
        const populatedAttributes = [];
        for (const attr of selectedAttributes) {
          if (attr.name && attr.unit) {
            populatedAttributes.push(attr);
            continue;
          }

          // Fetch attribute definition if name/unit is missing
          const attrDef = await Attribute.findById(attr.attributeId).lean();
          populatedAttributes.push({
            attributeId: attr.attributeId,
            name: attr.name || attrDef?.name || "Unknown",
            slug: attrDef?.slug,
            value: attr.value,
            unit: attr.unit || attrDef?.unit || ""
          });
        }
        selectedAttributes = populatedAttributes;
      }

      validatedItems.push({
        productId: item.productId,
        variantId: selectedVariantId,
        name,
        sku,
        image: thumbnail,
        quantity: item.quantity,
        price: unitPrice,
        total: itemTotal,
        selectedAttributes,
      });
    }

    // 3. Final Calculations
    const shippingCharge = Math.max(
      0,
      payload.shipping_charge ?? payload.delivery_charge,
    );
    const couponDiscount = Math.max(0, payload.coupon_discount || 0);
    const manualDiscount = Math.max(0, payload.discount || 0);

    const finalTotal = Math.max(
      0,
      calculatedSubtotal + shippingCharge - couponDiscount - manualDiscount,
    );

    const orderNumber = payload.order_number || `ORD-${Date.now()}`;

    const order = await Order.create({
      order_number: orderNumber,
      customerId: customerId as string,
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

    return resolveImageUrls(order, ["items.image"]);
  },

  async listOrders(filters: any = {}) {
    const orders = await Order.find({ ...filters, status: { $ne: "incomplete" } })
      .populate("customerId", "full_name phone email")
      .populate("items.productId", "name slug thumbnail")
      .populate("items.variantId")
      .sort({ created_at: -1 })
      .lean();
    return resolveImageUrls(orders, ["items.image", "items.productId.thumbnail"]);
  },
  async listIncompleteOrders(filters: any = {}) {
    const orders = await Order.find({ ...filters, status: "incomplete" })
      .populate("customerId", "full_name phone email")
      .populate("items.productId", "name slug thumbnail")
      .populate("items.variantId")
      .sort({ created_at: -1 })
      .lean();
    return resolveImageUrls(orders, ["items.image", "items.productId.thumbnail"]);
  },

  async listMyOrders(customerId: string) {
    if (!Types.ObjectId.isValid(customerId))
      throw new ApiError(400, "Invalid customer id");
    const orders = await Order.find({ customerId })
      .populate("items.productId", "name slug thumbnail")
      .sort({ created_at: -1 })
      .lean();
    return resolveImageUrls(orders, ["items.image", "items.productId.thumbnail"]);
  },

  async getOrderById(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid order id");
    const order = await Order.findById(id)
      .populate("customerId", "full_name phone email")
      .populate("items.productId", "name slug thumbnail")
      .populate("items.variantId")
      .lean();
    if (!order) throw new ApiError(404, "Order not found");
    return resolveImageUrls(order, ["items.image", "items.productId.thumbnail"]);
  },

  async updateOrder(
    id: string,
    payload: Partial<CreateOrderPayload & { status?: string }>,
  ) {
    console.log(payload);
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid order id");
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");

    const prevStatus = order.status;

    // Recompute totals if items/financials changed
    if (
      payload.items ||
      typeof payload.discount !== "undefined" ||
      typeof payload.delivery_charge !== "undefined" ||
      typeof payload.coupon_discount !== "undefined"
    ) {
      const items = payload.items || (order.toObject() as any).items;

      let subtotal = 0;
      const recomputedItems = [] as any[];

      for (const item of items) {
        // Fetch fresh product/variant data for price truth
        const product = await Product.findById(item.productId).lean();
        if (!product)
          throw new ApiError(404, `Product not found: ${item.productId}`);

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

      const shippingCharge =
        payload.shipping_charge ??
        payload.delivery_charge ??
        (order as any).shipping_charge ??
        0;
      const couponDiscount =
        payload.coupon_discount ?? (order as any).coupon_discount ?? 0;
      const manualDiscount = payload.discount ?? (order as any).discount ?? 0;

      const finalTotal = Math.max(
        0,
        subtotal + shippingCharge - couponDiscount - manualDiscount,
      );

      (order as any).items = recomputedItems;
      (order as any).subtotal = subtotal;
      (order as any).discount = manualDiscount;
      (order as any).shipping_charge = shippingCharge;
      (order as any).coupon_discount = couponDiscount;
      (order as any).total = finalTotal;
      
      if (order.payment) {
        order.payment.sales = finalTotal;
        order.payment.due = finalTotal - (order.payment.paid || 0);
        order.markModified('payment');
      }
    }

    if (payload.shipping_address)
      order.shipping_address = payload.shipping_address as any;
    if (payload.payment_method) order.payment_method = payload.payment_method;
    if (payload.status) order.status = payload.status as any;
    if (payload.shipping_rule_id)
      (order as any).shipping_rule_id = payload.shipping_rule_id;
    if (payload.coupon_code) (order as any).coupon_code = payload.coupon_code;
    if (payload.payment) order.payment = payload.payment as any;
    if (payload.notes) order.notes = payload.notes as any;
    if (payload.discount_Type) order.discount_Type = payload.discount_Type;
    if (payload.sub_status !== undefined) {
      if (payload.sub_status === "" || payload.status === "In-Transit") {
        order.sub_status = null;
      } else {
        order.sub_status = payload.sub_status;
      }
    }
    if (payload.courier) order.courier = payload.courier;
    if (payload.followUpDate !== undefined) {
      if (payload.followUpDate === "") {
        order.followUpDate = null;
      } else {
        order.followUpDate = new Date(payload.followUpDate);
      }
    }
    if (payload.dates?.shipping)
      order.dates.shipping = new Date(payload.dates.shipping) as any;
    if (payload.internalNotes) {
      (order as any).notes.push(payload.internalNotes);
    }

    await order.save();

    //  Handle inventory adjustments and sales reporting on status transitions
    const newStatus = order.status;
    if (newStatus !== prevStatus) {
      const now = new Date();

      if (!order.dates) {
        order.dates = {} as any;
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
      if (
        (newStatus === "in-transit" || newStatus === "delivered") &&
        prevStatus === "pending"
      ) {
        for (const item of (order as any).items) {
          await inventoryService.updateStock(
            item.productId.toString(),
            item.variantId?.toString() || null,
            -item.quantity,
          );
        }
        // Write sales report rows
        await SalesReport.insertMany(
          (order as any).items.map((it: any) => ({
            orderId: order._id,
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            total_price: it.total,
          })),
        );
      }
      // On cancel from confirmed/processing: restock
      if (
        newStatus === "cancelled" &&
        (prevStatus === "in-transit" || prevStatus === "delivered")
      ) {
        for (const item of (order as any).items) {
          await inventoryService.updateStock(
            item.productId.toString(),
            item.variantId?.toString() || null,
            item.quantity,
          );
        }
      }
    }

    return resolveImageUrls(order, ["items.image"]);
  },

  async deleteOrder(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid order id");
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Order not found");
    return deleted;
  },

  async deleteOrderMany(ids: string[]) {
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid order ids: ${invalidIds.join(", ")}`);
    const orders = await Order.find({ _id: { $in: ids } });
    if (!orders.length)
      throw new ApiError(404, "No products found for the given IDs");
    const orderIds = orders.map((o) => o._id);
    // Delete orders
    const result = await Order.deleteMany({ _id: { $in: orderIds } });
    return result;
  },
  async updateCourierInfo(id: string, courierData: ICourierInfo) {
    return Order.findByIdAndUpdate(
      id,
      {
        courier: courierData,
        status: "In-Transit",
      },
      { new: true },
    );
  },
  async updateCourierstatus(id: string, status: string) {
    return Order.findByIdAndUpdate(
      id,
      {
        "courier.status": status,
      },
      { new: true },
    );
  },
  async getOrdersByIds(ids: string[]) {
    return Order.find({
      _id: { $in: ids },
      status: { $nin: ["cancelled", "shipped"] },
    });
  },
};

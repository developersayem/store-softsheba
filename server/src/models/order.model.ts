import mongoose, { Schema, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IOrderItemAttribute {
  attributeId: mongoose.Types.ObjectId;
  name: string;
  value: string;
  unit?: string;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  selectedAttributes?: IOrderItemAttribute[];
}

export interface IShippingAddress {
  full_name: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  note?: string;
}

export interface IOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  order_number: string;
  customerId: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  discount_Type?: string;
  shipping_charge: number;
  shipping_rule_id?: mongoose.Types.ObjectId;
  coupon_code?: string;
  coupon_discount?: number;
  total: number;
  payment_method: "cod" | "online_payment";
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
  shipping_address: IShippingAddress;
  items: IOrderItem[];
  ip: string;
  isIpBlocked: boolean;
  dates: {
    created: Date;
    shipping: Date;
    approved?: Date;
    processing?: Date;
    ready_to_ship?: Date;
    on_hold?: Date;
    in_transit?:Date;
    cancelled?: Date;
    Delivered?: Date;
    flagged?: Date;
    PendingReturn?: Date;
  };
  payment: {
    sales: number;
    paid: number;
    due: number;
    currency: string;
  };
  notes?: string[];
  additional_notes?: string[];
  followUpDate?: Date | null;
  sub_status?: string | null;
  created_at: Date;
  updated_at: Date;
  courier: ICourierInfo;
}

export interface ICourierInfo {
  isCourierAssigned: Boolean;
  name: String;
  invoiceId: String;
  consignmentId: String;

  trackingCode: String;
  tracking_url: String;
  status: String;

  weight?: number;
  city_id?: string;
  zone_id?: string;
  area_id?: string;

  delivery_type?: number;
  product_type?: number;
  recipient_secendary_phone?: string;
  is_closed_box?: boolean;
  is_exchange?: boolean;

  sent_at?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
  name: { type: String, required: true },
  sku: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  selectedAttributes: [
    {
      attributeId: { type: Schema.Types.ObjectId, ref: "Attribute" },
      name: String,
      value: String,
      unit: String,
      _id: false,
    },
  ],
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: String,
  state: String,
  postal_code: String,
  note: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    order_number: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discount_Type: { type: String },
    shipping_charge: { type: Number, required: true, default: 0 },
    shipping_rule_id: { type: Schema.Types.ObjectId, ref: "ShippingRule" },
    coupon_code: { type: String },
    coupon_discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment_method: {
      type: String,
      enum: ["cod", "online_payment"],
      default: "cod",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "on hold",
        "approved",
        "processing",
        "ready to ship",
        "in-transit",
        "delivered",
        "flagged",
        "cancelled",
        "incomplete",
        "Pending",
        "On Hold",
        "Approved",
        "Processing",
        "Ready To Ship",
        "In-Transit",
        "Delivered",
        "Flagged",
        "Cancelled",
        "Incomplete",
      ],
      default: "pending",
    },
    shipping_address: { type: ShippingAddressSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    payment: {
      sales: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      due: { type: Number, default: 0 },
      currency: { type: String, default: "BDT" },
    },
    dates: {
      created: { type: Date, default: Date.now },
      shipping: { type: Date, default: Date.now },
      processing: { type: Date },
      ready_to_ship: { type: Date },
      on_hold: { type: Date },
      approved: { type: Date },
      flagged: { type: Date },
      cancelled: { type: Date },
      in_transit: { type: Date },
      Delivered: { type: Date },
      PendingReturn: { type: Date },
    },
    courier: {
      isCourierAssigned: { type: Boolean, default: false },
      name: {
        type: String,
        enum: ["steadfast", "pathao", "carrybee"],
      },
      invoiceId: {
        type: String,
        index: true,
      },
      consignmentId: {
        type: String,
        index: true,
      },
      trackingCode: {
        type: String,
        index: true,
      },
      tracking_url: String,
      status: {
        type: String,
      },
      weight: Number,
      city_id: String,
      zone_id: String,
      area_id: String,
      delivery_type: Number,
      product_type: Number,
      recipient_secendary_phone: String,
      is_closed_box: { type: Boolean, default: false },
      is_exchange: { type: Boolean, default: false },
      sent_at: Date,
    },
    ip: { type: String, required: true },
    isIpBlocked: {
      type: Boolean,
      default: false,
    },
    notes: [{ type: String }],
    additional_notes: [{ type: String }],
    followUpDate: { type: Date, default: null },
    sub_status: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

OrderSchema.plugin(storeIsolationPlugin);

OrderSchema.index({ storeId: 1 });
OrderSchema.index({ storeId: 1, order_number: 1 }, { unique: true });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

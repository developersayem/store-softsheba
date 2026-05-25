import {
  ICustomer,
  IOrderItem,
  IShippingAddress,
  PaymentMethod,
} from "@/types/order.type";

export type OrderStatus =
  | "All Orders"
  | "Pending"
  | "On Hold"
  | "Approved"
  | "Processing"
  | "Ready To Ship"
  | "In-Transit"
  | "Delivered"
  | "Flagged"
  | "Cancelled"
  | "Incomplete";

export interface Order {
  _id?: string;
  order_number: string;
  dates: {
    created?: string;
    shipping?: string;
    approved?: string;
    processing?: string;
    ready_to_ship?: string;
    on_hold?: string;
    in_transit?: string;
    cancelled?: string;
    Delivered?: string;
    flagged?: string;
    PendingReturn?: string;
  };
  customerId: ICustomer;
  pickupAddress: {
    type: "Warehouse";
    location: "Pickup";
  };
  payment: {
    sales: number;
    paid: number;
    due: number;
    currency: string;
  };
  subtotal?: number;
  discount?: number;
  courier?: ICourierInfo;
  shipping_charge?: number;
  shipping_rule_id?: string;
  coupon_code?: string;
  coupon_discount?: number;
  delivery_charge?: number;
  total?: number;
  payment_method?: PaymentMethod;
  status?: OrderStatus;
  shipping_address?: IShippingAddress;
  delivery_Type?: string;
  discount_Type?: string;
  items?: IOrderItem[];
  notes?: string[];
  additional_notes?: string[];
  internalNotes?: string;
  followUpDate?: string;
  sub_status?: string;
  created_at?: string;
  isIpBlocked?: boolean;
}
export interface ICourierInfo {
  name: string;
  invoiceId?: string;
  consignmentId?: string;
  trackingCode?: string;
  tracking_url?: string;
  status?: string;
  sent_at?: Date;
  city_id?: string;
  zone_id?: string;
  area_id?: string;
  weight?: number;
  delivery_type?: number;
  product_type?: number;
  recipient_secendary_phone?: string;
  is_closed_box?: boolean;
  is_exchange?: boolean;
}

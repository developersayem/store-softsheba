"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Order } from "@/components/dashboard/order/data";
import OrderCheckoutForm, {
  Customer,
  ICheckout,
} from "@/components/dashboard/order/OrderCheckoutForm";
import OrderCheckoutPage from "@/components/dashboard/order/orderCheckoutSummary";
import {
  Info,
  Trash2,
  Plus,
  Minus,
  SlidersHorizontal,
  ShoppingCart,
  X,
  Loader2,
  PencilIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddCustomerDialog from "@/components/dashboard/shared/addCustomerDialog";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { IProduct } from "@/types/product.type";
import CreateOrderProductCard from "@/components/dashboard/order/createOrderProductCard";
import { IVariant } from "@/types/variant.type";
import { useSearchParams } from "next/navigation";
import { IOrder, IOrderItem } from "@/types/order.type";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import EditCustomerDialog from "@/components/dashboard/shared/editCustomerDialog";
import { Input } from "@/components/ui/input";

type DiscountType = "flat" | "percent";

interface Discount {
  type: DiscountType;
  value: number;
}

interface CartItem {
  _id: string; // productId
  variantId?: string; // OPTIONAL
  sku: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  attributes?: {
    name: string;
    value: string;
    unit?: string;
  }[];
  weight?: number;
  discount: Discount;
}

export default function OrderCreate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [checkoutStep, setCheckoutStep] = useState<
    "order" | "cart" | "checkout-form" | "checkout-page"
  >("cart");
  const [orderCheckoutStep, setOrderCheckoutStep] = useState<
    "order" | "checkout-page"
  >("order");
  const [activeDiscountId, setActiveDiscountId] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [tempDiscount, setTempDiscount] = useState<Discount>({
    type: "flat",
    value: 0,
  });
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [checkoutData, setCheckoutData] = useState<ICheckout | null>(null);
  const [customerSearch, setCustomerSearch] = useState(
    selectedCustomer?.phone ?? "",
  );
  const [customerDropdown, setCustomerDropdown] = useState(false);

  const { data: cdata, mutate } = useSWR("/customers", fetcher);
  //console.log(cdata?.data);
  const customerData = useMemo(() => cdata?.data ?? [], [cdata]);

  const { data: products } = useSWR("/products", fetcher);
  //console.log(products?.data);
  const productData: IProduct[] = useMemo(
    () => products?.data ?? [],
    [products],
  );

  const handleCheckoutSubmit = (data: ICheckout) => {
    const order = buildOrderPayload(data);
    setDraftOrder(order);
    setOrderCheckoutStep("checkout-page");
  };

  //console.log(draftOrder);
  //console.log(checkoutData);

  const addToCart = (product: IProduct, variant?: IVariant) => {
    setCart((prev) => {
      const productId = product._id;
      const variantId = variant?._id;

      const existing = prev.find(
        (item) => item._id === productId && item.variantId === variantId,
      );

      if (existing) {
        return prev.map((item) =>
          item._id === productId && item.variantId === variantId
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }

      const price = variant
        ? (variant.sale_price ?? variant.regular_price ?? 0)
        : (product.sale_price ?? product.regular_price ?? 0);

      return [
        ...prev,
        {
          _id: productId,
          variantId,
          sku: variant?.sku ?? product.sku ?? "",
          name: product.name,
          price, // ✅ FIXED
          qty: 1,
          attributes: variant?.attributes ?? product.productAttributes,
          image: variant?.image ?? product.thumbnail ?? "",
          weight: product.weight,
          discount: { type: "flat", value: 0 },
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number, variantId?: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === productId && item.variantId === variantId
            ? { ...item, qty: item.qty + delta }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const openDiscountPanel = (item: CartItem) => {
    setActiveDiscountId(item._id);
    setTempDiscount(item.discount || { type: "flat", value: 0 });
  };

  const applyDiscount = () => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === activeDiscountId
          ? { ...item, discount: tempDiscount }
          : item,
      ),
    );
    setActiveDiscountId(null);
  };

  const calculateLineTotal = (item: CartItem) => {
    const base = item.price * item.qty;
    let discountAmount = 0;

    if (item.discount.type === "flat") {
      discountAmount = item.discount.value;
    } else {
      discountAmount = base * (item.discount.value / 100);
    }

    return Math.max(0, base - discountAmount);
  };

  const grandTotal = cart?.reduce(
    (acc, item) => acc + calculateLineTotal(item),
    0,
  );

  const filteredProducts = productData.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredCustomers = customerData.filter(
    (c: Customer) =>
      c.phone.includes(customerSearch) ||
      c.full_name.toLowerCase().includes(customerSearch?.toLowerCase()) ||
      c.address?.toLowerCase().includes(customerSearch?.toLowerCase()),
  );

  const buildOrderPayload = (checkoutData: ICheckout): Order => {
    if (!selectedCustomer) {
      throw new Error("Please select a customer before creating an order");
    }

    const subtotal = cart.reduce((acc, item) => {
      const base = item.price * item.qty;

      const discount =
        item.discount.type === "flat"
          ? item.discount.value
          : base * (item.discount.value / 100);

      return acc + Math.max(0, base - discount);
    }, 0);
    const discountAmount =
      checkoutData?.discountType === "percent"
        ? (grandTotal * checkoutData?.discount) / 100
        : (checkoutData?.discount ?? 0);
    const delivery_charge = checkoutData?.deliveryFee ?? 0;
    const coupon_discount = checkoutData?.discount ?? 0;
    const paid = checkoutData?.advanceAmount || 0;

    return {
      customerId: {
        _id: selectedCustomer._id,
        full_name: selectedCustomer.full_name,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
        isBlocked: false,
      },
      order_number: `ORD-${Date.now()}`,

      dates: {
        shipping: checkoutData?.shippingDate
          ? new Date(checkoutData.shippingDate).toISOString()
          : "",
      },

      pickupAddress: {
        type: "Warehouse",
        location: "Pickup",
      },

      payment: {
        sales: grandTotal,
        paid: checkoutData?.advanceAmount ?? 0,
        due: grandTotal - discountAmount + delivery_charge - paid,
        currency: "BDT",
      },
      discount_Type: checkoutData?.discountType,

      subtotal,
      discount: coupon_discount,
      delivery_charge,
      delivery_Type: checkoutData?.deliveryType,
      total: subtotal + delivery_charge - coupon_discount,

      payment_method: checkoutData?.paymentMethod || "cod",
      status: "Pending",
      notes: [checkoutData?.notes ?? ""],
      internalNotes: checkoutData?.internalNotes,

      shipping_address: {
        full_name: checkoutData?.name,
        phone: checkoutData?.phone,
        address: checkoutData?.deliveryAddress ?? "",
      },

      courier: checkoutData?.courier
        ? {
            name: checkoutData.courier,
            city_id: checkoutData.carrybeeCity,
            zone_id: checkoutData.carrybeeZone,
            area_id: checkoutData.carrybeeArea,
            weight: checkoutData.weight,
            recipient_secendary_phone: checkoutData.carrybeeSecondaryPhone,
            is_closed_box: checkoutData.isClosedBox,
            is_exchange: checkoutData.isExchange,
          }
        : undefined,

      items: cart.map((item) => ({
        image: item.image,
        productId: item._id.toString(),
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        total: item.price * item.qty,
        price: item.price,
        quantity: item.qty,
        selectedAttributes: item.attributes,
        discount: item.discount.value,
      })),
    };
  };

  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const isEditMode = Boolean(orderId);
  const { data: orderRes } = useSWR(
    orderId ? `/orders/${orderId}` : null,
    fetcher,
  );

  const existingOrder: Order = useMemo(() => orderRes?.data ?? [], [orderRes]);
  //console.log(existingOrder);
  const buildCartItemFromOrderItem = (item: IOrderItem): CartItem => {
    const productId =
      typeof item.productId === "string"
        ? item.productId
        : (item.productId?._id ?? "");
    const variantId =
      typeof item.variantId === "string" ? item.variantId : item.variantId?._id;

    return {
      _id: productId,
      variantId,
      sku: item.sku ?? "",
      name: item.name,
      price: item.price,
      qty: item.quantity,
      image: item.image ?? "",
      attributes: item.selectedAttributes,
      discount: {
        type: "flat",
        value: item?.discount ?? 0,
      },
    };
  };
  const toDateInputValue = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!existingOrder) return;
    const customer = customerData.find(
      (c: Customer) => c?._id === existingOrder?.customerId?._id,
    );

    // Customer
    setSelectedCustomer(customer);
    setCustomerSearch(customer?.phone);
    setCart(existingOrder?.items?.map(buildCartItemFromOrderItem) ?? []);

    // Checkout data
    setCheckoutData({
      name: existingOrder?.shipping_address?.full_name ?? "",
      phone: existingOrder?.shipping_address?.phone ?? "",
      deliveryAddress: existingOrder?.shipping_address?.address ?? "",

      deliveryFee: existingOrder?.shipping_charge ?? 0,
      discount: existingOrder?.discount ?? 0,

      discountType:
        existingOrder?.discount_Type === "percent" ? "percent" : "flat",

      paymentMethod:
        existingOrder?.payment_method === "online_payment"
          ? "online_payment"
          : "cod",

      advanceAmount: existingOrder?.payment?.paid ?? 0,

      courier: existingOrder?.courier?.name ?? "",

      notes: existingOrder?.notes?.[0] ?? "",
      internalNotes: existingOrder?.internalNotes ?? "",

      deliveryType: existingOrder?.delivery_Type ?? "regular",
      shippingDate: toDateInputValue(existingOrder?.dates?.shipping),

      isFreeDelivery: existingOrder?.shipping_charge === 0,
      isClosedBox: existingOrder?.courier?.is_closed_box ?? false,
      isExchange: existingOrder?.courier?.is_exchange ?? false,
      weight: existingOrder?.courier?.weight ?? 500,
    });
  }, [existingOrder, customerData]);

  const { data: customerRes, isLoading } = useSWR(
    selectedCustomer?._id ? `/customers/${selectedCustomer._id}` : null,
    fetcher,
  );

  const selectedcustomerData = useMemo(() => customerRes?.data, [customerRes]);
  const filteredOrders =
    selectedcustomerData?.orders?.filter((o: IOrder) => {
      const status = (o.status || "").toLowerCase();
      return ["delivered", "flagged", "cancelled"].includes(status);
    }) || [];

  const isOngoingOrder = !["delivered", "flagged", "cancelled"].includes(
    (existingOrder?.status || "").toLowerCase(),
  );
  return (
    <div>
      {orderCheckoutStep === "order" && (
        <div className="min-h-screen flex flex-col bg-accent/50 font-sans text-sm  overflow-hidden">
          {/* Header */}
          <div className="bg-accent px-4 py-3 shadow-sm z-10">
            <h1 className="text-xl font-bold">
              {isEditMode ? "Edit Sales Order" : "Create Sales Order"}
            </h1>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
            {/* ================= LEFT COLUMN: CUSTOMER INFO (Scrollable) ================= */}
            <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-2 pb-20 custom-scrollbar">
              <div className="flex gap-2">
                <Popover
                  open={customerDropdown}
                  onOpenChange={setCustomerDropdown}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start">
                      {customerSearch || "Search Customer"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search phone or name"
                        value={customerSearch}
                        onValueChange={setCustomerSearch}
                      />

                      {filteredCustomers.length === 0 && (
                        <CommandEmpty className="py-6 text-center text-muted-foreground">
                          <p className="text-xs mb-2">No customer found</p>
                          <AddCustomerDialog
                            mutateCustomersData={mutate}
                            initialPhone={
                              /^\d+$/.test(customerSearch) ? customerSearch : ""
                            }
                            initialName={
                              /^\d+$/.test(customerSearch) ? "" : customerSearch
                            }
                            trigger={
                              <Button
                                variant="link"
                                className="text-teal-600 p-0 h-auto text-xs"
                              >
                                Add &quot;{customerSearch}&quot; as new customer
                              </Button>
                            }
                          />
                        </CommandEmpty>
                      )}

                      <CommandGroup>
                        {filteredCustomers.map((customer: Customer) => (
                          <CommandItem
                            key={customer._id}
                            onSelect={() => {
                              setSelectedCustomer(customer);
                              setCustomerSearch(customer.phone);
                              setCustomerDropdown(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span>
                                {customer.full_name} ({customer.phone})
                              </span>
                              {customer.address && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {customer.address}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <AddCustomerDialog
                  mutateCustomersData={mutate}
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>

              {/* ONGOING ORDERS SECTION */}
              {isOngoingOrder && (
                <div className="mt-3 rounded-md border-none p-3 bg-[#fefcf8] dark:bg-amber-950/10">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                      Ongoing Orders
                    </span>
                    <Badge className="bg-[#f2b962] hover:bg-[#f2b962] text-black dark:bg-amber-600 dark:hover:bg-amber-600 dark:text-white rounded-sm px-2 text-[10px] font-bold">
                      1
                    </Badge>
                    {/* Small Bar Animation */}
                    <div className="flex items-end gap-[2px] h-3.5 ml-1 overflow-hidden">
                      <style>{`
                      @keyframes eq-play {
                        0%, 100% { transform: scaleY(0.3); }
                        50% { transform: scaleY(1); }
                      }
                    `}</style>
                      <div
                        className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                        style={{ animation: "eq-play 1s infinite ease-in-out" }}
                      />
                      <div
                        className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                        style={{
                          animation: "eq-play 0.8s infinite ease-in-out 0.2s",
                        }}
                      />
                      <div
                        className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                        style={{
                          animation: "eq-play 1.2s infinite ease-in-out 0.4s",
                        }}
                      />
                      <div
                        className="w-[2px] h-3.5 bg-gray-600 dark:bg-gray-400 origin-bottom"
                        style={{
                          animation: "eq-play 0.9s infinite ease-in-out 0.1s",
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-popover p-2.5 rounded   flex justify-between items-center text-[11px]">
                      <div>
                        <div className="flex items-center gap-1.5 font-medium mb-1.5">
                          <span className="text-[#3a8b9e] dark:text-cyan-400">
                            {existingOrder.order_number}
                          </span>
                          <div className="bg-[#3f6371] dark:bg-slate-700 text-white rounded-full p-[2px]">
                            <Info className="h-2.5 w-2.5" />
                          </div>
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          BDT {Number(existingOrder.subtotal || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-[#fef4e8] hover:bg-[#fef4e8] text-[#f2a550] dark:bg-orange-950/40 dark:hover:bg-orange-950/40 dark:text-orange-400 rounded px-2 mb-1.5 border-none font-medium capitalize"
                        >
                          {existingOrder.status}
                        </Badge>
                        <p className="text-muted-foreground flex items-center justify-end gap-1">
                          {new Date(
                            existingOrder?.created_at ?? "",
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <Info className="h-3 w-3" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCustomer && (
                <div>
                  {/* Customer Details */}
                  <div className="bg-accent flex items-start justify-between p-4 rounded shadow-sm relative">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500">
                          Customer Name
                        </label>
                        <div className="font-medium">
                          {selectedCustomer.full_name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          Mobile Number
                        </label>
                        <div className="font-medium">
                          {selectedCustomer.phone}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          Address
                        </label>
                        <div className="font-medium">
                          {selectedCustomer.address}
                        </div>
                      </div>
                    </div>
                    <EditCustomerDialog
                      id={selectedCustomer._id}
                      mutateCustomersData={mutate}
                      onUpdate={(updated) => {
                        setSelectedCustomer({
                          _id: updated._id,
                          full_name: updated.full_name,
                          phone: updated.phone,
                          address: updated.address || "",
                        });
                        setCheckoutData((prev) =>
                          prev
                            ? {
                                ...prev,
                                name: updated.full_name,
                                phone: updated.phone,
                                deliveryAddress: updated.address || "",
                              }
                            : null,
                        );
                      }}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-accent dark:text-white"
                        >
                          <PencilIcon className="h-4 w-4 " />
                          Edit
                        </Button>
                      }
                    />
                  </div>

                  {/* Order History */}
                  {isLoading ? (
                    <div className="flex h-32 items-center justify-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading order history...</span>
                    </div>
                  ) : (
                    <div className="bg-accent p-4 rounded shadow-sm mt-4">
                      <div className="flex gap-2 mb-4 border-b pb-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Order History
                        </span>
                        <span className="bg-gray-200 dark:bg-black/20 dark:text-gray-300 px-1.5 rounded text-xs py-0.5">
                          {selectedcustomerData?.totalOrders}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {/* Order Item */}
                        {filteredOrders.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground italic">
                            No Orders
                          </div>
                        ) : (
                          filteredOrders.map((o: IOrder) => (
                            <div
                              key={o.order_number}
                              className="flex justify-between items-start text-[11px]"
                            >
                              <div>
                                <div className="flex items-center gap-1 font-medium">
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {o.order_number}
                                  </span>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                  BDT {o.subtotal}
                                </p>
                              </div>

                              <div className="text-right">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    o?.status?.toLowerCase() === "delivered"
                                      ? "bg-green-100  text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {o.status}
                                </Badge>
                                <p className="text-muted-foreground mt-0.5">
                                  {new Date(o?.created_at ?? "").toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ================= MIDDLE COLUMN: PRODUCT SEARCH ================= */}
            <div className="lg:col-span-5 flex flex-col gap-4 ">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 rounded bg-accent shadow-sm border-0 focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <button className="bg-accent p-3 rounded shadow-sm hover:bg-gray-50 text-gray-600">
                  <SlidersHorizontal size={20} />
                </button>
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar space-y-3">
                {filteredProducts.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    No products found.
                  </div>
                )}

                {filteredProducts.map((product) => {
                  // Check if product is in cart to determine button state
                  const cartItem = cart?.find((c) => c._id === product._id);
                  const qtyInCart = cartItem ? cartItem.qty : 0;

                  return (
                    <CreateOrderProductCard
                      key={product._id}
                      product={product}
                      qtyInCart={qtyInCart}
                      addToCart={addToCart}
                      updateQty={updateQty}
                    />
                  );
                })}
              </div>
            </div>

            {/* ================= RIGHT COLUMN: CART ================= */}
            {checkoutStep === "cart" && (
              <div className="lg:col-span-4 h-fit flex flex-col bg-accent rounded shadow-sm border ">
                <div className="p-4 border-b bg-accent/50">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    Cart{" "}
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {cart?.length}
                    </span>
                  </h2>
                </div>

                <div className=" p-4 space-y-4 ">
                  {cart?.length === 0 && (
                    <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                      <ShoppingCart size={40} className="mb-2 opacity-20" />
                      <p>Cart is empty</p>
                    </div>
                  )}

                  {cart?.map((item) => {
                    const lineTotal = calculateLineTotal(item);
                    const isEditingDiscount = activeDiscountId === item._id;
                    const hasDiscount = item.discount.value > 0;
                    //console.log(item);
                    return (
                      <div
                        key={item._id}
                        className="bg-accent p-3 rounded border border-gray-200 shadow-sm relative group"
                      >
                        {/* Header: Img + Title + Price */}
                        <div className="flex gap-2 mb-2">
                          <Image
                            height={100}
                            width={100}
                            src={item.image}
                            className="w-10 h-10 rounded border object-cover"
                            alt="Thumb"
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-medium  line-clamp-1"
                              title={item.name}
                            >
                              {item.name}
                            </div>
                            <div className="text-[10px] text-blue-600">
                              SKU: {item.sku}
                            </div>
                            <div className="font-bold text-sm mt-0.5 flex items-center gap-2">
                              {hasDiscount ? (
                                <>
                                  <span className="text-teal-700">
                                    BDT {lineTotal.toFixed(2)}
                                  </span>
                                  <span className="text-gray-400 line-through text-xs font-normal">
                                    BDT {(item.price * item.qty).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span>BDT {item.price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Weight Badge */}
                        {item.attributes && item.attributes?.length > 0 && (
                          <>
                            <div className="mb-2">
                              <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-medium">
                                {item.attributes
                                  ? `${item.attributes?.[0]?.name} : ${item.attributes?.[0]?.value}`
                                  : ""}
                              </span>
                            </div>

                            {/* Unit Price Display */}
                            <div className="text-xs text-gray-500 mb-2 flex justify-between">
                              <span>Unit Price</span>
                              <span className="font-medium ">
                                BDT {item.price.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Discount Status */}
                        {hasDiscount && !isEditingDiscount && (
                          <div className="mb-3 flex justify-between items-center bg-teal-50 px-2 py-1 rounded border border-teal-100">
                            <span className="text-[10px] text-teal-700 font-medium">
                              {item.discount.type === "flat"
                                ? `BDT ${item.discount.value} Flat Off`
                                : `${item.discount.value}% Off`}
                            </span>
                            <button
                              onClick={() => openDiscountPanel(item)}
                              className="text-[10px] text-teal-600 underline hover:text-teal-800"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Controls Row */}
                        <div className="flex justify-between items-center mt-2">
                          {/* Add Discount Button (Only if not editing) */}
                          {!isEditingDiscount && (
                            <button
                              onClick={() => openDiscountPanel(item)}
                              className={`text-xs px-2 py-1 rounded transition border ${hasDiscount ? "hidden" : "text-teal-600 border-teal-600 hover:bg-teal-50"}`}
                            >
                              Add Discount
                            </button>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center bg-accent border border-gray-300 rounded overflow-hidden h-7">
                              <button
                                onClick={() => updateQty(item._id, -1)}
                                className="px-2 h-full hover:bg-gray-100 border-r border-gray-200"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="text"
                                value={item.qty}
                                className="w-8 text-center text-xs outline-none h-full"
                                readOnly
                              />
                              <button
                                onClick={() => updateQty(item._id, 1)}
                                className="px-2 h-full hover:bg-gray-100 border-l border-gray-200"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-1.5 bg-red-50 text-red-500 rounded border border-red-100 hover:bg-red-100 hover:border-red-200 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* ============ DISCOUNT EDIT PANEL ============ */}
                        {isEditingDiscount && (
                          <div className="mt-3 bg-accent p-3 rounded border border-blue-200 shadow-md animate-in slide-in-from-top-2 z-10">
                            <div className="flex gap-4 mb-3">
                              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                                <input
                                  type="radio"
                                  className="accent-teal-600"
                                  checked={tempDiscount.type === "flat"}
                                  onChange={() =>
                                    setTempDiscount({
                                      ...tempDiscount,
                                      type: "flat",
                                    })
                                  }
                                />
                                <span
                                  className={
                                    tempDiscount.type === "flat"
                                      ? "text-teal-700 font-medium"
                                      : "text-gray-500"
                                  }
                                >
                                  Flat
                                </span>
                              </label>
                              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                                <input
                                  type="radio"
                                  className="accent-teal-600"
                                  checked={tempDiscount.type === "percent"}
                                  onChange={() =>
                                    setTempDiscount({
                                      ...tempDiscount,
                                      type: "percent",
                                    })
                                  }
                                />
                                <span
                                  className={
                                    tempDiscount.type === "percent"
                                      ? "text-teal-700 font-medium"
                                      : "text-gray-500"
                                  }
                                >
                                  Percentage
                                </span>
                              </label>
                            </div>
                            <div className="mb-3">
                              <label className="block text-[10px] text-gray-400 mb-1">
                                Value (
                                {tempDiscount.type === "flat" ? "BDT" : "%"})
                              </label>
                              <Input
                                type="number"
                                value={tempDiscount.value || ""}
                                onChange={(e) =>
                                  setTempDiscount({
                                    ...tempDiscount,
                                    value: Number(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-teal-500 focus:bg-accent transition"
                                autoFocus
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setActiveDiscountId(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 rounded text-xs font-medium transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={applyDiscount}
                                className="bg-teal-600 hover:bg-teal-700 text-white py-1.5 rounded text-xs font-medium transition"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Footer moved inside */}
                  <div className="p-4  bg-accent/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>Items: {cart?.length}</span>
                      <span>
                        Total Qty: {cart?.reduce((a, b) => a + b.qty, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-bold text-white">
                        Grand Total:
                      </span>
                      <span className="text-2xl font-bold text-teal-700">
                        BDT{" "}
                        {grandTotal?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCheckoutStep("checkout-form")}
                        className="px-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded font-bold text-sm shadow-sm transition active:scale-[0.99]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {checkoutStep === "checkout-form" && (
              <div className="lg:col-span-4 h-fit flex flex-col bg-accent rounded shadow-sm border ">
                <OrderCheckoutForm
                  //handleCheckoutSubmit={handleCheckoutSubmit}
                  //setOrderCheckoutStep={setOrderCheckoutStep}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  cartSubtotal={grandTotal}
                  setCheckoutStep={() => setCheckoutStep("cart")}
                  checkoutData={checkoutData}
                  setCheckoutData={setCheckoutData}
                  cart={cart}
                  onSubmitOrder={(data) => {
                    setCheckoutData(data);
                    handleCheckoutSubmit(data);
                    //console.log("Checkout Data:", data);
                    //console.log("Cart Items:", cart);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {orderCheckoutStep === "checkout-page" && (
        <div className="min-h-screen flex flex-col bg-accent/50 font-sans text-sm  overflow-hidden">
          <OrderCheckoutPage
            orderId={orderId}
            isEditMode={isEditMode}
            order={draftOrder}
            onBack={() => setOrderCheckoutStep("order")}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Order } from "./data";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface Props {
  order: Order | null;
  onBack: () => void;
  onPlaceOrder?: () => void;
  isEditMode?: boolean;
  orderId?: string | null;
}

export default function OrderCheckoutPage({
  order,
  onBack,
  isEditMode,
  orderId,
}: Props) {
  //console.log(order);
  const subtotal = order?.subtotal ?? 0;
  const discount = order?.discount ?? 0;
  const discountType = order?.discount_Type;
  const delivery = order?.delivery_charge ?? 0;
  const advance = order?.payment?.paid ?? 0;
  const deliveryType = order?.delivery_Type;
  const due = order?.payment?.due ?? 0;
  const discountAmount =
    discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const router = useRouter();
  //console.log(order);
  const handleCreateOrder = async (status?: string) => {
    const payload = {
      ...order,
      ...(status && { status }), // if status exists, override it
    };
    if (isEditMode) {
      try {
        const res = await api.put(`/orders/${orderId}`, payload);
        //console.log(res);
        if (res.status === 200) {
          router.back();
        }
      } catch (error) {
        console.log(error);
        toast("Order Updation Failed!");
      }
    } else {
      try {
        const res = await api.post("/orders", order);
        //console.log(res);
        if (res.status === 201) {
          router.back();
        }
      } catch (error) {
        console.log(error);
        toast("Order Creation Failed!");
      }
    }
  };

  return (
    <div className="p-6 ">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL */}
        <div className="col-span-4 space-y-4">
          {/* Customer Info */}
          <div className="bg-accent border rounded p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Customer Info</h3>

            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-500 text-xs">Name</span>
                <p className="font-medium">
                  {order?.shipping_address?.full_name}
                </p>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Mobile</span>
                <p className="font-medium">{order?.shipping_address?.phone}</p>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Address</span>
                <p className="font-medium">
                  {order?.shipping_address?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="bg-accent border rounded p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Delivery & Payment</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Type</span>
                <span className="font-medium capitalize">{deliveryType}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium capitalize">
                  {order?.payment_method}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Advance Paid</span>
                <span className="font-medium text-teal-600">
                  BDT {advance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-8 bg-accent border rounded shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Checkout Summary</h2>
          </div>

          {/* ITEMS */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
            {order?.items?.map((item, index) => {
              //console.log(item);

              return (
                <div
                  key={item._id || index}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div className="flex gap-3">
                    <Image
                      height={100}
                      width={100}
                      src={item.image ?? ""}
                      alt="image"
                      className="w-12 h-12 rounded border"
                    />

                    <div className="flex flex-col gap-2">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-end text-gray-400">
                      {item.selectedAttributes &&
                      item.selectedAttributes.length > 0
                        ? `${item.selectedAttributes?.[0]?.name} : ${item.selectedAttributes?.[0]?.value}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400 text-end">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-semibold text-sm">
                      BDT {item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTALS */}
          <div className="p-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>- {discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{delivery.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-teal-600">
              <span>Advance Payment</span>
              <span>- {advance.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{due.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4 border-t flex items-center justify-between gap-3">
            {isEditMode && (
              <Button onClick={() => handleCreateOrder("Approved")}>
                Update & Approve Order
              </Button>
            )}
            {/* ACTION BUTTONS */}
            <div className="p-4  flex justify-end gap-3">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>

              <Button onClick={() => handleCreateOrder()}>
                {isEditMode ? "Update " : "Place "} Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react"; 
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Info, Loader2 } from "lucide-react";
import { Order } from "./data";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { IOrder } from "@/types/order.type";

interface Props {
  order: Order;
}

export function CustomerInfoHoverCard({ order }: Props) {
  const addr = order?.shipping_address;
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useSWR(
    isOpen && order.customerId?._id
      ? `/customers/${order.customerId._id}`
      : null,
    fetcher,
  );

  const customerData = data?.data;
  const filteredOrders =
    customerData?.orders?.filter((o: IOrder) => {
      const status = (o.status || "").toLowerCase();
      return ["delivered", "flagged", "cancelled"].includes(status);
    }) || [];
  const isOngoingOrder = !["delivered", "flagged", "cancelled"].includes(
    (order?.status || "").toLowerCase(),
  );
  return (
    <HoverCard openDelay={120} closeDelay={100} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-500" />
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        align="start"
        className="w-[360px] p-3 text-xs"
      >
        {/* 3. Handle the Loading State */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            {/* CUSTOMER BASIC INFO */}
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground">Customer ID</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      C-{order.customerId?._id}
                    </span>
                    <Badge className="bg-amber-400 text-black text-[10px] px-1.5">
                      NEW
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Customer Name</p>
                <p className="font-medium">{addr?.full_name}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{addr?.phone}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Customer Address</p>
                <p className="leading-tight">{addr?.address}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Map Location</p>
                <p className="leading-tight text-muted-foreground">
                  {addr?.address}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Additional Info</p>
                <p className="text-muted-foreground">N/A</p>
              </div>
            </div>

            {/* DELIVERY SUCCESS RATE (You can map your `customerData` here now) */}
            <div className="mt-3 rounded-md border p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Delivery Success Rate</p>
                <span className="text-sm font-semibold text-muted-foreground">
                  68.18 %
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded bg-muted overflow-hidden mb-2">
                <div className="h-full bg-teal-500" style={{ width: "68%" }} />
              </div>

              <p className="text-[10px] text-muted-foreground">
                Updated at Feb 14, 2026 6:55 AM by Sidrat Khan
              </p>

              {/* Courier table */}
              <table className="w-full text-[10px] mt-3 border">
                <thead className="bg-muted">
                  <tr>
                    <th className="border px-1 py-0.5 text-left">Courier</th>
                    <th className="border px-1 py-0.5">Total</th>
                    <th className="border px-1 py-0.5 text-green-600">
                      Delivered
                    </th>
                    <th className="border px-1 py-0.5 text-red-500">
                      Undelivered
                    </th>
                    <th className="border px-1 py-0.5">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-1 py-0.5">STEADFAST</td>
                    <td className="border px-1 py-0.5 text-center">22</td>
                    <td className="border px-1 py-0.5 text-center">14</td>
                    <td className="border px-1 py-0.5 text-center">8</td>
                    <td className="border px-1 py-0.5 text-center">63.64%</td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5">PATHAO</td>
                    <td className="border px-1 py-0.5 text-center">20</td>
                    <td className="border px-1 py-0.5 text-center">14</td>
                    <td className="border px-1 py-0.5 text-center">6</td>
                    <td className="border px-1 py-0.5 text-center">70.00%</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="border px-1 py-0.5">Total</td>
                    <td className="border px-1 py-0.5 text-center">44</td>
                    <td className="border px-1 py-0.5 text-center">30</td>
                    <td className="border px-1 py-0.5 text-center">14</td>
                    <td className="border px-1 py-0.5 text-center">68.18%</td>
                  </tr>
                </tbody>
              </table>
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
                          {order.order_number}
                        </span>
                        <div className="bg-[#3f6371] dark:bg-slate-700 text-white rounded-full p-[2px]">
                          <Info className="h-2.5 w-2.5" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        BDT {Number(order.subtotal || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-[#fef4e8] hover:bg-[#fef4e8] text-[#f2a550] dark:bg-orange-950/40 dark:hover:bg-orange-950/40 dark:text-orange-400 rounded px-2 mb-1.5 border-none font-medium capitalize"
                      >
                        {order.status}
                      </Badge>
                      <p className="text-muted-foreground flex items-center justify-end gap-1">
                        {new Date(order?.created_at ?? "").toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                        <Info className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDER HISTORY */}
            <div className="mt-3 rounded-md border p-3">
              {/* Summary */}
              <div className="flex flex-col gap-4 text-[11px] mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Order History</span>
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {customerData?.totalOrders}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Delivered</span>
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {customerData?.deliveredOrders}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Flagged</span>
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {customerData?.flaggedOrders}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Cancelled</span>
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {customerData?.cancelledOrders}
                  </Badge>
                </div>
              </div>

              {/* Order List */}
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
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

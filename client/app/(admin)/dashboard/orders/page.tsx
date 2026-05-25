"use client";

import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { IOrder } from "@/types/order.type";
import LoadingCom from "@/components/shared/loading-com";
import { useState } from "react";

const OrdersPage = () => {
  const [incompleteOrderClicked, setIncompleteOrderClicked] = useState(false);

  const { data, isLoading, error, mutate } = useSWR<{ data: IOrder[] }>(
    "/orders",
    fetcher
  );
  
  const { data: incompleteOrdersData, mutate: mutateIncompleteOrders } = useSWR<{ data: IOrder[] }>(
    incompleteOrderClicked ? "/orders/incomplete/order" : null,
    fetcher
  );

  const ordersData = incompleteOrderClicked ? incompleteOrdersData?.data || [] : data?.data || [];

  return (
    <div className=" space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingCom />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-medium">
          অর্ডার গুলো লোড করা সম্ভব হয়নি।
        </div>
      ) : (
        <OrdersTable orders={ordersData} incompleteOrderClicked={incompleteOrderClicked} setIncompleteOrderClicked={setIncompleteOrderClicked} mutateOrdersData={incompleteOrderClicked?mutateIncompleteOrders:mutate} />
      )}
    </div>
  );
};

export default OrdersPage;

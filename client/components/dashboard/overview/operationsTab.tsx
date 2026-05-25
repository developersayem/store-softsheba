"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, RotateCcw } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
// --- Custom Interfaces ---
interface DeliveryPartnerData {
  name: "steadfast" | "pathao" | "Other" | string;
  count: number;
  value: number;
}

interface PaymentData {
  name: string;
  method: string;
  count: number;
  value: number;
}

interface DiscountData {
  discountCount: number;
  advancedCount: number;
  discountValue: number;
  advancedValue: number;
}

interface OperationsData {
  deliveryPartners: DeliveryPartnerData[];
  payments: PaymentData[];
  discounts: DiscountData;
}

interface OperationsTabProps {
  globalWarehouse: string;
  globalDate: string;
  getDynamicTimeframe: (range: string) => string;
  isGlobal: boolean;
  setIsGlobal: (val: boolean) => void;
}

export default function OperationsTab({
  globalWarehouse,
  globalDate,
  getDynamicTimeframe,
  isGlobal,
  setIsGlobal,
}: OperationsTabProps) {
  //  Local states for each section's timeframe
  const [deliveryDate, setDeliveryDate] = useState(globalDate);
  const [paymentsDate, setPaymentsDate] = useState(globalDate);
  const [discountsDate, setDiscountsDate] = useState(globalDate);
  const [subFilter, setSubFilter] = useState("in-transit");

  // Data states
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  //  Fetch Data
  const fetchdeliveryPartnersData = useCallback(async () => {
    try {
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : deliveryDate,
      });
      //const result = await res.json();
      //set only delivery patners data
      const deliveryPartners = res.data.data.deliveryPartners;

      setData((prev) => {
        if (!prev) return prev; // safety check

        return {
          ...prev,
          deliveryPartners, // ✅ only update this part
        };
      });
    } catch (error) {
      console.error("Failed to fetch operations data", error);
    } finally {
      //setLoading(false);
    }
  }, [globalWarehouse, deliveryDate, globalDate,isGlobal]);
  const fetchPaymentsData = useCallback(async () => {
    try {
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : paymentsDate,
      });
      //const result = await res.json();
      //set only delivery patners data
      const payments = res.data.data.payments;

      setData((prev) => {
        if (!prev) return prev; // safety check

        return {
          ...prev,
          payments,
        };
      });
    } catch (error) {
      console.error("Failed to fetch operations data", error);
    } finally {
      //setLoading(false);
    }
  }, [globalWarehouse, paymentsDate, globalDate,isGlobal]);

  const fetchDiscountsData = useCallback(async () => {
    try {
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : discountsDate,
      });
      //const result = await res.json();
      //set only delivery patners data
      const discounts = res.data.data.discounts;

      setData((prev) => {
        if (!prev) return prev; // safety check

        return {
          ...prev,
          discounts,
        };
      });
    } catch (error) {
      console.error("Failed to fetch operations data", error);
    } finally {
      //setLoading(false);
    }
  }, [globalWarehouse, discountsDate, globalDate,isGlobal]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.post("/dashboard/overview", {
          warehouse: globalWarehouse,
          timeframe: globalDate,
        });
        //const result = await res.json();
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch operations data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalWarehouse, globalDate]);

  useEffect(() => {
    fetchdeliveryPartnersData();
  }, [fetchdeliveryPartnersData]);
  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);
  useEffect(() => {
    fetchDiscountsData();
  }, [fetchDiscountsData]);

  // --- Render logic ---
  if (loading || !data) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse">
        Loading operations data...
      </div>
    );
  }

  // Format currency
  const formatBDT = (value: number) => {
    return `BDT ${value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatShortAxis = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };
  //console.log(data);
  // Colors based on your design
  const COLORS = {
    steadfast: "#529b7c", //green
    pathao: "#FF0000", //red
    paymentDue: "#fe7a7b",
    paymentCollected: "#d1d5db", // placeholder gray
    discount: "#0d3c45",
    advanced: "#59a2a9",
    Other: "#9ca3af",
  };

  return (
    <div className="space-y-6 pt-6">
      {/* SECTION 1: Delivery Partners' Orders */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-medium">
                Delivery Partners&apos; Orders
              </CardTitle>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              <RotateCcw className="h-4 w-4  cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDynamicTimeframe(deliveryDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={subFilter}
              onValueChange={(val) => {
                setSubFilter(val);
              }}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs ">
                <SelectValue placeholder="By In-Transit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-transit">By In-Transit</SelectItem>
                <SelectItem value="delivered">By Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isGlobal ? globalDate : deliveryDate}
              onValueChange={(val) => {
                setIsGlobal(false);
                setDeliveryDate(val);
              }}
            >
              <SelectTrigger className=" h-8 text-xs ">
                <SelectValue placeholder="Lifetime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="lifeTime">Lifetime</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Order Rate Donut Chart */}
          <div className="flex flex-col border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">
                Delivery Partners&apos; Order Rate
              </h3>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.deliveryPartners}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="count"
                    stroke="none"
                  >
                    {data?.deliveryPartners?.map(
                      (entry: {
                        name: string;
                        count: number;
                        value: number;
                      }) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[entry.name as keyof typeof COLORS]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => [`${value} Orders`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className=" flex text-center items-center justify-center gap-2 mt-2">
              {data?.deliveryPartners.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-center gap-2 text-xs mb-2"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[entry.name as keyof typeof COLORS],
                    }}
                  ></span>
                  {entry.name}
                  {/* ({entry.value}%) */}
                </div>
              ))}
            </div>
            <p className="text-xs text-center font-medium text-muted-foreground">
              Total Order Count:{" "}
              {data?.deliveryPartners?.reduce(
                (acc, curr) => acc + curr.count,
                0,
              )}
            </p>
          </div>

          {/* Sales Value Bar Chart */}
          <div className="flex flex-col  border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">
                Delivery Partners&apos; Sales Value
              </h3>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.deliveryPartners} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatShortAxis}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "transparent" }}
                    formatter={(value: number) => [
                      formatBDT(value),
                      "Sales Value",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill={COLORS.steadfast}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full  mt-2">
              <p className="text-xs flex items-center justify-center font-medium text-center text-muted-foreground">
                Total Order Count: {data?.deliveryPartners?.[0]?.count}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Payments */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-medium">Payments</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              <RotateCcw className="h-4 w-4  cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDynamicTimeframe(paymentsDate)}
            </p>
          </div>
          <Select
            value={isGlobal ? globalDate : paymentsDate}
            onValueChange={(val) => {
              setIsGlobal(false);
              setPaymentsDate(val);
            }}
          >
            <SelectTrigger className=" h-8 text-xs ">
              <SelectValue placeholder="Lifetime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lifeTime">Lifetime</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Payment Order Count Bar Chart */}
          <div className="flex flex-col p-2">
            <h3 className="text-sm font-semibold mb-6">
              Total Order Count:{" "}
              {data?.payments?.reduce((a, b) => a + b.count, 0)}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.payments} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="method"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "transparent" }}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {data?.payments?.map((entry, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Payment Due"
                            ? COLORS.paymentDue
                            : COLORS.paymentCollected
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Sales Value Bar Chart */}
          <div className="flex flex-col p-2">
            <h3 className="text-sm font-semibold mb-6">
              Total Sales Value:{" "}
              {formatBDT(data?.payments?.reduce((a, b) => a + b.value, 0) ?? 0)}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.payments} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="method"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatShortAxis}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "transparent" }}
                    labelFormatter={(label) => `${label}`}
                    formatter={(value: number) => formatBDT(value)}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {data?.payments?.map((entry, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Payment Due"
                            ? COLORS.paymentDue
                            : COLORS.paymentCollected
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Discount Allowed & Advanced Payments */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-medium">
                Discount Allowed & Advanced Payments
              </CardTitle>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              <RotateCcw className="h-4 w-4  cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDynamicTimeframe(discountsDate)}
            </p>
          </div>
          <Select
            value={isGlobal ? globalDate : discountsDate}
            onValueChange={(val) => {
              setIsGlobal(false);
              setDiscountsDate(val);
            }}
          >
            <SelectTrigger className=" h-8 text-xs ">
              <SelectValue placeholder="Lifetime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lifeTime">Lifetime</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Discount/Advanced Count Chart */}
          <div className="flex flex-col border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-6 text-center">
              Discount Allowed & Advanced Payment Order Count
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Discount Allowed",
                      value: data?.discounts?.discountCount ?? 0,
                      fill: COLORS.discount,
                    },
                    {
                      name: "Advanced Payment",
                      value: data?.discounts?.advancedCount ?? 0,
                      fill: COLORS.advanced,
                    },
                  ]}
                  barSize={60}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {/* // {data.discounts.map((entry, index: number) => ( */}
                    <Cell
                      key={`cell-`} //fill={entry.fill}
                    />
                    {/* // ))} */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                Total Discount Allowed Orders Count:{" "}
                {data?.discounts?.discountCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Advanced Payment Orders Count:{" "}
                {data?.discounts?.advancedCount ?? 0}
              </p>
            </div>
          </div>

          {/* Discount/Advanced Value Chart */}
          <div className="flex flex-col border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-6 text-center">
              Discount Allowed & Advanced Payment Order Value
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Discount Allowed",
                      value: data?.discounts?.discountValue ?? 0,
                      fill: COLORS.discount,
                    },
                    {
                      name: "Advanced Payment",
                      value: data?.discounts?.advancedValue ?? 0,
                      fill: COLORS.advanced,
                    },
                  ]}
                  barSize={60}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatShortAxis}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "transparent" }}
                    formatter={(val: number) => [formatBDT(val), "Value"]}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {/* {(entry, index) => ( */}
                    <Cell
                      key={`cell-$index}`}
                      //fill={entry.fill}
                    />
                    {/* )} */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                Total Discount Allowed Orders Value:{" "}
                {formatBDT(data?.discounts?.discountValue ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Advanced Payment Orders Value:{" "}
                {formatBDT(data?.discounts?.advancedValue ?? 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

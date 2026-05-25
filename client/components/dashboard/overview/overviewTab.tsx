"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, Info, ArrowDown, ArrowUp } from "lucide-react";
import OrderStatusMultiSelect from "@/components/dashboard/overview/OrderStatusMultiSelect";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import api from "@/lib/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TYPES ---
interface OrderData {
  totalCount: number;
  totalSales: number;
  approved: { count: number; amount: number };
  processing: { count: number; amount: number };
  pending: { count: number; amount: number };
  "in-transit": { count: number; amount: number };
  "ready to ship"?: { count: number; amount: number };
  deliveredPaymentDue?: { count: number; amount: number };
  "on hold"?: { count: number; amount: number };
  pendingReturned?: { count: number; amount: number };
  cancelled?: { count: number; amount: number };
}

interface TrendData {
  day: string;
  count: number;
  amount: number;
}
interface ProfitData {
  totalProfit: number;
  name: string;
}

export default function OverviewTab({
  globalWarehouse,
  globalDate,
  getDynamicTimeframe,
  isGlobal,
  setIsGlobal,
}: {
  globalWarehouse: string;
  globalDate: string;
  getDynamicTimeframe: (dateStr: string) => string;
  isGlobal: boolean;
  setIsGlobal: (value: boolean) => void;
}) {
  // Split Data States
  const [orders, setOrders] = useState<OrderData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  // Profit Data States
  const [profitByProduct, setProfitByProduct] = useState<ProfitData[]>([]);
  const [profitByCategory, setProfitByCategory] = useState<ProfitData[]>([]);
  const [profit, setProfit] = useState();
  const [loss, setLoss] = useState();
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);
  // Local Section Filters
  const [orderDateRange, setOrderDateRange] = useState("today");
  const [profitDateRange, setProfitDateRange] = useState("today");
  const [trendFilter, setTrendFilter] = useState("approved");
  const [trendFrequency, setTrendFrequency] = useState("daily");
  const [show, setShow] = useState(false);
  const ORDER_STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "On Hold", value: "on hold" },
    { label: "Approved", value: "approved" },
    { label: "Processing", value: "processing" },
    { label: "Ready To Ship", value: "ready to ship" },
    { label: "In-Transit", value: "in-transit" },
    { label: "Delivered Payment Due", value: "delivered-payment-due" },
    {
      label: "Delivered Payment Collected",
      value: "delivered-payment-collected",
    },
    { label: "Cancelled", value: "cancelled" },
    { label: "Pending Returned", value: "pending-returned" },
    { label: "Returned", value: "returned" },
    { label: "Damaged", value: "damaged" },
  ];
  const [orderStatuses, setOrderStatuses] = useState<string[]>(
    ORDER_STATUS_OPTIONS.map((o) => o.value),
  );
  const [profitStatuses, setProfitStatuses] = useState<string[]>([
    "approved",
    "processing",
    "ready to ship",
    "in-transit",
    "delivered-payment-due",
    "delivered-payment-collected",
  ]);


  // --- API CALLS ---
  const fetchOrdersData = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        statuses: orderStatuses,
        timeframe: isGlobal ? globalDate : orderDateRange,
      });
      if (res.status === 200) {
        //console.log(res.data.data);
        setOrders(res.data.data.orders);
      }
    } catch {
      console.error("Failed to fetch orders:");
    } finally {
      setIsOrdersLoading(false);
    }
  }, [globalWarehouse, orderStatuses, orderDateRange, globalDate, isGlobal]);

  const fetchTrendsData = useCallback(async () => {
    try {
      setIsTrendsLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: globalDate,
        trendFilter: trendFilter,
        frequency: trendFrequency,
      });
      if (res.status === 200) {
        setTrends(res.data.data.trends);
      }
    } catch {
      console.error("Failed to fetch trends:");
    } finally {
      setIsTrendsLoading(false);
    }
  }, [globalWarehouse, globalDate, trendFilter, trendFrequency]);

  // Fetch Orders whenever orders-specific or global warehouse filters change
  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Fetch Trends whenever trends-specific or global filters change
  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

  const fetchProfitData = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      const res = await api.get(
        "/dashboard/profit",
        //   , {
        //   timeframe: isGlobal ? globalDate : profitDateRange,
        // }
      );
      if (res.status === 200) {
        //console.log(res.data.data);
        //setOrders(res.data.data.orders);
        setProfitByProduct(res.data.data.profitByProduct || []);
        setProfitByCategory(res.data.data.profitByCategory || []);
      }
    } catch {
      console.error("Failed to fetch profits data:");
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchProfitData();
  }, [fetchProfitData]);

  const fetchProfitAndLossOverview = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      const res = await api.post("/dashboard/profit-loss", {
        timeframe: isGlobal ? globalDate : profitDateRange,
        statuses: profitStatuses,
      });
      if (res.status === 200) {
        //console.log(res.data.data);
        setProfit(res.data.data.profit);
        setLoss(res.data.data.loss);
      }
    } catch {
      console.error("Failed to fetch profits data:");
    } finally {
      setIsOrdersLoading(false);
    }
  }, [profitDateRange, globalDate, isGlobal, profitStatuses]);

  useEffect(() => {
    fetchProfitAndLossOverview();
  }, [fetchProfitAndLossOverview]);

  return (
    <>
      {/* ORDERS KPI SECTION */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">Orders</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchOrdersData}
              disabled={isOrdersLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isOrdersLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusMultiSelect
              value={orderStatuses}
              onChange={setOrderStatuses}
            />
            <Select
              value={orderDateRange}
              onValueChange={(v) => {
                setIsGlobal(false);
                setOrderDateRange(v);
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs text-primary">
                <SelectValue placeholder="today" />
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
        <CardContent>
          {/* timeframe according to status selection */}
          <p className="text-xs text-muted-foreground mb-6">
            {getDynamicTimeframe(orderDateRange)}
          </p>

          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Order Count</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Order count based on the selected time period and the
                      order statuses.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold">
                {orders?.totalCount || 0}
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Sales Amount</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Sales amount based on the selected time period and the
                      order statuses.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold">
                BDT{" "}
                {orders?.totalSales?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                }) || "0.00"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Sub KPIs */}
          {show && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* pending */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-orange-500 font-medium mb-2">
                  Pending
                </div>
                <div className="text-xl font-bold">
                  {orders?.pending?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.pending?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* approved */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-green-500 font-medium mb-2">
                  Approved
                </div>
                <div className="text-xl font-bold">
                  {orders?.approved?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.approved?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* processing */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-amber-500 font-medium mb-2">
                  Processing
                </div>
                <div className="text-xl font-bold">
                  {orders?.processing?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.processing?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* cancelled */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-red-500 font-medium mb-2">
                  Cancelled
                </div>
                <div className="text-xl font-bold">
                  {orders?.cancelled?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.cancelled?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* in transit */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-amber-700 font-medium mb-2">
                  In-Transit
                </div>
                <div className="text-xl font-bold">
                  {orders?.["in-transit"]?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.["in-transit"]?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* on hold */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-red-300 font-medium mb-2">
                  On Hold
                </div>
                <div className="text-xl font-bold">
                  {orders?.["on hold"]?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.["on hold"]?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* ready to ship */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-blue-500 font-medium mb-2">
                  Ready To Ship
                </div>
                <div className="text-xl font-bold">
                  {orders?.["ready to ship"]?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.["ready to ship"]?.amount?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                    },
                  ) || "0.00"}
                </div>
              </div>
              {/* pending returned*/}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-red-200 font-medium mb-2">
                  Pending Returned
                </div>
                <div className="text-xl font-bold">
                  {orders?.pendingReturned?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.pendingReturned?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </div>
              </div>
              {/* Delivered Payment Due */}
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-sm text-amber-600 font-medium mb-2">
                  Delivered Payment Due
                </div>
                <div className="text-xl font-bold">
                  {orders?.deliveredPaymentDue?.count || 0}
                </div>
                <div className="text-sm font-semibold mt-1">
                  BDT{" "}
                  {orders?.deliveredPaymentDue?.amount?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                    },
                  ) || "0.00"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* profit and loss section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Profit and Loss
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchProfitAndLossOverview}
              disabled={isOrdersLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isOrdersLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusMultiSelect
              value={profitStatuses}
              onChange={setProfitStatuses}
            />
            <Select
              value={profitDateRange}
              onValueChange={(v) => {
                setIsGlobal(false);
                setProfitDateRange(v);
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs text-primary">
                <SelectValue placeholder="today" />
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

        <CardContent>
          <p className="text-xs text-muted-foreground mb-6">
            {getDynamicTimeframe(profitDateRange)}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Profit</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Total Profit based on the selected time period and the
                      order statuses.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold">
                {profit || 0}
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Loss Amount</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Loss amount based on the selected time period and the
                      order statuses.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold">
                BDT{" "}
                {loss|| "0.00"}
              </div>
            </div>
          </div>
          <div className="w-full mt-6">
            <Tabs defaultValue="product">
              <TabsList className="mb-2">
                <TabsTrigger value="product">Profit By Products</TabsTrigger>
                <TabsTrigger value="category">Profit By Categories</TabsTrigger>
              </TabsList>

              {/* --- PRODUCT PROFIT TABLE --- */}
              <TabsContent value="product">
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium w-16">#</th>
                        <th className="px-4 py-3 font-medium">Product Name</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Total Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitByProduct.length > 0 ? (
                        profitByProduct.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0 transition-colors hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-500">
                              BDT{" "}
                              {item.totalProfit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No product profit data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* --- CATEGORY PROFIT TABLE --- */}
              <TabsContent value="category">
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium w-16">#</th>
                        <th className="px-4 py-3 font-medium">Category Name</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Total Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitByCategory.length > 0 ? (
                        profitByCategory.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0 transition-colors hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-500">
                              BDT{" "}
                              {item.totalProfit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No category profit data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* TRENDS SECTION */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">Trends</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchTrendsData}
              disabled={isTrendsLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isTrendsLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={trendFilter} onValueChange={setTrendFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs text-primary">
                <SelectValue placeholder="By Approved" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">By Requested</SelectItem>
                <SelectItem value="approved">By Approved</SelectItem>
                <SelectItem value="in-transit">By In-Transit</SelectItem>
                <SelectItem value="delivered">By Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trendFrequency} onValueChange={setTrendFrequency}>
              <SelectTrigger className="w-[100px] h-8 text-xs text-primary">
                <SelectValue placeholder="Daily" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Order Trend Chart */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Order Trend</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Order quantity trend based on the selected order status
                      and the time period.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "transparent" }}
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
                    />
                    <Bar
                      dataKey="count"
                      fill="#148ea1"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Trend Chart */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Sales Trend</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-snug">
                    <p>
                      Order value trend based on the selected order status and
                      the time period.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "transparent" }}
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
                      formatter={(value: number) => `BDT ${value}`}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#148ea1"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

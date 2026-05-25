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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  RefreshCw,
  Info,
  Download,
  BarChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import api from "@/lib/axios";
import Image from "next/image";

// Performance Types
interface LocationData {
  location: string;
  count: number;
  value: number;
}

interface ItemData {
  id: string;
  name: string;
  weight: string;
  price: number;
  qty: number;
  amount: number;
  image?: string;
}

interface CustomerData {
  id: string;
  phone: string;
  name: string;
  badge?: string;
  address: string;
  district: string;
  frequency: number;
  value: number;
  since: string;
}

export default function PerformanceTab({
  globalWarehouse,
  globalDate,
  getDynamicTimeframe,
  isGlobal,
  setIsGlobal,
}: {
  isGlobal: boolean;
  setIsGlobal: (val: boolean) => void;
  globalWarehouse: string;
  globalDate: string;
  getDynamicTimeframe: (dateStr: string) => string;
}) {
  // --- STATE: PERFORMANCE TAB ---
  const [isPerfLoading, setIsPerfLoading] = useState(false);
  // Locations Filters
  const [locTimeframe, setLocTimeframe] = useState("thisMonth");
  
  // Items Filters
  const [itemVariantFilter, setItemVariantFilter] = useState("by_variants");
  const [itemReqFilter, setItemReqFilter] = useState("by_requested");
  const [itemTimeframe, setItemTimeframe] = useState("thisMonth");

  // Customers Filters
  const [custTransitFilter, setCustTransitFilter] = useState("by_in_transit");
  const [custFreqFilter, setCustFreqFilter] = useState("order_frequency");
  const [custTimeframe, setCustTimeframe] = useState("thisMonth");

  // Performance Data States
  const [topLocations, setTopLocations] = useState<LocationData[]>([]);
  const [topItems, setTopItems] = useState<ItemData[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerData[]>([]);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return "0.00";
    return val.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const fetchPerformanceData = useCallback(async () => {
    try {
      setIsPerfLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : custTimeframe,
      });

      if (res.status === 200) {
        const data = res.data.data;

        //setTopLocations(data.locations);
        //setTopItems(data.items);
        setTopCustomers(data.customers);
      }
    } catch {
      console.error("Failed to fetch performance data");
      setIsPerfLoading(false);
    } finally {
      setIsPerfLoading(false);
    }
  }, [
    globalWarehouse,
    globalDate,isGlobal,
    // locTimeframe,
    // itemVariantFilter,
    // itemReqFilter,
    // itemTimeframe,
    // custTransitFilter,
    // custFreqFilter,
    custTimeframe,
  ]);

  const fetchLocData = useCallback(async () => {
    try {
      setIsPerfLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : locTimeframe,
      });

      if (res.status === 200) {
        const data = res.data.data;

        setTopLocations(data.locations);
        // setTopItems(data.items);
        // setTopCustomers(data.customers);
      }
    } catch {
      console.error("Failed to fetch performance data");
      setIsPerfLoading(false);
    } finally {
      setIsPerfLoading(false);
    }
  }, [
    globalWarehouse,
    globalDate,
    locTimeframe,isGlobal
    // itemVariantFilter,
    // itemReqFilter,
    // itemTimeframe,
    // custTransitFilter,
    // custFreqFilter,
    // custTimeframe,
  ]);

  const fetchTopItemsData = useCallback(async () => {
    try {
      setIsPerfLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : itemTimeframe,
      });

      if (res.status === 200) {
        const data = res.data.data;

        //setTopLocations(data.locations);
        setTopItems(data.items);
        // setTopCustomers(data.customers);
      }
    } catch {
      console.error("Failed to fetch performance data");
      setIsPerfLoading(false);
    } finally {
      setIsPerfLoading(false);
    }
  }, [
    globalWarehouse,
    globalDate,
    //locTimeframe,
    // itemVariantFilter,
    // itemReqFilter,
    itemTimeframe,isGlobal
    // custTransitFilter,
    // custFreqFilter,
    // custTimeframe,
  ]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  useEffect(() => {
    fetchLocData();
  }, [fetchLocData]);

  useEffect(() => {
    fetchTopItemsData();
  }, [fetchTopItemsData]);

  return (
    <>
      {" "}
      {/* TOP 10 LOCATIONS */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Top 10 Locations
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                Top 10 locations by order count and value.
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPerformanceData}
              disabled={isPerfLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isPerfLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={isGlobal ? globalDate : locTimeframe}
              onValueChange={(val) => {
                setIsGlobal(false);
                setLocTimeframe(val);
              }}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs text-primary">
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
            {getDynamicTimeframe(globalDate)}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Chart: Order by Locations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  Order by Top 10 Locations{" "}
                  <Info className="inline w-3 h-3 text-muted-foreground ml-1" />
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="w-4 h-4 text-primary" />
                </Button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topLocations}
                    margin={{ top: 0, right: 20, left: 30, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="location"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      width={120}
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
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    >
                      <LabelList
                        dataKey="count"
                        position="insideRight"
                        fill="#fff"
                        fontSize={10}
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Total Order Count:{" "}
                {topLocations.reduce((acc, curr) => acc + curr.count, 0)}
              </p>
            </div>

            {/* Right Chart: Value by Locations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  Order Value by Top 10 Locations{" "}
                  <Info className="inline w-3 h-3 text-muted-foreground ml-1" />
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="w-4 h-4 text-primary" />
                </Button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topLocations}
                    margin={{ top: 0, right: 20, left: 30, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="location"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      width={120}
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
                      formatter={(val: number) => `BDT ${formatCurrency(val)}`}
                    />
                    <Bar
                      dataKey="value"
                      fill="#148ea1"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    >
                      <LabelList
                        dataKey="value"
                        position="insideRight"
                        fill="#fff"
                        fontSize={10}
                        offset={10}
                        formatter={(val: number) =>
                          `BDT ${formatCurrency(val)}`
                        }
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Total Sales Value: BDT{" "}
                {formatCurrency(
                  topLocations.reduce((acc, curr) => acc + curr.value, 0),
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* TOP 10 SELLING ITEMS */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Top 10 Selling Items
            </CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPerformanceData}
              disabled={isPerfLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isPerfLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={itemVariantFilter}
              onValueChange={setItemVariantFilter}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="by_variants">By Variants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemReqFilter} onValueChange={setItemReqFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="by_requested">By Requested</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isGlobal ? globalDate : itemTimeframe}
              onValueChange={(val) => {
                setIsGlobal(false);
                setItemTimeframe(val);
              }}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs text-primary">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
            >
              <BarChartIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-6">
            {getDynamicTimeframe(globalDate)}
          </p>

          <div className="relative flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 z-10 -ml-4 bg-background shadow-md h-8 w-8 rounded-full hidden md:flex"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex overflow-x-auto space-x-6 py-4 w-full hide-scrollbar no-scrollbar scroll-smooth">
              {topItems.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[200px] flex-shrink-0 flex flex-col gap-2"
                >
                  <div className="h-40 w-full bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden border">
                    <Image
                      height={100}
                      width={100}
                      src={item?.image ?? "#"}
                      alt="product image"
                    />
                  </div>
                  <h4 className="text-sm font-semibold line-clamp-2 leading-tight h-10">
                    {item.name}
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Weight: {item.weight}</p>
                    <p>Price: BDT {formatCurrency(item.price)}</p>
                    <p className="mt-2 text-foreground font-medium">
                      Total Sales Quantity:{" "}
                      <span className="font-bold">{item.qty}</span>
                    </p>
                    <p>Total Sales Amount:</p>
                    <p className="text-sm font-bold text-foreground">
                      BDT {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 z-10 -mr-4 bg-background shadow-md h-8 w-8 rounded-full hidden md:flex"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* TOP 10 CUSTOMERS */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Top 10 Customers
            </CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPerformanceData}
              disabled={isPerfLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isPerfLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={custTransitFilter}
              onValueChange={setCustTransitFilter}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="by_in_transit">By In-Transit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={custFreqFilter} onValueChange={setCustFreqFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_frequency">Order Frequency</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isGlobal ? globalDate : custTimeframe}
              onValueChange={(val) => {
                setIsGlobal(false);
                setCustTimeframe(val);
              }}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs text-primary">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-6">
            {getDynamicTimeframe(globalDate)}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Customer ID</th>
                  <th className="py-3 px-4 font-medium">Phone</th>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Address</th>
                  <th className="py-3 px-4 font-medium">District</th>
                  <th className="py-3 px-4 font-medium">Order Frequency</th>
                  <th className="py-3 px-4 font-medium">Order Value</th>
                  <th className="py-3 px-4 font-medium">Customer Since</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((cust, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-primary whitespace-nowrap">
                      {cust.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {cust.phone}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2 min-w-[200px]">
                      {cust.name}
                      {cust.badge && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">
                          {cust.badge}
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 max-w-[300px] truncate"
                      title={cust.address}
                    >
                      {cust.address}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {cust.district}
                    </td>
                    <td className="py-3 px-4">{cust.frequency}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      BDT {formatCurrency(cust.value)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {cust.since}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

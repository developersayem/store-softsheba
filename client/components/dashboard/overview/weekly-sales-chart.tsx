"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const salesData = [
  { date: "2025-08-27", sales: 950, orders: 45 },
  { date: "2025-08-28", sales: 1300, orders: 62 },
  { date: "2025-08-30", sales: 120, orders: 8 },
];

const ordersData = [
  { date: "2025-08-27", orders: 45, sales: 950 },
  { date: "2025-08-28", orders: 62, sales: 1300 },
  { date: "2025-08-30", orders: 8, sales: 120 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(142, 76%, 36%)",
  },
  orders: {
    label: "Orders",
    color: "hsl(221, 83%, 53%)",
  },
};

export function WeeklySalesChart() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Weekly Sales
        </CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-fit grid-cols-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-0 pb-2 text-gray-500 hover:text-gray-700"
            >
              Sales
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-0 pb-2 ml-6 text-gray-500 hover:text-gray-700"
            >
              Orders
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="sales" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    domain={[0, 1400]}
                    ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={chartConfig.sales.color}
                    strokeWidth={3}
                    dot={{
                      fill: chartConfig.sales.color,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: chartConfig.sales.color,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="orders" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ordersData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    domain={[0, 70]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={chartConfig.orders.color}
                    strokeWidth={3}
                    dot={{
                      fill: chartConfig.orders.color,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: chartConfig.orders.color,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

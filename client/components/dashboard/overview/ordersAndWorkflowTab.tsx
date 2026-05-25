"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RefreshCw, Info } from "lucide-react";

import api from "@/lib/axios";

// --- TYPES ---
interface PieChartData {
  name: string;
  value: number;
  color: string;
  count: number;
}
interface CycleTimeData {
  status: string;
  timeHours: number;
  fill: string;
}

export default function OrdersAndWorkflowTab({
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
  // Local Section Filters (Orders & Workflow)
  const [workflowTimeframe, setWorkflowTimeframe] = useState("thisMonth");
  const [cancelReturnTimeframe, setCancelReturnTimeframe] =
    useState("lifeTime");

  // Orders & Workflow Data States
  const [workflowStatusData, setWorkflowStatusData] = useState<PieChartData[]>(
    [],
  );
  const [cycleTimeData, setCycleTimeData] = useState<CycleTimeData[]>([]);

  const [cancelledOrdersData, setCancelledOrdersData] = useState<
    PieChartData[]
  >([]);

  const [returnedOrdersData, setReturnedOrdersData] = useState<PieChartData[]>(
    [],
  );
  // --- STATE: PERFORMANCE TAB ---
  //const [isPerfLoading, setIsPerfLoading] = useState(false);

  // const fetchOrdersAndWorkflowData = useCallback(async () => {
  //   try {
  //     //setIsPerfLoading(true);
  //     const res = await api.post("/dashboard/overview", {
  //       warehouse: globalWarehouse,
  //       timeframe: globalDate,
  //     });

  //     if (res.status === 200) {
  //       const data = res.data.data;

  //       console.log(data.workflow);

  //       if (data.workflow) {
  //         setWorkflowStatusData(data.workflow.workflowStatusData);
  //         setCycleTimeData(data.workflow.cycleTimeData);
  //         setCancelledOrdersData(data.workflow.cancelledOrdersData);
  //         setReturnedOrdersData(data.workflow.returnedOrdersData);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     console.error("Failed to fetch performance data");
  //     //setIsPerfLoading(false);
  //   } finally {
  //     //setIsPerfLoading(false);
  //   }
  // }, [globalWarehouse, globalDate]);

  const fetchOrderWorkflow = useCallback(async () => {
    try {
      //setIsPerfLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : workflowTimeframe,
      });

      if (res.status === 200) {
        const data = res.data.data;

        //console.log(data.workflow);

        if (data.workflow) {
          setWorkflowStatusData(data.workflow.workflowStatusData);
          setCycleTimeData(data.workflow.cycleTimeData);
          //setCancelledOrdersData(data.workflow.cancelledOrdersData);
          //setReturnedOrdersData(data.workflow.returnedOrdersData);
        }
      }
    } catch (error) {
      console.log(error);
      console.error("Failed to fetch performance data");
      //setIsPerfLoading(false);
    }
  }, [workflowTimeframe,globalDate,isGlobal,globalWarehouse]);

  const fetchCancelledAndReturnedOrderData = useCallback(async () => {
    try {
      //setIsPerfLoading(true);
      const res = await api.post("/dashboard/overview", {
        warehouse: globalWarehouse,
        timeframe: isGlobal ? globalDate : cancelReturnTimeframe,
      });

      if (res.status === 200) {
        const data = res.data.data;

        //console.log(data.workflow);

        if (data.workflow) {
          //setWorkflowStatusData(data.workflow.workflowStatusData);
          //setCycleTimeData(data.workflow.cycleTimeData);
          setCancelledOrdersData(data.workflow.cancelledOrdersData);
          setReturnedOrdersData(data.workflow.returnedOrdersData);
        }
      }
    } catch (error) {
      console.log(error);
      console.error("Failed to fetch performance data");
      //setIsPerfLoading(false);
    }
  }, [cancelReturnTimeframe,globalDate,isGlobal,globalWarehouse]);

  useEffect(() => {
    fetchOrderWorkflow();
  }, [fetchOrderWorkflow]);
  useEffect(() => {
    fetchCancelledAndReturnedOrderData();
  }, [fetchCancelledAndReturnedOrderData]);

  return (
    <>
      {/* SECTION 1: ORDER WORKFLOW ANALYSIS */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Order Workflow Analysis</h2>
            <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
            <RefreshCw className="w-4 h-4  cursor-pointer" />
          </div>
          <Select
            value={isGlobal ? globalDate : workflowTimeframe}
            onValueChange={(val) => {
              setIsGlobal(false);
              setWorkflowTimeframe(val);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-blue-50/50 ">
              <SelectValue placeholder="This Month" />
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
        <p className="text-xs text-muted-foreground mb-6">
          {getDynamicTimeframe(isGlobal ? globalDate : workflowTimeframe)}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status Percentage (Donut) */}
          <div className="border rounded-md p-4 ">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">Order Status Percentage</h3>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex h-[250px] items-center">
              <CustomLegend data={workflowStatusData} />
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workflowStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {workflowStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
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
                      formatter={(value) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Cycle Time (Horizontal Bar) */}
          <div className="border rounded-md p-4 ">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">Order Cycle Time</h3>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={cycleTimeData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    dataKey="status"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    width={80}
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
                  <Bar dataKey="timeHours" radius={[0, 4, 4, 0]}>
                    {cycleTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="timeHours"
                      position="right"
                      formatter={(val: number) => (val > 0 ? `${val} hr` : "")}
                      style={{ fontSize: 10, fill: "#64748b" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CANCELLED AND RETURNED ORDERS */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              Cancelled and Returned Orders
            </h2>
            <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
            <RefreshCw className="w-4 h-4  cursor-pointer" />
          </div>

          <Select
            value={isGlobal ? globalDate : cancelReturnTimeframe}
            onValueChange={(val) => {
              setIsGlobal(false);
              setCancelReturnTimeframe(val);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-blue-50/50 ">
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
        <p className="text-xs text-muted-foreground mb-6">
          {isGlobal
            ? getDynamicTimeframe(globalDate)
            : getDynamicTimeframe(cancelReturnTimeframe)}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cancelled Orders (Donut) */}
          <div className="border rounded-md p-4  flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">Cancelled Order</h3>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex h-[250px] items-center mb-4">
              <CustomLegend data={cancelledOrdersData} />
              <div className="flex-1 h-full relative">
                {cancelledOrdersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cancelledOrdersData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {cancelledOrdersData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
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
                        formatter={(value) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No Data
                  </div>
                )}
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-auto">
              Total Order Count:{" "}
              {cancelledOrdersData.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
          </div>

          {/* Returned Orders (Donut) */}
          <div className="border rounded-md p-4  flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">Returned Order</h3>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex h-[250px] items-center justify-center mb-4">
              {returnedOrdersData.length > 0 ? (
                <>
                  <CustomLegend data={returnedOrdersData} />
                  <div className="flex-1 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={returnedOrdersData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {returnedOrdersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
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
                          formatter={(value) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
            <div className="text-center text-xs text-muted-foreground mt-auto">
              Total Order Count:{" "}
              {returnedOrdersData.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// Helper component for Custom Pie Chart Legend
const CustomLegend = ({ data }: { data: PieChartData[] }) => (
  <div className="flex flex-col justify-center space-y-2 text-xs text-muted-foreground w-1/3 min-w-[150px]">
    {data.map((entry, index) => (
      <div key={`legend-${index}`} className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full inline-block shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span className="truncate">{entry.name}</span>
      </div>
    ))}
  </div>
);

"use client";

import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  LayoutDashboard,
  Box,
  Activity,
  TrendingUp,
} from "lucide-react";

import PerformanceTab from "@/components/dashboard/overview/performanceTab";
import OverviewTab from "@/components/dashboard/overview/overviewTab";
import OrdersAndWorkflowTab from "@/components/dashboard/overview/ordersAndWorkflowTab";
import OperationsTab from "@/components/dashboard/overview/operationsTab";

export default function OverviewPage() {
  // --- STATE ---
  // Global Filters
  const [globalWarehouse, setGlobalWarehouse] = useState("all");
  const [globalDate, setGlobalDate] = useState("last30days");
  const [isGlobal, setIsGlobal] = useState(false);

  // --- UTILS ---
  const getDynamicTimeframe = (range: string) => {
    const today = new Date();
    const endDate = new Date(today);
    let startDate = new Date(today);

    // Helper to format date as "Feb 28, 2026"
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    switch (range) {
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "thisWeek":
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        startDate = new Date(today.setDate(diff));
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "lifeTime":
        return "Lifetime";
      case "custom":
        return "Custom Date Range (Select Dates)";
      case "today":
      default:
        // startDate and endDate remain today
        break;
    }

    return `${formatDate(startDate)} 12:00 AM - ${formatDate(endDate)} 11:59 PM`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6">
      {/* HEADER & GLOBAL FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="shrink-0">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="flex items-center border rounded-md overflow-hidden bg-background">
            <div className="px-3 py-2 border-r text-sm font-medium bg-muted/50">
              Master Filter
            </div>
            <Select value={globalWarehouse} onValueChange={setGlobalWarehouse}>
              <SelectTrigger className="w-[140px] border-0 rounded-none focus:ring-0">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Warehouse (All)</SelectItem>
                <SelectItem value="wh1">Warehouse 1</SelectItem>
              </SelectContent>
            </Select>
            <div className="border-r h-full"></div>
            <Select
              value={globalDate}
              onValueChange={(v) => {
                setIsGlobal(true);
                setGlobalDate(v);
              }}
            >
              <SelectTrigger className="w-[120px] border-0 rounded-none focus:ring-0">
                <SelectValue placeholder="Last30Days" />
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
        </div>
      </div>

      {/* TABS CONTROLLER */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex-wrap justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6"
          >
            <Box className="w-4 h-4 mr-2" /> Orders & Workflow
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6"
          >
            <Activity className="w-4 h-4 mr-2" /> Operations
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6"
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Performance
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB CONTENT */}
        <TabsContent value="overview" className="space-y-6 pt-6">
          <OverviewTab
            globalWarehouse={globalWarehouse}
            globalDate={globalDate}
            getDynamicTimeframe={getDynamicTimeframe}
            isGlobal={isGlobal}
            setIsGlobal={setIsGlobal}
          />
        </TabsContent>

        {/* orders and workflow tab */}
        <TabsContent value="orders" className="space-y-6">
          <OrdersAndWorkflowTab
            globalWarehouse={globalWarehouse}
            globalDate={globalDate}
            getDynamicTimeframe={getDynamicTimeframe}
            isGlobal={isGlobal}
            setIsGlobal={setIsGlobal}
          />
        </TabsContent>
        <TabsContent value="operations">
          {/* Operations Tab Content */}
          <TabsContent value="operations" className="space-y-6 pt-6">
            <OperationsTab
              globalWarehouse={globalWarehouse}
              globalDate={globalDate}
              getDynamicTimeframe={getDynamicTimeframe}
              isGlobal={isGlobal}
              setIsGlobal={setIsGlobal}
            />
          </TabsContent>
        </TabsContent>
        <TabsContent value="performance" className="space-y-6">
          <PerformanceTab
            globalDate={globalDate}
            globalWarehouse={globalWarehouse}
            getDynamicTimeframe={getDynamicTimeframe}
            isGlobal={isGlobal}
            setIsGlobal={setIsGlobal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

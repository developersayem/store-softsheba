"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  LegendProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const data = [
  { name: "Head Shoulders Shampoo", value: 35, color: "#10b981" },
  { name: "Mint", value: 25, color: "#3b82f6" },
  { name: "Pantene hair-care", value: 20, color: "#f97316" },
  { name: "Dark & Lovely Conditioner", value: 20, color: "#60a5fa" },
];

const chartConfig = {
  "Head Shoulders Shampoo": {
    label: "Head Shoulders Shampoo",
    color: "#10b981",
  },
  Mint: {
    label: "Mint",
    color: "#3b82f6",
  },
  "Pantene hair-care": {
    label: "Pantene hair-care",
    color: "#f97316",
  },
  "Dark & Lovely Conditioner": {
    label: "Dark & Lovely Conditioner",
    color: "#60a5fa",
  },
};

// ✅ Strongly typed CustomLegend
const CustomLegend = ({ payload }: LegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function BestSellingProductsChart() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Best Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

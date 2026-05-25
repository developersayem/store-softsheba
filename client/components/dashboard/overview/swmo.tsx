"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  amount: number;
  status: "pending" | "processing" | "delivered" | "cancel";
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  paymentMethod: string;
}

interface RecentOrdersTableProps {
  orders: Order[];
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
  onViewOrder?: (order: Order) => void;
  onPrintInvoice?: (order: Order) => void;
  showPagination?: boolean;
  itemsPerPage?: number;
  title?: string;
  currency?: string;
}

export function RecentOrdersTable({
  orders,
  onStatusUpdate,
  onViewOrder,
  onPrintInvoice,
  showPagination = true,
  itemsPerPage = 8,
  title = "Recent Order",
  currency = "৳",
}: RecentOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "processing":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancel":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatOrderId = (id: string) => {
    // Extract numbers from order ID for display
    return id.replace(/[^0-9]/g, "");
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-center gap-2 my-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="text-gray-500"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {getVisiblePages().map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
            className={
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-gray-500"
            }
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="text-gray-500"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  INVOICE NO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  ORDER TIME
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  CUSTOMER NAME
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  METHOD
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  ACTION
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  INVOICE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Courier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                    {formatOrderId(order.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-900">
                    Cash
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-900">
                    {order.amount.toFixed(2)}
                    {currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={getStatusColor(order.status)}
                      variant="outline"
                    >
                      {order.status === "processing"
                        ? "Processing"
                        : order.status === "cancel"
                        ? "Cancel"
                        : order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600"
                        >
                          {order.status === "processing"
                            ? "Processing"
                            : order.status === "cancel"
                            ? "Cancel"
                            : order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "pending")
                          }
                        >
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "processing")
                          }
                        >
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "delivered")
                          }
                        >
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(order.id, "cancel")}
                        >
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrintInvoice?.(order)}
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewOrder?.(order)}
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => onPrintInvoice?.(order)}
                        className="h-8 w-8 bg-primary text-primary-foreground hover:text-gray-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </div>
    </div>
  );
}

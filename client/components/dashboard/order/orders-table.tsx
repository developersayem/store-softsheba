"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Copy,
  Edit,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Printer,
  File,
  SlidersHorizontal,
} from "lucide-react";
import { Order } from "./data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsappIcon } from "react-share";
import { toast } from "sonner";
//import { useInvoiceDownload } from "@/hooks/invoiceDownload";
import InvoicePreview from "../orders/InvoicePreview";
import { useStoreSettings } from "@/contexts/store-settings-context";
import InvoiceInfoPopover from "./InvoiceInfoPopOver";
import { CustomerInfoHoverCard } from "./customerInfoHoverCard";
import { useRouter } from "next/navigation";
import { ChangeStatusDialog, STATUS_CONFIG } from "./statusDialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InternalNoteForm from "./InternalNoteForm";
import LoadingOverlay from "../shared/LoadingOverlay";
import api from "@/lib/axios";
import { useReactToPrint } from "react-to-print";

interface OrdersTableProps {
  data: Order[];
  isLoading: boolean;
  mutate: () => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  selectedRows: string[]; // List of selected IDs
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
  onRowSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  //invoiceRef:RefObject<HTMLDivElement>;
}
export const formatDate = (date?: string | Date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function OrdersTable({
  data,
  currentPage,
  totalPages,
  itemsPerPage,
  selectedRows,
  onPageChange,
  onItemsPerPageChange,
  onRowSelect,
  onSelectAll,
  isLoading,
  mutate,
  //invoiceRef
}: OrdersTableProps) {
  const COLUMNS = [
    { id: "invoice", label: "Invoice No" },
    { id: "followUp", label: "Follow Up Date" },
    { id: "customer", label: "Customer" },
    { id: "pickup", label: "Pick Up Address" },
    { id: "payment", label: "Payments Info" },
    { id: "status", label: "Order Status" },
    { id: "deliveryPartner", label: "Delivery Partner" },
    { id: "deliveryFee", label: "Delivery Fee" },
    { id: "reason", label: "Reason" },
    { id: "notes", label: "Internal Notes" },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    COLUMNS.map((c) => c.id).filter(
      (id) => id !== "followUp" && id !== "pickup",
    ),
  );
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(
    null,
  );

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [orderForStatusUpdate, setOrderForStatusUpdate] =
    useState<Order | null>(null);

  const handleInlineStatusChange = (order: Order, newStatus: string) => {
    const complexStatuses = [
      "On Hold",
      "In-Transit",
      "Delivered",
      "Flagged",
      "Cancelled",
    ];

    if (
      complexStatuses.some(
        (s) => s.toLowerCase() === newStatus.toLowerCase(),
      ) ||
      newStatus === "In-Transit"
    ) {
      setOrderForStatusUpdate(order);
      setStatusDialogOpen(true);
    } else {
      updateOrderStatusSimple(order._id!, newStatus);
    }
  };

  const updateOrderStatusSimple = async (orderId: string, status: string) => {
    try {
      const res = await api.put(`/orders/${orderId}`, {
        status,
        sub_status: "",
        followUpDate: "",
      });
      if (res.status === 200) {
        toast.success("Status updated successfully");
        mutate();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "on hold":
        return "bg-orange-500";
      case "approved":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "ready to ship":
        return "bg-indigo-500";
      case "in-transit":
        return "bg-blue-400";
      case "delivered":
        return "bg-green-500";
      case "flagged":
        return "bg-red-400";
      case "cancelled":
        return "bg-red-600";
      case "incomplete":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const isAllColumnsSelected = visibleColumns.length === COLUMNS.length;

  const toggleAllColumns = (checked: boolean) => {
    setVisibleColumns(checked ? COLUMNS.map((c) => c.id) : []);
  };

  const toggleColumn = (id: string, checked: boolean) => {
    if (checked) {
      setVisibleColumns((prev) => [...prev, id]);
    } else {
      setVisibleColumns((prev) => prev.filter((colId) => colId !== id));
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Show dots if current page far from start
    if (currentPage > 3) {
      pages.push("...");
    }

    // Middle range
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show dots if current page far from end
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const isAllSelected =
    data.length > 0 &&
    data.every((row) => selectedRows.includes(row._id ?? ""));

  const handleCopy = async (phone: string) => {
    if (!phone) return;

    await navigator.clipboard.writeText(phone);
    toast.success(`"${phone}" Copied!`);
  };

  const handleWhatsApp = (phone: string) => {
    if (!phone) return;

    // Remove spaces, dashes etc. (important for WhatsApp)
    const formattedPhone = phone.replace(/\D/g, "");

    // WhatsApp chat link
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };
  const { storeSettingsData } = useStoreSettings();

  const invoiceRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;
  const [printTitle, setPrintTitle] = React.useState("Invoice");
  //const { downloadInvoice } = useInvoiceDownload();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async (
    id: string,
    courier: string,
    trackingCode: string,
  ) => {
    if (!trackingCode) {
      return;
    }

    return api.post(`/orders/refresh-courier-status`, {
      orderId: id,
      courier,
      trackingCode,
    });
  };

  const refreshAll = useCallback(async () => {
    if (!data?.length) return;

    setRefreshing(true);

    let success = 0;
    let failed = 0;

    try {
      await Promise.all(
        data.map(async (order) => {
          try {
            if (!order?.courier?.trackingCode) return;

            await handleRefresh(
              order._id ?? "",
              order?.courier?.name ?? "",
              order?.courier?.trackingCode ?? "",
            );

            success++;
          } catch {
            failed++;
          }
        }),
      );

      await mutate?.();

      if (success > 0) {
        toast.success(`${success} courier status refreshed`);
      }

      if (failed > 0) {
        toast.error(`${failed} failed to refresh`);
      }
    } finally {
      setRefreshing(false);
    }
  }, [data, mutate]);

  const handleBlockIP = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/block-ip`);
      toast.success(res.data.message || "IP settings changed successfully");
    } catch {
      toast.error("Failed to block IP");
    } finally {
      mutate();
    }
  };
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: printTitle,
    pageStyle: `
      @media print {
        @page { 
          size: 3in 4in; 
          margin: 0; 
        }
        body { 
          margin: 0; 
          padding: 0; 
          -webkit-print-color-adjust: exact; 
        }
      }
    `,
  });

  return (
    <div className="w-full space-y-4">
      <LoadingOverlay show={isInvoiceLoading} />
      {/* --- Filter Toolbar --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-card text-card-foreground p-2 rounded-md border shadow-sm gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refreshAll();
            }}
          >
            {" "}
            {refreshing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-[#1E8896] hover:text-[#1E8896] border-[#1E8896]/30"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter Column
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-3 border-b">
                <span className="text-sm font-medium">Columns</span>
              </div>
              <div className="p-2 flex flex-col gap-2 max-h-100 overflow-y-auto">
                <div className="flex items-center space-x-2 p-1">
                  <Checkbox
                    id="select-all"
                    checked={isAllColumnsSelected}
                    onCheckedChange={(checked) =>
                      toggleAllColumns(checked as boolean)
                    }
                    className="data-[state=checked]:bg-[#1E8896] data-[state=checked]:border-[#1E8896]"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
                {COLUMNS.map((col) => (
                  <div key={col.id} className="flex items-center space-x-2 p-1">
                    <Checkbox
                      id={`col-${col.id}`}
                      checked={visibleColumns.includes(col.id)}
                      onCheckedChange={(checked) =>
                        toggleColumn(col.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-[#1E8896] data-[state=checked]:border-[#1E8896]"
                    />
                    <label
                      htmlFor={`col-${col.id}`}
                      className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={onItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder="50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`dots-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 ${
                  currentPage === pageNum
                    ? "bg-[#1E8896] hover:bg-[#166d78] text-white"
                    : ""
                }`}
                onClick={() => onPageChange(pageNum as number)}
              >
                {pageNum}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className=" rounded-md border bg-card text-card-foreground overflow-x-auto shadow-sm">
        <Table className="">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                />
              </TableHead>
              {visibleColumns.includes("invoice") && (
                <TableHead className="w-45">Invoice No</TableHead>
              )}
              {visibleColumns.includes("followUp") && (
                <TableHead className="w-45">Follow Up Date</TableHead>
              )}
              {visibleColumns.includes("customer") && (
                <TableHead className="w-50">Customer</TableHead>
              )}
              {visibleColumns.includes("pickup") && (
                <TableHead>Pick Up Address</TableHead>
              )}
              {visibleColumns.includes("payment") && (
                <TableHead className="w-45">Payments Info</TableHead>
              )}
              {visibleColumns.includes("status") && (
                <TableHead>Order Status</TableHead>
              )}
              {visibleColumns.includes("deliveryPartner") && (
                <TableHead>Delivery Partner</TableHead>
              )}
              {visibleColumns.includes("deliveryFee") && (
                <TableHead>Delivery Fee</TableHead>
              )}
              {visibleColumns.includes("reason") && (
                <TableHead>Reason</TableHead>
              )}
              {visibleColumns.includes("notes") && (
                <TableHead className="w-12.5">Internal Note</TableHead>
              )}
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center h-24 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : visibleColumns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center h-24 text-muted-foreground"
                >
                  No Data.
                </TableCell>
              </TableRow>
            ) : !isLoading && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center h-24 text-muted-foreground"
                >
                  No orders found for this status.
                </TableCell>
              </TableRow>
            ) : (
              data.map((order) => {
                const isSelected = selectedRows.includes(order._id ?? "");
                //console.log(order);
                return (
                  <TableRow
                    key={order._id}
                    className={`transition-colors align-top ${isSelected ? "bg-[#1E8896]/5 hover:bg-[#1E8896]/10" : "hover:bg-muted/50"}`}
                  >
                    <TableCell className="py-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onRowSelect(order._id ?? "")}
                      />
                    </TableCell>

                    {/* Invoice Column */}
                    {visibleColumns.includes("invoice") && (
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 text-muted-foreground mb-1">
                            {/* <Info  className="h-4 w-4 cursor-pointer hover:text-blue-500" /> */}
                            <InvoiceInfoPopover order={order} />

                            <Copy
                              onClick={() => handleCopy(order.order_number)}
                              className="h-4 w-4 cursor-pointer hover:text-blue-500"
                            />
                            <Printer
                              onClick={async () => {
                                setIsInvoiceLoading(true);
                                setSelectedPrintOrder(order);

                                try {
                                  await new Promise((res) =>
                                    setTimeout(res, 150),
                                  );

                                  const name =
                                    order?.shipping_address?.full_name ||
                                    order?.customerId?.full_name ||
                                    "Customer";
                                  const phone =
                                    order?.shipping_address?.phone ||
                                    order?.customerId?.phone ||
                                    "";
                                  const title = `${name}-${phone}-${order?.order_number}`;
                                  setPrintTitle(title);
                                  handlePrint();
                                } finally {
                                  setTimeout(() => {
                                    setIsInvoiceLoading(false);
                                  }, 500);
                                }
                              }}
                              className="h-4 w-4 cursor-pointer hover:text-blue-500"
                            />
                            <Edit
                              onClick={() => {
                                router.push(
                                  `order/create?orderId=${order._id}`,
                                );
                              }}
                              className="h-4 w-4 cursor-pointer hover:text-blue-500"
                            />
                          </div>
                          <span
                            onClick={() =>
                              router.push(`order/view/${order._id}`)
                            }
                            className="font-medium text-[#1E8896] dark:text-[#2ec4d6] hover:underline cursor-pointer"
                          >
                            {order.order_number}
                          </span>
                          <div className="space-y-1 text-xs mt-1">
                            <div className="flex gap-1">
                              <span className="font-semibold w-14">
                                Created
                              </span>
                              <span className="text-muted-foreground">
                                {/* show date  */}
                                {formatDate(order?.dates?.created)}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <span className="font-semibold w-14">
                                Shipping
                              </span>
                              <span className="text-muted-foreground">
                                {formatDate(order?.dates?.shipping)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-red-500">
                              {order.isIpBlocked && "IP Blocked"}
                            </span>
                            {order.isIpBlocked && (
                              <Button
                                variant={"link"}
                                onClick={() => handleBlockIP(order._id ?? "")}
                              >
                                Unblock
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.includes("followUp") && (
                      <TableCell>{formatDate(order?.followUpDate)}</TableCell>
                    )}

                    {/* Customer Column */}
                    {visibleColumns.includes("customer") && (
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-[#1E8896] dark:text-[#2ec4d6] text-sm">
                              {order?.customerId?.full_name ||
                                order?.shipping_address?.full_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Badge className="bg-amber-400 rounded">New</Badge>
                            {/* <Info className="h-4 w-4 text-muted-foreground" /> */}
                            <CustomerInfoHoverCard order={order} />
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-foreground">
                              {order?.customerId?.phone ||
                                order?.shipping_address?.phone}
                            </span>
                            <Copy
                              onClick={() =>
                                handleCopy(
                                  order?.customerId?.phone ||
                                    order?.shipping_address?.phone ||
                                    "",
                                )
                              }
                              className="h-4 w-4 text-blue-500 cursor-pointer"
                            />
                            <div>
                              <WhatsappIcon
                                onClick={() =>
                                  handleWhatsApp(
                                    order?.customerId?.phone ||
                                      order?.shipping_address?.phone ||
                                      "",
                                  )
                                }
                                className="h-4 w-4 rounded-full"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-tight">
                            {order?.customerId?.address ||
                              order?.shipping_address?.address}
                          </p>
                        </div>
                      </TableCell>
                    )}

                    {/* Pickup Column */}
                    {visibleColumns.includes("pickup") && (
                      <TableCell className="py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[10px] rounded-sm font-normal"
                          >
                            {order.pickupAddress?.type}
                          </Badge>
                          <span className="text-xs text-[#1E8896] dark:text-[#2ec4d6]">
                            {order.pickupAddress?.location}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {/* Payments Info */}
                    {visibleColumns.includes("payment") && (
                      <TableCell className="py-4">
                        <div className="text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sales Amount:
                            </span>
                          </div>
                          <div className="font-medium">
                            {order?.payment?.currency}{" "}
                            {order?.payment?.sales.toFixed(2)}
                          </div>

                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">
                              Paid Amount:
                            </span>
                          </div>
                          <div>
                            {order?.payment?.currency}{" "}
                            {order?.payment?.paid.toFixed(2)}
                          </div>

                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">
                              Due Amount:
                            </span>
                          </div>
                          <div className="font-medium">
                            {order?.payment?.currency}{" "}
                            {order?.payment?.due.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Status */}
                    {visibleColumns.includes("status") && (
                      <TableCell className="py-4">
                        <Select
                          onValueChange={(val) =>
                            handleInlineStatusChange(order, val)
                          }
                          value={
                            Object.keys(STATUS_CONFIG).find(
                              (key) =>
                                key.toLowerCase() ===
                                (order.status || "Pending").toLowerCase(),
                            ) || "Pending"
                          }
                        >
                          <SelectTrigger className="min-w-25 h-8 px-3 gap-2 border-none bg-muted/50 hover:bg-muted font-medium text-[11px] rounded-full focus:ring-0">
                            <div
                              className={`size-1.5 rounded-full ${getStatusColor(order.status || "Pending")}`}
                            />
                            <SelectValue
                              placeholder={order.status || "Pending"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(STATUS_CONFIG).map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="text-xs"
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}

                    {/* Delivery Partner */}
                    {visibleColumns.includes("deliveryPartner") && (
                      <TableCell className="py-4 space-y-3">
                        {order?.courier?.name && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {order.courier.name}
                            </span>
                          </div>
                        )}
                        {order?.courier?.status && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium flex items-center gap-2  ">
                              Status:{" "}
                              <span
                                onClick={() => {
                                  if (order?.courier?.tracking_url) {
                                    window.open(
                                      order.courier.tracking_url,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }
                                }}
                                className="border cursor-pointer hover:border-blue-300 px-4 py-1 text-blue-300 font-semibold"
                              >
                                {" "}
                                {order.courier.status}
                              </span>
                            </span>
                          </div>
                        )}
                        {order?.courier?.consignmentId && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              ID: {order.courier.consignmentId}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    )}

                    {/* Delivery Fee */}
                    {visibleColumns.includes("deliveryFee") && (
                      <TableCell className="py-4">
                        <span className="text-xs font-medium">
                          {order?.payment?.currency}{" "}
                          {order?.delivery_charge?.toFixed(2) ??
                            order?.shipping_charge?.toFixed(2) ??
                            "0.00"}
                        </span>
                      </TableCell>
                    )}

                    {/* Sub Status / Reason */}
                    {visibleColumns.includes("reason") && (
                      <TableCell className="py-4">
                        {order.sub_status && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {order.sub_status}
                          </Badge>
                        )}
                        {/* {order.cancelReason && (
                        <div className="text-[10px] text-red-500 mt-1">
                          {order.cancelReason}
                        </div>
                      )} */}
                      </TableCell>
                    )}

                    {/* Action */}
                    {/* <TableCell className="py-4">
                      {order.internalNotes && (
                        <Button variant="ghost" size="icon">
                          <File className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell> */}
                    {visibleColumns.includes("notes") && (
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          {order.notes && order.notes.length > 0 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent className="w-80 max-h-80 overflow-y-auto">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">
                                    Internal Notes
                                  </h4>

                                  {order.notes.map((note, index) => (
                                    <div
                                      key={index}
                                      className="text-xs p-2  flex gap-2"
                                    >
                                      {index + 1}.
                                      <p className="text-foreground">{note}</p>
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Plus className="h-4 w-4 text-muted-foreground hover:text-gray-900" />
                              </Button>
                            </PopoverTrigger>

                            {/* Popover Content matching your image */}
                            <PopoverContent
                              className="w-85 p-3 shadow-lg border rounded-md"
                              align="end"
                              sideOffset={5}
                            >
                              <InternalNoteForm
                                id={order._id ?? ""}
                                onBack={() => mutate()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="py-4"></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Hidden Print Content */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {selectedPrintOrder && (
          <InvoicePreview
            order={selectedPrintOrder}
            storeSettingsData={storeSettingsData}
            invoiceRef={invoiceRef}
          />
        )}
      </div>
      <ChangeStatusDialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setOrderForStatusUpdate(null);
        }}
        selectedOrders={orderForStatusUpdate ? [orderForStatusUpdate] : []}
        onConfirm={async (updateData) => {
          try {
            const orderId = orderForStatusUpdate?._id;
            const orderLabel = orderForStatusUpdate?.order_number || "Order";

            if (updateData.status.toLowerCase() === "in-transit") {
              const res = await api.post(`/orders/${orderId}/send-to-courier`, {
                courier: updateData.subStatus,
                ...updateData.courierDetails,
              });
              if (res.status === 200) {
                toast.success(`${orderLabel} Sent to Courier successfully!`);
              }
            } else {
              const res = await api.put(`/orders/${orderId}`, {
                status: updateData.status,
                sub_status: updateData.subStatus || "",
                followUpDate: updateData.followUpDate || "",
              });
              if (res.status === 200) {
                toast.success(`${orderLabel}: Status updated!`);
              }
            }
            mutate();
          } catch (error: unknown) {
            const axiosError = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(
              axiosError.response?.data?.message || "Failed to update status",
            );
          } finally {
            setStatusDialogOpen(false);
            setOrderForStatusUpdate(null);
          }
        }}
      />
    </div>
  );
}

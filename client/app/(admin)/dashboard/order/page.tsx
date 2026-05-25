"use client";

import React, { useState, useMemo, useRef } from "react";
import { Order, OrderStatus } from "@/components/dashboard/order/data";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  Printer,
  FileDown,
  X,
  Upload,
  CalendarDays,
  ArrowLeftRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrdersTable } from "@/components/dashboard/order/orders-table";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { useRouter } from "next/navigation";
//import { useInvoiceDownload } from "@/hooks/invoiceDownload";
import InvoicePreview from "@/components/dashboard/orders/InvoicePreview";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { ChangeStatusDialog } from "@/components/dashboard/order/statusDialog";
import { toast } from "sonner";
import api from "@/lib/axios";
//import LoadingOverlay from "@/components/dashboard/shared/LoadingOverlay";
import { useReactToPrint } from "react-to-print";

const TAB_HIERARCHY: Record<string, string[]> = {
  "All Orders": [],
  Pending: [],
  "On Hold": [
    "Pre Order",
    "Out of Stock",
    "Awaiting Payment Confirmation",
    "Phone Number Unreachable",
    "Call Not Answered",
    "Awaiting Customer Decision",
    "Follow-up Call Scheduled",
    "Invalid Phone Number",
    "Additional Product Required",
    "Delivery Address Updated",
    "Delivery Date Updated",
    "Others",
  ],
  Approved: [],
  Processing: [],
  "Ready To Ship": [],
  "In-Transit": ["pathao", "steadfast"],
  Delivered: ["Payment Collected", "Payment Due"],
  Flagged: ["Pending Returned", "Damaged", "Returned"],
  Cancelled: [
    "Customer Unreachable",
    "Customer Payment Issues",
    "Customer Mistakenly Placed Order",
    "Customer Not Interested in Paying in Advance",
    "Customer Wants to Cancle",
    "Customer Will Not Be Available at delivery Time",
    "Customer Will Order Later",
    "Customer Not Interested",
    "Delay delivery",
    "Urgent Delivery Required",
    "Out of Area Coverage",
    "Product Stock-Out",
    "Product Price Issues",
    "Duplicate Order",
    "Test Order",
    "Fake Order",
    "other",
  ],
  Incomplete: [],
};

export default function OrdersPage() {
  const router = useRouter();
  // --- State ---
  const [activeTab, setActiveTab] = useState<OrderStatus>("Pending");
  const [activeChildTab, setActiveChildTab] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const invoiceRefs = useRef<{
  //   [key: string]: React.RefObject<HTMLDivElement | null>;
  // }>({});
 // const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const { data, isLoading, mutate } = useSWR<{ data: Order[] }>(
    "/orders",
    fetcher,
  );
  const ordersData = useMemo(() => data?.data || [], [data]);
  // --- Helpers ---
  const getCount = (status: OrderStatus, subStatus: string | null = null) => {
    // In a real app, you'd fetch these counts from the backend
    if (status === "All Orders") return ordersData.length;

    return ordersData.filter((o) => {
      const statusMatch = o?.status?.toLowerCase() === status.toLowerCase();
      if (!subStatus) return statusMatch;
      return (
        (statusMatch && o.sub_status === subStatus) ||
        o.courier?.name === subStatus
      );
    }).length;
  };
  //const { downloadInvoice } = useInvoiceDownload();

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    let data = ordersData;

    // 1. Filter by Main Status
    if (activeTab !== "All Orders") {
      data = data.filter(
        (order) => order.status?.toLowerCase() === activeTab.toLowerCase(),
      );
    }

    // 2. Filter by Child Tab (Sub Status)
    if (activeChildTab) {
      data = data.filter(
        (order) =>
          order.sub_status === activeChildTab ||
          order.courier?.name === activeChildTab,
      );
    }

    // 3. Filter by Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter((order) => {
        const orderNumber = order.order_number?.toLowerCase() || "";
        const customerName =
          order.shipping_address?.full_name?.toLowerCase() || "";
        const customerPhone =
          order.shipping_address?.phone?.toLowerCase() || "";
        return (
          orderNumber.includes(lowerSearch) ||
          customerName.includes(lowerSearch) ||
          customerPhone.includes(lowerSearch)
        );
      });
    }

    return data;
  }, [activeTab, activeChildTab, searchTerm, ordersData]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleTabChange = (status: OrderStatus) => {
    setActiveTab(status);
    setActiveChildTab(null);
    setCurrentPage(1);
    setSelectedOrderIds([]);
  };

  const handleChildTabChange = (subStatus: string) => {
    setActiveChildTab(subStatus === activeChildTab ? null : subStatus);
    setCurrentPage(1);
  };

  const toggleAllSelection = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(
        paginatedData.map((o) => o?._id).filter(Boolean) as string[],
      );
    } else {
      setSelectedOrderIds([]);
      setIsActionMenuOpen(false);
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedOrderIds((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      if (newSelection.length === 0) {
        setIsActionMenuOpen(false);
      }

      return newSelection;
    });
  };

  const availableChildTabs = TAB_HIERARCHY[activeTab] || [];

  const { storeSettingsData } = useStoreSettings();
  // const handleInvoiceDownload = async () => {
  //   if (selectedOrderIds.length === 0) {
  //     toast("Please select at least one order to download the invoice.");
  //     return;
  //   }
  //   setIsInvoiceLoading(true);

  //   // Loop through each selected order ID
  //   try {
  //     for (let i = 0; i < selectedOrderIds.length; i++) {
  //       const id = selectedOrderIds[i];
  //       const selectedOrder = ordersData.find((order) => order._id === id);

  //       if (selectedOrder) {
  //         // Create a specific file name for this individual order
  //         const fileName = `${selectedOrder.customerId?.full_name || "Customer"}-Invoice-${selectedOrder.order_number}.pdf`;

  //         // Grab the specific ref for this invoice
  //         const refElement = invoiceRefs.current[id];

  //         if (refElement && refElement.current) {
  //           // Trigger the download for this specific invoice
  //           downloadInvoice(
  //             refElement as React.RefObject<HTMLDivElement>,
  //             fileName,
  //           );

  //           // Wait 800ms before downloading the next one to prevent the browser from blocking it
  //           await new Promise((resolve) => setTimeout(resolve, 800));
  //         }
  //       }
  //     }
  //   } finally {
  //     setIsInvoiceLoading(false);
  //   }
  // };

  // const handleSendToCourierMany = useCallback(
  //   async (courier: string) => {
  //     if (selectedOrderIds.length === 0) {
  //       toast.error("Please select at least one product to Send.");
  //       return;
  //     }
  //     try {
  //       const res = await api.post(`/orders/send-to-courier-many`, {
  //         ids: selectedOrderIds,
  //         courier: courier,
  //       });
  //       if (res.status === 200) {
  //         console.log(res);
  //         toast.success(
  //           res.data.message || "Orders Send To Courier successfully",
  //         );
  //         setSelectedOrderIds([]);
  //         await mutate?.();
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       const axiosError = error as AxiosError<ApiErrorResponse>;
  //       toast.error(
  //         `Failed to send! ${axiosError?.response?.data?.message || "Failed to send!"}`,
  //       );
  //     }
  //   },
  //   [selectedOrderIds, mutate],
  // );
  // const handleSendToCourier = useCallback(
  //   async (id: string, type: string) => {
  //     try {
  //       const res = await api.post(`/orders/${id}/send-to-courier`, {
  //         courier: type,
  //       });
  //       if (res.status === 200) {
  //         //console.log(res);
  //         await mutate?.();
  //         toast(`Order-${id} send to ${type} courier!`);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       const axiosError = error as AxiosError<ApiErrorResponse>;
  //       toast.error(
  //         `Failed to send! ${axiosError?.response?.data?.message || "Failed to send!"}`,
  //       );
  //     }
  //     await mutate?.();
  //   },
  //   [mutate],
  // );

  const handleStatusUpdate = async (
    status: string,
    sub_status?: string,
    followUpDate?: Date,
    courierDetails?: Record<string, unknown>,
  ) => {
    if (selectedOrderIds.length === 0) {
      toast("Please select atleast one order to update status.");
      return;
    }
    const payload: {
      status: string;
      sub_status: string;
      followUpDate: string;
      courier?: { name: string };
    } = {
      status,
      sub_status:
        status.toLowerCase() === "in-transit" ? "" : (sub_status ?? ""),
      followUpDate: followUpDate ? followUpDate.toISOString() : "",
    };
    if (status.toLowerCase() === "in-transit" && sub_status) {
      payload.courier = {
        name: sub_status,
      };
    }
    let successCount = 0;

    await Promise.all(
      selectedOrderIds.map(async (orderId) => {
        const order = ordersData.find((o) => o._id === orderId);
        const orderLabel = order?.order_number || "Order";

        try {
          if (status.toLowerCase() === "in-transit" && sub_status) {
            const res = await api.post(`/orders/${orderId}/send-to-courier`, {
              courier: sub_status,
              ...courierDetails,
            });
            if (res.status === 200) {
              successCount++;
            } else {
              toast.error(`${orderLabel}: Failed to send to courier!`);
              return;
            }
          } else {
            const res = await api.put(`/orders/${orderId}`, payload);
            if (res.status === 200) {
              successCount++;
            }
          }
        } catch (error: unknown) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          let errMsg =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Something went wrong";

          // Simplify and Translate Common Carrybee Errors
          if (errMsg.toLowerCase().includes("recipient_phone")) {
            errMsg = "ফোন নম্বরটি ইনভ্যালিড (১০ বা ১১ ডিজিট হতে হবে)";
          } else if (errMsg.toLowerCase().includes("recipient_address")) {
            errMsg = "ঠিকানাটি অনেক ছোট বা অসম্পূর্ণ";
          } else if (errMsg.toLowerCase().includes("city_id")) {
            errMsg = "কুরিয়ারের জন্য সিটি/শহর সিলেক্ট করুন";
          } else if (errMsg.toLowerCase().includes("zone_id")) {
            errMsg = "কুরিয়ারের জন্য জোন সিলেক্ট করুন";
          } else if (errMsg.toLowerCase().includes("area_id")) {
            errMsg = "কুরিয়ারের জন্য এরিয়া সিলেক্ট করুন";
          } else if (errMsg.toLowerCase().includes("weight")) {
            errMsg = "পণ্যের ওজন সঠিক নয়";
          } else if (errMsg.toLowerCase().includes("validation error")) {
            errMsg = "তথ্যগুলো সঠিকভাবে পূরণ করা হয়নি";
          }

          toast.error(`${orderLabel}: ${errMsg}`);
        }
      }),
    );
    if (successCount > 0) {
      mutate();
      toast.success(
        `${successCount} order${successCount > 1 ? "s" : ""} status updated successfully`,
      );
    }
    setSelectedOrderIds([]);
    setIsActionMenuOpen(false);
  };

  const handleBlockIPSelected = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order.");
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    await Promise.all(
      selectedOrderIds.map(async (orderId) => {
        try {
          const res = await api.post(`/orders/${orderId}/block-ip`);

          if (res.status === 200) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }),
    );

    if (successCount > 0) {
      toast.success(
        `${successCount} order${successCount > 1 ? "s" : ""} IP status updated successfully`,
      );
    }

    if (failedCount > 0) {
      toast.error(
        `${failedCount} order${failedCount > 1 ? "s" : ""} failed to update IP status`,
      );
    }

    setSelectedOrderIds([]);
    setIsActionMenuOpen(false);
    mutate();
  };
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintInvoices = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Orders-Invoices",
  });

  return (
    <div className="min-h-screen  text-foreground  font-sans">
      {/* <LoadingOverlay show={isInvoiceLoading} /> */}
      <div className="space-y-6">
        {/* --- Header / Action Bar Area --- */}
        <div className="flex flex-col gap-4">
          {/* Top Row: Title & Global Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
              <h1 className="text-2xl font-bold">Orders</h1>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search order, customer, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 bg-transparent border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {/* Selection Counter  */}
              {selectedOrderIds.length > 0 && (
                <div className="flex items-center gap-2 mr-2 animate-in fade-in">
                  <span className="text-sm font-medium text-primary">
                    {selectedOrderIds.length} Selected
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={() => setSelectedOrderIds([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Settings Icon Button */}
              <Button
                variant="outline"
                size="icon"
                className="border-cyan-600 text-cyan-600 bg-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              {/* ACTION DROPDOWN */}
              <DropdownMenu
                open={isActionMenuOpen}
                onOpenChange={setIsActionMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-[#1E8896] border-border bg-white hover:bg-slate-50 hover:text-[#166d78]"
                  >
                    Action
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem
                    disabled={selectedOrderIds.length === 0}
                    onClick={() => setOpen(true)}
                    className="gap-3 cursor-pointer text-muted-foreground py-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" /> Change Status
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    //onClick={handleInvoiceDownload}
                    onClick={handlePrintInvoices}
                    className="gap-3 cursor-pointer font-semibold py-2 text-foreground"
                  >
                    <Printer className="h-4 w-4" /> Print Invoice
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-3 cursor-pointer text-muted-foreground/60 py-2"
                    disabled
                  >
                    <FileDown className="h-4 w-4" /> Export As CSV
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-3 cursor-pointer text-muted-foreground/60 py-2"
                    disabled
                  >
                    <FileDown className="h-4 w-4" /> Export Summary
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-3 cursor-pointer text-muted-foreground/60 py-2"
                    disabled
                  >
                    <Upload className="h-4 w-4" /> Upload Orders
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-3 cursor-pointer text-muted-foreground/60 py-2"
                    disabled
                  >
                    <CalendarDays className="h-4 w-4" /> Update Shipping Date
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={selectedOrderIds.length === 0}
                    onClick={handleBlockIPSelected}
                    className="gap-3 cursor-pointer text-muted-foreground py-2"
                  >
                    <X className="h-4 w-4" /> Toggle IP Block
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Order Button */}
              <Button
                className="bg-[#1E8896] hover:bg-[#166d78] text-white disabled:bg-gray-300 disabled:text-white/70 disabled:cursor-not-allowed"
                disabled={selectedOrderIds.length > 0}
                onClick={() => {
                  router.push("order/create");
                }}
              >
                Create Order
              </Button>
            </div>
          </div>
          <ChangeStatusDialog
            open={open}
            selectedOrders={ordersData.filter(o => o._id && selectedOrderIds.includes(o._id))}
            onClose={() => setOpen(false)}
            onConfirm={(data) => {
              // toast("Status updated successfully!");
              //console.log("STATUS UPDATE:", data);
              const followUpDate = data?.followUpDate
                ? typeof data.followUpDate === "string"
                  ? new Date(data.followUpDate)
                  : data.followUpDate
                : undefined;
              handleStatusUpdate(data.status, data.subStatus, followUpDate, data.courierDetails);
              mutate();
            }}
          />

          {/* --- Main Status Tabs --- */}
          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(TAB_HIERARCHY).map((status) => {
              const count = getCount(status as OrderStatus);
              const isActive = activeTab === status;
              return (
                <button
                  key={status}
                  onClick={() => handleTabChange(status as OrderStatus)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all
                    ${
                      isActive
                        ? "bg-[#1E8896] text-white font-medium shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {status}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-sm ${isActive ? "bg-white/20 text-white" : "bg-muted border border-border"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* --- Child Tabs (Rendered dynamically based on Parent) --- */}
          {availableChildTabs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
              {availableChildTabs.map((subStatus) => {
                const count = getCount(activeTab, subStatus);
                const isChildActive = activeChildTab === subStatus;
                return (
                  <button
                    key={subStatus}
                    onClick={() => handleChildTabChange(subStatus)}
                    className={`
                                text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2
                                ${
                                  isChildActive
                                    ? "border-[#1E8896] bg-[#1E8896]/10 text-[#1E8896] font-medium"
                                    : "border-border bg-card hover:border-[#1E8896]/50 text-muted-foreground"
                                }
                            `}
                  >
                    {subStatus}
                    <span className="font-semibold text-[10px] opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Table Component --- */}
        <OrdersTable
          //invoiceRef={invoiceRef}
          isLoading={isLoading}
          mutate={mutate}
          data={paginatedData}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          selectedRows={selectedOrderIds}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(Number(val));
            setCurrentPage(1);
          }}
          onRowSelect={toggleRowSelection}
          onSelectAll={toggleAllSelection}
        />
        {/* --- Hidden Individual Invoices Wrapper --- */}
        {/* {selectedOrderIds.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: "-10000px",
              top: 0,
              zIndex: -999,
            }}
          >
            {selectedOrderIds.map((id) => {
              const orderToPrint = ordersData.find((order) => order._id === id);

              if (!orderToPrint) return null;

              // Create a ref for this specific invoice if it doesn't exist
              if (!invoiceRefs.current[id]) {
                invoiceRefs.current[id] = React.createRef<HTMLDivElement>();
              }

              return (
                <div
                  key={orderToPrint._id}
                  style={{
                    width: "210mm",
                    backgroundColor: "#ffffff",
                    padding: "20px",
                  }}
                >
                  <InvoicePreview
                    invoiceRef={invoiceRefs.current[id]}
                    order={orderToPrint}
                    storeSettingsData={storeSettingsData}
                  />
                </div>
              );
            })}
          </div>
        )} */}
        {selectedOrderIds.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: "-10000px",
              top: 0,
            }}
          >
            <div 
            ref={printRef}
            >
              {selectedOrderIds.map((id) => {
                const orderToPrint = ordersData.find((o) => o._id === id);
                if (!orderToPrint) return null;

                return (
                  <div
                    key={id}
                    style={{
                      pageBreakAfter: "always",
                      // width: "210mm",
                      // background: "#fff",
                      // padding: "20px",
                    }}
                  >
                    <InvoicePreview
                     // invoiceRef={printRef}
                      order={orderToPrint}
                      storeSettingsData={storeSettingsData}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

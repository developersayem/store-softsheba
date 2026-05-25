"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { fetcher } from "@/lib/fetcher";
import {
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Printer,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useRef, useState } from "react";
import { Order } from "@/components/dashboard/order/data";
import { CustomerInfoHoverCard } from "@/components/dashboard/order/customerInfoHoverCard";
import { toast } from "sonner";
import api from "@/lib/axios";
import Image from "next/image";
import { ChangeStatusDialog } from "@/components/dashboard/order/statusDialog";
//import { useInvoiceDownload } from "@/hooks/invoiceDownload";
import InvoicePreview from "@/components/dashboard/orders/InvoicePreview";
import { useStoreSettings } from "@/contexts/store-settings-context";
import LoadingOverlay from "@/components/dashboard/shared/LoadingOverlay";
import { useReactToPrint } from "react-to-print";

export default function OrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const [noteText, setNoteText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading, mutate } = useSWR(`orders/${id}`, fetcher);
  const order: Order = useMemo(() => data?.data, [data]);
  //console.log(order);
  const invoiceRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  //const { downloadInvoice } = useInvoiceDownload();
  const { storeSettingsData } = useStoreSettings();
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${order?.customerId?.full_name}-Invoice-${order?.order_number}`,
  });

  const router = useRouter();
  if (isLoading) {
    return (
      <div className="fixed flex flex-col gap-4 inset-0 z-50 items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    );
  }
  if (!order) return <div className="p-6 text-red-500">Order not found</div>;

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

  // Calculate totals for the summary section based on items
  const totalQty =
    order?.items?.reduce(
      (acc: number, item) => acc + (item.quantity || 0),
      0,
    ) || 0;
  const discountAmount = order?.discount ?? 0;
  const subtotal = order?.subtotal ?? 0;

  const calculatedDiscount =
    order?.discount_Type === "flat"
      ? discountAmount
      : subtotal * (discountAmount / 100);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await api.put(`/orders/${id}`, {
        internalNotes: noteText,
      });
      if (res.status === 200) {
        toast("Note Added!");
        setNoteText("");
        setIsAdding(false);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to add note.");
    } finally {
      setSaving(false);
      await mutate();
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: string,
    sub_status?: string,
    followUpDate?: Date,
  ) => {
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

    try {
      const res = await api.put(`/orders/${id}`, payload);
      if (res.status === 200) {
        toast("Status updated successfully!");
      } else {
        toast("Failed to update status.");
      }
    } catch {
      toast("Failed to update status.");
    } finally {
      mutate();
    }
  };

  return (
    <div className=" min-h-screen">
      <LoadingOverlay show={isInvoiceLoading} />
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <InvoicePreview
          order={order}
          storeSettingsData={storeSettingsData}
          invoiceRef={invoiceRef}
        />
      </div>
      {/* Top Header Section */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold ">Order Details</h1>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-[#1A73E8] border border-[#1A73E8] rounded">
                Action <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem className="gap-3 cursor-pointer text-muted-foreground py-2">
                <FileDown className="h-4 w-4" /> Export Pdf
              </DropdownMenuItem>

              <DropdownMenuItem
                // onClick={async (e) => {
                //   e.stopPropagation();
                //   setIsInvoiceLoading(true);

                //   try {
                //     // Allow hidden InvoicePreview to render
                //     await new Promise((res) => setTimeout(res, 80));

                //     downloadInvoice(
                //       invoiceRef,
                //       `${order.customerId.full_name}-Invoice-${order.order_number}.pdf`,
                //     );
                //   } finally {
                //     // Give browser time to trigger download
                //     setTimeout(() => {
                //       setIsInvoiceLoading(false);
                //     }, 500);
                //   }
                // }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInvoiceLoading(true);
                  setTimeout(() => {
                    setIsInvoiceLoading(false);
                  }, 500);
                  handlePrint();
                }}
                className="gap-3 cursor-pointer font-semibold py-2 text-foreground"
              >
                <Printer className="h-4 w-4" /> Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => router.push(`/dashboard/order/create?orderId=${id}`)}
            className="px-4 py-1.5 text-sm font-medium bg-muted  rounded hover:bg-gray-600 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      <ChangeStatusDialog
        open={open}
        selectedOrders={order ? [order] : []}
        onClose={() => setOpen(false)}
        onConfirm={(data) => {
          // toast("Status updated successfully!");
         // console.log("STATUS UPDATE:", data);
          const followUpDate = data?.followUpDate
            ? typeof data.followUpDate === "string"
              ? new Date(data.followUpDate)
              : data.followUpDate
            : undefined;
          handleStatusUpdate(
            order?._id ?? "",
            data.status,
            data.subStatus,
            followUpDate,
          );
          mutate();
        }}
      />

      {/* Tabs */}
      <div className="px-6 border-b flex gap-6 text-sm font-medium ">
        <button className="py-3 text-[#1A73E8] border-b-2 border-[#1A73E8]">
          Details
        </button>
        <button className="py-3 hover:">Logs</button>
      </div>

      <div className="p-6 space-y-8">
        {/* Order Meta Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-700/10 text-teal-700 px-3 py-1 rounded text-sm font-medium border">
              {order.order_number || "SO-2260"}
              <Copy
                onClick={() => handleCopy(order.order_number)}
                size={14}
                className="cursor-pointer hover:text-teal-900"
              />
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-muted  rounded font-medium"
            >
              {order.status || "Ready To Ship"} <ChevronDown size={14} />
            </button>
            <div className="flex gap-1">
              <button className="p-1 border rounded hover:bg-gray-50 dark:hover:bg-muted ">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 border rounded bg-gray-200 dark:bg-muted ">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Order Information */}
          <div className="space-y-3 text-sm">
            <InfoRow
              label="Shipping Date"
              value={
                <div className="flex items-center gap-1.5">
                  {formatDate(order.dates?.shipping)}
                  <Calendar size={13} className="text-gray-400" />
                </div>
              }
            />
            <InfoRow
              label="Assigned to delivery partner"
              value={order.courier?.name || "Not Assigned Yet"}
            />
            <InfoRow
              label="Delivery Type"
              value={order.delivery_Type || "Regular"}
            />

            <InfoRow
              label="Additional Notes"
              value={order.additional_notes || "No notes."}
            />

            {/* Internal Notes Box */}
            {/* <div className="mt-6 border rounded-md">
              <div className="flex justify-between items-center p-3 border-b ">
                <span className="font-semibold  text-sm">Internal Notes</span>
                <button className="text-[#1A73E8] text-sm font-medium hover:underline">
                  Add Notes
                </button>
              </div>
              <div className="p-3">
                {order?.notes ? (
                  order?.notes?.map((note: string, i: number) => (
                    <p key={i} className="text-sm text-gray-600">
                      {i + 1}. {note}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No Notes.</p>
                )}
              </div>
            </div> */}
            <div className="mt-6 border rounded-md">
              {/* Header */}

              <div className="flex justify-between items-center p-3 border-b">
                <span className="font-semibold text-sm">Internal Notes</span>
                {isAdding ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNoteText("");
                      }}
                      className="text-red-500 text-sm font-medium hover:underline"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(order._id ?? "")}
                      className="text-[#1A73E8] text-sm font-medium hover:underline"
                      disabled={saving || !noteText.trim()}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="text-[#1A73E8] text-sm font-medium hover:underline"
                  >
                    Add Notes
                  </button>
                )}
              </div>
              {/* Add note form */}
              {isAdding && (
                <div className="border-t p-3 space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Add Internal Notes"
                    rows={3}
                  />
                </div>
              )}

              {/* Notes list */}
              <div className="p-3 space-y-2">
                {order.notes && order.notes.length > 0 ? (
                  order.notes.map((note, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {i + 1}. {note}{" "}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No Notes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Information */}
          <div className="space-y-4 text-sm flex flex-col items-end text-right">
            <div className="flex items-center gap-2">
              <CustomerInfoHoverCard order={order} />
              <h3 className="font-bold text-base ">
                {order.shipping_address?.full_name}
              </h3>
            </div>

            <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-400 text-yellow-900 rounded uppercase">
              New
            </span>

            <div className="flex items-center justify-end gap-2  font-medium">
              {/* WhatsApp icon  */}
              <svg
                onClick={() =>
                  handleWhatsApp(order.shipping_address?.phone ?? "")
                }
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="#25D366"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              <Copy
                onClick={() => handleCopy(order.shipping_address?.phone ?? "")}
                size={14}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              />
              <span>{order.shipping_address?.phone}</span>
            </div>

            <p className="text-gray-600">{order.shipping_address?.address}</p>

            <div className="mt-4">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="font-semibold ">Pick Up Location</p>
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  Warehouse
                </span>
              </div>
              <p className="text-[#1A73E8] font-medium text-sm cursor-pointer hover:underline">
                Pickup
              </p>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="font-semibold ">Drop Off Location</p>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                  Billing
                </span>
              </div>
              <p className="text-gray-600">{order.shipping_address?.address}</p>
            </div>
          </div>
        </div>

        {/* Items Table & Summary */}
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className=" border-b text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Attributes</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Requested Qty</th>
                <th className="px-4 py-3">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {order?.items?.length ? (
                order.items.map((item, i: number) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-teal-600">
                      {item.sku || "L02"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded overflow-hidden">
                        <Image
                          height={100}
                          width={100}
                          src={item.image || "https://placehold.co/40x40/png"}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1A73E8] font-medium cursor-pointer hover:underline">
                      {item.name || ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item?.selectedAttributes?.[0]?.name || ""} :{" "}
                      {item?.selectedAttributes?.[0]?.value || ""}
                    </td>
                    <td className="px-4 py-3">
                      BDT {item.price?.toFixed(2) || "650.00"}
                    </td>
                    <td className="px-4 py-3">{item.discount || ""}</td>
                    <td className="px-4 py-3 font-medium">
                      {item.quantity || "1"}
                    </td>

                    <td className="px-4 py-3">
                      BDT {(item.price * item.quantity)?.toFixed(2) || "650.00"}
                    </td>
                  </tr>
                ))
              ) : (
                // Fallback dummy row mirroring the image if items array is empty
                <tr className="hover:bg-muted/50 text-muted-foreground">
                  <td className="px-4 py-3 text-teal-600">L02</td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center text-white text-[8px] overflow-hidden">
                      img
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1A73E8] hover:underline cursor-pointer">
                    Pipe Cleaner / Block Out
                  </td>
                  <td className="px-4 py-3">0.9 kg</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">BDT 650.00</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-semibold">1</td>
                  <td className="px-4 py-3">0.9 kg</td>
                  <td className="px-4 py-3">BDT 650.00</td>
                </tr>
              )}

              {/* Seamless Summary Rows */}
              <tr className="">
                <td
                  colSpan={6}
                  className="px-4 py-2 text-right font-semibold text-muted-foreground"
                >
                  Sub - Total
                </td>
                <td className="px-4 py-2 font-semibold ">{totalQty || "1"}</td>
                <td className="px-4 py-2 font-semibold ">
                  BDT {order.subtotal?.toFixed(2) || "650.00"}
                </td>
              </tr>
              <tr className="">
                <td
                  colSpan={6}
                  className="px-4 py-2 text-right font-semibold text-muted-foreground"
                >
                  Discount
                </td>
                <td></td>
                <td colSpan={2} className="px-4 py-2 ">
                  - BDT {calculatedDiscount.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="">
                <td
                  colSpan={6}
                  className="px-4 py-2 text-right font-semibold text-muted-foreground"
                >
                  Delivery Fee
                </td>
                <td></td>
                <td colSpan={2} className="px-4 py-2 ">
                  BDT {order.shipping_charge?.toFixed(2) || "120.00"}
                </td>
              </tr>
              <tr className="">
                <td
                  colSpan={6}
                  className="px-4 py-2 text-right font-semibold text-muted-foreground"
                >
                  Advance Payment
                </td>
                <td></td>
                <td colSpan={2} className="px-4 py-2 ">
                  - BDT {order.payment?.paid.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className=" border-t">
                <td
                  colSpan={6}
                  className="px-4 py-3 text-right font-bold text-muted-foreground"
                >
                  Total Receivable
                </td>
                <td></td>
                <td colSpan={2} className="px-4 py-3 font-bold text-[#1A73E8]">
                  BDT {order.total?.toFixed(2) || "770.00"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="w-48  font-semibold">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "Feb 14, 2026 02:29 PM";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

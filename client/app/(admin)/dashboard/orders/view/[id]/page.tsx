"use client";

import { fetcher } from "@/lib/fetcher";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowLeft,
  Printer,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Package,
  Truck,
  User,
  AlertCircle,
  Edit,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { IOrderItem } from "@/types/order.type";
import Image from "next/image";
import Link from "next/link";
import InvoicePreview from "@/components/dashboard/orders/InvoicePreview";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import api from "@/lib/axios";

// --- Helper Functions ---

const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
  }).format(amount)} ৳`;

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "";

  switch (s) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          Pending
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
        >
          Confirmed
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Delivered
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function OrderView() {
  const { id } = useParams();
  const router = useRouter();
  const { storeSettingsData } = useStoreSettings();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const { data, mutate, error, isLoading } = useSWR(`orders/${id}`, fetcher);

  // Handle data structure safely
  const order = Array.isArray(data?.data) ? data?.data[0] : data?.data;
  //console.log(order);

  // --- Loading State (using Skeleton) ---
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Order not found</h2>
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setLoading(true);

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const imgProps = new window.Image();
      imgProps.src = dataUrl;

      imgProps.onload = () => {
        const pdfWidth = 80;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
        });

        doc.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        doc.save(`Invoice-${order.order_number}.pdf`);
        setLoading(false);
      };
    } catch {
      toast.error("Failed to generate PDF");
      setLoading(false);
    }
  };
  const handleRefresh = async (
    id: string,
    courier: string,
    trackingCode: string,
  ) => {
    if (!trackingCode) {
      toast.error("No tracking code available!");
      return;
    }
    setRefreshingId(id);
    try {
      const res = await api.post(`/orders/refresh-courier-status`, {
        orderId: id,
        courier,
        trackingCode,
      });
      if (res.status === 200) {
        //console.log(res);
        mutate();
        toast.success("Courier status refreshed");
      }
    } catch {
      toast.error("Failed to refresh courier status");
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="space-y-6">
        {/* --- Header --- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Order #{order.order_number}
                </h1>
                {getStatusBadge(order.status)}
              </div>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-3.5 w-3.5" />
                {formatDate(order.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/orders/edit/${order._id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" onClick={() => handleDownload()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 ">
          {/* --- Left Column (Product Details) --- */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Items Card */}
            <Card className="dark:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 ">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  Order Items
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-normal"
                  >
                    {order.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right pr-6">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item: IOrderItem) => (
                      <TableRow key={item._id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={item.image || ""}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                height={100}
                                width={100}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://placehold.co/100?text=No+Img";
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{item.name}</span>
                              <div className="flex flex-wrap gap-2">
                                {item.sku && (
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {item.sku}
                                  </span>
                                )}
                                {item.selectedAttributes?.map(
                                  (attr, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="h-5 px-1.5 text-[10px] font-normal"
                                    >
                                      {attr.name || "Option"}: {attr.value}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium pr-6">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card className="dark:bg-accent">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Shipping Charge</span>
                  <span className="text-foreground">
                    {formatCurrency(order.shipping_charge)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>- {formatCurrency(order.discount)}</span>
                  </div>
                )}

                {order.coupon_discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span>- {formatCurrency(order.coupon_discount)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoicePreview
                  storeSettingsData={storeSettingsData}
                  order={order}
                  handleDownload={handleDownload}
                  invoiceRef={invoiceRef}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>

          {/* --- Right Column  --- */}
          <div className="space-y-6">
            {/* --- Courier Info --- */}
            {order.courier?.name && (
              <Card className="dark:bg-accent">
                <CardHeader className="pb-3 ">
                  <div className="flex justify-between items-center flex-wrap gap-2 ">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                      Courier Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRefresh(
                          order._id,
                          order.courier.name,
                          order.courier.trackingCode!,
                        );
                      }}
                    >
                      {" "}
                      {refreshingId === order._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                        </>
                      )}
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Courier Name
                    </span>
                    <span className="font-medium capitalize">
                      {order.courier.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Invoice ID
                    </span>
                    <span className="font-medium">
                      {order.courier.invoiceId || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Consignment / Tracking Code
                    </span>
                    <span className="font-medium">
                      {order.courier.trackingCode || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Courier Status
                    </span>
                    <Badge
                      variant={
                        order.courier.status === "in_review"
                          ? "secondary"
                          : order.courier.status === "shipped"
                            ? "default"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {order.courier.status || "N/A"}
                    </Badge>
                  </div>

                  {order.courier.tracking_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Track Order
                      </span>
                      <a
                        href={order.courier.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline font-medium"
                      >
                        Track Here
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer Details */}
            <Card className="dark:bg-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.customerId ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {order.customerId.full_name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <span className="font-medium text-sm">
                          {order.customerId.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Registered Customer
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-1 text-sm">
                      <a
                        href={`tel:${order.customerId.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {order.customerId.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground italic text-sm">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    Guest Checkout
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card className="dark:bg-accent">
              <CardHeader className="">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="font-medium">
                  {order?.shipping_address?.full_name}
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  {order?.shipping_address?.city}
                  <br />
                  {order?.shipping_address?.address}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{order?.shipping_address?.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment & Logistics */}
            <Card className="dark:bg-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Payment Method
                  </span>
                  <div className="flex items-center gap-2 font-medium bg-muted-foreground/10 p-2 rounded">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="uppercase">{order.payment_method}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Shipping Zone
                  </span>
                  <span className="font-medium bg-muted-foreground/10 p-2 rounded">
                    {order?.shipping_address?.city}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

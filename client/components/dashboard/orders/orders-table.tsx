"use client";

import {
  useState,
  useMemo,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Search, Trash2 } from "lucide-react";
import { TbTruckDelivery } from "react-icons/tb";

import { IOrder } from "@/types/order.type";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import TableRows, { ApiErrorResponse } from "./Table-row";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AxiosError } from "axios";

interface OrdersTableProps {
  orders?: IOrder[];
  mutateOrdersData: KeyedMutator<{ data: IOrder[] }>;
  incompleteOrderClicked: boolean;
  setIncompleteOrderClicked: Dispatch<SetStateAction<boolean>>;
}

export function OrdersTable({
  orders = [],
  mutateOrdersData,
  incompleteOrderClicked,
  setIncompleteOrderClicked,
}: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  //console.log(selectedOrders)

  // -------------------- Filtering --------------------
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o?.shipping_address?.full_name?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, search, statusFilter]);

  //handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked)
        setSelectedOrders(filteredOrders.map((p) => p._id as string));
      else setSelectedOrders([]);
    },
    [filteredOrders],
  );

  const handleDeleteMany = useCallback(async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one product to delete.");
      return;
    }
    try {
      const res = await api.post(`/orders/delete-many`, {
        ids: selectedOrders,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Orders deleted successfully");
        setSelectedOrders([]);
        await mutateOrdersData?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting orders");
    }
  }, [selectedOrders, mutateOrdersData]);
  const handleSendToCourierMany = useCallback(
    async (courier: string) => {
      if (selectedOrders.length === 0) {
        toast.error("Please select at least one product to Send.");
        return;
      }
      try {
        const res = await api.post(`/orders/send-to-courier-many`, {
          ids: selectedOrders,
          courier: courier,
        });
        if (res.status === 200) {
          //console.log(res);
          toast.success(
            res.data.message || "Orders Send To Courier successfully",
          );
          setSelectedOrders([]);
          await mutateOrdersData?.();
        }
      } catch (error) {
        console.error(error);
        const axiosError = error as AxiosError<ApiErrorResponse>;
        toast.error(
          `Failed to send! ${axiosError?.response?.data?.message || "Failed to send!"}`,
        );
      }
    },
    [selectedOrders, mutateOrdersData],
  );
  const handleToggleIncompleteOrders = () => {
    setIncompleteOrderClicked(!incompleteOrderClicked);
    mutateOrdersData();
  };

  // -------------------- Export Function --------------------
  const handleExport = useCallback(() => {
    const dataToExport =
      selectedOrders.length > 0
        ? orders.filter((o) => selectedOrders.includes(o?._id??""))
        : filteredOrders;

    if (dataToExport.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Define CSV Headers based on your IOrder interface
    const headers = [
      "Order #",
      "Date",
      "Customer Name",
      "Phone",
      "Items Count",
      "Total Amount",
      "Status",
      "Courier",
      "Tracking Code",
    ];

    const csvRows = dataToExport.map((o) => {
      // Helper to sanitize text data and avoid CSV breaking on commas
      const clean = (val:string) => `"${String(val || "").replace(/"/g, '""')}"`;

      return [
        clean(o.order_number),
        clean(new Date(o?.created_at || new Date())?.toLocaleDateString()),
        clean(o?.shipping_address?.full_name??""),
        clean(o?.shipping_address?.phone??""),
        o.items?.length || 0,
        o.total,
        clean(o?.status??""),
        clean(o.courier?.name || "N/A"),
        clean(o.courier?.trackingCode || "N/A"),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Successfully exported ${dataToExport.length} orders`);
  }, [selectedOrders, filteredOrders, orders]);
  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filteredOrders.length / limit);
  const paginated = filteredOrders.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order / customer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export{" "}
            {selectedOrders.length > 0 ? `(${selectedOrders.length})` : "All"}
          </Button>
          <Tooltip>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-yellow-500 hover:text-yellow-700"
                    disabled={selectedOrders.length === 0}
                  >
                    <TbTruckDelivery className="h-5 w-5 text-amber-400 hover:text-amber-500" />
                    send to courier
                  </Button>
                </TooltipTrigger>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-accent">
                <AlertDialogHeader>
                  <AlertDialogTitle>Choose Courier?</AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-amber-600 text-white hover:bg-red-700"
                    onClick={() => handleSendToCourierMany("steadfast")}
                  >
                    Steadfast
                  </AlertDialogAction>
                  <AlertDialogAction
                    className="bg-orange-600 text-white hover:bg-red-700"
                    onClick={() => handleSendToCourierMany("pathao")}
                  >
                    Pathao
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>{" "}
            <TooltipContent side="top" className="text-sm">
              Send to Courier
            </TooltipContent>
          </Tooltip>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
                disabled={selectedOrders.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  selected orders.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white"
                  onClick={handleDeleteMany}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant={"outline"}
            onClick={() => handleToggleIncompleteOrders()}
            className={`${incompleteOrderClicked ? "text-blue-300" : ""} hover:text-blue-400 `}
          >
            {incompleteOrderClicked ? (
              "All "
            ) : (
              <>
                {" "}
                <svg
                  id="Incomplete-Cancel--Streamline-Carbon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <desc>
                    {
                      "\n    Incomplete Cancel Streamline Icon: https://streamlinehq.com\n  "
                    }
                  </desc>
                  <defs />
                  <path
                    d="M15 10.705 14.295 10 12.5 11.795 10.705 10 10 10.705 11.795 12.5 10 14.295 10.705 15 12.5 13.205 14.295 15 15 14.295 13.205 12.5 15 10.705z"
                    fill="#a8a7ae"
                    strokeWidth={0.5}
                  />
                  <path
                    d="M7 13a6 6 0 0 1 0 -12Z"
                    fill="#a8a7ae"
                    strokeWidth={0.5}
                  />
                  <path
                    d="M8.91285 2.3821a5.0144 5.0144 0 0 1 1.6211 1.08395l0.70665 -0.70675a6.01795 6.01795 0 0 0 -1.945 -1.3008Z"
                    fill="#a8a7ae"
                    strokeWidth={0.5}
                  />
                  <path
                    d="M13 7a5.965 5.965 0 0 0 -0.45835 -2.2954l-0.9236 0.38255A4.9714 4.9714 0 0 1 12 7Z"
                    fill="#a8a7ae"
                    strokeWidth={0.5}
                  />
                  <path
                    id="_Transparent_Rectangle_"
                    d="M0 0h16v16H0Z"
                    fill="none"
                    strokeWidth={0.5}
                  />
                </svg>
                Incomplete {" "}
              </>
            )}
            Orders
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              {/* <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem> */}
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((p) =>
                      selectedOrders.includes(p._id as string),
                    )
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </TableHead>

              <TableHead>ORDER</TableHead>
              <TableHead>CUSTOMER</TableHead>
              <TableHead>ITEMS</TableHead>
              <TableHead>PAYMENT</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>COURIER</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((order) => {
              return (
                <TableRows
                  order={order}
                  selectedOrders={selectedOrders}
                  setSelectedOrders={setSelectedOrders}
                  mutateOrdersData={mutateOrdersData}
                  key={order._id}
                />
              );
            })}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

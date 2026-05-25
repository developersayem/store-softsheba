"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { IOrder } from "@/types/order.type";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Edit, Eye, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { TbTruckDelivery } from "react-icons/tb";
import { AxiosError } from "axios";
const STATUS_COLORS: Record<string, string> = {
  pending: "!bg-yellow-100 !text-yellow-800",
  confirmed: "!bg-blue-100 !text-blue-800",
  processing: "!bg-purple-100 !text-purple-800",
  shipped: "!bg-indigo-100 !text-indigo-800",
  delivered: "!bg-green-100 !text-green-800",
  cancelled: "!bg-red-100 !text-red-800",
};
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  success?: boolean;
}

export default function TableRows({
  order,
  selectedOrders,
  setSelectedOrders,
  mutateOrdersData,
}: {
  order: IOrder;
  selectedOrders: string[];
  setSelectedOrders: Dispatch<SetStateAction<string[]>>;
  mutateOrdersData: KeyedMutator<{ data: IOrder[] }>;
}) {
  const [status, setStatus] = useState<string>(order?.status??"");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(order?.status??"");
  }, [order, mutateOrdersData]);

  // handle select single
  const handleSelectOrder = useCallback(
    (orderId: string, checked: boolean) => {
      if (checked) setSelectedOrders((prev) => [...prev, orderId]);
      else setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    },
    [setSelectedOrders],
  );

  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/orders/${id}`);
        if (res.status === 200) {
          toast.success("Order deleted successfully");
          await mutateOrdersData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting order");
      }
    },
    [mutateOrdersData],
  );
  const handleUpdateStatus = useCallback(
    async (newStatus: string) => {
      // optimistic UI update
      setStatus(newStatus);

      try {
        const res = await api.patch(`/orders/${order._id}/status`, {
          status: newStatus,
        });

        if (res.status === 200) {
          //toast.success("Order status updated");
          await mutateOrdersData();
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update order status");

        // rollback UI if API fails
        setStatus(order.status??"");
      }
    },
    [order._id, order.status, mutateOrdersData],
  );
  const handleSendToCourier = useCallback(
    async (id: string, type: string) => {
      try {
        const res = await api.post(`/orders/${id}/send-to-courier`, {
          courier: type,
        });
        if (res.status === 200) {
          //console.log(res);
          await mutateOrdersData?.();
          setStatus(res.data.data.status);
          toast(`Order-${id} send to ${type} courier!`);
        }
      } catch (error) {
        console.error(error);
        const axiosError = error as AxiosError<ApiErrorResponse>;
        toast.error(
          `Failed to send! ${axiosError?.response?.data?.message || "Failed to send!"}`,
        );
      }
      await mutateOrdersData?.();
    },
    [mutateOrdersData],
  );
  const handleRefresh = useCallback(
    async (id: string, courier: string, trackingCode: string) => {
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
          await mutateOrdersData?.();
          toast.success("Courier status refreshed");
        }
      } catch {
        toast.error("Failed to refresh courier status");
      } finally {
        setRefreshingId(null);
      }
    },
    [mutateOrdersData],
  );
  const handleBlockIP = async (orderId: string) => {
    try {
      const res=await api.post(`/orders/${orderId}/block-ip`);
      console.log(res);
      if (!order.isIpBlocked) {
        await mutateOrdersData();
        toast.success("IP blocked successfully");
      } else {
        await mutateOrdersData();
        toast.success("IP Unblocked successfully");
      }
    } catch {
      toast.error("Failed to block IP");
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/orders/edit/${id}`;
  };

  return (
    <TableRow key={order._id}>
      <TableCell>
        <Checkbox
          checked={selectedOrders.includes(order._id as string)}
          onCheckedChange={(checked) =>
            handleSelectOrder(order._id as string, Boolean(checked))
          }
        />
      </TableCell>
      <TableCell className="font-medium">#{order.order_number}</TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span>{order?.shipping_address?.full_name}</span>
          <span className="text-xs text-muted-foreground">
            {order?.shipping_address?.phone}
          </span>
        </div>
      </TableCell>

      <TableCell>{order?.items?.length}</TableCell>

      <TableCell className="uppercase">{order.payment_method}</TableCell>

      <TableCell className="font-semibold">
        ৳{order?.total?.toLocaleString()}
      </TableCell>

      <TableCell>
        {/* <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge> */}
        <Select
          value={status}
          onValueChange={handleUpdateStatus}
          disabled={status == "incomplete"}
        >
          <SelectTrigger
            className={`w-22.5 px-4 py-1 rounded-full border-none text-xs flex justify-center  items-center text-center font-medium capitalize [&>svg]:hidden ${STATUS_COLORS[status]}`}
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            {status == "incomplete" && (
              <SelectItem value="incomplete">Incomplete</SelectItem>
            )}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {order.courier ? (
          <div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                handleRefresh(
                  order._id??"",
                  order?.courier?.name??"",
                  order?.courier?.trackingCode??"",
                );
              }}
            >
              {" "}
              {refreshingId === order._id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <span className="ml-2 capitalize">
              {order.courier.status ?? "N/A"}
            </span>
          </div>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-fit px-2 text-amber-400 hover:text-amber-500"
                disabled={status == "incomplete"}
              >
                <TbTruckDelivery className="h-5 w-5" />
                send to courier
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Choose Courier?</AlertDialogTitle>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-amber-600 text-white hover:bg-red-700"
                  onClick={() => {
                    handleSendToCourier(order._id as string, "steadfast");
                  }}
                >
                  Steadfast
                </AlertDialogAction>
                <AlertDialogAction
                  className="bg-orange-600 text-white hover:bg-red-700"
                  onClick={() => {
                    handleSendToCourier(order._id as string, "pathao");
                  }}
                >
                  Pathao
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>

      <TableCell>
        {new Date(order?.created_at|| new Date()).toLocaleDateString("en-us", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </TableCell>

      <TableCell>
        <div>
          <Link href={`/dashboard/orders/view/${order._id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(order._id as string)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={
              order.isIpBlocked
                ? "text-green-600 hover:text-green-700"
                : "text-red-600 hover:text-red-700"
            }
            onClick={() => handleBlockIP(order?._id ?? "")}
            title={order.isIpBlocked ? "Unblock IP" : "Block IP"}
          >
            {order.isIpBlocked ? "Unblock IP" : "Block IP"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-semibold text-red-600">
                    {order.order_number}
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeleteOne(order._id as string)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

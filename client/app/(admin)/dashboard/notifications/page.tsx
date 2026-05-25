"use client";

import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { INotification } from "@/components/dashboard/notifications/NotificationsPreview";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

import { HasPermission } from "@/components/shared/has-permission";
import { AccessDenied } from "@/components/shared/access-denied";

export default function Notifications() {
  const router = useRouter();
  const { data, mutate, isLoading } = useSWR("/notifications", fetcher);

  const notifications: INotification[] = data || [];

  const unreadCount = notifications?.filter((n) => !n.isRead)?.length;

  const markAsRead = async (id: string, orderId: string) => {
    router.push(`/dashboard/order/view/${orderId}`);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };
  const handleStockAlertMarkAsRead = async (id: string, orderId: string) => {
    router.push(`/dashboard/products/view/${orderId}`);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };
  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast("Notification Deleted!");
      mutate();
    } catch {
      toast("Not Deleted! ");
    }
  };
  const handleSupportRead = async (id: string) => {
    router.push(`/dashboard/support`);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };

  return (
    <HasPermission 
      permission="notifications:view" 
      fallback={<AccessDenied title="Notifications Restricted" />}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} Unread
            </span>
          )}
        </h1>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 border" />
            <Skeleton className="h-20 border" />
            <Skeleton className="h-20 border" />
          </div>
        )}

        {!isLoading && notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
            No notifications available
          </p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`flex flex-col gap-1 md:flex-row justify-between cursor-pointer items-start md:items-center p-4 rounded-md transition-colors
                  ${
                    n.isRead
                      ? "bg-accent border border-gray-300 dark:border-gray-700"
                      : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
                  }
                  hover:shadow-md
                `}
              >
                <div
                  className="w-full"
                  onClick={() => {
                    if (n.type === "support") {
                      handleSupportRead(n._id);
                    } else if (n.title !== "Low Stock Alert") {
                      markAsRead(n._id, n.orderId);
                    }  else {
                      handleStockAlertMarkAsRead(n._id, n.productId);
                    }
                  }}
                >
                  <p
                    className={`font-semibold text-sm ${
                      n.isRead
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2 mt-2 md:mt-0">
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <p className="w-2 h-2 rounded-full bg-blue-300" />
                      Unread
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNotification(n._id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HasPermission>
  );
}

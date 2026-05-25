"use client";

import api from "@/lib/axios";
import { fetcher } from "@/lib/fetcher";
import { socket } from "@/lib/socket";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export interface INotification {
  _id: string;
  orderId: string;
  productId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  created_at: string;
}

export default function NotificationsPreview() {
  const { data, mutate } = useSWR("/notifications", fetcher);
  const router = useRouter();

  const notifications: INotification[] = data || [];
  //console.log(notifications);
  const [open, setOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const previewItems = unreadNotifications.slice(0, 5);
  //console.log(unreadNotifications);
  /* SOCKET LISTENER */
  useEffect(() => {
    const handleNewNotification = (newNotification: INotification) => {
      mutate();
      const truncateMessage = (msg: string, maxWords = 24) => {
        const words = msg.split(" ");
        if (words.length <= maxWords) return msg;
        return words.slice(0, maxWords).join(" ") + "...";
      };

      toast(newNotification.title, {
        description: truncateMessage(newNotification.message),
        action: {
          label: "View",
          onClick: () => router.push("/dashboard/notifications"),
        },
      });
    };

    socket?.on("notification:new", handleNewNotification);

    return () => {
      socket?.off("notification:new", handleNewNotification);
    };
  }, [mutate, router]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        previewRef.current &&
        !previewRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id: string, orderId: string) => {
    router.push(`/dashboard/order/view/${orderId}`);
    setOpen(false);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };
  const handleStockAlert = async (id: string, productId: string) => {
    router.push(`/dashboard/products/view/${productId}`);
    setOpen(false);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };
  const handleSupportRead = async (id: string) => {
    router.push(`/dashboard/support`);
    setOpen(false);
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch {
      toast("Notification status Didnot updated!");
    }
  };
  return (
    <div className="relative" ref={previewRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative focus:outline-none h-9 w-9 flex items-center justify-center border border-neutral-200 dark:border-neutral-500 rounded-md hover:bg-accent transition-all duration-200"
        aria-label="Notifications"
      >
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1.5 -right-1 rounded-full bg-red-600 w-4 h-4 text-[10px] text-white flex items-center justify-center border-2 border-neutral-50 dark:border-[#0A0A0A]">
            {unreadNotifications.length}
          </span>
        )}
        <Bell className="h-[1.2rem] w-[1.2rem]" />
      </button>

      {/* Preview Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1 w-60 sm:w-100  bg-accent border rounded-md shadow-lg z-50">
          <div className="p-3 border-b font-semibold text-sm">
            Notifications
          </div>

          {previewItems.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">
              No unread notifications
            </p>
          ) : (
            <ul className="max-h-[70vh] overflow-auto">
              {previewItems.map((item) => (
                <li
                  key={item._id}
                  className="px-4 py-3 border-b hover:bg-primary/10 cursor-pointer"
                  onClick={() => {
                    if (item.type === "support") {
                      handleSupportRead(item._id);
                    } else if (item.title !== "Low Stock Alert") {
                      handleRead(item._id, item.orderId);
                    } else {
                      handleStockAlert(item._id, item.productId);
                    }
                  }}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.message}
                  </p>
                  <span className="text-xs text-muted-foreground ">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                  <span
                    className={`pl-2 text-xs text-extrabold ${
                      item.isRead ? "text-blue-300" : "text-red-300"
                    } `}
                  >
                    {item.isRead ? "Read" : "Unread"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="p-2 text-center border-t">
            <Link
              href={"/dashboard/notifications"}
              className="text-sm text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

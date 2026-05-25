"use client";

import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { format } from "date-fns";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import MessagePreview from "@/components/dashboard/support/MessagePreview";

interface SupportMail {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  status?: "pending" | "resolved";
}

export default function SupportPage() {
  const { data, isLoading, mutate } = useSWR("/support", fetcher);
  const mails: SupportMail[] = data?.data ?? [];
  useEffect(() => {
    const handleNewSupportMail = () => {
      mutate();
    };
    socket?.on("notification:new", handleNewSupportMail);
    return () => {
      socket?.off("notification:new", handleNewSupportMail);
    };
  }, [mutate]);

  return (
    <div className="min-h-screen  ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Support Inbox
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All customer support requests are displayed here.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-accent shadow rounded-lg p-6 h-32"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && mails.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            No support mails found.
          </p>
        )}

        {/* Support Mail Cards */}
        {!isLoading &&
          mails.map((mail) => (
            <div
              key={mail._id}
              className="bg-accent/50 shadow-md rounded-lg p-6 flex flex-col md:flex-row justify-between gap-4"
            >
              {/* User Info */}
              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mail.name} {mail.phone && ` | ${mail.phone}`}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mail.email}
                </p>
                <div className="mt-2 p-4 bg-accent/50 border-x-4 border-accent rounded-lg">
                   <MessagePreview message={mail.message} id={mail._id} />
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-col items-start md:items-end justify-between">
                <span className="text-gray-400 dark:text-gray-500 text-sm">
                  {format(new Date(mail.createdAt), "dd MMM yyyy, hh:mm a")}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLicense } from "@/hooks/use-license";
import publicApi from "@/lib/publicApi";

export function LicenseStatus() {
  const { metadata, status: currentStatus, isValid, mutate } = useLicense();
  const [isSyncing, setIsSyncing] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const res = await publicApi.post("/license/sync");
      if (res.status === 200) {
        await mutate();
      }
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!metadata) return null;

  const { expirationDate } = metadata;

  const getDaysLeft = () => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const today = new Date();
    return Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const daysLeft = getDaysLeft();
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  const SyncButton = () => (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors group/sync"
      title="Sync license status now"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : "group-hover/sync:rotate-180 transition-transform duration-500"}`} />
    </button>
  );

  if (currentStatus === "expired") {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1.5 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 h-9 px-3 font-medium transition-all duration-300"
      >
        <AlertCircle className="h-4 w-4" />
        License Expired
        <SyncButton />
      </Badge>
    );
  }

  if (currentStatus === "revoked") {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1.5 animate-pulse border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 h-9 px-3 font-medium"
      >
        <AlertCircle className="h-4 w-4" />
        License Revoked
        <SyncButton />
      </Badge>
    );
  }

  if (currentStatus === "suspended") {
    return (
      <Badge
        className="flex items-center gap-1.5 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 h-9 px-3 font-medium"
      >
        <AlertCircle className="h-4 w-4" />
        License Suspended
        <SyncButton />
      </Badge>
    );
  }

  if (currentStatus === "connection_error") {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 text-neutral-500 border-neutral-200 dark:border-neutral-800 h-9 px-3 font-medium bg-neutral-50/50 dark:bg-neutral-900/50"
      >
        <Clock className="h-4 w-4 animate-spin-slow" />
        Syncing License...
        <SyncButton />
      </Badge>
    );
  }

  if (!isValid) {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1.5 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 h-9 px-3 font-medium"
      >
        <AlertCircle className="h-4 w-4" />
        Invalid License
        <SyncButton />
      </Badge>
    );
  }

  if (isExpiringSoon) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-3 h-9 rounded-md font-medium"
      >
        <Clock className="h-4 w-4" />
        {daysLeft} days left
        <SyncButton />
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1.5 bg-green-50/50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/50 px-3 h-9 rounded-md font-medium"
    >
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      License Active {daysLeft !== null && `(${daysLeft}d)`}
      <SyncButton />
    </Badge>
  );
}

"use client";

import { StaffTable } from "@/components/dashboard/staff/StaffTable";
import LoadingCom from "@/components/shared/loading-com";
import { fetcher } from "@/lib/fetcher";
import { IUser } from "@/types/user.type";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const StaffPage = () => {
  const { data, isLoading, error, mutate } = useSWR<{ data: IUser[] }>(
    "/staff",
    fetcher
  );

  const staffData = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store staff and their permissions.
          </p>
        </div>
        <Link href="/dashboard/staff/add">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" /> Add Staff
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingCom />
        </div>
      ) : error || staffData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card border-2 border-dashed rounded-xl p-8 text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Plus className="size-6" />
          </div>
          <h3 className="text-lg font-semibold">No Staff Found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            It looks like you haven&apos;t added any staff members yet.
          </p>
          <Link href="/dashboard/staff/add">
            <Button size="sm" className="mt-2">
              Add Your First Staff
            </Button>
          </Link>
        </div>
      ) : (
        <StaffTable staffData={staffData} mutateStaffData={mutate} />
      )}
    </div>
  );
};

export default StaffPage;

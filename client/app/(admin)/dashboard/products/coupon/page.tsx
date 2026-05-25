"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Download, FileText, Upload, X } from "lucide-react";
import { useState } from "react";

import { ICoupon } from "@/types/coupon.type";

import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import LoadingCom from "@/components/shared/loading-com";
import api from "@/lib/axios";
import { toast } from "sonner";

import { AddCouponModal } from "@/components/dashboard/coupon/add-coupon-modal";
import { EditCouponModal } from "@/components/dashboard/coupon/edit-coupon-modal";
import { CouponTable } from "@/components/dashboard/coupon/coupon-table";

const CouponsPage = () => {
  const [openImport, setOpenImport] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<ICoupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // -------------------------------------------
  // FETCH ALL COUPONS
  // -------------------------------------------
  const {
    data: couponsRes,
    isLoading,
    mutate: mutateCouponsData,
  } = useSWR<{ data: ICoupon[] }>("/coupons", fetcher);

  const couponsData = couponsRes?.data || [];

  // -------------------------------------------
  // EXPORT
  // -------------------------------------------
  const handleExport = (format: "csv" | "json") => {
    const exportData = selectedCoupons.length ? selectedCoupons : couponsData;

    if (exportData.length === 0) {
      toast.error("No coupons to export");
      return;
    }

    const timestamp = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (format === "json") {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coupons-${timestamp}.json`;
      link.click();
      return;
    }

    // CSV Export
    const headers = [
      "_id",
      "Code",
      "Type",
      "Discount",
      "Min Purchase",
      "Start Date",
      "End Date",
      "Active",
      "Created At",
      "Updated At",
    ];

    const csv = [
      headers.join(","),
      ...exportData.map((c: ICoupon) =>
        [
          c._id,
          `"${c.code}"`,
          c.discount_type,
          c.discount,
          c.min_purchase ?? "",
          c.start_date,
          c.end_date,
          c.isActive,
          c.createdAt,
          c.updatedAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coupons-${timestamp}.csv`;
    link.click();
  };

  // -------------------------------------------
  // IMPORT
  // -------------------------------------------
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/coupons/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Coupons imported successfully");
      await mutateCouponsData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message: string } } })?.response?.data
          ?.message || "Failed to import coupons";
      toast.error(msg);
    } finally {
      setOpenImport(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = "";
  };

  // -------------------------------------------
  // EDIT
  // -------------------------------------------
  const handleEditCoupon = (coupon: ICoupon) => {
    setEditingCoupon(coupon);
    setEditOpen(true);
  };

  // -------------------------------------------
  // PAGE
  // -------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Coupons</h1>

        <div className="flex flex-wrap gap-2">
          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileText className="h-4 w-4 mr-2" />
                Export to JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import */}
          {!openImport ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenImport(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-dashed border-green-500! text-green-600 bg-transparent"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setOpenImport(false)}
              >
                <X className="h-5 w-5 font-extrabold" />
              </Button>
            </div>
          )}

          {/* Add Coupon */}
          <AddCouponModal mutateCouponsData={mutateCouponsData} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingCom displayText="Loading coupons" />
      ) : (
        <CouponTable
          coupons={couponsData}
          onEdit={handleEditCoupon}
          mutateData={mutateCouponsData}
          onSelectionChange={setSelectedCoupons}
        />
      )}

      {/* Edit Modal */}
      <EditCouponModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        coupon={editingCoupon}
        mutateCouponsData={mutateCouponsData}
      />
    </div>
  );
};

export default CouponsPage;

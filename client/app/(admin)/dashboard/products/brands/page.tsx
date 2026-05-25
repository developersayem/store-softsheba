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
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import LoadingCom from "@/components/shared/loading-com";
import api from "@/lib/axios";
import { toast } from "sonner";
import { IBrand } from "@/types/brand.type";
import { AddBrandsModal } from "@/components/dashboard/brands/add-brand-model";
import { BrandsTable } from "@/components/dashboard/brands/brands-table";
import { EditBrandModal } from "@/components/dashboard/brands/edit-brand-modal";

const BrandsPages = () => {
  const [openImport, setOpenImport] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<IBrand[]>([]);
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);

  // fetch all brand data
  const {
    data: brandsRes,
    isLoading: isBrandsLoading,
    mutate: mutateBrandsData,
  } = useSWR<{ data: IBrand[] }>("/brands", fetcher);

  const brandsData = brandsRes?.data || [];

  // function to handle export brands
  const handleExport = (format: "csv" | "json") => {
    // pick only selected brands, or all if none selected
    const exportData = selectedBrands.length > 0 ? selectedBrands : brandsData;

    if (exportData.length === 0) {
      toast.error("No brands to export");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (format === "json") {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `brands-${formattedDate}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "_id",
        "Name",
        "Slug",
        "Logo",
        "Featured",
        "Published",
        "Created At",
        "Updated At",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData.map((p: IBrand) =>
          [
            p._id,
            `"${p.name}"`,
            `"${p.slug}"`,
            `"${p.image || ""}"`,
            p.isFeatured,
            p.isPublished,
            p.createdAt,
            p.updatedAt,
          ].join(",")
        ),
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `brands-${formattedDate}.csv`;
      link.click();
    }
  };

  // main handler to upload file
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/brands/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Brands imported successfully");
        await mutateBrandsData(); // refresh list after import
      }
    } catch (error: unknown) {
      console.error("Import error:", error);
      const msg =
        (error as { response?: { data?: { message: string } } }).response?.data
          ?.message || "Failed to import brands";
      toast.error(msg);
    } finally {
      setOpenImport(false);
    }
  };

  // input change handler
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = ""; // reset file input for re-upload
  };

  // Handle open edit brand modal
  const handleEditBrand = (brand: IBrand) => {
    setEditingBrand(brand);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Brands</h1>
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

          {/* Add brand modal */}
          <AddBrandsModal mutateBrandsData={mutateBrandsData} />
        </div>
      </div>

      {/* Products Table */}

      {isBrandsLoading ? (
        <div>
          <LoadingCom displayText="Loading" />
        </div>
      ) : (
        <BrandsTable
          brands={brandsData}
          onEditBrand={handleEditBrand}
          mutateBrandsData={mutateBrandsData}
          onSelectedChange={(selected) => setSelectedBrands(selected)}
        />
      )}
      {/* Edit Modal */}
      <EditBrandModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        brand={editingBrand}
        mutateBrandsData={mutateBrandsData}
      />
    </div>
  );
};

export default BrandsPages;

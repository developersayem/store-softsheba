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
import { AddCategoriesModal } from "@/components/dashboard/categories/add-categories-modal";
import { ICategory } from "@/types/category.type";
import { CategoriesTable } from "@/components/dashboard/categories/category-table";
import { EditCategoryModal } from "@/components/dashboard/categories/edit-category-modal";

const CategoriesPages = () => {
  const [openImport, setOpenImport] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );

  // fetch all categories data
  const {
    data: categoriesRes,
    isLoading: isCategoriesLoading,
    mutate: mutateCategoriesData,
  } = useSWR<{ data: ICategory[] }>("/categories", fetcher);

  const categoriesData = categoriesRes?.data || [];

  // function to handle export collections
  const handleExport = (format: "csv" | "json") => {
    // pick only selected categories or all if none selected
    const exportData =
      selectedCategories.length > 0
        ? categoriesData.filter((c) => selectedCategories.includes(c))
        : categoriesData;

    if (exportData.length === 0) {
      toast.error("No categories to export");
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
      link.download = `categories-${formattedDate}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "_id",
        "Name",
        "Slug",
        "Description",
        "Parent ID",
        "Parent Name",
        "Featured",
        "Published",
        "Image",
        "Created At",
        "Updated At",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData.map((p: ICategory) =>
          [
            p._id,
            `"${p.name}"`,
            `"${p.slug}"`,
            `"${p.description || ""}"`,
            `"${p.parent?._id || ""}"`,
            `"${p.parent?.name || ""}"`,
            p.isFeatured,
            p.isPublished,
            `"${p.icon || ""}"`,
            `"${p.banner || ""}"`,
            p.createdAt,
            p.updatedAt,
          ].join(",")
        ),
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `categories-${formattedDate}.csv`;
      link.click();
    }
  };

  // main handler to upload file
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/categories/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Categories imported successfully");
        await mutateCategoriesData(); // refresh list after import
      }
    } catch (error: unknown) {
      console.error("Import error:", error);
      const msg =
        (error as { response?: { data?: { message: string } } }).response?.data
          ?.message || "Failed to import categories";
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

  // Handle open edit category modal
  const handleEditCategory = (category: ICategory) => {
    setEditingCategory(category);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
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

          {/* Add category modal */}
          <AddCategoriesModal
            categoriesData={categoriesData}
            mutateCategoriesData={mutateCategoriesData}
          />
        </div>
      </div>

      {/* Products Table */}

      {isCategoriesLoading ? (
        <div>
          <LoadingCom displayText="Loading" />
        </div>
      ) : (
        <CategoriesTable
          categories={categoriesData}
          onEditCategory={handleEditCategory}
          mutateCategoriesData={mutateCategoriesData}
          onSelectionChange={setSelectedCategories}
        />
      )}
      {/* Edit Modal */}
      <EditCategoryModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        category={editingCategory}
        categories={categoriesData}
        mutateCategoriesData={mutateCategoriesData}
      />
    </div>
  );
};

export default CategoriesPages;

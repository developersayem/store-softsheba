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
import { AddCollectionModal } from "@/components/dashboard/collections/add-collection-model";
import { ICollection } from "@/types/collection.type";
import { CollectionsTable } from "@/components/dashboard/collections/collection-table";
import { EditCollectionModal } from "@/components/dashboard/collections/edit-collection-modal";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import LoadingCom from "@/components/shared/loading-com";
import api from "@/lib/axios";
import { toast } from "sonner";

const CollectionsPages = () => {
  const [openImport, setOpenImport] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<ICollection[]>(
    []
  );
  const [editingCollection, setEditingCollection] =
    useState<ICollection | null>(null);

  // fetch all collection data
  const {
    data: collectionsRes,
    isLoading: isCollectionLoading,
    mutate: mutateCollectionsData,
  } = useSWR<{ data: ICollection[] }>("/collections", fetcher);

  const collectionsData = collectionsRes?.data || [];

  // function to handle export collections
  const handleExport = (format: "csv" | "json") => {
    // pick only selected collections, or all if none selected
    const exportData =
      selectedCollections.length > 0 ? selectedCollections : collectionsData;

    if (exportData.length === 0) {
      toast.error("No collections to export");
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
      link.download = `collections-${formattedDate}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "_id",
        "Name",
        "Slug",
        "Description",
        "Products",
        "Featured",
        "Published",
        "Image",
        "Created At",
        "Updated At",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData
          .map((p: ICollection) =>
            p.products && Array.isArray(p.products)
              ? [
                  p._id,
                  `"${p.name}"`,
                  `"${p.slug}"`,
                  `"${p.description || ""}"`,
                  `"${p.products.join("|")}"`,
                  p.isFeatured,
                  p.isPublished,
                  `"${p.image || ""}"`,
                  p.createdAt,
                  p.updatedAt,
                ].join(",")
              : null
          )
          .filter(Boolean), // remove any null values
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collections-${formattedDate}.csv`;
      link.click();
    }
  };

  // main handler to upload file
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/collections/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Collections imported successfully");
        await mutateCollectionsData(); // refresh list after import
      }
    } catch (error: unknown) {
      console.error("Import error:", error);
      const msg =
        (error as { response?: { data?: { message: string } } }).response?.data
          ?.message || "Failed to import collections";
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

  // Handle open edit Collection modal
  const handleEditCollection = (collection: ICollection) => {
    setEditingCollection(collection);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Collections</h1>
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

          {/* Add Collection modal */}
          <AddCollectionModal mutateCollectionsData={mutateCollectionsData} />
        </div>
      </div>

      {/* Products Table */}

      {isCollectionLoading ? (
        <div>
          <LoadingCom displayText="Loading" />
        </div>
      ) : (
        <CollectionsTable
          collections={collectionsData}
          onEditCollection={handleEditCollection}
          mutateCollectionsData={mutateCollectionsData}
          onSelectionChange={setSelectedCollections}
        />
      )}
      {/* Edit Modal */}
      <EditCollectionModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={editingCollection}
        mutateCollectionsData={mutateCollectionsData}
      />
    </div>
  );
};

export default CollectionsPages;

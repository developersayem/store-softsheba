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

import { IAttribute } from "@/types/attributes.type";

import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import LoadingCom from "@/components/shared/loading-com";
import api from "@/lib/axios";
import { toast } from "sonner";

import { AddAttributeModal } from "@/components/dashboard/attribute/add-attribute-model";
import { EditAttributeModal } from "@/components/dashboard/attribute/edit-attribute-modal";
import { AttributeTable } from "@/components/dashboard/attribute/attribute-table";

const AttributesPage = () => {
  const [openImport, setOpenImport] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<IAttribute[]>(
    []
  );
  const [editingAttribute, setEditingAttribute] = useState<IAttribute | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);

  // -------------------------------------------
  // FETCH ALL ATTRIBUTES
  // -------------------------------------------
  const {
    data: attributesRes,
    isLoading,
    mutate: mutateAttributesData,
  } = useSWR<{ data: IAttribute[] }>("/attributes", fetcher);

  const attributesData = attributesRes?.data || [];

  // -------------------------------------------
  // EXPORT
  // -------------------------------------------
  const handleExport = (format: "csv" | "json") => {
    const exportData =
      selectedAttributes.length > 0 ? selectedAttributes : attributesData;

    if (exportData.length === 0) {
      toast.error("No attributes to export");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (format === "json") {
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attributes-${formattedDate}.json`;
      link.click();
      return;
    }

    // CSV Export
    const headers = [
      "_id",
      "Name",
      "Slug",
      "Values",
      "Active",
      "Created At",
      "Updated At",
    ];

    const csv = [
      headers.join(","),
      ...exportData.map((a: IAttribute) =>
        [
          a._id,
          `"${a.name}"`,
          `"${a.slug}"`,
          `"${a.values.join("|")}"`,
          a.isActive,
          a.createdAt,
          a.updatedAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attributes-${formattedDate}.csv`;
    link.click();
  };

  // -------------------------------------------
  // IMPORT
  // -------------------------------------------
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/attributes/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Attributes imported successfully");
      await mutateAttributesData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message: string } } })?.response?.data
          ?.message || "Failed to import attributes";
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
  const handleEditAttribute = (attr: IAttribute) => {
    setEditingAttribute(attr);
    setEditOpen(true);
  };

  // -------------------------------------------
  // PAGE RENDER
  // -------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Attributes</h1>

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

          {/* Add Attribute */}
          <AddAttributeModal mutateAttributesData={mutateAttributesData} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingCom displayText="Loading attributes" />
      ) : (
        <AttributeTable
          attributes={attributesData}
          onEdit={handleEditAttribute}
          onSelectionChange={setSelectedAttributes}
          mutateData={mutateAttributesData}
        />
      )}

      {/* Edit Modal */}
      <EditAttributeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        attribute={editingAttribute}
        mutateAttributesData={mutateAttributesData}
      />
    </div>
  );
};

export default AttributesPage;

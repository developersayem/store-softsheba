"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Download, FileText, Plus, Upload, X } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import api from "@/lib/axios";
import LoadingCom from "@/components/shared/loading-com";
import { ProductsTable } from "@/components/dashboard/products/products-table";
import { IProduct } from "@/types/product.type";

const ProductsPages = () => {
  const [openImport, setOpenImport] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);

  const {
    data: productsRes,
    isLoading: isProductsLoading,
    mutate: mutateProductsData,
  } = useSWR<{ data: IProduct[] }>("/products/all", fetcher);

  const productsData = productsRes?.data || [];

  // ---------------- EXPORT ----------------
  const handleExport = (format: "csv" | "json") => {
    const exportData =
      selectedProducts.length > 0 ? selectedProducts : productsData;

    if (!exportData.length) {
      toast.error("No products to export");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (format === "json") {
      const simplifiedData = exportData.map((p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        categories: (p.categories || []).map((c) => c.name).join(", "),
        brand: p.brand?.name || "",
        hasVariants: p.hasVariants,
        variants: (p.variants || []).map((v) => ({
          sku: v.sku,
          price: v.regular_price,
          discount_type: v.discount_type,
          discount: v.discount,
          stock: v.stock,
          sold: v.sold,
          attributes: (v.attributes || []).map((a) => ({
            [a.attributeId.name]: a.value,
          })),
        })),
        is_published: p.is_published,
        thumbnail: p.thumbnail || "",
        createdAt: p.createdAt || "",
        updatedAt: p.updatedAt || "",
      }));

      const blob = new Blob([JSON.stringify(simplifiedData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-${formattedDate}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "_id",
        "Name",
        "Slug",
        "Categories",
        "Brand",
        "Has Variants",
        "Variant SKUs",
        "Published",
        "Thumbnail",
        "Created At",
        "Updated At",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData.map((p) =>
          [
            p._id,
            `"${p.name}"`,
            `"${p.slug}"`,
            `"${(p.categories || []).map((c) => c.name).join("|")}"`,
            `"${p.brand?.name || ""}"`,
            p.hasVariants,
            `"${(p.variants || []).map((v) => v.sku).join("|")}"`,
            p.is_published,
            `"${p.thumbnail || ""}"`,
            p.createdAt || "",
            p.updatedAt || "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-${formattedDate}.csv`;
      link.click();
    }
  };

  // ---------------- IMPORT ----------------
  const onImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Products imported successfully");
        await mutateProductsData();
      }
    } catch (error: unknown) {
      console.error("Import error:", error);
      const msg =
        (error as { response?: { data?: { message: string } } }).response?.data
          ?.message || "Failed to import products";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex flex-wrap gap-2">
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
                  className="border-2 border-dashed border-green-500 text-green-600 bg-transparent"
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
          <Link href="/dashboard/products/add">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      {/* Products Table */}
      {isProductsLoading ? (
        <LoadingCom displayText="Loading" />
      ) : (
        <ProductsTable
          products={productsData}
          mutateProductsData={mutateProductsData}
          onSelectionChange={setSelectedProducts}
        />
      )}
    </div>
  );
};

export default ProductsPages;

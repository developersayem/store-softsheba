"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  Zap,
  ZapOff,
  Eye,
} from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { IProduct } from "@/types/product.type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "../order/orders-table";

interface ProductsTableProps {
  products?: IProduct[];
  className?: string;
  onSelectionChange?: (selected: IProduct[]) => void;
  mutateProductsData?: KeyedMutator<{ data: IProduct[] }>;
}

export function ProductsTable({
  products = [],
  className,
  onSelectionChange,
  mutateProductsData,
}: ProductsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // -------------------- Filtering --------------------
  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (filterBy === "published")
    filtered = filtered.filter((p) => p.is_published);
  else if (filterBy === "unpublished")
    filtered = filtered.filter((p) => !p.is_published);

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // -------------------- Handlers --------------------
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelectedProducts(products.map((p) => p._id as string));
      else setSelectedProducts([]);
    },
    [products],
  );

  const handleSelectProduct = useCallback(
    (productId: string, checked: boolean) => {
      if (checked) setSelectedProducts((prev) => [...prev, productId]);
      else setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    },
    [],
  );

  // Only call onSelectionChange when selectedProducts actually changes
  useEffect(() => {
    if (!onSelectionChange) return;

    const selectedObjects = products.filter((p) =>
      selectedProducts.includes(p._id as string),
    );
    onSelectionChange(selectedObjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts]); // Only depend on selectedProducts, not products or onSelectionChange

  // -------------------- Actions --------------------
  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/products/update/${id}`;
  };

  // handel delete one
  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/products/${id}`);
        if (res.status === 200) {
          toast.success("Product deleted successfully");
          await mutateProductsData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting product");
      }
    },
    [mutateProductsData],
  );

  // handel delete many
  const handleDeleteMany = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to delete.");
      return;
    }
    try {
      const res = await api.post(`/products/delete-many`, {
        ids: selectedProducts,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Products deleted successfully");
        setSelectedProducts([]);
        await mutateProductsData?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting products");
    }
  }, [selectedProducts, mutateProductsData]);

  // handel toggle publish
  const handleTogglePublish = useCallback(
    async (productId: string) => {
      try {
        const res = await api.patch(`/products/${productId}/toggle-publish`);
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateProductsData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating product");
      }
    },
    [mutateProductsData],
  );

  // handel toggle flash sale
  const handleToggleFlashSale = useCallback(
    async (productId: string) => {
      try {
        const res = await api.patch(`/products/${productId}/toggle-flash_sale`);
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateProductsData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating product");
      }
    },
    [mutateProductsData],
  );

  // handel toggle publish many
  const handleTogglePublishMany = useCallback(
    async (action: "publish" | "unpublish") => {
      if (selectedProducts.length === 0) {
        toast.error("Please select at least one product.");
        return;
      }
      try {
        const res = await api.patch(`/products/toggle-multiple-publish`, {
          ids: selectedProducts,
          action,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedProducts([]);
          await mutateProductsData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating products");
      }
    },
    [selectedProducts, mutateProductsData],
  );

  // handel toggle flash sale many
  const handleToggleFlashSaleMany = useCallback(
    async (action: "flash_sale" | "disable_flash_sale") => {
      if (selectedProducts.length === 0) {
        toast.error("Please select at least one product.");
        return;
      }
      try {
        const res = await api.patch(`/products/toggle-multiple-flash_sale`, {
          ids: selectedProducts,
          action,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedProducts([]);
          await mutateProductsData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating products");
      }
    },
    [selectedProducts, mutateProductsData],
  );

  // -------------------- Render --------------------

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center md:justify-between">
        <div className="flex w-full items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
              Rows:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1); // Reset to page 1 when changing limit
              }}
            >
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue placeholder="12" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
                disabled={selectedProducts.length === 0}
                onClick={() => handleTogglePublishMany("publish")}
              >
                <Star />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Publish Selected
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={selectedProducts.length === 0}
                onClick={() => handleTogglePublishMany("unpublish")}
              >
                <StarOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Unpublish Selected
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-yellow-500 hover:text-yellow-700"
                disabled={selectedProducts.length === 0}
                onClick={() => handleToggleFlashSaleMany("flash_sale")}
              >
                <Zap />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Enable Flash Sale
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={selectedProducts.length === 0}
                onClick={() => handleToggleFlashSaleMany("disable_flash_sale")}
              >
                <ZapOff />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Disable Flash Sale
            </TooltipContent>
          </Tooltip>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
                disabled={selectedProducts.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  selected products.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white"
                  onClick={handleDeleteMany}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger size="sm" className="w-35">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Table */}
      <div className="border rounded-lg capitalize">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((p) =>
                      selectedProducts.includes(p._id as string),
                    )
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </TableHead>
              <TableHead className="font-semibold">NAME</TableHead>
              <TableHead className="font-semibold">CATEGORY</TableHead>
              <TableHead className="font-semibold">BRAND</TableHead>
              <TableHead className="font-semibold">PRICE</TableHead>
              <TableHead className="font-semibold">STOCK</TableHead>
              <TableHead className="font-semibold text-center">
                RATINGS
              </TableHead>
              <TableHead className="font-semibold">PUBLISHED</TableHead>
              <TableHead className="font-semibold">Flash Sale</TableHead>
              <TableHead className="font-semibold">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product._id as string)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(
                        product._id as string,
                        Boolean(checked),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2 h-8 group">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Image
                            src={product.thumbnail || "/placeholder.png"}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="rounded cursor-pointer hover:scale-105 transition-transform"
                          />
                        </DialogTrigger>
                        <DialogContent
                          className="max-w-3xl p-0 bg-white border-none shadow-none"
                          showCloseButton={false}
                          aria-describedby={undefined}
                        >
                          <DialogTitle className="sr-only">
                            Product Image
                          </DialogTitle>
                          <Image
                            src={product.thumbnail || "/placeholder.png"}
                            alt={product.name}
                            width={800}
                            height={800}
                            className="rounded-lg mx-auto"
                          />
                        </DialogContent>
                      </Dialog>
                      <div className="flex flex-col min-w-0 py-1 ">
                        <span
                          onClick={() =>
                            router.push(
                              `/dashboard/products/update/${product._id}`,
                            )
                          }
                          className="font-medium cursor-pointer line-clamp-1 hover:text-blue-500 whitespace-normal break-words max-w-[450px] leading-relaxed"
                        >
                          {product.name}
                        </span>
                        <div className=" flex items-center gap-1 text-blue-500 ">
                          {/* open in new tab */}
                          <Link
                            href={`/dashboard/products/update/${product._id}`}
                            className="hidden group-hover:flex text-[13px] hover:underline"
                          >
                            Edit
                          </Link>
                          <span className="hidden group-hover:flex text-[13px] hover:underline">
                            |
                          </span>

                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="hidden  group-hover:flex text-[13px] hover:underline"
                          >
                            view
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {product.categories?.map((c) => c.name).join(", ")}
                </TableCell>
                <TableCell>{product.brand?.name}</TableCell>
                <TableCell>
                  {product.hasVariants
                    ? Math.min(...product.variants.map((v) => v.regular_price))
                    : product.regular_price}
                </TableCell>
                <TableCell>
                  {product.hasVariants
                    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                    : product.stock || 0}
                </TableCell>
                <TableCell className="text-center font-medium text-yellow-600">
                  {(() => {
                    const avgVariantRating =
                      product.hasVariants && product.variants?.length > 0
                        ? product.variants.reduce(
                            (acc, v) => acc + (v.ratings || 0),
                            0,
                          ) / product.variants.length
                        : 0;
                    return product.ratings || avgVariantRating || 0;
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Switch
                      checked={product.is_published}
                      onCheckedChange={() =>
                        handleTogglePublish(product._id as string)
                      }
                    />
                    <p className="text-muted-foreground">
                      {product.publishedAt
                        ? formatDate(product.publishedAt)
                        : "Not published"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_flash_sale}
                    onCheckedChange={() =>
                      handleToggleFlashSale(product._id as string)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/products/view/${product.slug}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product._id as string)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="bg-accent">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete{" "}
                            <span className="font-semibold text-red-600">
                              {product.name}
                            </span>
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() =>
                              handleDeleteOne(product._id as string)
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-6"
                >
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {(() => {
              const pages = [];
              const showLeftEllipsis = currentPage > 4;
              const showRightEllipsis = currentPage < totalPages - 3;

              // ---  ALWAYS SHOW FIRST 3 PAGES ---
              const startPages = [1, 2, 3].filter((p) => p <= totalPages);
              startPages.forEach((p) => {
                pages.push(
                  <PaginationItem key={`start-${p}`}>
                    <PaginationLink
                      onClick={() => setCurrentPage(p)}
                      isActive={currentPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>,
                );
              });

              // ---  LEFT ELLIPSIS ---
              if (showLeftEllipsis) {
                pages.push(
                  <PaginationItem key="left-ellipsis">
                    <PaginationEllipsis />
                  </PaginationItem>,
                );
              }

              // ---  MIDDLE / CURRENT TAB (If not already in start or end) ---
              // We show current page and its neighbors if it's far enough from boundaries
              if (currentPage > 3 && currentPage < totalPages - 2) {
                // If we are just past the start, we might only need to show the current page
                pages.push(
                  <PaginationItem key={`current-${currentPage}`}>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage)}
                      isActive={true}
                      className="cursor-pointer"
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>,
                );
              }

              // ---  RIGHT ELLIPSIS ---
              if (showRightEllipsis) {
                pages.push(
                  <PaginationItem key="right-ellipsis">
                    <PaginationEllipsis />
                  </PaginationItem>,
                );
              }

              // ---  ALWAYS SHOW LAST 3 PAGES ---
              const endPages = [
                totalPages - 2,
                totalPages - 1,
                totalPages,
              ].filter((p) => p > 3);
              // Remove duplicates if totalPages is small
              const uniqueEndPages = [...new Set(endPages)];

              uniqueEndPages.forEach((p) => {
                pages.push(
                  <PaginationItem key={`end-${p}`}>
                    <PaginationLink
                      onClick={() => setCurrentPage(p)}
                      isActive={currentPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>,
                );
              });

              return pages;
            })()}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <div className="text-center text-xs text-muted-foreground">
        showing {paginated.length} of {filtered.length} products
      </div>
    </div>
  );
}

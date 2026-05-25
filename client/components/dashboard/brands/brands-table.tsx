"use client";

import { useState, useCallback } from "react";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import {
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  BookCheck,
  BookDashed,
} from "lucide-react";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

import api from "@/lib/axios";
import { IBrand } from "@/types/brand.type";
import { KeyedMutator } from "swr";
import { toast } from "sonner";

interface BrandsTableProps {
  brands?: IBrand[];
  className?: string;
  onEditBrand?: (brand: IBrand) => void;
  mutateBrandsData?: KeyedMutator<{ data: IBrand[] }>;
  onSelectedChange?: (brands: IBrand[]) => void;
}

export function BrandsTable({
  brands = [],
  className,
  onEditBrand,
  mutateBrandsData,
  onSelectedChange,
}: BrandsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selected, setSelected] = useState<string[]>([]);

  // ---------------- FILTERING ----------------
  let filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterBy === "published")
    filtered = filtered.filter((b) => b.isPublished);
  if (filterBy === "unpublished")
    filtered = filtered.filter((b) => !b.isPublished);

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  // ---------------- SELECTION ----------------
  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      const ids = checked ? paginated.map((b) => b._id) : [];
      setSelected(ids);
      onSelectedChange?.(brands.filter((b) => ids.includes(b._id)));
    },
    [paginated, brands, onSelectedChange]
  );

  const toggleSelectOne = useCallback(
    (id: string, checked: boolean) => {
      setSelected((prev) => {
        const updated = checked ? [...prev, id] : prev.filter((x) => x !== id);
        onSelectedChange?.(brands.filter((b) => updated.includes(b._id)));
        return updated;
      });
    },
    [brands, onSelectedChange]
  );

  // ---------------- ACTIONS ----------------
  const deleteOne = useCallback(
    async (id: string) => {
      try {
        const result = await api.delete(`/brands/${id}`);
        if (result.status === 200) {
          toast.success("Brand deleted");
          mutateBrandsData?.();
        }
      } catch {
        toast.error("Error deleting brand");
      }
    },
    [mutateBrandsData]
  );

  const deleteMany = useCallback(async () => {
    if (!selected.length) return toast.error("Select at least 1 item");

    try {
      const result = await api.post(`/brands/delete-many`, { ids: selected });
      toast.success(result.data.message || "Deleted successfully");
      setSelected([]);
      mutateBrandsData?.();
    } catch {
      toast.error("Error deleting brands");
    }
  }, [selected, mutateBrandsData]);

  const togglePublishOne = useCallback(
    async (id: string) => {
      try {
        const result = await api.patch(`/brands/${id}/toggle-published`);
        toast.success(result.data.message);
        mutateBrandsData?.();
      } catch {
        toast.error("Error updating publish state");
      }
    },
    [mutateBrandsData]
  );

  const togglePublishMany = useCallback(
    async (action: "publish" | "unpublish") => {
      if (!selected.length) return toast.error("Select at least 1 item");

      try {
        const result = await api.patch(`/brands/toggle-multiple-published`, {
          ids: selected,
          action,
        });

        toast.success(result.data.message);
        setSelected([]);
        mutateBrandsData?.();
      } catch {
        toast.error("Error updating brands");
      }
    },
    [selected, mutateBrandsData]
  );

  const toggleFeaturedOne = useCallback(
    async (id: string) => {
      try {
        const result = await api.patch(`/brands/${id}/toggle-featured`);
        toast.success(result.data.message);
        mutateBrandsData?.();
      } catch {
        toast.error("Error updating featured state");
      }
    },
    [mutateBrandsData]
  );

  const toggleFeaturedMany = useCallback(
    async (action: "feature" | "unfeature") => {
      if (!selected.length) return toast.error("Select at least 1 item");

      try {
        const result = await api.patch(`/brands/toggle-multiple-featured`, {
          ids: selected,
          action,
        });

        toast.success(result.data.message);
        setSelected([]);
        mutateBrandsData?.();
      } catch {
        toast.error("Error updating brands");
      }
    },
    [selected, mutateBrandsData]
  );

  const handleEdit = useCallback(
    (brand: IBrand) => {
      onEditBrand?.(brand);
    },
    [onEditBrand]
  );

  // ---------------- RENDER ----------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                onClick={() => togglePublishMany("publish")}
                className="text-green-600"
              >
                <BookCheck />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Publish Selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                onClick={() => togglePublishMany("unpublish")}
                className="text-red-600"
              >
                <BookDashed />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unpublish Selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                onClick={() => toggleFeaturedMany("feature")}
                className="text-yellow-600"
              >
                <Star />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Feature Selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                onClick={() => toggleFeaturedMany("unfeature")}
                className="text-red-600"
              >
                <StarOff />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unfeature Selected</TooltipContent>
          </Tooltip>

          {/* DELETE MANY */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                className="bg-red-100 text-red-700 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Brands?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white"
                  onClick={deleteMany}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Filter */}
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[140px]" size="sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((b) => selected.includes(b._id))
                  }
                  onCheckedChange={(c) => toggleSelectAll(Boolean(c))}
                />
              </TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((brand) => (
              <TableRow key={brand._id}>
                {/* SELECT */}
                <TableCell>
                  <Checkbox
                    checked={selected.includes(brand._id)}
                    onCheckedChange={(c) =>
                      toggleSelectOne(brand._id, Boolean(c))
                    }
                  />
                </TableCell>

                {/* NAME + LOGO */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Image
                          src={brand.image || "/placeholder.png"}
                          alt={brand.name}
                          width={32}
                          height={32}
                          className="rounded cursor-pointer hover:scale-105 transition"
                        />
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-3xl p-0 bg-white border-none shadow-none"
                        showCloseButton={false}
                        aria-describedby={undefined}
                      >
                        <DialogTitle className="sr-only">Brand Image</DialogTitle>
                        <Image
                          src={brand.image || "/placeholder.png"}
                          alt={brand.name}
                          width={800}
                          height={800}
                          className="rounded-lg mx-auto"
                        />
                      </DialogContent>
                    </Dialog>

                    <span className="font-medium">{brand.name}</span>
                  </div>
                </TableCell>

                <TableCell>{brand.slug}</TableCell>

                {/* PUBLISHED */}
                <TableCell>
                  <Switch
                    checked={brand.isPublished}
                    onCheckedChange={() => togglePublishOne(brand._id)}
                  />
                </TableCell>

                {/* FEATURED */}
                <TableCell>
                  <Switch
                    checked={brand.isFeatured}
                    onCheckedChange={() => toggleFeaturedOne(brand._id)}
                  />
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(brand)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="bg-accent">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete <b>{brand.name}</b> permanently?
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOne(brand._id)}
                            className="bg-red-600 text-white"
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
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  No brands found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "opacity-50 pointer-events-none"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "opacity-50 pointer-events-none"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

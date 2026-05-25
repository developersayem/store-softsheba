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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Search, Edit, Trash2, CircleCheckBig, CircleOff } from "lucide-react";

import api from "@/lib/axios";
import { KeyedMutator } from "swr";
import { toast } from "sonner";

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
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

import { ICoupon } from "@/types/coupon.type";

interface CouponTableProps {
  coupons?: ICoupon[];
  className?: string;
  onEdit?: (coupon: ICoupon) => void;
  mutateData?: KeyedMutator<{ data: ICoupon[] }>;
  onSelectionChange?: (selected: ICoupon[]) => void;
}

export function CouponTable({
  coupons = [],
  className,
  onEdit,
  mutateData,
  onSelectionChange,
}: CouponTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selected, setSelected] = useState<string[]>([]);

  // ---------- FILTER ----------
  const filtered = coupons
    .filter((c) => c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => {
      if (filterBy === "active") return c.isActive;
      if (filterBy === "inactive") return !c.isActive;
      return true;
    });

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // ---------- SELECTION HANDLERS ----------
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelected = checked ? paginated.map((p) => p._id) : [];
      setSelected(newSelected);
      onSelectionChange?.(coupons.filter((c) => newSelected.includes(c._id)));
    },
    [paginated, coupons, onSelectionChange]
  );

  const handleSelectOne = useCallback(
    (id: string, checked: boolean) => {
      const newSelected = checked
        ? [...selected, id]
        : selected.filter((x) => x !== id);
      setSelected(newSelected);
      onSelectionChange?.(coupons.filter((c) => newSelected.includes(c._id)));
    },
    [selected, coupons, onSelectionChange]
  );

  // ---------- DELETE ----------
  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/coupons/${id}`);
        if (res.status === 200) {
          toast.success("Deleted successfully");
          await mutateData?.();
          setSelected((prev) => prev.filter((x) => x !== id));
        }
      } catch {
        toast.error("Failed to delete");
      }
    },
    [mutateData]
  );

  const handleDeleteMany = useCallback(async () => {
    if (!selected.length) return toast.error("Select items first");
    try {
      const res = await api.post(`/coupons/delete-many`, { ids: selected });
      if (res.status === 200) {
        toast.success(res.data.message || "Deleted successfully");
        setSelected([]);
        await mutateData?.();
      }
    } catch {
      toast.error("Failed to delete");
    }
  }, [selected, mutateData]);

  // ---------- TOGGLE ACTIVE ----------
  const handleToggleActive = useCallback(
    async (id: string) => {
      try {
        const res = await api.patch(`/coupons/${id}/toggle-status`);
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateData?.();
        }
      } catch {
        toast.error("Failed to update");
      }
    },
    [mutateData]
  );

  const handleToggleActiveMany = useCallback(
    async (action: "activate" | "deactivate") => {
      if (!selected.length) return toast.error("Select items first");
      try {
        const res = await api.patch(`/coupons/toggle-multiple`, {
          ids: selected,
          action,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          setSelected([]);
          await mutateData?.();
        }
      } catch {
        toast.error("Failed to update");
      }
    },
    [selected, mutateData]
  );

  // ---------- RENDER ----------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search coupons"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Activate Selected */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                className="text-green-600"
                onClick={() => handleToggleActiveMany("activate")}
              >
                <CircleCheckBig />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Activate Selected</TooltipContent>
          </Tooltip>

          {/* Deactivate Selected */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.length}
                className="text-red-600"
                onClick={() => handleToggleActiveMany("deactivate")}
              >
                <CircleOff />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deactivate Selected</TooltipContent>
          </Tooltip>

          {/* Delete Selected */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-100 text-red-700 border-red-200"
                disabled={!selected.length}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
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

          {/* Filter */}
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[140px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((c) => selected.includes(c._id))
                  }
                  onCheckedChange={(c) => handleSelectAll(Boolean(c))}
                />
              </TableHead>

              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((coupon) => (
              <TableRow key={coupon._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(coupon._id)}
                    onCheckedChange={(c) =>
                      handleSelectOne(coupon._id, Boolean(c))
                    }
                  />
                </TableCell>

                <TableCell>{coupon.code}</TableCell>
                <TableCell className="capitalize">
                  {coupon.discount_type}
                </TableCell>
                <TableCell>
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount}%`
                    : `${coupon.discount}`}
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }).format(new Date(coupon.start_date))}{" "}
                  —{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }).format(new Date(coupon.end_date))}
                </TableCell>

                <TableCell>
                  {Array.isArray(coupon.products) ? coupon.products.length : 0}
                </TableCell>

                <TableCell>
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => handleToggleActive(coupon._id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-red-600"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white"
                            onClick={() => handleDeleteOne(coupon._id)}
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
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  No coupons found
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
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === currentPage}
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
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
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
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

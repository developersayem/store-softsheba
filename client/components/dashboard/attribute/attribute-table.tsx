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

import { IAttribute } from "@/types/attributes.type";

interface AttributeTableProps {
  attributes?: IAttribute[];
  className?: string;
  onEdit?: (attr: IAttribute) => void;
  onToggleActive?: (id: string, value: boolean) => void;
  onSelectionChange?: (selected: IAttribute[]) => void;
  mutateData?: KeyedMutator<{ data: IAttribute[] }>;
}

export function AttributeTable({
  attributes = [],
  className,
  onEdit,
  onToggleActive,
  onSelectionChange,
  mutateData,
}: AttributeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selected, setSelected] = useState<string[]>([]);

  // ---------------------- Filtering ----------------------
  let filtered = attributes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterBy === "active") filtered = filtered.filter((a) => a.isActive);
  else if (filterBy === "inactive")
    filtered = filtered.filter((a) => !a.isActive);

  // ---------------------- Pagination ----------------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // ---------------------- Selection Handlers ----------------------
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelected(checked ? paginated.map((p) => p._id) : []);
    },
    [paginated]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }, []);

  // ✅ FIX: Only call onSelectionChange when selected actually changes
  useEffect(() => {
    if (!onSelectionChange) return;

    const selectedObjects = attributes.filter((c) => selected.includes(c._id));
    onSelectionChange(selectedObjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]); // Only depend on selected

  // ---------------------- CRUD Handlers ----------------------
  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/attributes/${id}`);
        if (res.status === 200) {
          toast.success("Deleted successfully");
          await mutateData?.();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete");
      }
    },
    [mutateData]
  );

  const handleDeleteMany = useCallback(async () => {
    if (!selected.length) return toast.error("Select items first");

    try {
      const res = await api.post(`/attributes/delete-many`, {
        ids: selected,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Deleted successfully");
        setSelected([]);
        await mutateData?.();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }, [selected, mutateData]);

  const handleToggleActive = useCallback(
    async (id: string, value: boolean) => {
      onToggleActive?.(id, value);

      try {
        const res = await api.patch(`/attributes/${id}/toggle-status`);
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateData?.();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update");
      }
    },
    [onToggleActive, mutateData]
  );

  const handleToggleActiveMany = useCallback(
    async (action: "activate" | "deactivate") => {
      if (!selected.length) return toast.error("Select items first");

      try {
        const res = await api.patch(`/attributes/toggle-multiple`, {
          ids: selected,
          action,
        });

        if (res.status === 200) {
          toast.success(res.data.message);
          setSelected([]);
          await mutateData?.();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update");
      }
    },
    [selected, mutateData]
  );

  const handleEdit = useCallback(
    (attr: IAttribute) => {
      onEdit?.(attr);
    },
    [onEdit]
  );

  // ---------------------- Render ----------------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search attributes"
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((a) => selected.includes(a._id))
                  }
                  onCheckedChange={(c) => handleSelectAll(Boolean(c))}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((attr) => (
              <TableRow key={attr._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(attr._id)}
                    onCheckedChange={(c) =>
                      handleSelectOne(attr._id, Boolean(c))
                    }
                  />
                </TableCell>

                <TableCell>
                  {attr.name}
                  {attr.unit && (
                    <span className="text-muted-foreground ml-1">
                      ({attr.unit})
                    </span>
                  )}
                </TableCell>
                <TableCell>{attr.slug}</TableCell>

                <TableCell className="max-w-xs truncate">
                  {attr.values.join(", ")}
                </TableCell>

                <TableCell>
                  <Switch
                    checked={attr.isActive}
                    onCheckedChange={(value) =>
                      handleToggleActive(attr._id, value)
                    }
                  />
                </TableCell>

                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(attr)}
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
                            onClick={() => handleDeleteOne(attr._id)}
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
                  className="text-center text-muted-foreground py-6"
                >
                  No attributes found
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
                  currentPage === 1
                    ? "opacity-50 pointer-events-none"
                    : "cursor-pointer"
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

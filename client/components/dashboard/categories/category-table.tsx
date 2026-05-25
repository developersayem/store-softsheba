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
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import { ICategory } from "@/types/category.type";

interface CategoriesTableProps {
  categories?: ICategory[];
  className?: string;
  onEditCategory?: (category: ICategory) => void;
  onTogglePublish?: (categoryId: string, value: boolean) => void;
  onSelectionChange?: (selected: ICategory[]) => void;
  mutateCategoriesData?: KeyedMutator<{ data: ICategory[] }>;
}

export function CategoriesTable({
  categories = [],
  className,
  onEditCategory,
  onSelectionChange,
  mutateCategoriesData,
}: CategoriesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // -------------------- Filtering --------------------
  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => {
      if (filterBy === "published") return c.isPublished;
      if (filterBy === "unpublished") return !c.isPublished;
      return true;
    });

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // -------------------- Handlers --------------------
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelectedCategories(categories.map((c) => c._id));
      else setSelectedCategories([]);
    },
    [categories]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) =>
        checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
      );
    },
    []
  );

  useEffect(() => {
    if (!onSelectionChange) return;
    const selectedObjects = categories.filter((c) =>
      selectedCategories.includes(c._id)
    );
    onSelectionChange(selectedObjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]); // ✅ Only depend on selectedCategories

  const handleEdit = useCallback(
    (category: ICategory) => onEditCategory?.(category),
    [onEditCategory]
  );

  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/categories/${id}`);
        if (res.status === 200) {
          toast.success("Category deleted successfully");
          await mutateCategoriesData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting category");
      }
    },
    [mutateCategoriesData]
  );

  const handleDeleteMany = useCallback(async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    try {
      const res = await api.post(`/categories/delete-many`, {
        ids: selectedCategories,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Categories deleted successfully");
        setSelectedCategories([]);
        await mutateCategoriesData?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting categories");
    }
  }, [selectedCategories, mutateCategoriesData]);

  const handleTogglePublishSingle = useCallback(
    async (categoryId: string) => {
      try {
        const res = await api.patch(
          `/categories/${categoryId}/toggle-published`
        );
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateCategoriesData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating category");
      }
    },
    [mutateCategoriesData]
  );

  const handleToggleFeaturedSingle = useCallback(
    async (categoryId: string) => {
      try {
        const res = await api.patch(
          `/categories/${categoryId}/toggle-featured`
        );
        if (res.status === 200) {
          toast.success(res.data.message);
          await mutateCategoriesData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating category");
      }
    },
    [mutateCategoriesData]
  );

  const handleTogglePublishMany = useCallback(
    async (action: "publish" | "unpublish") => {
      if (selectedCategories.length === 0) {
        toast.error("Please select at least one category.");
        return;
      }
      try {
        const res = await api.patch(`/categories/toggle-multiple-published`, {
          ids: selectedCategories,
          action,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedCategories([]);
          await mutateCategoriesData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating categories");
      }
    },
    [selectedCategories, mutateCategoriesData]
  );

  const handleToggleFeaturedMany = useCallback(
    async (action: "feature" | "unfeature") => {
      if (selectedCategories.length === 0) {
        toast.error("Please select at least one category.");
        return;
      }
      try {
        const res = await api.patch(`/categories/toggle-multiple-featured`, {
          ids: selectedCategories,
          action,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedCategories([]);
          await mutateCategoriesData?.();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating categories");
      }
    },
    [selectedCategories, mutateCategoriesData]
  );

  // -------------------- Render --------------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* Publish / Featured / Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
                disabled={selectedCategories.length === 0}
                onClick={() => handleTogglePublishMany("publish")}
              >
                <BookCheck />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Publish Selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={selectedCategories.length === 0}
                onClick={() => handleTogglePublishMany("unpublish")}
              >
                <BookDashed />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Remove from Publish</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-yellow-600 hover:text-yellow-700"
                disabled={selectedCategories.length === 0}
                onClick={() => handleToggleFeaturedMany("feature")}
              >
                <Star />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Mark as Featured</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={selectedCategories.length === 0}
                onClick={() => handleToggleFeaturedMany("unfeature")}
              >
                <StarOff />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Remove from Featured</TooltipContent>
          </Tooltip>

          {/* DELETE */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
                disabled={selectedCategories.length === 0}
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
                  selected collections.
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
                    paginated.every((c) => selectedCategories.includes(c._id))
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>Banner</TableHead>
              <TableHead>DESCRIPTION</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>PUBLISHED</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={(checked) =>
                      handleSelectCategory(category._id, Boolean(checked))
                    }
                  />
                </TableCell>
                {/* icons and name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Image
                          src={category.icon || "/placeholder.png"}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="rounded cursor-pointer hover:scale-105 transition-transform"
                        />
                      </DialogTrigger>
                      <DialogContent
                        showCloseButton={false}
                        aria-describedby={undefined}
                      >
                        <DialogTitle className="sr-only">
                          Category Image
                        </DialogTitle>
                        <Image
                          src={category.icon || "/placeholder.png"}
                          alt={category.name}
                          width={800}
                          height={800}
                          className="rounded-lg mx-auto"
                        />
                      </DialogContent>
                    </Dialog>
                    {category.name}
                  </div>
                </TableCell>
                {/* banner image */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Image
                          src={category.banner || "/placeholder.png"}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="rounded cursor-pointer hover:scale-105 transition-transform"
                        />
                      </DialogTrigger>
                      <DialogContent
                        showCloseButton={false}
                        aria-describedby={undefined}
                      >
                        <DialogTitle className="sr-only">
                          Banner Image
                        </DialogTitle>
                        <Image
                          src={category.banner || "/placeholder.png"}
                          alt={category.name}
                          width={800}
                          height={800}
                          className="rounded-lg mx-auto"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                {/* description */}
                <TableCell className="max-w-xs truncate">
                  {category.description}
                </TableCell>
                {/* parent category */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {category.parent ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Image
                            src={category.parent.icon || "/placeholder.png"}
                            alt={category.parent.name || "Parent"}
                            width={32}
                            height={32}
                            className="rounded cursor-pointer hover:scale-105 transition-transform"
                          />
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined}>
                          <DialogTitle className="sr-only">
                            Parent Category Image
                          </DialogTitle>
                          <Image
                            src={category.parent.icon || "/placeholder.png"}
                            alt={category.parent.name || "Parent"}
                            width={800}
                            height={800}
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      "None"
                    )}
                    {category.parent?.name}
                  </div>
                </TableCell>
                {/* published */}
                <TableCell>
                  <Switch
                    checked={category.isPublished}
                    onCheckedChange={() =>
                      handleTogglePublishSingle(category._id)
                    }
                  />
                </TableCell>
                {/* featured */}
                <TableCell>
                  <Switch
                    checked={category.isFeatured}
                    onCheckedChange={() =>
                      handleToggleFeaturedSingle(category._id)
                    }
                  />
                </TableCell>
                {/* actions */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{category.name}
                            &quot;
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteOne(category._id)}
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
                <TableCell colSpan={7} className="text-center py-6">
                  No category found
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

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
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

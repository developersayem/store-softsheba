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
  GripVertical,
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

// --- DND Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ICollection } from "@/types/collection.type";
import api from "@/lib/axios";
import { KeyedMutator } from "swr";
import { toast } from "sonner";

interface CollectionsTableProps {
  collections?: ICollection[];
  className?: string;
  onEditCollection?: (collection: ICollection) => void;
  onTogglePublish?: (collectionId: string, value: boolean) => void;
  onSelectionChange?: (selected: ICollection[]) => void;
  mutateCollectionsData?: KeyedMutator<{ data: ICollection[] }>;
}

// --- Sortable Table Row Component ---
function SortableRow({
  children,
  id,
  isDragDisabled,
}: {
  children: React.ReactNode;
  id: string;
  isDragDisabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? ("relative" as const) : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-accent" : ""}
    >
      <TableCell className="w-8 pr-0">
        {!isDragDisabled ? (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        ) : (
          <div className="w-6" /> // Placeholder to keep alignment when dragging is disabled
        )}
      </TableCell>
      {children}
    </TableRow>
  );
}

export function CollectionsTable({
  collections = [],
  className,
  onEditCollection,
  onTogglePublish,
  onSelectionChange,
  mutateCollectionsData,
}: CollectionsTableProps) {
  // Local state for optimistic UI updates during drag-and-drop
  const [localCollections, setLocalCollections] = useState<ICollection[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Sync local state when props change
  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  // -------------------- Filtering --------------------
  let filtered = localCollections.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (filterBy === "published") {
    filtered = filtered.filter((c) => c.isPublished);
  } else if (filterBy === "unpublished") {
    filtered = filtered.filter((c) => !c.isPublished);
  }

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Disable dragging if user is searching, filtering, or not on page 1 (to prevent order corruption)
  const isDragDisabled =
    searchTerm !== "" || filterBy !== "all" || currentPage !== 1;

  // -------------------- DND Sensors --------------------
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // -------------------- Handlers --------------------
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localCollections.findIndex((c) => c._id === active.id);
      const newIndex = localCollections.findIndex((c) => c._id === over.id);

      // Optimistic UI update
      const newItems = arrayMove(localCollections, oldIndex, newIndex);
      setLocalCollections(newItems);

      // Prepare payload (Assign sequential order based on new array)
      const updates = newItems.map((item, index) => ({
        id: item._id,
        order: index + 1,
      }));

      try {
        await api.patch(`/collections/reorder/all`, { updates });
        toast.success("Order updated successfully");
        mutateCollectionsData?.();
      } catch {
        toast.error("Failed to update order");
        setLocalCollections(collections);
      }
    }
  };

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCollections(localCollections?.map((p) => p._id) || []);
      } else {
        setSelectedCollections([]);
      }
    },
    [localCollections],
  );

  const handleSelectCollection = useCallback(
    (collectionId: string, checked: boolean) => {
      if (checked) {
        setSelectedCollections((prev) => [...prev, collectionId]);
      } else {
        setSelectedCollections((prev) =>
          prev.filter((id) => id !== collectionId),
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!onSelectionChange) return;

    const selectedObjects = localCollections.filter((c) =>
      selectedCollections.includes(c._id),
    );
    onSelectionChange(selectedObjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollections]);

  const handleEdit = useCallback(
    (collection: ICollection) => {
      onEditCollection?.(collection);
    },
    [onEditCollection],
  );

  const handleDeleteOne = useCallback(
    async (id: string) => {
      try {
        const res = await api.delete(`/collections/${id}`);
        if (res.status === 200) {
          toast.success("Collection deleted successfully");
          await mutateCollectionsData?.();
        }
      } catch {
        toast.error("Error deleting collection");
      }
    },
    [mutateCollectionsData],
  );

  const handleDeleteMany = useCallback(async () => {
    try {
      if (selectedCollections.length === 0) return;

      const res = await api.post(`/collections/delete-many`, {
        ids: selectedCollections,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Collections deleted successfully");
        setSelectedCollections([]);
        await mutateCollectionsData?.();
      }
    } catch {
      toast.error("Error deleting collections");
    }
  }, [selectedCollections, mutateCollectionsData]);

  const handleTogglePublish = useCallback(
    async (collectionId: string, value: boolean) => {
      onTogglePublish?.(collectionId, value);
      try {
        const res = await api.patch(
          `/collections/${collectionId}/toggle-published`,
        );
        if (res.status === 200) {
          toast.success(`${res.data.message}`);
          await mutateCollectionsData?.();
        }
      } catch {
        toast.error("Error updating collection");
      }
    },
    [onTogglePublish, mutateCollectionsData],
  );

  const handleTogglePublishMany = useCallback(
    async (action: "publish" | "unpublish") => {
      if (selectedCollections.length === 0) return;

      try {
        const res = await api.patch(`/collections/toggle-multiple-published`, {
          ids: selectedCollections,
          action,
        });

        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedCollections([]);
          await mutateCollectionsData?.();
        }
      } catch {
        toast.error("Error updating collections");
      }
    },
    [selectedCollections, mutateCollectionsData],
  );

  const handleToggleFeatured = useCallback(
    async (collectionId: string, value: boolean) => {
      console.log(value);
      try {
        const res = await api.patch(
          `/collections/${collectionId}/toggle-featured`,
        );
        if (res.status === 200) {
          toast.success(`${res.data.message}`);
          await mutateCollectionsData?.();
        }
      } catch {
        toast.error("Error updating collection");
      }
    },
    [mutateCollectionsData],
  );

  const handleToggleFeaturedMany = useCallback(
    async (action: "feature" | "unfeature") => {
      if (selectedCollections.length === 0) return;

      try {
        const res = await api.patch(`/collections/toggle-multiple-featured`, {
          ids: selectedCollections,
          action,
        });

        if (res.status === 200) {
          toast.success(res.data.message);
          setSelectedCollections([]);
          await mutateCollectionsData?.();
        }
      } catch {
        toast.error("Error updating collections");
      }
    },
    [selectedCollections, mutateCollectionsData],
  );

  // -------------------- Render --------------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
                disabled={selectedCollections.length === 0}
                onClick={() => handleTogglePublishMany("publish")}
              >
                <BookCheck />
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
                disabled={selectedCollections.length === 0}
                onClick={() => handleTogglePublishMany("unpublish")}
              >
                <BookDashed />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Remove from Publish
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-yellow-600 hover:text-yellow-700"
                disabled={selectedCollections.length === 0}
                onClick={() => handleToggleFeaturedMany("feature")}
              >
                <Star />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Mark as Featured
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={selectedCollections.length === 0}
                onClick={() => handleToggleFeaturedMany("unfeature")}
              >
                <StarOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              Remove from Featured
            </TooltipContent>
          </Tooltip>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
                disabled={selectedCollections.length === 0}
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

      {isDragDisabled && collections.length > 0 && (
        <div className="text-xs text-muted-foreground italic">
          * Drag and drop reordering is disabled while filtering, searching, or
          viewing extra pages.
        </div>
      )}

      {/* Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={paginated.map((c) => c._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="border rounded-lg capitalize">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginated.length > 0 &&
                        paginated.every((c) => selectedCollections.includes(c._id))
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAll(Boolean(checked))
                      }
                    />
                  </TableHead>
                  <TableHead className="font-semibold">NAME</TableHead>
                  <TableHead className="font-semibold">DESCRIPTION</TableHead>
                  <TableHead className="font-semibold">PRODUCTS</TableHead>
                  <TableHead className="font-semibold">PUBLISHED</TableHead>
                  <TableHead className="font-semibold">Featured</TableHead>
                  <TableHead className="font-semibold">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((collection) => (
                  <SortableRow
                    key={collection._id}
                    id={collection._id}
                    isDragDisabled={isDragDisabled}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCollections.includes(collection._id)}
                        onCheckedChange={(checked) =>
                          handleSelectCollection(
                            collection?._id,
                            Boolean(checked),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Image
                              src={collection?.image || "/placeholder.png"}
                              alt={collection?.name}
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
                              Collection Image
                            </DialogTitle>
                            <Image
                              src={collection?.image || "/placeholder.png"}
                              alt={collection?.name}
                              width={800}
                              height={800}
                              className="rounded-lg mx-auto"
                            />
                          </DialogContent>
                        </Dialog>
                        <span className="font-medium">{collection?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {collection?.description}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {(collection?.products?.length ?? 0) > 0
                        ? `${collection.products?.length}`
                        : "0"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={collection?.isPublished}
                        onCheckedChange={(value) =>
                          handleTogglePublish(collection?._id, value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={collection?.isFeatured}
                        onCheckedChange={(value) =>
                          handleToggleFeatured(collection?._id, value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(collection)}
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
                                This action cannot be undone. This will
                                permanently delete{" "}
                                <span className="font-semibold text-red-600">
                                  &quot;{collection.name}&quot;
                                </span>{" "}
                                collection.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDeleteOne(collection._id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </SortableRow>
                ))}

                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-6"
                    >
                      No collections found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
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

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
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
                    ? "pointer-events-none opacity-50"
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

"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/pagination";
import { Search, Check, Trash2, Eye, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { KeyedMutator } from "swr";
import type { IReview } from "@/types/review.type";
import { ReviewModal } from "./review-modal";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface ReviewsTableProps {
  reviews?: IReview[];
  className?: string;
  mutateReviewsData?: KeyedMutator<{ data: IReview[] }>;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Approved", className: "bg-green-500/20 text-green-400" },
};

export function ReviewsTable({
  reviews = [],
  className,
  mutateReviewsData,
}: ReviewsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  //console.log(selectedReviews)

  const getStatus = (r: IReview) => (r.isApproved ? "approved" : "pending");

  // -------------------- Filtering --------------------
  const filtered = reviews.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------- Pagination --------------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // -------------------- Handlers --------------------
  const handleSelectAll = (checked: boolean) => {
    setSelectedReviews(checked ? paginated.map((r) => r._id) : []);
  };

  const handleSelectReview = (id: string, checked: boolean) => {
    setSelectedReviews((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleUpdateStatus = async (id: string) => {
    try {
      await api.patch(`/reviews/${id}/approve`);
      toast.success("Review approved");
      await mutateReviewsData?.();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      await mutateReviewsData?.();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/reviews/${id}/approve`);
      toast.success("Review approved");
      await mutateReviewsData?.();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/reviews/${id}/reject`);
      toast.success("Review rejected");
      await mutateReviewsData?.();
    } catch {
      toast.error("Failed to update review");
    }
  };
  const handleDeleteMany = useCallback(async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select at least one review to delete.");
      return;
    }
    try {
      const res = await api.post(`/reviews/delete-many`, {
        ids: selectedReviews,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Reviews deleted successfully");
        setSelectedReviews([]);
        await mutateReviewsData?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting reviews");
    }
  }, [selectedReviews, mutateReviewsData]);

  // -------------------- Render --------------------
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-100 text-red-700 border-red-200 hover:bg-red-500 hover:text-white"
              disabled={selectedReviews.length === 0}
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
                selected reviews.
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
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    paginated.length > 0 &&
                    paginated.every((r) => selectedReviews.includes(r._id))
                  }
                  onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((review) => {
              const status = getStatus(review);

              return (
                <TableRow key={review._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedReviews.includes(review._id)}
                      onCheckedChange={(v) =>
                        handleSelectReview(review._id, Boolean(v))
                      }
                    />
                  </TableCell>

                  <TableCell className="font-medium">{review.name}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {review.email}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Image
                            src={
                              review.product?.thumbnail || "/placeholder.png"
                            }
                            alt={review.product?.name || "Product"}
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
                            src={
                              review.product?.thumbnail || "/placeholder.png"
                            }
                            alt={review.product?.name || "Product"}
                            width={800}
                            height={800}
                            className="rounded-lg mx-auto"
                          />
                        </DialogContent>
                      </Dialog>
                      <span className="line-clamp-1 truncate">{review.product?.name || "Deleted Product"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[200px]">
                    <p className="line-clamp-2 truncate text-sm text-muted-foreground">
                      {review.review}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[status].className}`}
                    >
                      {statusConfig[status].label}
                    </span>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!review.isApproved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600"
                          onClick={() => handleUpdateStatus(review._id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete(review._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No reviews found
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ReviewModal
        review={selectedReview}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

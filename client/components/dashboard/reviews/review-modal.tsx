/* eslint-disable @next/next/no-img-element */
"use client";

import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IReview } from "@/types/review.type";

interface ReviewModalProps {
  review: IReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ReviewModal({
  review,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: ReviewModalProps) {
  if (!review) return null;

  const formattedDate = new Date(review.createdAt).toLocaleString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-lg p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            Review Details
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Reviewer */}
          <div>
            <p className="text-sm text-zinc-500">Reviewer</p>
            <p className="font-medium">{review.name}</p>
            <p className="text-sm text-zinc-400">{review.email}</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm text-zinc-500 mb-2">Product</p>
            <div className="flex items-center gap-3">
              <img
                src={review.product?.thumbnail || "/placeholder.svg"}
                alt={review.product?.name || "Product"}
                className="h-12 w-12 rounded object-cover bg-zinc-800"
              />
              <span className="font-medium">{review.product?.name || "Deleted Product"}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm text-zinc-500 mb-1">Rating</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-700"
                    }`}
                />
              ))}
              <span className="ml-2 text-sm text-zinc-400">
                {review.rating} / 5
              </span>
            </div>
          </div>

          {/* Review */}
          <div>
            <div className="space-y-2">
              <p className="text-sm text-zinc-500 mb-1">Review</p>
              <p className="break-words whitespace-pre-wrap">{review.review}</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-sm text-zinc-500">Submitted</p>
            <p className="text-zinc-300">{formattedDate}</p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
          <Button
            onClick={() => onApprove(review._id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Approve
          </Button>

          <Button
            onClick={() => onReject(review._id)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Reject
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

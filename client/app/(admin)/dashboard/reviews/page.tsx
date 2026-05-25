"use client";
import { ReviewsTable } from "@/components/dashboard/reviews/reviews-table";
import LoadingCom from "@/components/shared/loading-com";
import { fetcher } from "@/lib/fetcher";
import { IReview } from "@/types/review.type";
import useSWR from "swr";

export default function ReviewsPage() {
  // fetch all brand data
  const {
    data: reviewsRes,
    error,
    isLoading,
    mutate: mutateReviewsData,
  } = useSWR<{ data: IReview[] }>("/reviews", fetcher);

  const reviewsData = reviewsRes?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Reviews</h1>
      </div>
      <div className="w-full flex justify-center items-center">
        {isLoading && <LoadingCom />}
        {error && <p>Error: {error.message}</p>}
        {reviewsData.length === 0 && !isLoading && !error && (
          <p>No reviews found.</p>
        )}
      </div>
      {reviewsData.length > 0 && (
        <ReviewsTable
          reviews={reviewsData}
          mutateReviewsData={mutateReviewsData}
        />
      )}
    </div>
  );
}

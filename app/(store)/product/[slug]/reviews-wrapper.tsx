"use client";

import { useState, useCallback } from "react";

import { ProductReviews } from "@/components/product/product-reviews";
import { useAuth } from "@/lib/auth-context";

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  created_at: Date | string;
  username: string;
  avatar_url: string;
}

interface ProductReviewsWrapperProps {
  initialReviews: ReviewItem[];
  totalReviews: number;
  productSlug: string;
}

export const ProductReviewsWrapper = ({
  initialReviews,
  totalReviews,
  productSlug,
}: ProductReviewsWrapperProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(totalReviews);

  const hasReviewed = reviews.some(
    (r) => user && r.username === user.username,
  );

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();

        throw new Error(data.error ?? "Failed to submit review");
      }

      // Refresh reviews
      const reviewsRes = await fetch(
        `/api/products/${productSlug}/reviews`,
      );
      const reviewsData = await reviewsRes.json();

      if (reviewsData.success) {
        setReviews(reviewsData.data.reviews);
        setTotal(reviewsData.data.total);
      }
    },
    [productSlug],
  );

  return (
    <ProductReviews
      canReview={!!user && !hasReviewed}
      productSlug={productSlug}
      reviews={reviews}
      total={total}
      onSubmitReview={handleSubmitReview}
    />
  );
};

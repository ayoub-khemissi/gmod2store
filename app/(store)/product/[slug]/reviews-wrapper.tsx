"use client";

import { useState, useCallback, useEffect } from "react";

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
  initialCanReview?: boolean;
}

export const ProductReviewsWrapper = ({
  initialReviews,
  totalReviews,
  productSlug,
  initialCanReview = false,
}: ProductReviewsWrapperProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(totalReviews);
  const [canReview, setCanReview] = useState(initialCanReview);

  // Fetch review eligibility when user logs in client-side
  useEffect(() => {
    if (!user) {
      setCanReview(false);

      return;
    }

    fetch(`/api/products/${productSlug}/reviews?page=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCanReview(data.data.canReview);
        }
      })
      .catch(() => {});
  }, [user, productSlug]);

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
      const reviewsRes = await fetch(`/api/products/${productSlug}/reviews`);
      const reviewsData = await reviewsRes.json();

      if (reviewsData.success) {
        setReviews(reviewsData.data.reviews);
        setTotal(reviewsData.data.total);
        setCanReview(reviewsData.data.canReview);
      }
    },
    [productSlug],
  );

  return (
    <ProductReviews
      canReview={canReview}
      needsPurchase={!!user && !canReview}
      productSlug={productSlug}
      reviews={reviews}
      total={total}
      onSubmitReview={handleSubmitReview}
    />
  );
};

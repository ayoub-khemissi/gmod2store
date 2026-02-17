"use client";

import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { useState } from "react";

import { StarRating } from "./star-rating";

import { LoadingButton } from "@/components/ui/loading-button";
import { useAuth } from "@/lib/auth-context";

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  created_at: Date | string;
  username: string;
  avatar_url: string;
}

interface ProductReviewsProps {
  reviews: ReviewItem[];
  total: number;
  productSlug: string;
  canReview: boolean;
  needsPurchase?: boolean;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
}

export const ProductReviews = ({
  reviews,
  total,
  canReview,
  needsPurchase,
  onSubmitReview,
}: ProductReviewsProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim().length < 5 || !onSubmitReview) return;
    setIsSubmitting(true);
    try {
      await onSubmitReview(rating, comment);
      setRating(0);
      setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-4">
        Reviews ({total})
      </h2>

      {/* Review form */}
      {user && canReview && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-default-500">Your rating:</span>
            <StarRating
              interactive
              rating={rating}
              size="lg"
              onChange={setRating}
            />
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Write your review..."
              value={comment}
              variant="bordered"
              onValueChange={setComment}
            />
            <LoadingButton
              color="primary"
              isDisabled={rating === 0 || comment.trim().length < 5}
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              Submit
            </LoadingButton>
          </div>
          <Divider className="mt-6" />
        </div>
      )}

      {/* Purchase notice */}
      {needsPurchase && !canReview && (
        <div className="mb-6">
          <div className="rounded-xl bg-default-100 px-4 py-3 text-sm text-default-500">
            You must purchase this product to write a review.
          </div>
          <Divider className="mt-6" />
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-default-400 text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <Avatar
                className="flex-shrink-0"
                name={review.username}
                size="sm"
                src={review.avatar_url}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {review.username}
                  </span>
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-default-400 text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-default-600 text-sm">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

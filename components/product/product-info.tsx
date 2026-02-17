"use client";

import type { Product } from "@/types/product";

import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";

import { StarRating } from "./star-rating";

import { LoadingButton } from "@/components/ui/loading-button";

interface ProductInfoProps {
  product: Product;
  seller?: { username: string; avatar_url: string; slug: string | null };
  owned?: boolean;
  onBuy?: () => void;
  isBuying?: boolean;
}

export const ProductInfo = ({
  product,
  seller,
  owned,
  onBuy,
  isBuying,
}: ProductInfoProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip color="primary" size="sm" variant="flat">
          {product.category}
        </Chip>
        {product.is_staff_pick && (
          <Chip color="warning" size="sm" variant="flat">
            Staff Pick
          </Chip>
        )}
      </div>

      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        {product.title}
      </h1>

      {seller && (
        <NextLink
          className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
          href={seller.slug ? `/creators/${seller.slug}` : "#"}
        >
          <Avatar name={seller.username} size="sm" src={seller.avatar_url} />
          <span className="text-default-500">by {seller.username}</span>
        </NextLink>
      )}

      <div className="flex items-center gap-3">
        <StarRating rating={product.average_rating} />
        <span className="text-default-400 text-sm">
          ({product.review_count} review{product.review_count !== 1 ? "s" : ""})
        </span>
        <span className="text-default-400 text-sm">
          {product.sales_count} sale{product.sales_count !== 1 ? "s" : ""}
        </span>
      </div>

      <Divider />

      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-primary">
          {product.price === 0 ? "Free" : `$${product.price.toFixed(2)}`}
        </span>

        {owned ? (
          <LoadingButton color="success" size="lg" variant="flat">
            Owned
          </LoadingButton>
        ) : (
          <LoadingButton
            color="primary"
            isLoading={isBuying}
            size="lg"
            variant="shadow"
            onPress={onBuy}
          >
            {product.price === 0 ? "Get for Free" : "Buy Now"}
          </LoadingButton>
        )}
      </div>

      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.map((tag) => (
            <Chip key={tag} size="sm" variant="bordered">
              {tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
};

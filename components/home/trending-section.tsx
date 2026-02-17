"use client";

import { ScrollShadow } from "@heroui/scroll-shadow";
import { Skeleton } from "@heroui/skeleton";

import { SectionHeading } from "@/components/ui";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

interface TrendingSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export const TrendingSection = ({
  products,
  isLoading,
}: TrendingSectionProps) => {
  return (
    <section className="mb-12">
      <SectionHeading
        description="The most popular products this week"
        heading="Trending"
        size="sm"
      />

      {isLoading ? (
        <div className="flex gap-4 mt-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px]">
              <Skeleton className="w-full h-[200px] rounded-xl" />
              <Skeleton className="w-3/4 h-5 mt-3 rounded-lg" />
              <Skeleton className="w-1/2 h-4 mt-2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <ScrollShadow
          className="flex gap-4 mt-6 pb-4"
          orientation="horizontal"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] max-w-[280px]">
              <ProductCard
                averageRating={product.average_rating}
                category={product.category}
                price={product.price}
                slug={product.slug}
                thumbnailUrl={product.thumbnail_url}
                title={product.title}
              />
            </div>
          ))}
        </ScrollShadow>
      )}
    </section>
  );
};

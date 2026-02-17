"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Pagination } from "@heroui/pagination";

import { CategoryFilter } from "@/components/browse/category-filter";
import { FilterSidebar } from "@/components/browse/filter-sidebar";
import { ActiveFilters } from "@/components/browse/active-filters";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/types/product";

interface BrowseClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialCategory: string | null;
  initialSort: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialMinRating: string;
}

export const BrowseClient = ({
  initialProducts,
  initialPage,
  initialTotalPages,
  initialCategory,
  initialSort,
  initialMinPrice,
  initialMaxPrice,
  initialMinRating,
}: BrowseClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when filters change
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams],
  );

  const activeFilters: { key: string; label: string }[] = [];

  if (initialCategory) {
    activeFilters.push({
      key: "category",
      label: `Category: ${initialCategory}`,
    });
  }
  if (initialMinPrice) {
    activeFilters.push({
      key: "minPrice",
      label: `Min: $${initialMinPrice}`,
    });
  }
  if (initialMaxPrice) {
    activeFilters.push({
      key: "maxPrice",
      label: `Max: $${initialMaxPrice}`,
    });
  }
  if (initialMinRating) {
    activeFilters.push({
      key: "minRating",
      label: `${initialMinRating}+ Stars`,
    });
  }

  return (
    <>
      <CategoryFilter
        selected={initialCategory}
        onChange={(cat) => updateParams({ category: cat })}
      />

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() =>
          router.push("/browse")
        }
        onRemove={(key) => updateParams({ [key]: null })}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <FilterSidebar
          maxPrice={initialMaxPrice}
          minPrice={initialMinPrice}
          minRating={initialMinRating}
          sort={initialSort}
          onMaxPriceChange={(v) => updateParams({ maxPrice: v })}
          onMinPriceChange={(v) => updateParams({ minPrice: v })}
          onMinRatingChange={(v) => updateParams({ minRating: v })}
          onSortChange={(v) => updateParams({ sort: v })}
        />

        <div className="flex-1">
          <ProductGrid
            products={initialProducts.map((p) => ({
              title: p.title,
              slug: p.slug,
              price: p.price,
              category: p.category,
              thumbnailUrl: p.thumbnail_url,
              averageRating: p.average_rating,
            }))}
          />

          {initialTotalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                showControls
                page={initialPage}
                total={initialTotalPages}
                onChange={(page) =>
                  updateParams({ page: page.toString() })
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

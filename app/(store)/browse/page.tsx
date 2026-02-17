import { Metadata } from "next";

import { title } from "@/components/primitives";
import { getProducts } from "@/services/product.service";
import { BrowseClient } from "./browse-client";

interface BrowsePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: BrowsePageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : null;

  return {
    title: category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} — Browse`
      : "Browse Products",
    description: `Browse ${category ?? "all"} products for s&box. Discover gamemodes, tools, maps, and assets.`,
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const minRating = typeof params.minRating === "string" ? Number(params.minRating) : undefined;

  let result;

  try {
    result = await getProducts({
      category,
      search,
      sort: sort as "newest" | "popular" | "price_asc" | "price_desc" | "rating",
      page,
      minPrice,
      maxPrice,
      minRating,
      limit: 20,
    });
  } catch {
    result = { products: [], total: 0, page: 1, totalPages: 0 };
  }

  return (
    <section className="flex flex-col gap-6 py-8 md:py-10">
      <h1 className={title({ size: "sm" })}>Browse Products</h1>
      <BrowseClient
        initialCategory={category ?? null}
        initialMaxPrice={maxPrice?.toString() ?? ""}
        initialMinPrice={minPrice?.toString() ?? ""}
        initialMinRating={minRating?.toString() ?? ""}
        initialPage={page}
        initialProducts={result.products}
        initialSort={sort ?? "newest"}
        initialTotal={result.total}
        initialTotalPages={result.totalPages}
      />
    </section>
  );
}

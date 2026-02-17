"use client";

import { ProductCard } from "./product-card";

interface ProductGridItem {
  title: string;
  slug: string;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  averageRating: number;
}

interface ProductGridProps {
  products: ProductGridItem[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-default-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.slug} {...product} />
      ))}
    </div>
  );
};

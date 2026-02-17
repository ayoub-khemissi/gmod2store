"use client";

import { CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Image } from "@heroui/image";
import NextLink from "next/link";

import { SectionHeading } from "@/components/ui";
import { GlassCard } from "@/components/ui/glass-card";
import type { Product } from "@/types/product";

interface StaffPicksSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export const StaffPicksSection = ({
  products,
  isLoading,
}: StaffPicksSectionProps) => {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mb-12">
      <SectionHeading
        color="cyan"
        description="Hand-picked by our team"
        heading="Staff Picks"
        size="sm"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {products.map((product) => (
            <GlassCard
              key={product.id}
              isPressable
              as={NextLink}
              glow="primary"
              href={`/product/${product.slug}`}
            >
              <CardBody className="flex flex-row gap-4 p-4">
                <Image
                  alt={product.title}
                  className="object-cover w-[140px] h-[120px] flex-shrink-0"
                  radius="lg"
                  src={product.thumbnail_url ?? "/placeholder.png"}
                />
                <div className="flex flex-col gap-2 min-w-0">
                  <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg truncate">
                    {product.title}
                  </h3>
                  <p className="text-default-500 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Chip color="primary" size="sm" variant="flat">
                      {product.category}
                    </Chip>
                    <Chip color="success" size="sm" variant="flat">
                      ${product.price.toFixed(2)}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  );
};

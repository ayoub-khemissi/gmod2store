"use client";

import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";

import { SectionHeading } from "@/components/ui";
import { GlassCard } from "@/components/ui/glass-card";

interface Creator {
  id: number;
  username: string;
  avatar_url: string;
  slug: string | null;
  product_count: number;
  total_sales: number;
}

interface TopCreatorsSectionProps {
  creators: Creator[];
  isLoading?: boolean;
}

export const TopCreatorsSection = ({
  creators,
  isLoading,
}: TopCreatorsSectionProps) => {
  if (!isLoading && creators.length === 0) return null;

  return (
    <section className="mb-12">
      <SectionHeading
        color="green"
        description="The creators behind the best content"
        heading="Top Creators"
        size="sm"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-20 h-4 rounded-lg" />
              <Skeleton className="w-16 h-3 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {creators.map((creator) => (
            <GlassCard
              key={creator.id}
              isPressable
              as={NextLink}
              className="items-center text-center"
              href={creator.slug ? `/creators/${creator.slug}` : "#"}
            >
              <div className="flex flex-col items-center gap-3 p-4">
                <Avatar
                  isBordered
                  className="w-16 h-16"
                  color="primary"
                  name={creator.username}
                  src={creator.avatar_url}
                />
                <div>
                  <p className="font-[family-name:var(--font-heading)] font-semibold text-sm">
                    {creator.username}
                  </p>
                  <p className="text-default-400 text-xs">
                    {creator.product_count} products
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  );
};

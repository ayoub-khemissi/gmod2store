"use client";

import { CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { DownloadButton } from "./download-button";
import type { LibraryItem } from "@/services/library.service";

interface LibraryGridProps {
  items: LibraryItem[];
  isLoading?: boolean;
}

export const LibraryGrid = ({ items, isLoading }: LibraryGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-default-500 text-lg">Your library is empty.</p>
        <NextLink className="text-primary mt-2 inline-block" href="/browse">
          Browse products to get started
        </NextLink>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <GlassCard key={item.license_id}>
          <CardBody className="p-4">
            <div className="flex gap-3">
              <NextLink href={`/product/${item.slug}`}>
                <Image
                  alt={item.title}
                  className="object-cover w-20 h-16 flex-shrink-0"
                  radius="lg"
                  src={item.thumbnail_url ?? "/placeholder.png"}
                />
              </NextLink>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <NextLink href={`/product/${item.slug}`}>
                    <h3 className="font-[family-name:var(--font-heading)] font-semibold truncate">
                      {item.title}
                    </h3>
                  </NextLink>
                  {item.has_update && (
                    <Badge color="warning" content="Update" size="sm">
                      <span />
                    </Badge>
                  )}
                </div>
                <p className="text-default-400 text-xs">
                  by {item.seller_username}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Chip size="sm" variant="flat">
                    {item.category}
                  </Chip>
                  {item.current_version && (
                    <span className="text-default-400 text-xs">
                      v{item.current_version}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <DownloadButton licenseId={item.license_id} />
            </div>
          </CardBody>
        </GlassCard>
      ))}
    </div>
  );
};

"use client";

import { CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

import { GlassCard } from "@/components/ui/glass-card";

interface Stats {
  total_products: number;
  total_sales: number;
  total_revenue: number;
  total_views: number;
  average_rating: number;
}

interface StatsGridProps {
  stats: Stats | null;
  isLoading?: boolean;
}

const statItems = [
  { key: "total_revenue" as const, label: "Total Revenue", prefix: "$", decimals: 2 },
  { key: "total_sales" as const, label: "Total Sales", prefix: "", decimals: 0 },
  { key: "total_products" as const, label: "Products", prefix: "", decimals: 0 },
  { key: "total_views" as const, label: "Total Views", prefix: "", decimals: 0 },
];

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <GlassCard key={item.key} glow="primary">
          <CardBody className="p-5">
            <p className="text-default-400 text-sm">{item.label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1 rounded-lg" />
            ) : (
              <p className="text-2xl font-bold font-[family-name:var(--font-heading)] mt-1">
                {item.prefix}
                {(stats?.[item.key] ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: item.decimals,
                  maximumFractionDigits: item.decimals,
                })}
              </p>
            )}
          </CardBody>
        </GlassCard>
      ))}
    </div>
  );
};

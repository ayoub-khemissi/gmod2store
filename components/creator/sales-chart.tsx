"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Skeleton } from "@heroui/skeleton";
import { useState, useEffect, useCallback } from "react";

import { GlassCard } from "@/components/ui/glass-card";

interface SalesTrend {
  date: string;
  sales: number;
  revenue: number;
}

export const SalesChart = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [data, setData] = useState<SalesTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/creator/sales?period=${period}&days=30`,
      );
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <GlassCard>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
            Sales Trends
          </h3>
          <Tabs
            selectedKey={period}
            size="sm"
            onSelectionChange={(key) =>
              setPeriod(key as "daily" | "weekly" | "monthly")
            }
          >
            <Tab key="daily" title="Daily" />
            <Tab key="weekly" title="Weekly" />
            <Tab key="monthly" title="Monthly" />
          </Tabs>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : data.length === 0 ? (
          <p className="text-default-400 text-center py-12">
            No sales data yet.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-48">
            {data.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-primary/60 rounded-t-md hover:bg-primary transition-colors min-h-[2px]"
                  style={{
                    height: `${(d.revenue / maxRevenue) * 100}%`,
                  }}
                  title={`${d.date}: $${d.revenue.toFixed(2)} (${d.sales} sales)`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

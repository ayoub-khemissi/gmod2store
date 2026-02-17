"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";

import { title } from "@/components/primitives";
import { GlassCard } from "@/components/ui/glass-card";

interface OverviewStats {
  totalUsers: number;
  publishedProducts: number;
  pendingProducts: number;
  totalRevenue: number;
  openTickets: number;
  unresolvedContacts: number;
}

const statCards = [
  { key: "totalUsers" as const, label: "Total Users", href: "/admin/users", color: "primary" as const },
  { key: "publishedProducts" as const, label: "Published Products", href: "/admin/products?status=published", color: "secondary" as const },
  { key: "pendingProducts" as const, label: "Pending Review", href: "/admin/products", color: "primary" as const },
  { key: "totalRevenue" as const, label: "Platform Revenue", prefix: "$", color: "secondary" as const },
  { key: "openTickets" as const, label: "Open Tickets", href: "/admin/tickets", color: "primary" as const },
  { key: "unresolvedContacts" as const, label: "Unresolved Contacts", href: "/admin/contacts", color: "primary" as const },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <h1 className={title({ size: "sm" })}>Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <GlassCard
            key={card.key}
            as={card.href ? NextLink : undefined}
            glow={card.color === "primary" ? "primary" : "secondary"}
            href={card.href}
            isPressable={!!card.href}
          >
            <div className="p-4">
              <p className="text-sm text-default-500">{card.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1 rounded-lg" />
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {card.prefix ?? ""}
                  {stats?.[card.key]?.toLocaleString() ?? 0}
                </p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}

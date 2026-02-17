"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";
import { useState, useEffect, useCallback } from "react";

import { title } from "@/components/primitives";
import { StatsGrid } from "@/components/creator/stats-grid";
import { SalesChart } from "@/components/creator/sales-chart";
import { ProductManagementTable } from "@/components/creator/product-management-table";
import { ProfileEditor } from "@/components/creator/profile-editor";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@/types/product";

interface Stats {
  total_products: number;
  total_sales: number;
  total_revenue: number;
  total_views: number;
  average_rating: number;
}

export default function CreatorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{
    bio: string;
    slug: string;
    social_links: Record<string, string>;
  } | null>(null);

  const isCreator =
    user?.role === "creator" || user?.role === "admin";

  const fetchData = useCallback(async () => {
    if (!isCreator) return;
    setIsLoading(true);
    try {
      const [statsRes, productsRes, profileRes] = await Promise.all([
        fetch("/api/creator/stats"),
        fetch("/api/creator/products"),
        fetch("/api/creator/profile"),
      ]);
      const [statsJson, productsJson, profileJson] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        profileRes.json(),
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (productsJson.success) setProducts(productsJson.data);
      if (profileJson.success && profileJson.data) {
        setProfile({
          bio: profileJson.data.bio ?? "",
          slug: profileJson.data.slug ?? "",
          social_links: profileJson.data.social_links ?? {},
        });
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [isCreator]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className={title({ size: "sm" })}>Become a Creator</h1>
        <p className="text-default-500 text-center max-w-md">
          Start selling your gamemodes, tools, maps, and assets to the s&box
          community.
        </p>
        <p className="text-default-400 text-sm text-center max-w-md">
          Contact an admin to request creator access.
        </p>
      </div>
    );
  }

  const handleSaveProfile = async (data: {
    bio: string;
    slug: string;
    social_links: Record<string, string>;
  }) => {
    const res = await fetch("/api/creator/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setProfile(data);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className={title({ size: "sm" })}>Creator Dashboard</h1>
        <Button
          as={NextLink}
          color="primary"
          href="/creator/products/new"
          variant="shadow"
        >
          New Product
        </Button>
      </div>

      <Tabs aria-label="Creator dashboard tabs" size="lg" variant="underlined">
        <Tab key="overview" title="Overview">
          <div className="flex flex-col gap-6 mt-4">
            <StatsGrid isLoading={isLoading} stats={stats} />
            <SalesChart />
          </div>
        </Tab>
        <Tab key="products" title="Products">
          <div className="mt-4">
            <ProductManagementTable
              isLoading={isLoading}
              products={products}
            />
          </div>
        </Tab>
        <Tab key="profile" title="Profile">
          <div className="mt-4">
            {profile ? (
              <ProfileEditor
                initialBio={profile.bio}
                initialSlug={profile.slug}
                initialSocialLinks={profile.social_links}
                onSave={handleSaveProfile}
              />
            ) : (
              <Skeleton className="h-64 w-full max-w-xl rounded-xl" />
            )}
          </div>
        </Tab>
      </Tabs>

      <div className="mt-4">
        <Button
          as="a"
          href="/api/creator/export"
          size="sm"
          variant="flat"
        >
          Export Sales CSV
        </Button>
      </div>
    </>
  );
}

import type { Product } from "@/types/product";

import { Metadata } from "next";

import { HeroSection } from "@/components/home/hero-section";
import { TrendingSection } from "@/components/home/trending-section";
import { StaffPicksSection } from "@/components/home/staff-picks-section";
import { TopCreatorsSection } from "@/components/home/top-creators-section";
import {
  getTrendingProducts,
  getStaffPicks,
  getTopCreators,
} from "@/services/product.service";

export const metadata: Metadata = {
  title: "s&box Store — Marketplace for s&box Creators and Players",
  description:
    "Discover gamemodes, tools, maps, and assets built for Source 2. Buy, sell, and share with the s&box community.",
  openGraph: {
    title: "s&box Store — Marketplace for s&box Creators and Players",
    description:
      "Discover gamemodes, tools, maps, and assets built for Source 2.",
  },
};

export default async function Home() {
  let trending: Product[] = [];
  let staffPicks: Product[] = [];
  let topCreators: {
    id: number;
    username: string;
    avatar_url: string;
    slug: string | null;
    product_count: number;
    total_sales: number;
  }[] = [];

  try {
    [trending, staffPicks, topCreators] = await Promise.all([
      getTrendingProducts(8),
      getStaffPicks(4),
      getTopCreators(6),
    ]);
  } catch {
    // DB not available
  }

  return (
    <div className="flex flex-col gap-4">
      <HeroSection />
      <TrendingSection products={trending} />
      <StaffPicksSection products={staffPicks} />
      <TopCreatorsSection creators={topCreators} />
    </div>
  );
}

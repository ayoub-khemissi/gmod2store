import type { MetadataRoute } from "next";

import { RowDataPacket } from "mysql2/promise";

import { query } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface SlugRow extends RowDataPacket {
  slug: string;
  updated_at: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  let creatorPages: MetadataRoute.Sitemap = [];

  try {
    const products = await query<SlugRow[]>(
      "SELECT slug, updated_at FROM products WHERE status = 'published'",
    );

    productPages = products.map((p) => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const creators = await query<SlugRow[]>(
      "SELECT slug, updated_at FROM users WHERE role IN ('creator', 'admin') AND slug IS NOT NULL",
    );

    creatorPages = creators.map((c) => ({
      url: `${BASE_URL}/creators/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB may not be available during build
  }

  return [...staticPages, ...productPages, ...creatorPages];
}

import { ProductCategorySlug } from "@/config/categories";

export type ProductStatus = "draft" | "pending" | "published" | "rejected";

export interface Product {
  id: number;
  seller_id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategorySlug;
  status: ProductStatus;
  thumbnail_url: string | null;
  average_rating: number;
  review_count: number;
  sales_count: number;
  view_count: number;
  is_staff_pick: boolean;
  tags: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVersion {
  id: number;
  product_id: number;
  version: string;
  changelog: string;
  archive_url: string;
  file_size: number;
  created_at: Date;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

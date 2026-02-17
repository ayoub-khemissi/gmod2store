import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductReviewsWrapper } from "./reviews-wrapper";

import {
  getProductBySlug,
  getProductImages,
  getProductVersions,
  incrementViewCount,
} from "@/services/product.service";
import { findUserById } from "@/services/auth.service";
import { getProductReviews } from "@/services/review.service";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductDescription } from "@/components/product/product-description";
import { ProductVersions } from "@/components/product/product-versions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch {
    return { title: "Product Not Found" };
  }

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const [images, versions, reviewsData, seller] = await Promise.all([
    getProductImages(product.id),
    getProductVersions(product.id),
    getProductReviews(product.id, 1, 10),
    findUserById(product.seller_id),
  ]);

  // Fire-and-forget view count increment
  incrementViewCount(product.id).catch(() => {});

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductGallery
          images={images}
          thumbnailUrl={product.thumbnail_url}
          title={product.title}
        />
        <ProductInfo
          product={product}
          seller={
            seller
              ? {
                  username: seller.username,
                  avatar_url: seller.avatar_url,
                  slug: seller.slug,
                }
              : undefined
          }
        />
      </div>

      <ProductDescription description={product.description} />
      <ProductVersions versions={versions} />
      <ProductReviewsWrapper
        initialReviews={reviewsData.reviews}
        productSlug={slug}
        totalReviews={reviewsData.total}
      />
    </section>
  );
}

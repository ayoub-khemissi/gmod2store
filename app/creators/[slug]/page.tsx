import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@heroui/avatar";

import { getCreatorBySlug } from "@/services/creator.service";
import { getProducts } from "@/services/product.service";
import { ProductGrid } from "@/components/product/product-grid";
import { title } from "@/components/primitives";

interface CreatorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CreatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) return { title: "Creator Not Found" };

  return {
    title: `${creator.username} — Creator Storefront`,
    description:
      creator.bio ?? `Browse products by ${creator.username} on s&box Store.`,
    openGraph: {
      title: `${creator.username} — s&box Store`,
      description:
        creator.bio ?? `Browse products by ${creator.username}.`,
      images: creator.avatar_url ? [creator.avatar_url] : [],
    },
  };
}

export default async function CreatorStorefrontPage({
  params,
}: CreatorPageProps) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) notFound();

  const { products } = await getProducts({
    sellerId: creator.id,
    status: "published",
    limit: 50,
  });

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      {/* Creator header */}
      <div className="flex flex-col items-center gap-4 text-center">
        {creator.banner_url && (
          <div
            className="absolute inset-x-0 top-0 h-48 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${creator.banner_url})` }}
          />
        )}
        <Avatar
          isBordered
          className="w-24 h-24"
          color="primary"
          name={creator.username}
          src={creator.avatar_url}
        />
        <h1 className={title({ size: "sm" })}>{creator.username}</h1>
        {creator.bio && (
          <p className="text-default-500 max-w-lg">{creator.bio}</p>
        )}
        {creator.social_links && Object.keys(creator.social_links).length > 0 && (
          <div className="flex gap-3">
            {Object.entries(creator.social_links).map(
              ([key, url]) =>
                url && (
                  <a
                    key={key}
                    className="text-default-400 hover:text-primary transition-colors text-sm capitalize"
                    href={url as string}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {key}
                  </a>
                ),
            )}
          </div>
        )}
      </div>

      {/* Products */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-4">
          Products ({products.length})
        </h2>
        <ProductGrid
          products={products.map((p) => ({
            title: p.title,
            slug: p.slug,
            price: p.price,
            category: p.category,
            thumbnailUrl: p.thumbnail_url,
            averageRating: p.average_rating,
          }))}
        />
      </div>
    </section>
  );
}

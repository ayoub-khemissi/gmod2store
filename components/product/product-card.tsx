"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";

interface ProductCardProps {
  title: string;
  slug: string;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  averageRating: number;
}

export const ProductCard = ({
  title,
  slug,
  price,
  category,
  thumbnailUrl,
  averageRating,
}: ProductCardProps) => {
  return (
    <Card
      isPressable
      as={NextLink}
      className="w-full"
      href={`/product/${slug}`}
    >
      <CardBody className="overflow-visible p-0">
        <Image
          alt={title}
          className="w-full object-cover h-[200px]"
          radius="lg"
          shadow="sm"
          src={thumbnailUrl ?? "/placeholder.png"}
          width="100%"
        />
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-2 pt-3">
        <div className="flex w-full justify-between items-center">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-base">
            {title}
          </h3>
          <span className="text-primary font-semibold">
            ${price.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-2">
          <Chip size="sm" variant="flat">
            {category}
          </Chip>
          {averageRating > 0 && (
            <Chip color="warning" size="sm" variant="flat">
              {averageRating.toFixed(1)} / 5
            </Chip>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

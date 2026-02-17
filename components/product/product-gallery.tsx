"use client";

import { Image } from "@heroui/image";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/modal";
import { useState } from "react";

import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  thumbnailUrl: string | null;
  title: string;
}

export const ProductGallery = ({
  images,
  thumbnailUrl,
  title,
}: ProductGalleryProps) => {
  const allImages =
    images.length > 0
      ? images.map((img) => img.url)
      : thumbnailUrl
        ? [thumbnailUrl]
        : ["/placeholder.png"];

  const [selected, setSelected] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <button
        aria-label={`View ${title} full size`}
        className="relative w-full aspect-video rounded-xl overflow-hidden glass-card cursor-zoom-in"
        onClick={onOpen}
      >
        <Image
          alt={title}
          className="object-cover w-full h-full"
          radius="none"
          src={allImages[selected]}
        />
      </button>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((url, index) => (
            <button
              key={index}
              aria-label={`View image ${index + 1}`}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selected
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              onClick={() => setSelected(index)}
            >
              <Image
                alt={`${title} - image ${index + 1}`}
                className="object-cover w-full h-full"
                radius="none"
                src={url}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      <Modal isOpen={isOpen} size="5xl" onClose={onClose}>
        <ModalContent>
          <ModalBody className="p-2">
            <Image
              alt={title}
              className="object-contain w-full max-h-[80vh]"
              radius="lg"
              src={allImages[selected]}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

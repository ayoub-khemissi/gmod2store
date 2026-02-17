"use client";

import type { WizardData } from "./upload-wizard";

import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";

interface StepPreviewProps {
  data: WizardData;
  onPrev: () => void;
}

export const StepPreview = ({ data, onPrev }: StepPreviewProps) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create product
      const createRes = await fetch("/api/creator/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          description: data.description,
          price: data.price,
          category: data.category,
          tags: data.tags,
        }),
      });
      const createJson = await createRes.json();

      if (!createJson.success) throw new Error(createJson.error);

      const productId = createJson.data.id;

      // 2. Upload images
      for (const url of data.imageUrls) {
        await fetch(`/api/creator/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      }

      // 3. Create version
      await fetch(`/api/creator/products/${productId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archive_url: data.archiveUrl,
          file_size: data.fileSize,
          changelog: "Initial release",
        }),
      });

      // 4. Submit for review
      await fetch(`/api/creator/products/${productId}/submit`, {
        method: "POST",
      });

      router.push("/creator");
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6">
        <h3 className="font-[family-name:var(--font-heading)] font-semibold text-xl mb-4">
          Preview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {data.imageUrls[0] && (
              <Image
                alt={data.title}
                className="aspect-video object-cover w-full"
                radius="lg"
                src={data.imageUrls[0]}
              />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
              {data.title}
            </h2>
            <div className="flex gap-2">
              <Chip color="primary" size="sm" variant="flat">
                {data.category}
              </Chip>
              <Chip color="success" size="sm" variant="flat">
                {data.price === 0 ? "Free" : `$${data.price.toFixed(2)}`}
              </Chip>
            </div>
            <p className="text-default-500 text-sm line-clamp-4">
              {data.description}
            </p>
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="bordered">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
            <p className="text-default-400 text-xs">
              {data.imageUrls.length} image(s) |{" "}
              {(data.fileSize / 1024 / 1024).toFixed(1)} MB archive
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="flat" onPress={onPrev}>
          Back
        </Button>
        <LoadingButton color="primary" variant="shadow" onPress={onOpen}>
          Submit for Review
        </LoadingButton>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Submission</ModalHeader>
          <ModalBody>
            <p>
              Your product will be submitted for review. Once approved, it will
              be visible on the marketplace.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <LoadingButton
              color="primary"
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              Confirm
            </LoadingButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

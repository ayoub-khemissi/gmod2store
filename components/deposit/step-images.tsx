"use client";

import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useRef, useState } from "react";

import type { WizardData } from "./upload-wizard";

interface StepImagesProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepImages = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}: StepImagesProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (data.imageUrls.length + newUrls.length >= 10) break;

      const formData = new FormData();

      formData.append("image", file);

      try {
        const res = await fetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (json.success) {
          newUrls.push(json.data.url);
        }
      } catch {
        // skip failed
      }
    }

    onUpdate({ imageUrls: [...data.imageUrls, ...newUrls] });
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    onUpdate({
      imageUrls: data.imageUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-default-500">
        Upload up to 10 images. The first image will be used as the thumbnail.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.imageUrls.map((url, index) => (
          <div key={index} className="relative group rounded-xl overflow-hidden">
            <img
              alt={`Image ${index + 1}`}
              className="aspect-video object-cover w-full"
              src={url}
            />
            <button
              className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
              onClick={() => removeImage(index)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-primary/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                Thumbnail
              </span>
            )}
          </div>
        ))}

        {data.imageUrls.length < 10 && (
          <button
            className="glass-card aspect-video flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Spinner size="sm" />
            ) : (
              <span className="text-default-400 text-3xl">+</span>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        accept="image/*"
        className="hidden"
        multiple
        type="file"
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files);
        }}
      />

      <div className="flex gap-3 mt-2">
        <Button variant="flat" onPress={onPrev}>
          Back
        </Button>
        <Button
          color="primary"
          isDisabled={data.imageUrls.length === 0}
          onPress={onNext}
        >
          Next: Preview
        </Button>
      </div>
    </div>
  );
};

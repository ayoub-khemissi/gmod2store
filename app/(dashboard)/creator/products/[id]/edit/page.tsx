"use client";

import type { Product, ProductImage } from "@/types/product";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Spinner } from "@heroui/spinner";
import { Alert } from "@heroui/alert";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";
import { productCategories } from "@/config/categories";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [category, setCategory] = useState("gamemodes");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "danger";
  } | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/creator/products/${id}`);
      const json = await res.json();

      if (json.success) {
        const p = json.data;

        setProduct(p);
        setImages(p.images ?? []);
        setFormTitle(p.title);
        setSlug(p.slug);
        setDescription(p.description);
        setPrice(String(p.price));
        setCategory(p.category);
        setTags(p.tags ?? []);
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();

    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/creator/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          slug,
          description,
          price: Number(price),
          category,
          tags,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setProduct(json.data);
        setSaveMessage({
          text: "Product updated successfully",
          type: "success",
        });
      } else {
        setSaveMessage({
          text: json.error ?? "Failed to save",
          type: "danger",
        });
      }
    } catch {
      setSaveMessage({ text: "Failed to save", type: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= 10) break;

      const formData = new FormData();

      formData.append("image", file);

      try {
        const res = await fetch(`/api/creator/products/${id}/images`, {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (json.success) {
          setImages((prev) => [
            ...prev,
            {
              id: Date.now(),
              product_id: Number(id),
              url: json.data.url,
              sort_order: json.data.sort_order,
            },
          ]);
        }
      } catch {
        // skip failed
      }
    }

    setIsUploading(false);
    // Refetch to get actual image IDs
    fetchProduct();
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      const res = await fetch(
        `/api/creator/products/${id}/images?imageId=${imageId}`,
        { method: "DELETE" },
      );
      const json = await res.json();

      if (json.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch {
      // fail silently
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-[400px] w-full max-w-xl rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <h1 className={title({ size: "sm" })}>Product not found</h1>
        <Button variant="flat" onPress={() => router.push("/creator")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const canSave =
    formTitle.trim().length >= 3 &&
    slug.trim().length >= 3 &&
    description.trim().length >= 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className={title({ size: "sm" })}>Edit Product</h1>
        <div className="flex gap-2">
          <Button variant="flat" onPress={() => router.push("/creator")}>
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            isDisabled={!canSave}
            isLoading={isSaving}
            onPress={handleSave}
          >
            Save Changes
          </LoadingButton>
        </div>
      </div>

      {saveMessage && (
        <Alert
          isClosable
          color={saveMessage.type}
          onClose={() => setSaveMessage(null)}
        >
          {saveMessage.text}
        </Alert>
      )}

      <div className="flex flex-col gap-4 max-w-xl">
        <Input
          isRequired
          label="Product Title"
          value={formTitle}
          variant="bordered"
          onValueChange={setFormTitle}
        />

        <Input
          isRequired
          label="URL Slug"
          value={slug}
          variant="bordered"
          onValueChange={setSlug}
        />

        <Input
          isRequired
          description={
            description.trim().length > 0 && description.trim().length < 10
              ? `${10 - description.trim().length} more characters needed`
              : undefined
          }
          label="Description"
          value={description}
          variant="bordered"
          onValueChange={setDescription}
        />

        <Select
          label="Category"
          selectedKeys={[category]}
          variant="bordered"
          onSelectionChange={(keys) =>
            setCategory(Array.from(keys)[0] as string)
          }
        >
          {productCategories.map((cat) => (
            <SelectItem key={cat.slug}>{cat.label}</SelectItem>
          ))}
        </Select>

        <Input
          label="Price (USD)"
          min={0}
          placeholder="0.00"
          step={0.01}
          type="number"
          value={price}
          variant="bordered"
          onValueChange={setPrice}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Tags"
            placeholder={
              tags.length === 0
                ? "Type a tag and press Enter"
                : "Add another tag..."
            }
            value={tagInput}
            variant="bordered"
            onKeyDown={handleTagKeyDown}
            onValueChange={setTagInput}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  onClose={() => removeTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Images section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Images</h2>
        <p className="text-default-500 text-sm">
          Up to 10 images. The first image is used as thumbnail.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden"
            >
              <img
                alt={`Image ${index + 1}`}
                className="aspect-video object-cover w-full"
                src={img.url}
              />
              <button
                className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                onClick={() => handleImageDelete(img.id)}
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

          {images.length < 10 && (
            <button
              className="glass-card aspect-video rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => imageInputRef.current?.click()}
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
          ref={imageInputRef}
          multiple
          accept="image/*"
          className="hidden"
          type="file"
          onChange={(e) => {
            if (e.target.files) handleImageUpload(e.target.files);
          }}
        />
      </div>
    </div>
  );
}

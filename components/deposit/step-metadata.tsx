"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import { productCategories } from "@/config/categories";
import type { WizardData } from "./upload-wizard";

interface StepMetadataProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepMetadata = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}: StepMetadataProps) => {
  const [tagInput, setTagInput] = useState("");

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();

    if (tag && !data.tags.includes(tag)) {
      onUpdate({ tags: [...data.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: data.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && data.tags.length > 0) {
      removeTag(data.tags[data.tags.length - 1]);
    }
  };

  const canContinue =
    data.title.trim().length >= 3 &&
    data.slug.trim().length >= 3 &&
    data.description.trim().length >= 10;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Input
        isRequired
        label="Product Title"
        placeholder="My Awesome Gamemode"
        value={data.title}
        variant="bordered"
        onValueChange={(v) => {
          onUpdate({ title: v, slug: generateSlug(v) });
        }}
      />

      <Input
        isRequired
        label="URL Slug"
        placeholder="my-awesome-gamemode"
        value={data.slug}
        variant="bordered"
        onValueChange={(v) => onUpdate({ slug: v })}
      />

      <Input
        isRequired
        description={data.description.trim().length > 0 && data.description.trim().length < 10 ? `${10 - data.description.trim().length} more characters needed` : undefined}
        label="Description"
        placeholder="Describe your product in detail..."
        value={data.description}
        variant="bordered"
        onValueChange={(v) => onUpdate({ description: v })}
      />

      <Select
        label="Category"
        selectedKeys={[data.category]}
        variant="bordered"
        onSelectionChange={(keys) =>
          onUpdate({ category: Array.from(keys)[0] as string })
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
        value={data.price.toString()}
        variant="bordered"
        onValueChange={(v) => onUpdate({ price: Number(v) || 0 })}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="Tags"
          placeholder={data.tags.length === 0 ? "Type a tag and press Enter" : "Add another tag..."}
          value={tagInput}
          variant="bordered"
          onKeyDown={handleTagKeyDown}
          onValueChange={setTagInput}
        />
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.map((tag) => (
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

      <div className="flex gap-3 mt-2">
        <Button variant="flat" onPress={onPrev}>
          Back
        </Button>
        <Button
          color="primary"
          isDisabled={!canContinue}
          onPress={onNext}
        >
          Next: Add Images
        </Button>
      </div>
    </div>
  );
};

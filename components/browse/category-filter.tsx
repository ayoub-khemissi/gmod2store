"use client";

import { Chip } from "@heroui/chip";

import { productCategories } from "@/config/categories";

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
      role="group"
    >
      <Chip
        className="cursor-pointer"
        color={selected === null ? "primary" : "default"}
        variant={selected === null ? "solid" : "flat"}
        onClick={() => onChange(null)}
      >
        All
      </Chip>
      {productCategories.map((cat) => (
        <Chip
          key={cat.slug}
          className="cursor-pointer"
          color={selected === cat.slug ? "primary" : "default"}
          variant={selected === cat.slug ? "solid" : "flat"}
          onClick={() => onChange(cat.slug)}
        >
          {cat.label}
        </Chip>
      ))}
    </div>
  );
};

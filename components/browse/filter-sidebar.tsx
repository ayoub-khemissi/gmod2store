"use client";

import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

interface FilterSidebarProps {
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const sortOptions = [
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Most Popular" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Highest Rated" },
];

export const FilterSidebar = ({
  minPrice,
  maxPrice,
  minRating,
  sort,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onSortChange,
}: FilterSidebarProps) => {
  return (
    <div className="flex flex-col gap-4 w-full lg:w-64 flex-shrink-0">
      <Select
        aria-label="Sort by"
        label="Sort by"
        selectedKeys={sort ? [sort] : ["newest"]}
        variant="bordered"
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string;

          onSortChange(val);
        }}
      >
        {sortOptions.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>

      <div className="flex gap-2">
        <Input
          label="Min Price"
          placeholder="0"
          size="sm"
          type="number"
          value={minPrice}
          variant="bordered"
          onValueChange={onMinPriceChange}
        />
        <Input
          label="Max Price"
          placeholder="Any"
          size="sm"
          type="number"
          value={maxPrice}
          variant="bordered"
          onValueChange={onMaxPriceChange}
        />
      </div>

      <Select
        aria-label="Minimum rating"
        label="Min Rating"
        selectedKeys={minRating ? [minRating] : []}
        variant="bordered"
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string;

          onMinRatingChange(val ?? "");
        }}
      >
        <SelectItem key="4">4+ Stars</SelectItem>
        <SelectItem key="3">3+ Stars</SelectItem>
        <SelectItem key="2">2+ Stars</SelectItem>
        <SelectItem key="1">1+ Stars</SelectItem>
      </Select>
    </div>
  );
};

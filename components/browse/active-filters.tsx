"use client";

import { Chip } from "@heroui/chip";

interface ActiveFiltersProps {
  filters: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFilters = ({
  filters,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          color="primary"
          size="sm"
          variant="flat"
          onClose={() => onRemove(filter.key)}
        >
          {filter.label}
        </Chip>
      ))}
      <button
        className="text-xs text-default-400 hover:text-primary transition-colors ml-2"
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  );
};

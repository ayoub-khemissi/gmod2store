"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { Chip } from "@heroui/chip";

import type { ProductVersion } from "@/types/product";

interface ProductVersionsProps {
  versions: ProductVersion[];
}

export const ProductVersions = ({ versions }: ProductVersionsProps) => {
  if (versions.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-4">
        Versions
      </h2>
      <Accordion variant="splitted">
        {versions.map((version, index) => (
          <AccordionItem
            key={version.id}
            aria-label={`Version ${version.version}`}
            startContent={
              <div className="flex items-center gap-2">
                <Chip
                  color={index === 0 ? "primary" : "default"}
                  size="sm"
                  variant={index === 0 ? "solid" : "flat"}
                >
                  v{version.version}
                </Chip>
                {index === 0 && (
                  <Chip color="success" size="sm" variant="flat">
                    Latest
                  </Chip>
                )}
              </div>
            }
            subtitle={new Date(version.created_at).toLocaleDateString()}
            title={`Version ${version.version}`}
          >
            <div className="text-default-600 whitespace-pre-wrap">
              {version.changelog}
            </div>
            {version.file_size > 0 && (
              <p className="text-default-400 text-sm mt-2">
                Size: {(version.file_size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

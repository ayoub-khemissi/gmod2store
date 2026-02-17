"use client";

import type { Product } from "@/types/product";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import NextLink from "next/link";

interface ProductManagementTableProps {
  products: Product[];
  isLoading?: boolean;
}

const statusColorMap: Record<
  string,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  draft: "default",
  pending: "warning",
  published: "success",
  rejected: "danger",
};

export const ProductManagementTable = ({
  products,
  isLoading,
}: ProductManagementTableProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <Table aria-label="Products management table">
      <TableHeader>
        <TableColumn>PRODUCT</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>CATEGORY</TableColumn>
        <TableColumn>PRICE</TableColumn>
        <TableColumn>SALES</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No products yet. Create your first product!">
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex flex-col">
                <p className="font-semibold">{product.title}</p>
                <p className="text-xs text-default-400">/{product.slug}</p>
              </div>
            </TableCell>
            <TableCell>
              <Chip
                color={statusColorMap[product.status]}
                size="sm"
                variant="flat"
              >
                {product.status}
              </Chip>
            </TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>${Number(product.price).toFixed(2)}</TableCell>
            <TableCell>{product.sales_count}</TableCell>
            <TableCell>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="light">
                    Actions
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Product actions">
                  <DropdownItem
                    key="edit"
                    as={NextLink}
                    href={`/creator/products/${product.id}/edit`}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="versions"
                    as={NextLink}
                    href={`/creator/products/${product.id}/versions`}
                  >
                    Manage Versions
                  </DropdownItem>
                  <DropdownItem
                    key="view"
                    as={NextLink}
                    href={`/product/${product.slug}`}
                  >
                    View Public Page
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

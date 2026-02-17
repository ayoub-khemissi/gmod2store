"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { Skeleton } from "@heroui/skeleton";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";

interface AdminProduct {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  price: number;
  seller_username: string;
  seller_id: number;
  created_at: string;
}

const statusColorMap: Record<string, "default" | "warning" | "success" | "danger"> = {
  draft: "default",
  pending: "warning",
  published: "success",
  rejected: "danger",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [actioning, setActioning] = useState<number | null>(null);

  const fetchProducts = (status: string) => {
    setIsLoading(true);
    fetch(`/api/admin/products?status=${status}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab]);

  const handleApprove = async (productId: number) => {
    setActioning(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch {
      //
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (productId: number) => {
    setActioning(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Does not meet quality standards" }),
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch {
      //
    } finally {
      setActioning(null);
    }
  };

  return (
    <>
      <h1 className={title({ size: "sm" })}>Product Moderation</h1>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab key="pending" title="Pending" />
        <Tab key="published" title="Published" />
        <Tab key="rejected" title="Rejected" />
        <Tab key="draft" title="Drafts" />
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Table aria-label="Products" className="mt-2">
          <TableHeader>
            <TableColumn>PRODUCT</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>PRICE</TableColumn>
            <TableColumn>SELLER</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No products found.">
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <span className="font-medium">{product.title}</span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {product.category}
                  </Chip>
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.seller_username}</TableCell>
                <TableCell>
                  <Chip
                    color={statusColorMap[product.status] ?? "default"}
                    size="sm"
                    variant="flat"
                  >
                    {product.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  {product.status === "pending" && (
                    <div className="flex gap-2">
                      <LoadingButton
                        color="success"
                        isLoading={actioning === product.id}
                        size="sm"
                        variant="flat"
                        onPress={() => handleApprove(product.id)}
                      >
                        Approve
                      </LoadingButton>
                      <LoadingButton
                        color="danger"
                        isLoading={actioning === product.id}
                        size="sm"
                        variant="flat"
                        onPress={() => handleReject(product.id)}
                      >
                        Reject
                      </LoadingButton>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

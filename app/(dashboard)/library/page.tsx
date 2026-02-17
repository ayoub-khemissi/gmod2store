"use client";

import type { LibraryItem } from "@/services/library.service";

import { useState, useEffect } from "react";

import { title } from "@/components/primitives";
import { LibraryGrid } from "@/components/library/library-grid";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/library")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setItems(data.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <h1 className={title({ size: "sm" })}>My Library</h1>
      <LibraryGrid isLoading={isLoading} items={items} />
    </>
  );
}

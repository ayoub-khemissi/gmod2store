"use client";

import { useParams } from "next/navigation";

import { title } from "@/components/primitives";

export default function EditProductPage() {
  const { id } = useParams();

  return (
    <>
      <h1 className={title({ size: "sm" })}>Edit Product</h1>
      <p className="text-default-500">
        Edit product #{id}. Full editor form will load here.
      </p>
    </>
  );
}

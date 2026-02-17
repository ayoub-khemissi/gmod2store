"use client";

import { title } from "@/components/primitives";
import { UploadWizard } from "@/components/deposit/upload-wizard";

export default function NewProductPage() {
  return (
    <>
      <h1 className={title({ size: "sm" })}>New Product</h1>
      <p className="text-default-500 mb-4">
        Upload your product and submit it for review.
      </p>
      <UploadWizard />
    </>
  );
}

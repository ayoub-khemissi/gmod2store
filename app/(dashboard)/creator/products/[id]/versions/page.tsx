"use client";

import { useParams } from "next/navigation";

import { title } from "@/components/primitives";

export default function VersionsPage() {
  const { id } = useParams();

  return (
    <>
      <h1 className={title({ size: "sm" })}>Manage Versions</h1>
      <p className="text-default-500">Version management for product #{id}.</p>
    </>
  );
}

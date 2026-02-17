"use client";

import { useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";

interface DownloadButtonProps {
  licenseId: number;
  versionId?: number;
}

export const DownloadButton = ({
  licenseId,
  versionId,
}: DownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const url = `/api/library/${licenseId}/download${
        versionId ? `?versionId=${versionId}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingButton
      className="w-full"
      color="primary"
      isLoading={isLoading}
      size="sm"
      variant="flat"
      onPress={handleDownload}
    >
      Download
    </LoadingButton>
  );
};

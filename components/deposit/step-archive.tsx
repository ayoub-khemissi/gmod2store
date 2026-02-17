"use client";

import type { WizardData } from "./upload-wizard";

import { useState, useRef } from "react";
import { Progress } from "@heroui/progress";

import { LoadingButton } from "@/components/ui/loading-button";

interface StepArchiveProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
}

export const StepArchive = ({ data, onUpdate, onNext }: StepArchiveProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();

      formData.append("archive", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise<{ url: string; file_size: number }>(
        (resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const json = JSON.parse(xhr.responseText);

              if (json.success) {
                resolve(json.data);
              } else {
                reject(new Error(json.error));
              }
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", "/api/uploads/archive");
          xhr.send(formData);
        },
      );

      onUpdate({ archiveUrl: result.url, fileSize: result.file_size });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="glass-card p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];

          if (file) handleUpload(file);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          accept=".zip,.rar,.7z,.tar.gz"
          className="hidden"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) handleUpload(file);
          }}
        />
        <p className="text-default-500 text-lg">
          {data.archiveUrl
            ? "Archive uploaded successfully!"
            : "Drag & drop your archive here, or click to browse"}
        </p>
        <p className="text-default-400 text-sm mt-2">
          Supports ZIP, RAR, 7Z. Max 500MB.
        </p>
      </div>

      {isUploading && (
        <Progress
          aria-label="Upload progress"
          color="primary"
          label={`Uploading... ${progress}%`}
          value={progress}
        />
      )}

      {error && <p className="text-danger text-sm">{error}</p>}

      {data.archiveUrl && (
        <LoadingButton className="w-fit" color="primary" onPress={onNext}>
          Next: Add Details
        </LoadingButton>
      )}
    </div>
  );
};

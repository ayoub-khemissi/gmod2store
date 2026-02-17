"use client";

import { useState } from "react";
import { Progress } from "@heroui/progress";

import { StepArchive } from "./step-archive";
import { StepMetadata } from "./step-metadata";
import { StepImages } from "./step-images";
import { StepPreview } from "./step-preview";

const steps = ["Upload Archive", "Details", "Images", "Preview & Submit"];

export interface WizardData {
  archiveUrl: string;
  fileSize: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrls: string[];
}

export const UploadWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    archiveUrl: "",
    fileSize: 0,
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: "gamemodes",
    tags: [],
    imageUrls: [],
  });

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          {steps.map((step, i) => (
            <span
              key={i}
              className={
                i <= currentStep ? "text-primary font-semibold" : "text-default-400"
              }
            >
              {step}
            </span>
          ))}
        </div>
        <Progress
          aria-label="Wizard progress"
          color="primary"
          size="sm"
          value={((currentStep + 1) / steps.length) * 100}
        />
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <StepArchive data={data} onNext={next} onUpdate={updateData} />
      )}
      {currentStep === 1 && (
        <StepMetadata
          data={data}
          onNext={next}
          onPrev={prev}
          onUpdate={updateData}
        />
      )}
      {currentStep === 2 && (
        <StepImages
          data={data}
          onNext={next}
          onPrev={prev}
          onUpdate={updateData}
        />
      )}
      {currentStep === 3 && (
        <StepPreview data={data} onPrev={prev} />
      )}
    </div>
  );
};

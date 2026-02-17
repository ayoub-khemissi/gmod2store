"use client";

import { Progress } from "@heroui/progress";

interface QualityScoreBadgeProps {
  score: number;
}

export const QualityScoreBadge = ({ score }: QualityScoreBadgeProps) => {
  const color = score >= 80 ? "success" : score >= 50 ? "warning" : "danger";

  return (
    <div className="flex flex-col items-center gap-1 w-16">
      <Progress
        aria-label="Quality score"
        color={color}
        size="sm"
        value={score}
      />
      <span className="text-xs font-semibold">{score}/100</span>
    </div>
  );
};

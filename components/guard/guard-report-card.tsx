"use client";

import { CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { QualityScoreBadge } from "./quality-score-badge";

import { GlassCard } from "@/components/ui/glass-card";

interface GuardReportCardProps {
  status: string;
  qualityScore: number | null;
  createdAt: string;
}

const statusColorMap: Record<
  string,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  pending: "default",
  running: "primary",
  passed: "success",
  failed: "danger",
  override: "warning",
};

export const GuardReportCard = ({
  status,
  qualityScore,
  createdAt,
}: GuardReportCardProps) => {
  return (
    <GlassCard>
      <CardBody className="p-4 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Chip
              color={statusColorMap[status] ?? "default"}
              size="sm"
              variant="flat"
            >
              {status}
            </Chip>
            <span className="text-default-400 text-sm">
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        {qualityScore !== null && <QualityScoreBadge score={qualityScore} />}
      </CardBody>
    </GlassCard>
  );
};

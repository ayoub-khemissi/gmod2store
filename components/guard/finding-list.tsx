"use client";

import { Chip } from "@heroui/chip";

interface Finding {
  severity: string;
  message: string;
  file?: string;
  line?: number;
}

interface FindingListProps {
  findings: Finding[];
}

const severityColorMap: Record<string, "default" | "warning" | "danger"> = {
  info: "default",
  warning: "warning",
  critical: "danger",
};

export const FindingList = ({ findings }: FindingListProps) => {
  if (findings.length === 0) {
    return <p className="text-default-400 text-sm">No findings.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {findings.map((finding, i) => (
        <div key={i} className="flex items-start gap-2 p-2 glass-subtle rounded-lg">
          <Chip
            color={severityColorMap[finding.severity] ?? "default"}
            size="sm"
            variant="flat"
          >
            {finding.severity}
          </Chip>
          <div>
            <p className="text-sm">{finding.message}</p>
            {finding.file && (
              <p className="text-xs text-default-400">
                {finding.file}
                {finding.line ? `:${finding.line}` : ""}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

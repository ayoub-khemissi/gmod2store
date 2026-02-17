"use client";

import type { GuardStatus } from "@/types/guard";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { title } from "@/components/primitives";
import { QualityScoreBadge } from "@/components/guard/quality-score-badge";

interface GuardReportRow {
  id: number;
  product_id: number;
  version_id: number | null;
  status: GuardStatus;
  quality_score: number | null;
  product_title: string;
  seller_username: string;
  created_at: string;
}

const statusColorMap: Record<
  GuardStatus,
  "default" | "warning" | "success" | "danger" | "primary"
> = {
  pending: "default",
  running: "warning",
  passed: "success",
  failed: "danger",
  override: "primary",
};

export default function AdminGuardPage() {
  const [reports, setReports] = useState<GuardReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/guard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReports(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <>
        <h1 className={title({ size: "sm" })}>Guard Reports</h1>
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={title({ size: "sm" })}>Guard Reports</h1>
      <p className="text-default-500 text-sm">
        Security scan results for submitted products.
      </p>

      <Table aria-label="Guard reports" className="mt-2">
        <TableHeader>
          <TableColumn>PRODUCT</TableColumn>
          <TableColumn>SELLER</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>QUALITY</TableColumn>
          <TableColumn>DATE</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No guard reports.">
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <span className="font-medium">{report.product_title}</span>
              </TableCell>
              <TableCell>{report.seller_username}</TableCell>
              <TableCell>
                <Chip
                  color={statusColorMap[report.status]}
                  size="sm"
                  variant="flat"
                >
                  {report.status}
                </Chip>
              </TableCell>
              <TableCell>
                {report.quality_score !== null ? (
                  <QualityScoreBadge score={report.quality_score} />
                ) : (
                  <span className="text-default-400 text-sm">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(report.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

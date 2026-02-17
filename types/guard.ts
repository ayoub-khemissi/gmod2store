export type GuardStatus = "pending" | "running" | "passed" | "failed" | "override";

export interface GuardReport {
  id: number;
  product_id: number;
  version_id: number | null;
  status: GuardStatus;
  static_analysis: Record<string, unknown> | null;
  ai_review: Record<string, unknown> | null;
  content_check: Record<string, unknown> | null;
  sandbox_result: Record<string, unknown> | null;
  quality_score: number | null;
  created_at: Date;
  updated_at: Date;
}

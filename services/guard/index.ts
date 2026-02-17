import { execute, query } from "@/lib/db";
import { updateProduct, getProductById, getProductImages } from "@/services/product.service";
import { getLatestVersion } from "@/services/version.service";
import { runStaticAnalysis } from "./static-analysis";
import { runAiReview } from "./ai-review";
import { runContentCheck } from "./content-moderation";
import { runSandbox } from "./sandbox";
import { RowDataPacket } from "mysql2/promise";

export async function runGuardPipeline(productId: number): Promise<number> {
  const product = await getProductById(productId);

  if (!product) throw new Error("Product not found");

  const version = await getLatestVersion(productId);
  const images = await getProductImages(productId);

  // Create report
  const result = await execute(
    "INSERT INTO guard_reports (product_id, version_id, status) VALUES (?, ?, 'running')",
    [productId, version?.id ?? null],
  );
  const reportId = result.insertId;

  try {
    // Run all checks in parallel
    const [staticResult, aiResult, contentResult, sandboxResult] =
      await Promise.all([
        version
          ? runStaticAnalysis(version.archive_url)
          : Promise.resolve({ passed: true, findings: [], filesScanned: 0 }),
        version
          ? runAiReview(version.archive_url)
          : Promise.resolve({
              passed: true,
              qualityScore: 50,
              feedback: [],
            }),
        runContentCheck(
          images.map((i) => i.url),
          product.description,
        ),
        version
          ? runSandbox(version.archive_url)
          : Promise.resolve({
              passed: true,
              exitCode: 0,
              memoryUsage: 0,
              cpuTime: 0,
              output: "",
            }),
      ]);

    const allPassed =
      staticResult.passed &&
      aiResult.passed &&
      contentResult.passed &&
      sandboxResult.passed;

    const qualityScore = aiResult.qualityScore;

    // Update report
    await execute(
      `UPDATE guard_reports SET
        status = ?,
        static_analysis = ?,
        ai_review = ?,
        content_check = ?,
        sandbox_result = ?,
        quality_score = ?
      WHERE id = ?`,
      [
        allPassed ? "passed" : "failed",
        JSON.stringify(staticResult),
        JSON.stringify(aiResult),
        JSON.stringify(contentResult),
        JSON.stringify(sandboxResult),
        qualityScore,
        reportId,
      ],
    );

    // Update product status
    if (allPassed) {
      await updateProduct(productId, { status: "published" });
    } else {
      await updateProduct(productId, { status: "rejected" });
    }

    return reportId;
  } catch (error) {
    await execute(
      "UPDATE guard_reports SET status = 'failed' WHERE id = ?",
      [reportId],
    );

    await updateProduct(productId, { status: "rejected" });
    throw error;
  }
}

export async function getGuardReport(reportId: number) {
  const rows = await query<RowDataPacket[]>(
    "SELECT * FROM guard_reports WHERE id = ?",
    [reportId],
  );

  return rows[0] ?? null;
}

export async function getProductGuardReports(productId: number) {
  return query<RowDataPacket[]>(
    "SELECT * FROM guard_reports WHERE product_id = ? ORDER BY created_at DESC",
    [productId],
  );
}

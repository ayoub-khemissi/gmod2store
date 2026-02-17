export interface ContentCheckResult {
  passed: boolean;
  findings: { type: string; severity: string; message: string }[];
}

export async function runContentCheck(
  _imageUrls: string[],
  _description: string,
): Promise<ContentCheckResult> {
  // In production, send images to AI vision for NSFW/hate/copyright check
  // And run text analysis on description
  return {
    passed: true,
    findings: [],
  };
}

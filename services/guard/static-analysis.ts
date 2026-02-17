const MALICIOUS_PATTERNS = [
  {
    pattern: /Process\.Start/i,
    severity: "critical",
    message: "Process execution detected",
  },
  {
    pattern: /System\.Net\.WebClient/i,
    severity: "critical",
    message: "Network client usage detected",
  },
  {
    pattern: /HttpClient/i,
    severity: "warning",
    message: "HTTP client usage detected",
  },
  {
    pattern: /System\.IO\.File\.(Delete|Move|Copy)/i,
    severity: "warning",
    message: "File system manipulation detected",
  },
  {
    pattern: /eval\s*\(/i,
    severity: "critical",
    message: "Dynamic code evaluation detected",
  },
  {
    pattern: /Assembly\.Load/i,
    severity: "critical",
    message: "Dynamic assembly loading detected",
  },
  {
    pattern: /base64/i,
    severity: "warning",
    message: "Base64 encoding detected",
  },
  {
    pattern: /Reflection\.Emit/i,
    severity: "critical",
    message: "Code emission detected",
  },
];

export interface StaticFinding {
  severity: string;
  message: string;
  file?: string;
  line?: number;
}

export interface StaticAnalysisResult {
  passed: boolean;
  findings: StaticFinding[];
  filesScanned: number;
}

export async function runStaticAnalysis(
  _archiveUrl: string,
): Promise<StaticAnalysisResult> {
  // In production, this would extract the archive and scan .cs files
  // For now, return a placeholder that passes
  return {
    passed: true,
    findings: [],
    filesScanned: 0,
  };
}

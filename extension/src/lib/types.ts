// Mirrors the backend's api/_lib/types.ts (kept lean + duplicated, since the
// extension builds separately from the backend).

export type ProviderName = "claude" | "openai";

export interface Analysis {
  isJob: boolean;
  role: string | null;
  company: string | null;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  tips: string[];
  summary: string;
}

export interface AnalyzeRequest {
  url: string;
  title?: string;
  pageText: string;
  provider?: ProviderName;
}

export interface ApplyResult {
  action: "created" | "updated";
  pageId: string;
  pageUrl: string;
}

export interface CoverResult {
  coverLetter: string;
}

export interface SetupResult {
  databaseId: string;
  dataSourceId: string;
  url: string;
  created: boolean;
}

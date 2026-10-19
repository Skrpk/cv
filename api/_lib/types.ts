// Shared domain types for the CV & Job Application Assistant.
// See GLOSSARY.md for what these words mean.

export type ProviderName = "claude" | "openai";

/** The ordered set of Stages on the Board. Terminal: Offer, Rejected. */
export const STAGES = [
  "Applied",
  "HR Interview",
  "Code Assignment",
  "Tech Interview",
  "Final Interview",
  "Offer",
  "Rejected",
] as const;
export type Stage = (typeof STAGES)[number];

/** Request body for POST /api/analyze. */
export interface AnalyzeRequest {
  url: string;
  title?: string;
  pageText: string;
  provider?: ProviderName;
}

/** The comparison of one Job Description against the CV. */
export interface Analysis {
  isJob: boolean;
  role: string | null;
  company: string | null;
  matchScore: number; // 0-100
  strengths: string[];
  gaps: string[];
  tips: string[];
  summary: string;
}

/** Request body for POST /api/apply. */
export interface ApplyRequest {
  url: string;
  analysis: Analysis;
}

/** Result of creating/updating an Application on the Board. */
export interface ApplyResult {
  action: "created" | "updated";
  pageId: string;
  pageUrl: string;
}

/** Request body for POST /api/setup. */
export interface SetupRequest {
  parentPageId: string;
}

export interface SetupResult {
  databaseId: string;
  created: boolean;
}

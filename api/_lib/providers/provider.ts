import type { Analysis, ProviderName } from "../types";

export interface AnalyzeInput {
  cv: string;
  jd: string;
  url: string;
  title?: string;
}

/** A pluggable LLM backend that turns (CV, JD) into an Analysis. */
export interface AnalysisProvider {
  readonly name: ProviderName;
  analyze(input: AnalyzeInput): Promise<Analysis>;
}

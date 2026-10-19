import type { ProviderName } from "../types";
import type { AnalysisProvider } from "./provider";
import { createClaudeProvider } from "./claude";
import { createOpenAiProvider } from "./openai";

/** Resolves a provider by name, defaulting to Claude. */
export function getProvider(name: ProviderName = "claude"): AnalysisProvider {
  switch (name) {
    case "openai":
      return createOpenAiProvider();
    case "claude":
    default:
      return createClaudeProvider();
  }
}

export type { AnalysisProvider } from "./provider";

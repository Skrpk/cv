import type { ProviderName } from "../types";

export interface JsonCompletionInput {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * A minimal LLM seam: given a system + user prompt, return a JSON string.
 * Each provider forces JSON its own way (OpenAI json mode, Claude prefill).
 * All prompt and parsing logic lives in ../analysis.ts, not here.
 */
export interface CompletionProvider {
  readonly name: ProviderName;
  completeJson(input: JsonCompletionInput): Promise<string>;
}

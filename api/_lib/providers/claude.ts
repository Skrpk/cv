import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisProvider, AnalyzeInput } from "./provider";
import type { Analysis } from "../types";
import { MODELS } from "./models";

export function createClaudeProvider(): AnalysisProvider {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return {
    name: "claude",
    async analyze(_input: AnalyzeInput): Promise<Analysis> {
      // Phase 2: prompt `client` with the CV + JD using MODELS.claude.analyze
      // and parse the model's JSON into an Analysis.
      void client;
      void MODELS;
      throw new Error("claude.analyze not implemented yet (Phase 2)");
    },
  };
}

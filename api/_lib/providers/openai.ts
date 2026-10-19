import OpenAI from "openai";
import type { AnalysisProvider, AnalyzeInput } from "./provider";
import type { Analysis } from "../types";
import { MODELS } from "./models";

export function createOpenAiProvider(): AnalysisProvider {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return {
    name: "openai",
    async analyze(_input: AnalyzeInput): Promise<Analysis> {
      // Phase 2: prompt `client` with the CV + JD using MODELS.openai.analyze
      // and parse the model's JSON into an Analysis.
      void client;
      void MODELS;
      throw new Error("openai.analyze not implemented yet (Phase 2)");
    },
  };
}

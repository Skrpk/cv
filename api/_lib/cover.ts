import type { CompletionProvider } from "./providers/provider";
import { extractJson, type AnalyzeInput } from "./analysis";

// Generates a JD-tailored cover letter grounded in the CV. Reuses the analyze
// input shape (cv + jd + url/title) and the JSON-completion provider seam.

export const COVER_SYSTEM_PROMPT = `You are a professional writer helping a job candidate. Write a tailored cover letter for the candidate applying to the role described on the job page.

Rules:
- About 250-350 words, 3-4 short paragraphs.
- Ground every claim ONLY in the candidate's CV. Never invent employers, titles, metrics, or skills not present in it.
- Match the letter to the role's key requirements; name the company or product if it's clear from the page.
- Confident and specific; no clichés, no filler, no empty superlatives.
- Open with "Dear Hiring Team," unless the page clearly names a person or team.
- End with a sign-off using the candidate's name from the CV.

Respond with ONLY a JSON object, no prose, no code fences:
{ "coverLetter": string }   // the letter, with \\n line breaks`;

export function buildCoverPrompt(input: AnalyzeInput): string {
  return [
    "## Candidate CV",
    input.cv,
    "",
    "## Job page",
    `URL: ${input.url}`,
    input.title ? `Title: ${input.title}` : "",
    "",
    "## Extracted page text",
    input.jd,
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseCoverLetter(raw: string): string {
  const o = extractJson(raw);
  const letter = typeof o.coverLetter === "string" ? o.coverLetter.trim() : "";
  if (!letter) throw new Error("Model did not return a cover letter");
  return letter;
}

export async function runCoverLetter(
  provider: CompletionProvider,
  input: AnalyzeInput,
): Promise<string> {
  const raw = await provider.completeJson({
    system: COVER_SYSTEM_PROMPT,
    user: buildCoverPrompt(input),
    maxTokens: 1400,
  });
  return parseCoverLetter(raw);
}

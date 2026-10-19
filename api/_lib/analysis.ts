import type { Analysis } from "./types";
import type { CompletionProvider } from "./providers/provider";

// The whole brain of /analyze lives here, provider-agnostic: the prompt, the
// page-text trimming, and the defensive parse. Providers only make the call.

export interface AnalyzeInput {
  cv: string;
  jd: string;
  url: string;
  title?: string;
}

/** Cap on job-page text sent to the model, to bound token cost. */
export const MAX_JD_CHARS = 12000;

/**
 * Light cleanup of raw page innerText before it reaches the model: normalise
 * whitespace, collapse blank-line runs, and hard-cap the length. The extension
 * does the main-content extraction; this is the server-side safety net.
 */
export function trimPageText(text: string): string {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return normalized.length > MAX_JD_CHARS
    ? normalized.slice(0, MAX_JD_CHARS) + "\n…[truncated]"
    : normalized;
}

export const SYSTEM_PROMPT = `You are a precise technical recruiting assistant. You compare one candidate CV against a job description extracted from a web page.

The page text is raw innerText and may contain navigation, cookie banners, and unrelated content. First decide whether it actually contains a real job posting.

Respond with ONLY a JSON object, no prose, no code fences, matching exactly:
{
  "isJob": boolean,
  "role": string | null,
  "company": string | null,
  "matchScore": integer 0-100,
  "strengths": string[],
  "gaps": string[],
  "tips": string[],
  "summary": string
}

Rules:
- If the page is NOT a job posting, set isJob=false, role=null, company=null, matchScore=0, empty arrays, and a one-sentence summary saying it isn't a job posting.
- matchScore reflects how well THIS candidate fits THIS role, 0 (no fit) to 100 (ideal).
- strengths: concrete requirements in the JD that the CV clearly meets. Max 6.
- gaps: requirements in the JD that the CV does not mention or only weakly supports. Max 6.
- tips: short, actionable ways the candidate could tailor their application to this role. Max 3.
- summary: 2-3 sentences, plain and specific.
- Base everything ONLY on the provided CV and JD. Never invent experience the CV does not state.`;

export function buildUserPrompt(input: AnalyzeInput): string {
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

export function extractJson(raw: string): Record<string, unknown> {
  const t = raw.trim();
  try {
    return JSON.parse(t) as Record<string, unknown>;
  } catch {
    // Model wrapped the JSON in prose or fences — grab the outermost object.
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(t.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        /* fall through */
      }
    }
  }
  throw new Error("Model did not return valid JSON");
}

function strArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function clampScore(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Turns raw model output into a safe, well-formed Analysis. */
export function parseAnalysis(raw: string): Analysis {
  const o = extractJson(raw);

  if (o.isJob !== true) {
    return {
      isJob: false,
      role: null,
      company: null,
      matchScore: 0,
      strengths: [],
      gaps: [],
      tips: [],
      summary: str(o.summary) ?? "This page doesn't look like a job posting.",
    };
  }

  return {
    isJob: true,
    role: str(o.role),
    company: str(o.company),
    matchScore: clampScore(o.matchScore),
    strengths: strArray(o.strengths, 6),
    gaps: strArray(o.gaps, 6),
    tips: strArray(o.tips, 3),
    summary: str(o.summary) ?? "",
  };
}

/** Runs one Analysis end to end against the given provider. */
export async function runAnalysis(
  provider: CompletionProvider,
  input: AnalyzeInput,
): Promise<Analysis> {
  const raw = await provider.completeJson({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: 1200,
  });
  return parseAnalysis(raw);
}

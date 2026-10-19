import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import type { AnalyzeRequest, Analysis } from "./_lib/types";

// POST /api/analyze — compares one Job Description against the CV.
// Phase 1: validates + returns a stub Analysis. Phase 2 wires the model.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  if (preflight(req, res)) return;
  cors(res);
  if (req.method !== "POST") return methodNotAllowed(res, "POST, OPTIONS");
  if (!requireSecret(req, res)) return;

  const body = req.body as Partial<AnalyzeRequest> | undefined;
  if (!body || typeof body.url !== "string" || typeof body.pageText !== "string") {
    return res.status(400).json({ error: "Expected { url, pageText, provider? }" });
  }

  // TODO Phase 2: loadCv() + getProvider(body.provider).analyze({ cv, jd, url, title }).
  const stub: Analysis = {
    isJob: true,
    role: "Senior Full Stack Engineer",
    company: "Example Co",
    matchScore: 82,
    strengths: [
      "TypeScript end-to-end across recent projects",
      "React + Node.js full-stack ownership",
      "High-load systems (100k+ daily users)",
    ],
    gaps: [
      "Kubernetes depth not evidenced",
      "No GraphQL federation experience shown",
    ],
    tips: [
      "Lead with the Finloo from-scratch build",
      "Quantify the 20k visitors/day scale",
    ],
    summary: "Stubbed analysis — Phase 2 wires the real model call.",
  };
  return res.status(200).json(stub);
}

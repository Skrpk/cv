import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import { loadCv } from "./_lib/cv";
import { getProvider } from "./_lib/providers";
import { trimPageText } from "./_lib/analysis";
import { runCoverLetter } from "./_lib/cover";
import type { AnalyzeRequest, ProviderName } from "./_lib/types";

// POST /api/cover — generates a JD-tailored cover letter from the CV.
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

  const provider: ProviderName = body.provider === "openai" ? "openai" : "claude";

  try {
    const cv = loadCv();
    const jd = trimPageText(body.pageText);
    const coverLetter = await runCoverLetter(getProvider(provider), {
      cv,
      jd,
      url: body.url,
      title: body.title,
    });
    return res.status(200).json({ coverLetter });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.startsWith("Missing ") ? 500 : 502;
    return res.status(status).json({ error: msg });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import type { ApplyRequest, ApplyResult } from "./_lib/types";

// POST /api/apply — records an Application on the Board (dedupe by URL).
// Phase 1: validates + returns a stub result. Phase 3 wires Notion.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  if (preflight(req, res)) return;
  cors(res);
  if (req.method !== "POST") return methodNotAllowed(res, "POST, OPTIONS");
  if (!requireSecret(req, res)) return;

  const body = req.body as Partial<ApplyRequest> | undefined;
  if (!body || typeof body.url !== "string" || !body.analysis) {
    return res.status(400).json({ error: "Expected { url, analysis }" });
  }

  // TODO Phase 3: getNotionDatabaseId() + upsertApplication(dbId, url, analysis).
  const stub: ApplyResult = {
    action: "created",
    pageId: "stub-page-id",
    pageUrl: "https://www.notion.so/stub-page-id",
  };
  return res.status(200).json(stub);
}

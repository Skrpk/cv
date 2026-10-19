import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import { getBoard } from "./_lib/kv";
import { upsertApplication } from "./_lib/notion";
import type { ApplyRequest } from "./_lib/types";

// POST /api/apply — records an Application on the Board (dedupe by URL).
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

  try {
    const board = await getBoard();
    if (!board) {
      return res
        .status(400)
        .json({ error: "No board configured. Run /api/setup first." });
    }
    const result = await upsertApplication(
      board.dataSourceId,
      body.url,
      body.analysis,
    );
    return res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.startsWith("Missing ") ? 500 : 502;
    return res.status(status).json({ error: msg });
  }
}

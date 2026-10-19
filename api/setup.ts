import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import type { SetupRequest, SetupResult } from "./_lib/types";

// POST /api/setup — one-time: creates the Board under a parent page and
// stores its id in KV. Phase 1: validates + returns a stub. Phase 3 wires Notion.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  if (preflight(req, res)) return;
  cors(res);
  if (req.method !== "POST") return methodNotAllowed(res, "POST, OPTIONS");
  if (!requireSecret(req, res)) return;

  const body = req.body as Partial<SetupRequest> | undefined;
  if (!body || typeof body.parentPageId !== "string") {
    return res.status(400).json({ error: "Expected { parentPageId }" });
  }

  // TODO Phase 3: createBoard(body.parentPageId) + setNotionDatabaseId(id).
  const stub: SetupResult = {
    databaseId: "stub-database-id",
    created: true,
  };
  return res.status(200).json(stub);
}

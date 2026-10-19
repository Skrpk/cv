import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, cors, methodNotAllowed } from "./_lib/http";
import { requireSecret } from "./_lib/auth";
import { createBoard } from "./_lib/notion";
import { setBoard } from "./_lib/kv";
import type { SetupRequest, SetupResult } from "./_lib/types";

// POST /api/setup — one-time: creates the Board under a parent page and
// stores its ids in KV.
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

  try {
    const board = await createBoard(body.parentPageId);
    await setBoard(board);
    const result: SetupResult = { ...board, created: true };
    return res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.startsWith("Missing ") ? 500 : 502;
    return res.status(status).json({ error: msg });
  }
}

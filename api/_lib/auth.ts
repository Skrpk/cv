import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Guards an endpoint with the shared secret. The extension sends it in the
 * `x-app-secret` header; the backend compares against APP_SHARED_SECRET.
 * Returns true when the caller is allowed; otherwise it has already written a
 * 401/500 response and the handler should stop.
 */
export function requireSecret(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.APP_SHARED_SECRET;
  if (!expected) {
    res.status(500).json({ error: "Server is missing APP_SHARED_SECRET" });
    return false;
  }
  const got = req.headers["x-app-secret"];
  if (typeof got !== "string" || got !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

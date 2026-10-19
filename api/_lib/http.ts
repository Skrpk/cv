import type { VercelRequest, VercelResponse } from "@vercel/node";

// The extension calls these endpoints cross-origin from chrome-extension://<id>.
// The shared secret travels in a header (not a cookie), so a wildcard origin is safe.
export function cors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-app-secret");
  res.setHeader("Access-Control-Max-Age", "86400");
}

/** Answers a CORS preflight. Returns true if the request was fully handled. */
export function preflight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    cors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function methodNotAllowed(res: VercelResponse, allow: string): void {
  res.setHeader("Allow", allow);
  res.status(405).json({ error: "Method Not Allowed" });
}

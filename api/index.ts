import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

// Serves the CV page at `/` (see vercel.json rewrite). Unchanged behaviour
// from the original api/index.js, now in TypeScript.
export default function handler(
  request: VercelRequest,
  response: VercelResponse,
): VercelResponse | void {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).send("Method Not Allowed");
  }

  const html = fs.readFileSync(
    path.join(process.cwd(), "standalone.html"),
    "utf8",
  );

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );

  return response.status(200).send(request.method === "HEAD" ? "" : html);
}
